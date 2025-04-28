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
  const { chatIds } = useAuthStore();
  const {
    messages,
    setMessages,
    setIsLandingPageVisible,
    setActiveChat,
    _setRelatedQuestions: setRelatedQuestions,
    _setIsStreamingResponse: setIsStreaming,
    currentChatId,
    isLoadingMessages,
    isStreamingResponse,
  } = useChatStore();
  const { isAppInitialized } = useAppInitializationStore();

  const userId = useAuthStore(state => state.user?.id);
  const isOnboardingComplete = useAuthStore(state => state.user?.onboardingComplete);
  const userChatSessions = useAuthStore(state => state.user?.chatsessions);
  const userName = useAuthStore(state => state.user?.name);
  const userUniversity = useAuthStore(state => state.user?.university);


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
    //{ question: "What is your current school?", metadata: "SCHOOL" },       // 0
    { question: "let's get this started! Help me get to know the **real** you.\nThe **more you share** the **more accurate** we get in helping out ✨\n\nWhich school are you in?", metadata: "SCHOOL" },
    { question: "And what year are you rockin' right now?", metadata: "YEAR" },
    //{ question: "This is a test, are you Mathieu?", metadata: "TEST" },
    { question: "What’s your insta? won’t be public — just helps me get your vibe 🏄", metadata: "INSTAGRAM" },
    //{ question: "What's your favorite color?", metadata: "FAVORITE_COLOR" },
    //{ question: "What's your pet's name?", metadata: "PET_NAME" },
    { question: "Second to last question! If you've got a LinkedIn, paste it here, just helps me get your pro side 💼", metadata: "LINKEDIN" },
    { question: "Got a major or minor picked out yet? if you're still figuring it out, totally fine — just click on 'Undecided'", metadata: "MAJOR&MINOR" },
    { question: "Final step! Just check these boxes so we can vibe legally ✅", metadata: "COMPLIANCE" },
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
    // ---> Ajout: Vérification KEDGE <---
    const isKedgeUser = userUniversity === 'kedge';
    const complianceIndex = onboardingMessages.findIndex(q => q.metadata === 'COMPLIANCE'); // Normalement 5

    // Si Kedge et on demande une question avant COMPLIANCE (sauf la première), ne rien faire.
    if (isKedgeUser && index < complianceIndex && index !== 0) {
        console.warn(`[useOnboarding - sendNext] Utilisateur Kedge: Saut de la question ${index} (avant conformité).`);
        return;
    }
    // Si Kedge et c'est la première question (index 0), on saute directement à COMPLIANCE
    if (isKedgeUser && index === 0) {
        console.log(`[useOnboarding - sendNext] Utilisateur Kedge: Saut de la première étape vers la conformité (index ${complianceIndex}).`);
        // On appelle récursivement avec l'index de conformité et les messages actuels
        // Pas besoin de délai ici car il sera appliqué dans l'appel récursif si complianceIndex est 0 (ce qui n'est pas le cas)
        // ou pas appliqué du tout si complianceIndex > 0 (ce qui est le cas)
        return sendNextOnboardingMessage(complianceIndex, currentMessagesSnom, fieldToUpdate, previousAnswer);
    }
    // ---> Fin Ajout KEDGE <---


    // ---> SÉCURITÉ SUPPLÉMENTAIRE + DÉLAI pour la première question <--- 
    // On applique le délai seulement si ce n'est PAS un utilisateur Kedge
    // OU si c'est un Kedge mais que la question de conformité est la première (index 0, cas peu probable)
    if (index === 0 && !isKedgeUser) {
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

    // Récupérer la question originale et le métadata
    const { question: originalQuestion, metadata } = onboardingMessages[index];
    let questionToSend = originalQuestion;

    // Personnaliser la première question si le nom est disponible ET NON Kedge
    if (index === 0 && userName && !isKedgeUser) {
        questionToSend = `Ok ${userName}, ${originalQuestion.charAt(0).toLowerCase() + originalQuestion.slice(1)}`;
        console.log(`[useOnboarding] Question personnalisée pour index 0: "${questionToSend}"`);
    }

    // ---> NOUVELLE LOGIQUE: Personnaliser la question de conformité pour Kedge <---
    if (isKedgeUser && index === complianceIndex) {
        if (userName) {
            questionToSend = `Salut ${userName} ! Coche des checkbox pour qu on soit sur la meme longueur d onde! ✅`;
            console.log(`[useOnboarding] Question de conformité personnalisée pour Kedge (avec nom): "${questionToSend}"`);
        } else {
            questionToSend = `Salut, coche des checkbox pour qu on soit sur la meme longueur d onde! ✅`;
            console.log(`[useOnboarding] Question de conformité personnalisée pour Kedge (sans nom): "${questionToSend}"`);
        }
    }
    // ---> FIN NOUVELLE LOGIQUE <---

    const onboardingMessageId = generateUniqueId();

    // Utiliser questionToSend ici
    const loadingMessage: Message = { id: onboardingMessageId, type: 'ai', content: '', personaName: 'Lucy', METADATAONBOARDING: metadata, isLoading: true };
    messagesAfterUpdate = [...messagesAfterUpdate, loadingMessage];
    setMessages(messagesAfterUpdate);

    if (currentUserId && currentChatId) {
      try {
        console.log(`[useOnboarding] Sauvegarde étape AI (métadata: ${metadata}).`);
        // Utiliser questionToSend ici
        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, metadata, message: questionToSend, type: 'ai' });
      } catch (error) { console.error(`❌ Erreur saveOnboardingStep (AI) pour ${metadata}:`, error); }
    }

    // Utiliser questionToSend ici
    messagesAfterUpdate = await fakeStreamMessage(questionToSend, metadata, onboardingMessageId, messagesAfterUpdate);

    setIsStreaming(false);
    console.log(`[useOnboarding] Étape ${index} ("${metadata}") affichée.`);

  }, [
    generateUniqueId, setMessages, updateUserField, saveOnboardingStep, setIsLandingPageVisible,
    setRelatedQuestions, setIsStreaming, onSubmit, fakeStreamMessage,
    skipLinkedInQuestion, onboardingMessages, userName, userUniversity
  ]);




  // --- useEffect Principal (Logique Très Simplifiée) ---
  useEffect(() => {
    // --- Étape 1: Lire les états nécessaires ---
    // Action stable: setActiveChat
    // Fonctions stables : sendNextOnboardingMessage
    console.log(
      `[useOnboarding Check - Simple] Init: ${isAppInitialized}, UserID: ${userId}, OnboardingDone: ${isOnboardingComplete}, ChatID: ${currentChatId}, LoadingMsgs: ${isLoadingMessages}, Streaming: ${isStreamingResponse}, RanCheck: ${hasRunOnboardingCheckRef.current}, StartAttempted: ${onboardingStartAttemptedRef.current}`
    );

    // --- Étape 2: Vérifier si l'onboarding doit être géré ---
    const shouldManageOnboarding = isAppInitialized && userId && !isOnboardingComplete;

    if (!shouldManageOnboarding) {
      hasRunOnboardingCheckRef.current = false;
      onboardingStartAttemptedRef.current = false;
      return;
    }

    // --- Étape 3: Gérer le cas où currentChatId est manquant (Reprise) ---
    if (!currentChatId) {
      console.log("[useOnboarding Check - Simple] Onboarding active, but currentChatId is null. Attempting resume setup...");
      if (userChatSessions && userChatSessions.length === 1) {
        const onboardingChatId = userChatSessions[0];
        console.warn(`[useOnboarding - Simple] Setting active chat for resume: ${onboardingChatId}. Loading history...`);
        setActiveChat(onboardingChatId); // Déclenche chargement historique
        return; // Attendre la mise à jour et le chargement
      } else {
        console.error(`[useOnboarding - Simple] Cannot resume: Unable to find single chat ID. Sessions:`, userChatSessions);
        hasRunOnboardingCheckRef.current = false;
        return;
      }
    }

    // --- Étape 4: Attendre la stabilité (messages chargés, pas de streaming) ---
    if (isLoadingMessages || isStreamingResponse) {
      if (isLoadingMessages) console.log(`[useOnboarding Check - Simple] Waiting for messages for chat ${currentChatId}...`);
      if (isStreamingResponse) console.log(`[useOnboarding Check - Simple] Waiting for AI response for chat ${currentChatId}...`);
      hasRunOnboardingCheckRef.current = false; // On attend, on pourra agir après
      return;
    }

    // --- Étape 5: Éviter actions multiples dans un état stable ---
    if (hasRunOnboardingCheckRef.current) {
      console.log("[useOnboarding Check - Simple] Action already performed in this stable cycle. Skipping.");
      return;
    }

    // --- Étape 6: ACTION (Uniquement pour le démarrage initial / reprise à zéro) ---
    console.log(`[useOnboarding ACTION - Simple] Stable state for chat ${currentChatId}. Checking if first message needed...`);
    hasRunOnboardingCheckRef.current = true; // Marquer qu'on a évalué ce cycle

    const messagesInStore = useChatStore.getState().messages;
    const hasExistingOnboardingMessages = messagesInStore.some((msg: Message) => !!msg.METADATAONBOARDING);
    const hasNotAttemptedStart = !onboardingStartAttemptedRef.current;

    // Envoyer la première question SEULEMENT si aucune question d'onboarding n'a jamais été envoyée
    // ET qu'on n'a pas déjà essayé de démarrer dans un cycle précédent.
    if (!hasExistingOnboardingMessages && hasNotAttemptedStart) {
      onboardingStartAttemptedRef.current = true; // Marquer la tentative de démarrage
      const isKedgeAtStart = userUniversity === 'kedge';
      const complianceIndexAtStart = onboardingMessages.findIndex(q => q.metadata === 'COMPLIANCE'); // Normalement 5

      if (isKedgeAtStart) {
        console.log(`🚀 [useOnboarding ACTION - Simple - Kedge] Starting onboarding directly at COMPLIANCE step for chat ${currentChatId}...`);
        sendNextOnboardingMessage(complianceIndexAtStart, messagesInStore); // Envoyer question COMPLIANCE
      } else {
        console.log(`🚀 [useOnboarding ACTION - Simple - Non-Kedge] Starting onboarding sequence / Sending first message for chat ${currentChatId}...`);
        sendNextOnboardingMessage(0, messagesInStore); // Envoyer question 0
      }
    } else {
       console.log(`[useOnboarding ACTION - Simple] Skipping message send: Either messages exist, or start already attempted.`);
       // Si des messages existent déjà (reprise), cet effet ne fait rien de plus.
       // L'utilisateur devra interagir pour continuer.
    }

  }, [
       // Dépendances Primitives ou Stables
       isAppInitialized,
       userId,
       isOnboardingComplete,
       userChatSessions,
       currentChatId,
       isLoadingMessages,
       isStreamingResponse,
       userUniversity,
       // Fonctions Stables
       setActiveChat,
       sendNextOnboardingMessage 
       // determineResumeIndex n'est plus nécessaire
  ]);
  // --- FIN MODIFICATION useEffect ---


  // --- Fonctions de Handler pour les Réponses Spécifiques ---
  // Modifiées pour passer le tableau de messages mis à jour

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



  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
      // Déterminer le texte du résumé en fonction de l'université
      const isKedgeUser = userUniversity === 'kedge';
      const summary = isKedgeUser
        ? `Termes acceptés : ${payload.termsAccepted ? '✔️' : '❌'} | Âge confirmé : ${payload.ageConfirmed ? '✔️' : '❌'}`
        : `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
       // Pour COMPLIANCE, la mise à jour du profil est gérée par l'objet passé
      handleSendGeneric(summary, 6, "COMPLIANCE", { complianceAccepted: true, ...payload });
  }, [handleSendGeneric, userUniversity]);


  



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