import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { sendUserInfoLinkedInScraping, scrapeLinkedInProfile, scrapeInstagramProfile } from '../../../api/auth_and_onboarding';
import { Message, StudentProfile, User } from '../../../interfaces/interfaces_eleve';
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
  const { user, chatIds } = useAuthStore();
  const {
    messages,
    setMessages,
    setIsLandingPageVisible,
    _setRelatedQuestions: setRelatedQuestions,
    _setIsStreamingResponse: setIsStreaming,
    setActiveChat,
  } = useChatStore();
  const { isAppInitialized } = useAppInitializationStore();

  // --- Refs ---
  const hasRunOnboardingCheckRef = useRef(false);
  const onboardingStartAttemptedRef = useRef(false);
  const [skipLinkedInQuestion, setSkipLinkedInQuestion] = useState(false);
  const linkedInCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (linkedInCheckTimeoutRef.current) {
        clearTimeout(linkedInCheckTimeoutRef.current);
      }
    };
  }, []);

  // --- Constantes ---
  const onboardingMessages = [
    { question: "What is your current school?", metadata: "SCHOOL" },       // 0
    { question: "What year are you in?", metadata: "YEAR" },         // 1
    { question: "What's your Insta?", metadata: "INSTAGRAM" },    // 2
    { question: "What is you linkedin URL?", metadata: "LINKEDIN" }, // 3
    { question: "What is your major and minor?", metadata: "MAJOR&MINOR" }, // 4
    { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" }, // 5
  ];

  // --- Fonction pour obtenir l'index de la prochaine question ---
  const getNextQuestionIndex = useCallback((currentIndex: number) => {
    // Après INSTAGRAM (index 2), vérifier si on saute LINKEDIN (index 3)
    if (currentIndex === 2 && skipLinkedInQuestion) {
      return 4; // Aller à MAJOR&MINOR (index 4)
    }
    // Sinon, passer simplement à l'étape suivante
    return currentIndex + 1;
  }, [skipLinkedInQuestion]);


  
  // --- Fonction pour déterminer l'index de reprise when the user didnt finish the onboarding and come back to it ---
  const determineResumeIndex = useCallback((currentUser: User | null): number => {
    if (!currentUser) return 0; // Sécurité: retourne la première question si pas d'utilisateur

    const isLinkedInSkipped = skipLinkedInQuestion; // Utilise l'état local du hook

    // Vérifier chaque étape dans l'ordre
    if (!currentUser.faculty || currentUser.faculty.length === 0) return 0; // SCHOOL (index 0)
    if (!currentUser.year) return 1; // YEAR (index 1)
    // Vérifier si instagram_username est manquant (undefined, null, ou chaîne vide)
    if (currentUser.instagram_username === undefined || currentUser.instagram_username === null || currentUser.instagram_username === '') return 2; // INSTAGRAM (index 2)

    // Vérifier LinkedIn SEULEMENT si on ne doit PAS le sauter
    if (!isLinkedInSkipped && (currentUser.linkedin_url === undefined || currentUser.linkedin_url === null || currentUser.linkedin_url === '')) return 3; // LINKEDIN (index 3)

    // Déterminer l'index attendu pour MAJOR&MINOR en fonction du saut LinkedIn
    const majorMinorIndex = isLinkedInSkipped ? 3 : 4;
    if (!currentUser.major || currentUser.major.length === 0) return majorMinorIndex; // MAJOR&MINOR

    // Déterminer l'index attendu pour COMPLIANCE
    const complianceIndex = isLinkedInSkipped ? 4 : 5;
     // Vérifier si complianceAccepted est manquant ou faux
    if (currentUser.complianceAccepted === undefined || currentUser.complianceAccepted === null || !currentUser.complianceAccepted) return complianceIndex; // COMPLIANCE

    // Si on arrive ici, toutes les étapes semblent remplies selon le profil.
    // Cela ne devrait pas arriver si user.onboardingComplete est false, mais par sécurité :
    console.warn("[useOnboarding] determineResumeIndex: All steps seem complete based on profile, but onboardingComplete is false. Defaulting to final step index.");
    return complianceIndex; // Retourne l'index de la dernière étape (COMPLIANCE)
  }, [skipLinkedInQuestion]); // Dépend seulement de l'état skipLinkedInQuestion

  // --- Fonctions Mémoisées (useCallback) ---

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
        console.log(`[useOnboarding] Profil utilisateur mis à jour (Firestore). L'écouteur mettra à jour le store.`);
    } catch (error) {
        console.error("❌ [useOnboarding] Erreur lors de la mise à jour Firestore pour updateUserField:", error);
    }
  }, []);


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
    // ---> SÉCURITÉ SUPPLÉMENTAIRE + DÉLAI pour la première question <--- 
    if (index === 0) {
      // Re-vérifier si l'onboarding n'est pas déjà complet juste avant d'envoyer
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.onboardingComplete) {
        console.log("🚫 [useOnboarding - sendNext] Onboarding marqué complet juste avant envoi index 0. Annulation.");
        return; 
      }
      // Ajouter le délai de 2 secondes avant le tout premier message
      console.log("⏳ [useOnboarding - sendNext] Délai de 2 secondes avant la première question...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("⏳ [useOnboarding - sendNext] Fin du délai. Envoi question 0.");
    }
    // ---> FIN SÉCURITÉ + DÉLAI <--- 

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
        updateUserField(fieldToUpdate);
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


  const handleSendGeneric = useCallback(async (
    messageContent: string,
    nextIndex: number,
    metadata: string,
    fieldToUpdate?: string | Record<string, any>,
    valueToUpdate?: any
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

      // Mettre à jour le profil SANS attendre
      if (fieldToUpdate) {
          console.log("[useOnboarding] Lancement de updateUserField (avec délai interne) en arrière-plan...");
          updateUserField(fieldToUpdate, valueToUpdate ?? messageContent);
      }

      // Passer IMMÉDIATEMENT à la question suivante
      await sendNextOnboardingMessage(nextIndex, messagesWithHuman);

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, sendNextOnboardingMessage]);



  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
    const summary = `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
     // Pour COMPLIANCE, la mise à jour du profil est gérée par l'objet passé
    handleSendGeneric(summary, 6, "COMPLIANCE", { complianceAccepted: true, ...payload });
}, [handleSendGeneric]);




  // --- useEffect Principal (REVISITÉ POUR STABILITÉ) ---
  useEffect(() => {
    // Les valeurs lues ici (userId, isOnboardingComplete, etc.) viennent des sélecteurs optimisés
    console.log(
      `[useOnboarding Check] Init: ${isAppInitialized}, UserID: ${user?.id}, OnboardingDone: ${user?.onboardingComplete}, ChatID: ${chatIds[0]}, LoadingMsgs: ${useChatStore.getState().isLoadingMessages}, Streaming: ${useChatStore.getState().isStreamingResponse}, RanCheck: ${hasRunOnboardingCheckRef.current}, StartAttempted: ${onboardingStartAttemptedRef.current}`
    );

    // --- Condition 1: Peut-on envisager l'onboarding ? ---
    // Utilise les primitives sélectionnées
    const canConsiderOnboarding = isAppInitialized && user && !user.onboardingComplete;

    if (!canConsiderOnboarding) {
      hasRunOnboardingCheckRef.current = false;
      onboardingStartAttemptedRef.current = false;
      if (!isAppInitialized) console.log("[useOnboarding Check] Waiting for app initialization...");
      else if (!user) console.log("[useOnboarding Check] Waiting for user data...");
      else if (user.onboardingComplete) console.log("[useOnboarding Check] Onboarding already complete.");
      return;
    }

    // --- Condition 2: Déterminer le Chat ID Actif ---
    let effectiveChatId = chatIds[0]; // Utilise la primitive sélectionnée

    // Logique de reprise : utilise userChatSessions sélectionné
    if (!effectiveChatId && user.chatsessions && user.chatsessions.length === 1) {
      const potentialOnboardingChatId = user.chatsessions[0];
      if (potentialOnboardingChatId !== chatIds[0]) { // Compare avec la primitive
        console.warn(`[useOnboarding] Resuming onboarding. Setting active chat to: ${potentialOnboardingChatId}. Will load messages...`);
        setActiveChat(potentialOnboardingChatId); // Appel l'action stable
        // ATTENTION: On sort ici pour laisser l'effet se relancer quand `chatIds` (la dépendance) changera.
        return;
      }
    } else if (!effectiveChatId && (!user.chatsessions || user.chatsessions.length !== 1)) {
      console.error(`[useOnboarding] Resuming error: Cannot determine single onboarding chat ID. Sessions:`, user.chatsessions);
      hasRunOnboardingCheckRef.current = false;
      return;
    }

    // --- Condition 3: Agir seulement si le Chat ID est défini ET stable ---
    if (!effectiveChatId) {
      console.log("[useOnboarding Check] Waiting for effectiveChatId (currentChatId) to be set...");
      hasRunOnboardingCheckRef.current = false;
      return;
    }

    // --- Condition 4: Agir seulement si l'état est stable (non-loading, non-streaming) ---
    // Utilise les primitives sélectionnées
    if (useChatStore.getState().isLoadingMessages || useChatStore.getState().isStreamingResponse) {
      if (useChatStore.getState().isLoadingMessages) console.log(`[useOnboarding Check] Waiting for messages to load for chat ${effectiveChatId}...`);
      if (useChatStore.getState().isStreamingResponse) console.log(`[useOnboarding Check] Waiting for AI response to finish for chat ${effectiveChatId}...`);
      // On réinitialise le flag car on est en attente, l'action doit pouvoir se redéclencher
      hasRunOnboardingCheckRef.current = false;
      return;
    }

    // --- Condition 5: Éviter actions multiples ---
    if (hasRunOnboardingCheckRef.current) {
      console.log("[useOnboarding Check] Action already performed in this stable cycle. Skipping.");
      return;
    }

    // --- ACTION ---
    console.log(`[useOnboarding ACTION] Conditions met for chat ${effectiveChatId}. Deciding action...`);
    hasRunOnboardingCheckRef.current = true; // Marquer l'action

    // Lire les messages via getState UNIQUEMENT ici, car on agit.
    const messagesInStore = useChatStore.getState().messages;
    const hasExistingOnboardingMessages = messagesInStore.some((msg: Message) => !!msg.METADATAONBOARDING);
    const hasNotAttemptedStart = !onboardingStartAttemptedRef.current;

    if (!hasExistingOnboardingMessages && hasNotAttemptedStart) {
      // Démarrage initial
      onboardingStartAttemptedRef.current = true;
      console.log(`🚀 [useOnboarding ACTION] Starting onboarding sequence for chat ${effectiveChatId}...`);
      // Utilise les messages lus juste avant
      sendNextOnboardingMessage(0, messagesInStore);
    } else { // Reprise
      console.log(`[useOnboarding ACTION] Resuming onboarding for chat ${effectiveChatId}.`);
      // Passe userProfileForLogic (lu au début) à determineResumeIndex
      const resumeIndex = determineResumeIndex(user);
      console.log(`[useOnboarding ACTION] Determined resume index: ${resumeIndex}`);

      const lastMessage = messagesInStore[messagesInStore.length - 1];
      const lastMessageIsTargetQuestion = lastMessage?.type === 'ai' &&
                                          lastMessage.METADATAONBOARDING &&
                                          resumeIndex < onboardingMessages.length &&
                                          lastMessage.METADATAONBOARDING === onboardingMessages[resumeIndex].metadata;

      if (resumeIndex < onboardingMessages.length && !lastMessageIsTargetQuestion) {
        console.log(`[useOnboarding ACTION] Sending resume question at index ${resumeIndex}.`);
        // Utilise les messages lus juste avant
        sendNextOnboardingMessage(resumeIndex, messagesInStore);
      } else if (resumeIndex >= onboardingMessages.length) {
        console.log("[useOnboarding ACTION] Resume index indicates completion. Finalizing...");
        handleSendCOMPLIANCEMessage({ termsAccepted: true, ageConfirmed: true });
      } else {
        console.log(`[useOnboarding ACTION] Skipping resume question ${resumeIndex}. Last message might already be it.`);
      }
    }
  }, [
       // --- Dépendances Stables ou Primitives ---
       isAppInitialized,      // Primitive (boolean)
       user,                // Primitive (string | undefined)
       chatIds,         // Primitive (string | null)
       useChatStore.getState().isLoadingMessages,     // Primitive (boolean)
       useChatStore.getState().isStreamingResponse,   // Primitive (boolean)

       // --- Fonctions Stables (via useCallback ou actions Zustand) ---
       setActiveChat,
       determineResumeIndex,
       sendNextOnboardingMessage,
       handleSendCOMPLIANCEMessage
       // NOTE: userProfileForLogic n'est PAS inclus ici pour éviter les re-renders
       // si seule une partie non pertinente du profil change. On le lit au début
       // de l'effet et on le passe à determineResumeIndex.
     ]);
  // --- FIN MODIFICATION useEffect ---

  // --- Fonctions de Handler pour les Réponses Spécifiques ---
  // Modifiées pour passer le tableau de messages mis à jour


  const handleSendSCHOOLMessage = useCallback((schoolMessage: string) => {
      handleSendGeneric(schoolMessage, 1, "SCHOOL", 'faculty', schoolMessage.split(", "));
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
            console.log("[useOnboarding] Scraping Instagram terminé, Firestore devrait être mis à jour et le store suivra.");
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
        console.log("[useOnboarding] Scraping LinkedIn terminé, Firestore devrait être mis à jour et le store suivra.");
      }
    } catch (error) {
      console.error("[useOnboarding] Erreur lors du scraping LinkedIn:", error);
    }
  }, [handleSendGeneric]);


  const handleSendMAJORMINORMessage = useCallback(({ majors, minors }: { majors: string[]; minors: string[]; }) => {
      const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
      // Pour MAJORMINOR, la mise à jour du profil est gérée par l'objet passé
      handleSendGeneric(content, 5, "MAJOR&MINOR", { major: majors, minor: minors });
  }, [handleSendGeneric]);



  


  



  // ---> TEST QUESTIONS OUTDATING NOT IN THE LOGIC <-----
  const handleSendTESTMessage = useCallback((testMessage: string) => {
    handleSendGeneric(testMessage, 3, "TEST");
  }, [handleSendGeneric]);
  
  // ---> AJOUT HANDLERS QUESTIONS TEST <-----
  const handleSendFAVORITE_COLORMessage = useCallback((colorMessage: string) => {
    // Index suivant (PET_NAME) est 5
    handleSendGeneric(colorMessage, 5, "FAVORITE_COLOR"); 
  }, [handleSendGeneric]);

  const handleSendPET_NAMEMessage = useCallback((petNameMessage: string) => {
    // Index suivant (LINKEDIN) est 6 ou 7 (si skip)
     const nextIndex = getNextQuestionIndex(5);
    handleSendGeneric(petNameMessage, nextIndex, "PET_NAME");
  }, [handleSendGeneric, getNextQuestionIndex]);
  
  // ---------------------------------------

  // --- Return ---
  return {
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendTESTMessage,
    handleSendINSTAGRAMMessage,
    handleSendFAVORITE_COLORMessage, 
    handleSendPET_NAMEMessage,
    handleSendLINKEDINMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
  };
};