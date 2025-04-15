import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { Message, StudentProfile, User } from '../../../interfaces/interfaces_eleve';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { useAppInitializationStore } from '../../../stores/useAppInitializationStore';

// Hook principal simplifié - Sans fake streaming ni onSubmit pour le test
export const useOnboarding = ({
  generateUniqueId,
}: {
  generateUniqueId: () => number;
}) => {
  // --- Stores ---
  const { user, chatIds, updateUserProfileInStore } = useAuthStore();
  const {
    messages, // Lire pour éviter d'écraser
    setMessages,
    isLoadingMessages, // Pour le démarrage
    // Plus besoin des actions de streaming ici
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
    const updatePayload = typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;
    try {
        console.log(`[useOnboarding] Màj profil local user ${currentUserId} avec:`, updatePayload);
        updateUserProfileInStore(updatePayload); 
        // Mise à jour Firestore (si nécessaire)
        // await updateDoc(doc(db, "users", currentUserId), updatePayload);
        console.log(`[useOnboarding] Profil utilisateur mis à jour (Store).`);
    } catch (error) {
        console.error("❌ [useOnboarding] Erreur lors de la mise à jour profil:", error);
    }
  }, [updateUserProfileInStore]);

  // --- Fonction principale pour gérer la réponse et l'étape suivante --- //
  const handleSendGeneric = useCallback(async (
    messageContent: string,                // Réponse humaine
    currentIndex: number,                // Index de l'étape actuelle
    fieldToUpdate?: string | Record<string, any>, // Pour màj profil
    valueToUpdate?: any                   // Pour màj profil
  ) => {
      const currentUserId = useAuthStore.getState().user?.id;
      const currentChatId = useAuthStore.getState().chatIds[0];
      const currentMessages = useChatStore.getState().messages; // Lire l'état avant modif

      if (!currentUserId || !currentChatId) {
          console.error("❌ [useOnboarding] User ID ou Chat ID manquant pour handleSendGeneric.");
          return;
      }

      const humanMessageId = generateUniqueId();
      const nextIndex = currentIndex + 1;
      const currentMetadata = onboardingMessages[currentIndex]?.metadata;

      if (!currentMetadata) {
          console.error(`❌ Metadata manquante pour index actuel: ${currentIndex}`);
          return;
      }

      // 1. Préparer le message humain
      const humanMessage: Message = {
        id: humanMessageId,
        type: 'human',
        content: messageContent
      };

      // 2. Préparer le message AI suivant (COMPLET) si applicable
      let nextAiMessage: Message | null = null;
      const isLastStep = nextIndex >= onboardingMessages.length;

      if (!isLastStep) {
        const nextStep = onboardingMessages[nextIndex];
        if (!nextStep?.metadata || !nextStep?.question) {
             console.error(`❌ Config invalide pour index suivant: ${nextIndex}`);
             return;
        }
        nextAiMessage = {
          id: humanMessageId + 1, // ID simple
          type: 'ai',
          content: nextStep.question, // Contenu COMPLET
          personaName: 'Lucy',
          isLoading: false, // Pas en chargement
          METADATAONBOARDING: nextStep.metadata
        };
      }

      // 3. **Mise à jour Atomique de l'État**
      const messagesToAdd = nextAiMessage ? [humanMessage, nextAiMessage] : [humanMessage];
      const messagesAfterUpdate = [...currentMessages, ...messagesToAdd];
      console.log(`[useOnboarding] Ajout de ${messagesToAdd.length} message(s). Nouvel état:`, messagesAfterUpdate);
      setMessages(messagesAfterUpdate);

      // --- Actions Asynchrones (après mise à jour état) --- 

      // 4. Sauver l'étape humaine
      try {
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: messageContent, type: 'human', metadata: currentMetadata });
      } catch(error) {
        console.error(`❌ Erreur saveOnboardingStep (Human - ${currentMetadata}):`, error);
      }

      // 5. Sauver l'étape AI suivante (si elle existe)
      if (nextAiMessage) {
        try {
          await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: nextAiMessage.content, type: 'ai', metadata: nextAiMessage.METADATAONBOARDING || '' });
        } catch(error) {
          console.error(`❌ Erreur saveOnboardingStep (AI - ${nextAiMessage.METADATAONBOARDING}):`, error);
        }
      }

      // 6. Mettre à jour le profil utilisateur
      if (fieldToUpdate) {
        await updateUserField(fieldToUpdate, valueToUpdate ?? messageContent);
      }

      // 7. Marquer comme complet si c'était la dernière étape
      if (isLastStep) {
        console.log("[useOnboarding] Onboarding terminé.");
        await updateUserField({ onboardingComplete: true });
        // Ici on pourrait appeler onSubmit si on voulait une transition backend
        // await onSubmit(messagesAfterUpdate, ""); 
      }

  }, [
      generateUniqueId, setMessages, saveOnboardingStep, updateUserField,
      // Plus besoin de dépendre de fonctions de stream ou onSubmit pour l'instant
  ]);


  // --- useEffect Principal (Simplifié pour démarrage sans stream) --- //
  useEffect(() => {
    const checkAndStartOnboarding = async () => {
      console.log(
        `[useOnboarding Check Effect Run] isAppInitialized: ${isAppInitialized}, userExists: ${!!user}, onboardingComplete: ${user?.onboardingComplete}, isLoadingMessages: ${isLoadingMessages}, hasRunCheckRef: ${hasRunOnboardingCheckRef.current}, startAttemptedRef: ${onboardingStartAttemptedRef.current}`
      );
      
      const canConsiderOnboarding = isAppInitialized && user && !user.onboardingComplete && !isLoadingMessages && !hasRunOnboardingCheckRef.current;

      if (canConsiderOnboarding) {
        hasRunOnboardingCheckRef.current = true; 
        console.log("[useOnboarding Check] Pre-conditions met. Checking start conditions...");

        const currentMessagesFromStore = useChatStore.getState().messages;
        const hasExistingOnboardingMessages = currentMessagesFromStore.some((msg: Message) => !!msg.METADATAONBOARDING);
        const hasNotAttemptedStart = !onboardingStartAttemptedRef.current;

        if (!hasExistingOnboardingMessages && hasNotAttemptedStart) {
          onboardingStartAttemptedRef.current = true;
          console.log("🚀 [useOnboarding] Starting onboarding - Adding first message directly.");
          
          const firstAiMessageId = generateUniqueId();
          const firstStep = onboardingMessages[0];

          if (firstStep?.question && firstStep?.metadata) {
               // Préparer le PREMIER message AI COMPLET
               const firstAiMessage: Message = {
                  id: firstAiMessageId,
                  type: 'ai',
                  content: firstStep.question, // Texte complet
                  personaName: 'Lucy',
                  isLoading: false, // Pas en chargement
                  METADATAONBOARDING: firstStep.metadata
               };
               
               // 1. Ajouter le premier message AI à l'état
               setMessages([firstAiMessage]);
               console.log("[useOnboarding Check] First message added.", [firstAiMessage]);

               // 2. Sauvegarder la première étape AI
               const currentUserId = useAuthStore.getState().user?.id;
               const currentChatId = useAuthStore.getState().chatIds[0];
               if(currentUserId && currentChatId) {
                 try {
                   await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: firstStep.question, type: 'ai', metadata: firstStep.metadata });
                 } catch (error) {
                   console.error(`❌ Erreur saveOnboardingStep (AI - Initial):`, error);
                 }
               } else {
                 console.error("❌ User/Chat ID manquant pour sauvegarde initiale.");
               }

          } else {
              console.error("❌ [useOnboarding] Erreur: Config invalide pour la première étape.");
          }
        } else {
          if (hasExistingOnboardingMessages) console.log("ℹ️ [useOnboarding] Start conditions not met: Onboarding messages already exist.");
          if (!hasNotAttemptedStart) console.log("ℹ️ [useOnboarding] Start conditions not met: Start sequence already attempted.");
        }
      } else {
        if (!isAppInitialized) console.log("[useOnboarding Check] Waiting for app initialization...");
        else if (!user) console.log("[useOnboarding Check] Waiting for user data...");
        else if (user?.onboardingComplete) console.log("[useOnboarding Check] Onboarding already complete.");
        else if (isLoadingMessages) console.log("[useOnboarding Check] Waiting for messages to load...");
        else if (hasRunOnboardingCheckRef.current) console.log("[useOnboarding Check] Check already performed in this cycle.");
      }
    };

    checkAndStartOnboarding();

  }, [isAppInitialized, user, isLoadingMessages, generateUniqueId, setMessages, saveOnboardingStep, updateUserProfileInStore]); // Ajustement des dépendances


  // --- Handlers spécifiques (inchangés, appellent handleSendGeneric) --- //
  const handleSendSCHOOLMessage = useCallback((schoolMessage: string) => {
      handleSendGeneric(schoolMessage, 0, 'faculty', schoolMessage.split(", "));
  }, [handleSendGeneric]);

  const handleSendYEARMessage = useCallback((yearMessage: string) => {
      handleSendGeneric(yearMessage, 1, 'year');
  }, [handleSendGeneric]);

  const handleSendLINKEDINMessage = useCallback((linkedinMessage: string) => {
      handleSendGeneric(linkedinMessage, 2, 'linkedin_url');
  }, [handleSendGeneric]);

  const handleSendMAJORMINORMessage = useCallback(({ majors, minors }: { majors: string[]; minors: string[]; }) => {
      const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
      handleSendGeneric(content, 3, { major: majors, minor: minors });
  }, [handleSendGeneric]);

  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
      const summary = `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
      handleSendGeneric(summary, 4, { complianceAccepted: true, onboardingComplete: true, ...payload });
  }, [handleSendGeneric]);


  // --- Return --- //
  return {
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendLINKEDINMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
  };
};