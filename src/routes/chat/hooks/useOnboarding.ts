import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { Message, StudentProfile, User } from '../../../interfaces/interfaces_eleve';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { useAppInitializationStore } from '../../../stores/useAppInitializationStore';

// Ultra-Simple Test Version
export const useOnboarding = ({
  generateUniqueId,
}: {
  generateUniqueId: () => number;
}) => {
  // --- Stores ---
  const { user, chatIds, updateUserProfileInStore } = useAuthStore();
  const {
    messages, 
    setMessages,
    isLoadingMessages,
  } = useChatStore();
  const { isAppInitialized } = useAppInitializationStore();

  // --- Refs ---
  const hasRunOnboardingCheckRef = useRef(false);
  const onboardingStartAttemptedRef = useRef(false);

  // --- Constantes --- //
  const onboardingMessages = [
    { question: "What is your current school?", metadata: "SCHOOL" },
    { question: "What year are you in?", metadata: "YEAR" },
    { question: "What is you linkedin URL?", metadata: "LINKEDIN" },
    { question: "What is your major and minor?", metadata: "MAJOR&MINOR" },
    { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" },
  ];

  // --- Fonctions Mémoisées --- //
  const updateUserField = useCallback(async (
    fieldOrObject: string | Record<string, any>,
    value?: any
  ) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (!currentUserId) return;
    const updatePayload = typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;
    try {
        console.log(`[useOnboarding][Test] Màj profil user ${currentUserId}:`, updatePayload);
        updateUserProfileInStore(updatePayload);
        // Firestore update if needed
        // await updateDoc(doc(db, "users", currentUserId), updatePayload);
        console.log(`[useOnboarding][Test] Profil mis à jour (Store).`);
    } catch (error) { console.error("❌ [useOnboarding][Test] Erreur màj profil:", error); }
  }, [updateUserProfileInStore]);

  // --- Fonction pour ajouter le message AI suivant --- //
  const addNextAiMessage = useCallback(async (nextIndex: number) => {
    const currentUserId = useAuthStore.getState().user?.id;
    const currentChatId = useAuthStore.getState().chatIds[0];
    const currentMessages = useChatStore.getState().messages;

    if (!currentUserId || !currentChatId) {
        console.error("❌ [Test] User/Chat ID manquant pour addNextAiMessage.");
        return;
    }

    const isLastStep = nextIndex >= onboardingMessages.length;
    if (isLastStep) {
        console.log("[Test] Onboarding terminé (pas de message AI suivant)."); 
        await updateUserField({ onboardingComplete: true });
        return;
    }

    const nextStep = onboardingMessages[nextIndex];
    if (!nextStep?.metadata || !nextStep?.question) {
         console.error(`❌ [Test] Config invalide index: ${nextIndex}`);
         return;
    }

    // Créer le message AI suivant (complet)
    const nextAiMessage: Message = {
      id: generateUniqueId(), 
      type: 'ai',
      content: nextStep.question,
      personaName: 'Lucy',
      isLoading: false, 
      METADATAONBOARDING: nextStep.metadata
    };

    // Ajouter ce message à la liste existante
    console.log(`[Test] Ajout message AI (Index ${nextIndex}):`, nextAiMessage);
    setMessages([...currentMessages, nextAiMessage]);

    // Sauver l'étape AI ajoutée
    try {
      await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: nextAiMessage.content, type: 'ai', metadata: nextAiMessage.METADATAONBOARDING || '' });
    } catch(error) {
      console.error(`❌ [Test] Erreur save AI step (${nextAiMessage.METADATAONBOARDING}):`, error);
    }

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField]);


  // --- handleSendGeneric (Ultra-Simple) --- //
  const handleSendGeneric = useCallback(async (
    messageContent: string,
    currentIndex: number,
    fieldToUpdate?: string | Record<string, any>,
    valueToUpdate?: any
  ) => {
      const currentUserId = useAuthStore.getState().user?.id;
      const currentChatId = useAuthStore.getState().chatIds[0];
      const currentMessages = useChatStore.getState().messages; 

      if (!currentUserId || !currentChatId) return;

      const currentMetadata = onboardingMessages[currentIndex]?.metadata;
      if (!currentMetadata) return;

      // 1. Préparer et ajouter SEULEMENT le message humain
      const humanMessage: Message = {
        id: generateUniqueId(),
        type: 'human',
        content: messageContent
      };
      const messagesAfterHuman = [...currentMessages, humanMessage];
      console.log(`[Test] Ajout message humain. Nouvel état:`, messagesAfterHuman);
      setMessages(messagesAfterHuman);

      // --- Actions Asynchrones --- 
      // Màj profil et sauver étape humaine
      if (fieldToUpdate) { 
        await updateUserField(fieldToUpdate, valueToUpdate ?? messageContent);
      }
      try {
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: messageContent, type: 'human', metadata: currentMetadata });
      } catch(error) {
        console.error(`❌[Test] Erreur save Human step (${currentMetadata}):`, error);
      }

      // 2. Déclencher l'ajout du message AI SUIVANT après un délai
      const nextIndex = currentIndex + 1;
      const delayMs = 300; // Délai réduit ? Testez ce qui semble naturel
      console.log(`[Test] Programmation ajout message AI (Index ${nextIndex}) dans ${delayMs}ms...`);
      setTimeout(() => {
          addNextAiMessage(nextIndex);
      }, delayMs); 

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, addNextAiMessage]);


  // --- useEffect Principal (Ultra-Simple) --- //
  useEffect(() => {
    const checkAndStartOnboarding = async () => {
      console.log(
        `[Test Check Run] AppInit: ${isAppInitialized}, User: ${!!user}, OnboardingDone: ${user?.onboardingComplete}, LoadingMsgs: ${isLoadingMessages}, CheckRan: ${hasRunOnboardingCheckRef.current}, StartAttempted: ${onboardingStartAttemptedRef.current}`
      );
      
      const canConsider = isAppInitialized && user && !user.onboardingComplete && !isLoadingMessages && !hasRunOnboardingCheckRef.current;

      if (canConsider) {
        hasRunOnboardingCheckRef.current = true; 
        const currentMsgs = useChatStore.getState().messages;
        const hasExisting = currentMsgs.some((msg: Message) => !!msg.METADATAONBOARDING);
        const notAttempted = !onboardingStartAttemptedRef.current;

        if (!hasExisting && notAttempted) {
          onboardingStartAttemptedRef.current = true;
          console.log("🚀 [Test] Starting - Adding first message.");
          const firstStep = onboardingMessages[0];

          if (firstStep?.question && firstStep?.metadata) {
               const firstAiMessage: Message = {
                  id: generateUniqueId(), type: 'ai', content: firstStep.question,
                  personaName: 'Lucy', isLoading: false, METADATAONBOARDING: firstStep.metadata
               };
               
               // 1. Ajouter le premier message AI
               setMessages([firstAiMessage]);
               console.log("[Test] First message added.", [firstAiMessage]);

               // 2. Sauvegarder la première étape AI
               const uid = useAuthStore.getState().user?.id;
               const cid = useAuthStore.getState().chatIds[0];
               if(uid && cid) {
                 try { await saveOnboardingStep({ chatId: cid, userId: uid, message: firstStep.question, type: 'ai', metadata: firstStep.metadata }); }
                 catch (error) { console.error(`❌[Test] Erreur save Initial AI:`, error); }
               } else { console.error("❌[Test] User/Chat ID manquant."); }

          } else { console.error("❌[Test] Config invalide."); }
        } else { /* logs */ }
      } else { /* logs */ }
    };
    checkAndStartOnboarding();
  }, [isAppInitialized, user, isLoadingMessages, generateUniqueId, setMessages, saveOnboardingStep, updateUserProfileInStore]);


  // --- Handlers spécifiques (inchangés) --- //
  const handleSendSCHOOLMessage = useCallback((m: string) => { handleSendGeneric(m, 0, 'faculty', m.split(", ")); }, [handleSendGeneric]);
  const handleSendYEARMessage = useCallback((m: string) => { handleSendGeneric(m, 1, 'year'); }, [handleSendGeneric]);
  const handleSendLINKEDINMessage = useCallback((m: string) => { handleSendGeneric(m, 2, 'linkedin_url'); }, [handleSendGeneric]);
  const handleSendMAJORMINORMessage = useCallback((d: { majors: string[]; minors: string[]; }) => { const c = `Majors: ${d.majors.join(', ')} | Minors: ${d.minors.join(', ')}`; handleSendGeneric(c, 3, { major: d.majors, minor: d.minors }); }, [handleSendGeneric]);
  const handleSendCOMPLIANCEMessage = useCallback((p: { termsAccepted: boolean; ageConfirmed: boolean; }) => { const s = `Terms accepted: ${p.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${p.ageConfirmed ? '✔️' : '❌'}`; handleSendGeneric(s, 4, { complianceAccepted: true, onboardingComplete: true, ...p }); }, [handleSendGeneric]);

  // --- Return --- //
  return { handleSendSCHOOLMessage, handleSendYEARMessage, handleSendLINKEDINMessage, handleSendMAJORMINORMessage, handleSendCOMPLIANCEMessage };
};