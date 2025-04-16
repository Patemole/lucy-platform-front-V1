import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { scrapeLinkedInProfile, scrapeInstagramProfile } from '../../../api/auth_and_onboarding';
import { Message} from '../../../interfaces/interfaces_eleve';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { useAppInitializationStore } from '../../../stores/useAppInitializationStore';

// Hook principal
export const useOnboarding = ({
  generateUniqueId,
  hasStartedStreaming,
  setHasStartedStreaming,
  onSubmit,
}: {
  generateUniqueId: () => number;
  hasStartedStreaming: boolean;
  setHasStartedStreaming: (val: boolean) => void;
  onSubmit: (history: Message[], inputValue: string, isOnboardingMessage?: boolean) => Promise<void>;
}) => {
  // --- Stores ---
  const { user, updateUserProfileInStore } = useAuthStore();
  const {
    messages,
    setMessages,
    setIsLandingPageVisible,
    _setRelatedQuestions: setRelatedQuestions,
    _setIsStreamingResponse: setIsStreaming,
  } = useChatStore();
  const { isAppInitialized } = useAppInitializationStore();

  // --- Refs ---
  const hasRunOnboardingCheckRef = useRef(false);
  const onboardingStartAttemptedRef = useRef(false);
  const [skipLinkedInQuestion, setSkipLinkedInQuestion] = useState(false);
  const linkedInCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Constantes ---
  const onboardingMessages = [
    { question: "What is your current school?", metadata: "SCHOOL" },
    { question: "What year are you in?", metadata: "YEAR" },
    { question: "What's your Insta?", metadata: "INSTAGRAM" },
    { question: "What is you linkedin URL?", metadata: "LINKEDIN" },
    { question: "What is your major and minor?", metadata: "MAJOR&MINOR" },
    { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" },
  ];

  // --- Fonction pour obtenir l'index de la prochaine question ---
  const getNextQuestionIndex = useCallback((currentIndex: number) => {
    if (currentIndex === 2 && skipLinkedInQuestion) { // 2 est l'index après INSTAGRAM
      return 4; // Skip LINKEDIN (index 3) et aller directement à MAJOR&MINOR (index 4)
    }
    return currentIndex + 1;
  }, [skipLinkedInQuestion]);

  // --- Fonctions Mémoisées (useCallback) ---

  // Met à jour le profil utilisateur
  const updateUserField = useCallback(async (
    fieldOrObject: string | Record<string, any>,
    value?: any
  ) => {
    const currentUserId = useAuthStore.getState().user?.id; // Lire l'ID au moment de l'exécution
    if (!currentUserId) {
        console.error("updateUserField: User ID manquant.");
        return;
    }
    const userRef = doc(db, "users", currentUserId);
    const updatePayload = typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;
    try {
        console.log(`[useOnboarding] Mise à jour Firestore user ${currentUserId} avec:`, updatePayload);
        await updateDoc(userRef, updatePayload);
        useAuthStore.getState().updateUserProfileInStore(updatePayload); // Appeler l'action du store
        console.log(`[useOnboarding] Profil utilisateur mis à jour (Firestore & Store).`);
    } catch (error) {
        console.error("❌ [useOnboarding] Erreur lors de la mise à jour Firestore pour updateUserField:", error);
    }
  }, []); // Pas de dépendances externes ici, les actions/états sont lus à l'intérieur


  // Simule le streaming d'un message AI de manière plus sûre
  const fakeStreamMessage = useCallback(async (
    messageContent: string,
    metadata: string,
    messageId: number,
    currentMessagesArray: Message[] // Accepte le tableau de messages actuel
  ) => {
    const chunks = messageContent.split(' ');
    let displayedContent = '';
    let workingMessagesArray = [...currentMessagesArray]; // Copie locale pour travailler

    // S'assurer que le message existe (normalement ajouté avant cet appel)
    const messageExists = workingMessagesArray.some(msg => msg.id === messageId);
    if (!messageExists) {
        console.error(`[useOnboarding] fakeStreamMessage: Message avec ID ${messageId} non trouvé dans le tableau fourni.`);
        // Optionnel: Tenter de le rajouter ? Ou juste retourner.
        const loadingMsg: Message = { id: messageId, type: 'ai', content: '', personaName: 'Lucy', METADATAONBOARDING: metadata, isLoading: true };
        workingMessagesArray = [...workingMessagesArray, loadingMsg];
        setMessages(workingMessagesArray); // Mise à jour initiale si manquant
    }


    for (const chunk of chunks) {
      displayedContent += chunk + ' ';
      // Créer le nouveau tableau basé sur la copie locale précédente
      workingMessagesArray = workingMessagesArray.map((msg: Message) =>
          msg.id === messageId ? { ...msg, content: displayedContent.trim(), isLoading: true } : msg
      );
      setMessages(workingMessagesArray); // Mettre à jour le store avec la dernière version

      if (displayedContent.trim().length > 0 && !useChatStore.getState().isStreamingResponse) { // Lire l'état actuel si besoin pour hasStartedStreaming
         // setHasStartedStreaming(true); // Gérer via setIsStreaming maintenant ?
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Création du tableau final
    const finalMessages = workingMessagesArray.map((msg: Message) =>
        msg.id === messageId ? { ...msg, isLoading: false } : msg
    );
    setMessages(finalMessages); // Mettre à jour le store une dernière fois
    console.log(`[useOnboarding] Streaming terminé pour message ID: ${messageId}`);
    return finalMessages; // Retourner le tableau final pour la chaîne d'appels

  }, [setMessages]); // Dépend seulement de setMessages


  // Fonction principale pour envoyer la prochaine question d'onboarding
  const sendNextOnboardingMessage = useCallback(async (
    index: number,
    currentMessagesSnom: Message[],
    fieldToUpdate?: string | Record<string, any>,
    previousAnswer?: string
  ): Promise<void> => {
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

      console.log("🏁 [useOnboarding] Onboarding terminé, appel de onSubmit pour message final avec isOnboardingMessage=true.");
      setIsStreaming(true);
      await onSubmit(historyForSubmit, '', true);
      return;
    }

    // Si on doit sauter la question LinkedIn
    if (index === 3 && skipLinkedInQuestion) {
      console.log("[useOnboarding] Saut de la question LinkedIn car profil déjà trouvé");
      return sendNextOnboardingMessage(4, messagesAfterUpdate, fieldToUpdate, previousAnswer);
    }

    console.log(`[useOnboarding] Préparation étape ${index}.`);
    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setIsStreaming(true);

    const { question, metadata } = onboardingMessages[index];
    const onboardingMessageId = generateUniqueId();

    const loadingMessage: Message = { id: onboardingMessageId, type: 'ai', content: '', personaName: 'Lucy', METADATAONBOARDING: metadata, isLoading: true };
    messagesAfterUpdate = [...messagesAfterUpdate, loadingMessage];
    setMessages(messagesAfterUpdate);

    if (currentUserId && currentChatId) {
      try {
        console.log(`[useOnboarding] Sauvegarde étape AI (métadata: ${metadata}).`);
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, metadata, message: question, type: 'ai' });
      } catch (error) { console.error(`❌ Erreur saveOnboardingStep (AI) pour ${metadata}:`, error); }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    messagesAfterUpdate = await fakeStreamMessage(question, metadata, onboardingMessageId, messagesAfterUpdate);

    setIsStreaming(false);
    console.log(`[useOnboarding] Étape ${index} ("${metadata}") affichée.`);

  }, [generateUniqueId, setMessages, updateUserField, saveOnboardingStep, setIsLandingPageVisible, setRelatedQuestions, setIsStreaming, onSubmit, fakeStreamMessage, skipLinkedInQuestion, onboardingMessages]);


  // --- useEffect Principal (pour démarrer l'onboarding) ---
  useEffect(() => {
    console.log(
      `[useOnboarding Check Effect Run] isAppInitialized: ${isAppInitialized}, userExists: ${!!user}, onboardingComplete: ${user?.onboardingComplete}, messagesLength: ${messages?.length}, hasRunCheckRef: ${hasRunOnboardingCheckRef.current}, startAttemptedRef: ${onboardingStartAttemptedRef.current}`
    );

    // --- Section 1: Pre-conditions ---
    // Check if we are in a state where we *might* need to start onboarding.
    // 1. Is the main application initialization finished?
    // 2. Do we have the user data?
    // 3. Is the user's onboarding NOT marked as complete in their profile?
    // 4. Have we NOT already run this check logic in the current component lifecycle?
    const canConsiderOnboarding = isAppInitialized && user && !user.onboardingComplete && !hasRunOnboardingCheckRef.current;

    if (canConsiderOnboarding) {
      // Mark that this check has been performed for this cycle.
      // This prevents redundant checks if only `messages` change later without other core dependencies changing.
      hasRunOnboardingCheckRef.current = true;
      console.log("[useOnboarding Check] Pre-conditions met. Checking if onboarding should actually start...");

      // --- Section 2: Start Conditions ---
      const hasExistingOnboardingMessages = messages.some((msg: Message) => !!msg.METADATAONBOARDING);
      const hasNotAttemptedStart = !onboardingStartAttemptedRef.current;

      // Decision: Start onboarding only if pre-conditions met, no existing messages found, and start not previously attempted.
      if (!hasExistingOnboardingMessages && hasNotAttemptedStart) {
        // Mark that we are now attempting to start the sequence.
        onboardingStartAttemptedRef.current = true;
        console.log("🚀 [useOnboarding] Start conditions met. Starting onboarding sequence...");
        // Lire l'état actuel des messages juste avant de démarrer
        const initialMessages = useChatStore.getState().messages;
        sendNextOnboardingMessage(0, initialMessages); // Passer le tableau de messages initial
      } else {
        if (hasExistingOnboardingMessages) console.log("ℹ️ [useOnboarding] Start conditions not met: Onboarding messages already exist.");
        if (!hasNotAttemptedStart) console.log("ℹ️ [useOnboarding] Start conditions not met: Start sequence already attempted.");
      }
    } else {
      // Log why the pre-conditions failed
      if (!isAppInitialized) console.log("[useOnboarding Check] Waiting for app initialization...");
      else if (!user) console.log("[useOnboarding Check] Waiting for user data...");
      else if (user?.onboardingComplete) console.log("[useOnboarding Check] Onboarding already complete.");
      else if (hasRunOnboardingCheckRef.current) console.log("[useOnboarding Check] Check already performed in this cycle.");
    }
  }, [isAppInitialized, user, messages, sendNextOnboardingMessage]); // Garder 'messages' ici pour détecter l'ajout initial


  // --- Fonctions de Handler pour les Réponses Spécifiques ---
  // Modifiées pour passer le tableau de messages mis à jour

  const handleSendGeneric = useCallback(async (
    messageContent: string,
    nextIndex: number,
    metadata: string,
    fieldToUpdate?: string | Record<string, any>,
    valueToUpdate?: any // Pour les cas simples (string)
  ) => {
      const newMessage: Message = { id: generateUniqueId(), type: 'human', content: messageContent };
      const currentMessages = useChatStore.getState().messages;
      const messagesWithHuman = [...currentMessages, newMessage]; // Créer le tableau mis à jour
      setMessages(messagesWithHuman); // Mettre à jour le store

      const currentUserId = useAuthStore.getState().user?.id;
      const currentChatId = useAuthStore.getState().chatIds[0];

      // Sauver l'étape humaine
      if (currentUserId && currentChatId) {
          try {
              await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: messageContent, type: 'human', metadata: metadata });
          } catch(error) {
              console.error(`❌ [useOnboarding] Erreur saveOnboardingStep (${metadata}):`, error);
          }
      }
      // Mettre à jour le profil AVANT d'envoyer la question suivante
      if (fieldToUpdate) {
          await updateUserField(fieldToUpdate, valueToUpdate ?? messageContent); // Utiliser valueToUpdate si fourni, sinon messageContent
      }

      // Passer le tableau mis à jour à la fonction suivante
      await sendNextOnboardingMessage(nextIndex, messagesWithHuman); // Ne passe plus fieldToUpdate/previousAnswer ici

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, sendNextOnboardingMessage]);


  const handleSendSCHOOLMessage = useCallback((schoolMessage: string) => {
      handleSendGeneric(schoolMessage, 1, "SCHOOL", 'faculty', schoolMessage.split(", ")); // Mettre à jour 'faculty' avec un tableau
  }, [handleSendGeneric]);

  const handleSendYEARMessage = useCallback((yearMessage: string) => {
      handleSendGeneric(yearMessage, 2, "YEAR", 'year');
  }, [handleSendGeneric]);

  // Fonction pour vérifier périodiquement si linkedin_profile a été mis à jour
  const checkLinkedInProfile = useCallback((maxAttempts = 10) => {
    let attempts = 0;

    const check = () => {
      const user = useAuthStore.getState().user;
      if (user?.linkedin_profile !== undefined) {
        // Profile trouvé, on met à jour skipLinkedInQuestion
        setSkipLinkedInQuestion(!!user.linkedin_profile);
        if (linkedInCheckTimeoutRef.current) {
          clearTimeout(linkedInCheckTimeoutRef.current);
        }
      } else if (attempts < maxAttempts) {
        // Continuer à vérifier toutes les secondes
        attempts++;
        linkedInCheckTimeoutRef.current = setTimeout(check, 1000);
      }
    };

    check();

    // Cleanup function
    return () => {
      if (linkedInCheckTimeoutRef.current) {
        clearTimeout(linkedInCheckTimeoutRef.current);
      }
    };
  }, []);

  // Modifier handleSendINSTAGRAMMessage pour utiliser le nouveau système de vérification
  const handleSendINSTAGRAMMessage = useCallback(async (instagramMessage: string) => {
    const currentMessages = useChatStore.getState().messages;
    const newMessage: Message = { id: generateUniqueId(), type: 'human', content: instagramMessage };
    const messagesWithHuman = [...currentMessages, newMessage];
    setMessages(messagesWithHuman);

    const currentUserId = useAuthStore.getState().user?.id;
    const currentChatId = useAuthStore.getState().chatIds[0];

    if (currentUserId && currentChatId) {
      try {
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, message: instagramMessage, type: 'human', metadata: "INSTAGRAM" });
      } catch(error) {
        console.error(`❌ [useOnboarding] Erreur saveOnboardingStep (INSTAGRAM):`, error);
      }
    }

    await updateUserField('instagram_username', instagramMessage);
    
    // Lancer le scraping Instagram en parallèle
    if (currentUserId) {
      console.log("[useOnboarding] Appel de scrapeInstagramProfile avec le username:", instagramMessage);
      scrapeInstagramProfile(instagramMessage, currentUserId)
        .then(instagramData => {
          if (instagramData) {
            updateUserProfileInStore({ instagram_profile: instagramData });
            console.log("[useOnboarding] Profil Instagram mis à jour dans le store");
          }
        })
        .catch(error => {
          console.error("[useOnboarding] Erreur lors du scraping Instagram:", error);
        });
    }

    // Vérifier si on a déjà une réponse LinkedIn dans le store
    const user = useAuthStore.getState().user;
    console.log("[useOnboarding] Vérification linkedin_profile:", user?.linkedin_profile);
    
    // Si linkedin_profile est true, on a trouvé un profil → skip la question
    // Si linkedin_profile est false, on n'a pas trouvé de profil → poser la question
    // Si linkedin_profile est undefined/null, pas de réponse encore → poser la question
    setSkipLinkedInQuestion(user?.linkedin_profile === true);

    // Utiliser getNextQuestionIndex pour déterminer la prochaine question
    const nextIndex = getNextQuestionIndex(2); // 2 est l'index après INSTAGRAM
    await sendNextOnboardingMessage(nextIndex, messagesWithHuman);

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, sendNextOnboardingMessage, getNextQuestionIndex, checkLinkedInProfile]);



  const handleSendLINKEDINMessage = useCallback(async (linkedinMessage: string) => {
    // Appeler handleSendGeneric pour mettre à jour le profil et passer à la question suivante
    await handleSendGeneric(linkedinMessage, 4, "LINKEDIN", 'linkedin_url');
    
    // Appeler scrapeLinkedInProfile pour envoyer l'URL au backend
    try {
      console.log("[useOnboarding] Appel de scrapeLinkedInProfile avec l'URL:", linkedinMessage);
      const currentUserId = useAuthStore.getState().user?.id;
      if (!currentUserId) {
        throw new Error("User ID not found");
      }
      const linkedinData = await scrapeLinkedInProfile(linkedinMessage, currentUserId);
      console.log("[useOnboarding] Résultat du scraping LinkedIn:", linkedinData);
      
      // Si le scraping a réussi, on met à jour le profil utilisateur avec les données
      if (linkedinData) {
        // Mettre à jour le profil avec les données LinkedIn dans le store
        updateUserProfileInStore({ linkedin_profile: linkedinData });
        console.log("[useOnboarding] Profil LinkedIn mis à jour dans le store");
      }
    } catch (error) {
      console.error("[useOnboarding] Erreur lors du scraping LinkedIn:", error);
    }
  }, [handleSendGeneric, updateUserProfileInStore]);

  const handleSendMAJORMINORMessage = useCallback(({ majors, minors }: { majors: string[]; minors: string[]; }) => {
      const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
      // Pour MAJORMINOR, la mise à jour du profil est gérée par l'objet passé
      handleSendGeneric(content, 5, "MAJOR&MINOR", { major: majors, minor: minors });
  }, [handleSendGeneric]);

  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
      const summary = `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
       // Pour COMPLIANCE, la mise à jour du profil est gérée par l'objet passé
      handleSendGeneric(summary, 6, "COMPLIANCE", { complianceAccepted: true, ...payload });
  }, [handleSendGeneric]);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (linkedInCheckTimeoutRef.current) {
        clearTimeout(linkedInCheckTimeoutRef.current);
      }
    };
  }, []);

  // --- Return ---
  return {
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendLINKEDINMessage,
    handleSendINSTAGRAMMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
  };
};