import { useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { Message } from '../../../interfaces/interfaces_eleve';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { onboardingMessages, streamOnboardingMessage } from '../../../services/onboardingService';

// Hook principal
export const useOnboarding = ({
  generateUniqueId,
  onSubmit,
}: {
  generateUniqueId: () => number;
  onSubmit: (history: Message[], inputValue: string, isOnboardingMessage?: boolean) => Promise<void>;
}) => {
  // --- Stores ---
  const { user } = useAuthStore();
  const {
    messages,
    setMessages,
    setIsLandingPageVisible,
    _setRelatedQuestions: setRelatedQuestions,
    _setIsStreamingResponse: setIsStreaming,
  } = useChatStore();

  // Met à jour le profil utilisateur
  const updateUserField = useCallback(async (
    fieldOrObject: string | Record<string, any>,
    value?: any
  ) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (!currentUserId) {
        console.error("updateUserField: User ID manquant.");
        return;
    }
    const userRef = doc(db, "users", currentUserId);
    const updatePayload = typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;
    try {
        console.log(`[useOnboarding] Mise à jour Firestore user ${currentUserId} avec:`, updatePayload);
        await updateDoc(userRef, updatePayload);
        useAuthStore.getState().updateUserProfileInStore(updatePayload);
        console.log(`[useOnboarding] Profil utilisateur mis à jour (Firestore & Store).`);
    } catch (error) {
        console.error("❌ [useOnboarding] Erreur lors de la mise à jour Firestore pour updateUserField:", error);
    }
  }, []);

  // Fonction principale pour envoyer la prochaine question d'onboarding
  const sendNextOnboardingMessage = useCallback(async (
    index: number,
    currentMessagesSnom: Message[],
    fieldToUpdate?: string | Record<string, any>,
    previousAnswer?: string
  ) => {
    const currentUserId = useAuthStore.getState().user?.id;
    const currentChatId = useAuthStore.getState().chatIds[0];
    let messagesAfterUpdate = [...currentMessagesSnom];

    if (index >= onboardingMessages.length) {
      console.log("[useOnboarding] Fin de l'index, tentative de finalisation.");
      await updateUserField({ onboardingComplete: true });

      if (previousAnswer && currentUserId && currentChatId) {
         const lastStep = onboardingMessages[onboardingMessages.length - 1];
         try {
            console.log(`[useOnboarding] Sauvegarde dernière étape humaine (métadata: ${lastStep.metadata}).`);
            await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, metadata: lastStep.metadata, message: previousAnswer, type: 'human' });
         } catch (error) { console.error(`❌ Erreur saveOnboardingStep (fin, humain) pour ${lastStep.metadata}:`, error); }
      }

       if (typeof fieldToUpdate === 'object') {
         await updateUserField(fieldToUpdate);
       }

      const loadingAiMessage: Message = { id: generateUniqueId() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true };
      const historyForSubmit = [...messagesAfterUpdate, loadingAiMessage];
      setMessages(historyForSubmit);

      console.log("🏁 [useOnboarding] Onboarding terminé, appel de onSubmit pour message final.");
      setIsStreaming(true);
      await onSubmit(historyForSubmit, '');

      return;
    }

    console.log(`[useOnboarding] Préparation étape ${index}.`);
    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setIsStreaming(true);

    const { question, metadata } = onboardingMessages[index];
    const onboardingMessageId = generateUniqueId();

    if (currentUserId && currentChatId) {
      try {
        console.log(`[useOnboarding] Sauvegarde étape AI (métadata: ${metadata}).`);
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, metadata, message: question, type: 'ai' });
      } catch (error) { console.error(`❌ Erreur saveOnboardingStep (AI) pour ${metadata}:`, error); }
    }

    await streamOnboardingMessage(question, metadata, onboardingMessageId, messagesAfterUpdate);

  }, [
    generateUniqueId, setMessages, updateUserField, saveOnboardingStep,
    setIsLandingPageVisible, setRelatedQuestions, setIsStreaming,
    onSubmit
  ]);

  const handleSendGeneric = useCallback(async (
    messageContent: string,
    nextIndex: number,
    metadata: string,
    fieldToUpdate?: string | Record<string, any>,
    valueToUpdate?: any
  ) => {
      const newMessage: Message = { id: generateUniqueId(), type: 'human', content: messageContent };
      const currentMessages = useChatStore.getState().messages;
      const messagesWithHuman = [...currentMessages, newMessage];
      setMessages(messagesWithHuman);

      const currentUserId = useAuthStore.getState().user?.id;
      const currentChatId = useAuthStore.getState().chatIds[0];

      if (currentUserId && currentChatId) {
          try {
              await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: messageContent, type: 'human', metadata: metadata });
          } catch(error) {
              console.error(`❌ [useOnboarding] Erreur saveOnboardingStep (${metadata}):`, error);
          }
      }
      if (fieldToUpdate) {
          await updateUserField(fieldToUpdate, valueToUpdate ?? messageContent);
      }

      await sendNextOnboardingMessage(nextIndex, messagesWithHuman);

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, sendNextOnboardingMessage]);

  const handleSendSCHOOLMessage = useCallback((schoolMessage: string) => {
      handleSendGeneric(schoolMessage, 1, "SCHOOL", 'faculty', schoolMessage.split(", "));
  }, [handleSendGeneric]);

  const handleSendYEARMessage = useCallback((yearMessage: string) => {
      handleSendGeneric(yearMessage, 2, "YEAR", 'year');
  }, [handleSendGeneric]);

  const handleSendLINKEDINMessage = useCallback((linkedinMessage: string) => {
      handleSendGeneric(linkedinMessage, 3, "LINKEDIN", 'linkedin_url');
  }, [handleSendGeneric]);

  const handleSendMAJORMINORMessage = useCallback(({ majors, minors }: { majors: string[]; minors: string[]; }) => {
      const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
      handleSendGeneric(content, 4, "MAJOR&MINOR", { major: majors, minor: minors });
  }, [handleSendGeneric]);

  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
      const summary = `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
      handleSendGeneric(summary, 5, "COMPLIANCE", { complianceAccepted: true, ...payload });
  }, [handleSendGeneric]);

  return {
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendLINKEDINMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
  };
};