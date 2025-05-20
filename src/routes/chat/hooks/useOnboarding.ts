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
    _setIsLoadingOnboardingMessage,
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
    { question: "What's your insta? won't be public — just helps me get your vibe 🏄", metadata: "INSTAGRAM" },
    //{ question: "What's your favorite color?", metadata: "FAVORITE_COLOR" },
    //{ question: "What's your pet's name?", metadata: "PET_NAME" },
    { question: "Second to last question! If you've got a LinkedIn, paste it here, just helps me get your pro side 💼", metadata: "LINKEDIN" },
    { question: "Got a major or minor picked out yet? if you're still figuring it out, totally fine — just click on 'Undecided'", metadata: "MAJOR&MINOR" },
    { question: "Final step! Just check these boxes so we can vibe legally ✅", metadata: "COMPLIANCE" },
  ];

  // --- NOUVEAU: Tableau de messages d'onboarding spécifique à Kedge ---
  const onboardingMessagesKedge = [
    { question: "Salut! Pour commencer, peux-tu me dire quel programme tu suis à Kedge ?", metadata: "SCHOOL_KEDGE" },
    { question: "Super! Et sur quel campus es-tu ?", metadata: "CAMPUS_KEDGE" },
    { question: "Parfait ! Dernière étape, coche ces cases pour qu'on soit sur la même longueur d'onde légalement ✅", metadata: "COMPLIANCE" },
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
    console.time("sendNextOnboardingMessage_ENTIRE_FUNCTION"); // Timer pour toute la fonction
    console.log(`[sendNextOnboardingMessage] Entrée - index: ${index}, currentMessagesSnom length: ${currentMessagesSnom.length}`);

    // ---> Ajout: Vérification KEDGE <---
    const isKedgeUser = userUniversity === 'kedge';
    const currentOnboardingSteps = isKedgeUser ? onboardingMessagesKedge : onboardingMessages;
    const complianceIndex = currentOnboardingSteps.findIndex(q => q.metadata === 'COMPLIANCE');
    const currentUserId = useAuthStore.getState().user?.id;
    const currentChatId = useAuthStore.getState().chatIds[0];

    // Si Kedge et on demande une question AVANT la première (SCHOOL_KEDGE) - ne devrait pas arriver
    // OU si Kedge et on demande une question APRES COMPLIANCE - fin de l'onboarding Kedge
    if (isKedgeUser && (index < 0 || index > complianceIndex)) {
        if (index > complianceIndex) { // Si après compliance, c'est la fin
            console.log("[sendNextOnboardingMessage - Kedge] Condition de finalisation Kedge entrée (index > complianceIndex).");
            console.time("sendNextOnboardingMessage_kedge_finalization_onSubmit_call");
            // Logique de finalisation (similaire à la fin générale mais pour Kedge)
            await updateUserField({ onboardingComplete: true });
            if (previousAnswer && currentUserId && currentChatId) {
                const lastStepMetadata = currentOnboardingSteps[complianceIndex]?.metadata; // Utiliser complianceIndex
                if (lastStepMetadata) {
                    try {
                        console.log(`[useOnboarding - Kedge] Sauvegarde dernière étape humaine (métadata: ${lastStepMetadata}).`);
                        await saveOnboardingStep({ chatId: currentChatId, userId: currentUserId, metadata: lastStepMetadata, message: previousAnswer, type: 'human' });
                    } catch (error) { console.error(`❌ Erreur saveOnboardingStep (fin Kedge, humain) pour ${lastStepMetadata}:`, error); }
                }
            }
            if (typeof fieldToUpdate === 'object') {
                updateUserField(fieldToUpdate);
            }
            const loadingAiMessage: Message = { id: generateUniqueId() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true };
            const historyForSubmit = [...currentMessagesSnom, loadingAiMessage];
            setMessages(historyForSubmit);
            console.log("🏁 [useOnboarding - Kedge] Onboarding Kedge terminé, appel de onSubmit pour message final.");
            setIsStreaming(true);
            await onSubmit(historyForSubmit, '', true); // isOnboardingMessage = true
            console.timeEnd("sendNextOnboardingMessage_kedge_finalization_onSubmit_call");
            // NOUVEAU: Si c'était la première question (index 0) qui mène à la fin
            if (index === 0 && useChatStore.getState().isLoadingOnboardingMessage) { // Vérifie l'état actuel
              console.log("[useOnboarding - Kedge Final] Remise à false de isLoadingOnboardingMessage.");
              _setIsLoadingOnboardingMessage(false);
            }
            console.timeEnd("sendNextOnboardingMessage_ENTIRE_FUNCTION"); // Fin timer
            return;
        }
        console.warn(`[useOnboarding - sendNext - Kedge] Index ${index} hors limites pour Kedge. Arrêt.`);
        return;
    }


    // ---> SÉCURITÉ SUPPLÉMENTAIRE + DÉLAI pour la première question ---
    // S'applique si c'est la toute première question envoyée à l'utilisateur (index 0 du tableau pertinent)
    if (index === 0) { // Concerne la première question du flux (standard ou Kedge)
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

    let messagesAfterUpdate = [...currentMessagesSnom];

    if (index >= currentOnboardingSteps.length) {
      console.log(`[sendNextOnboardingMessage] Condition de finalisation STANDARD entrée (index >= currentOnboardingSteps.length). Index: ${index}, Longueur: ${currentOnboardingSteps.length}`);
      console.time("sendNextOnboardingMessage_standard_finalization_onSubmit_call");
      await updateUserField({ onboardingComplete: true });

      if (previousAnswer && currentUserId && currentChatId) {
        const lastStep = currentOnboardingSteps[currentOnboardingSteps.length - 1];
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
      console.timeEnd("sendNextOnboardingMessage_standard_finalization_onSubmit_call");
      // NOUVEAU: Si c'était la première question (index 0) qui mène à la fin
      if (index === 0 && useChatStore.getState().isLoadingOnboardingMessage) { // Vérifie l'état actuel
        console.log("[useOnboarding - Standard Final] Remise à false de isLoadingOnboardingMessage.");
        _setIsLoadingOnboardingMessage(false);
      }
      console.timeEnd("sendNextOnboardingMessage_ENTIRE_FUNCTION"); // Fin timer
      return;
    }

    // Si on doit sauter la question LinkedIn (ne s'applique pas à Kedge car LinkedIn n'est pas dans leur flux)
    if (!isKedgeUser && index === 3 && skipLinkedInQuestion) {
      console.log("[useOnboarding] Saut de la question LinkedIn car profil déjà trouvé");
      return sendNextOnboardingMessage(4, messagesAfterUpdate, fieldToUpdate, previousAnswer);
    }

    console.log(`[useOnboarding] Préparation étape ${index} pour ${isKedgeUser ? 'Kedge' : 'Standard'}.`);
    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setIsStreaming(true);

    // Récupérer la question originale et le métadata DU BON TABLEAU
    const { question: originalQuestion, metadata } = currentOnboardingSteps[index];
    let questionToSend = originalQuestion;

    // Personnaliser la première question si le nom est disponible ET NON Kedge (pour le flux standard)
    // OU si Kedge et c'est la première question de Kedge (SCHOOL_KEDGE)
    if (userName && index === 0) { // S'applique à la première question de chaque flux
        if (isKedgeUser) {
            // Pour Kedge, la question SCHOOL_KEDGE est déjà personnalisée dans sa définition
            // Mais on peut ajouter le nom si on veut, ex: "Salut ${userName}! Pour commencer..."
            // Pour l'instant, on garde la question telle quelle pour Kedge.
            // Si on veut personnaliser : questionToSend = `Salut ${userName}! ${originalQuestion.charAt(0).toLowerCase() + originalQuestion.slice(1)}`;
            console.log(`[useOnboarding] Question Kedge (index 0 - ${metadata}): "${questionToSend}"`);
        } else { // Flux standard
            questionToSend = `Ok ${userName}, ${originalQuestion.charAt(0).toLowerCase() + originalQuestion.slice(1)}`;
            console.log(`[useOnboarding] Question standard personnalisée pour index 0: "${questionToSend}"`);
        }
    }

    // Personnalisation de la question de conformité pour Kedge (déjà gérée dans le tableau kedge)
    // Si on voulait une personnalisation dynamique ici :
    if (isKedgeUser && metadata === 'COMPLIANCE') {
        if (userName) {
            // La question est déjà "Parfait ! Dernière étape..." on peut la préfixer par le nom si besoin.
            // Exemple: questionToSend = `Parfait ${userName}! Dernière étape...`
            // Pour l'instant, la question dans onboardingMessagesKedge est suffisante.
            console.log(`[useOnboarding] Question de conformité Kedge (personnalisée dans tableau): "${questionToSend}"`);
        } else {
            console.log(`[useOnboarding] Question de conformité Kedge (sans nom, tableau): "${questionToSend}"`);
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
    // NOUVEAU: Remettre à false si c'était la première question et que l'état est toujours vrai
    if (index === 0 && useChatStore.getState().isLoadingOnboardingMessage) { // Vérifie l'état actuel
        console.log("[useOnboarding - sendNext] Premier message (" + metadata + ") streamé, remettant isLoadingOnboardingMessage à false.");
        _setIsLoadingOnboardingMessage(false);
    }
    console.log(`[useOnboarding] Étape ${index} ("${metadata}") affichée.`);
    console.timeEnd("sendNextOnboardingMessage_ENTIRE_FUNCTION"); // Fin timer si pas de return anticipé

  }, [
    generateUniqueId, setMessages, updateUserField, saveOnboardingStep, setIsLandingPageVisible,
    setRelatedQuestions, setIsStreaming, onSubmit, fakeStreamMessage,
    skipLinkedInQuestion, onboardingMessages, onboardingMessagesKedge, userName, userUniversity,
    _setIsLoadingOnboardingMessage,
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
         // NOUVEAU: Si on active le chat pour reprise d'onboarding, on n'est plus en train de "préparer" le tout premier message car l'historique va être chargé.
        // Mais si l'onboarding n'est PAS complet, et qu'on va charger l'historique, il se peut qu'il n'y en ait pas encore
        // et que le premier message soit toujours en attente. Laisser isLoadingOnboardingMessage à true ici est plus sûr.
        // Il sera mis à false par sendNextOnboardingMessage ou le check suivant.
        return; // Attendre la mise à jour et le chargement
      } else {
        console.error(`[useOnboarding - Simple] Cannot resume: Unable to find single chat ID. Sessions:`, userChatSessions);
        // NOUVEAU: Si on ne peut pas reprendre, on ne "prépare" plus rien.
        if (useChatStore.getState().isLoadingOnboardingMessage) _setIsLoadingOnboardingMessage(false);
        hasRunOnboardingCheckRef.current = false;
        return;
      }
    }

    // --- Étape 4: Attendre la stabilité (messages chargés, pas de streaming) ---    
    if (isLoadingMessages || isStreamingResponse) {
      if (isLoadingMessages) console.log(`[useOnboarding Check - Simple] Waiting for messages for chat ${currentChatId}...`);
      if (isStreamingResponse) console.log(`[useOnboarding Check - Simple] Waiting for AI response for chat ${currentChatId}...`);
      // Ne pas toucher à hasRunOnboardingCheckRef.current ici, pour permettre une action au prochain cycle stable.
      return;
    }

    // --- Étape 5: Gérer le cas où l'utilisateur est déjà onboardé --- 
    if (isOnboardingComplete) {
      // NOUVEAU: Si l'utilisateur est déjà onboardé, s'assurer que isLoadingOnboardingMessage est false.
      if (useChatStore.getState().isLoadingOnboardingMessage) {
        console.log("[useOnboarding Check - Simple] User already onboarded. Setting isLoadingOnboardingMessage to false.");
        _setIsLoadingOnboardingMessage(false);
      }
      hasRunOnboardingCheckRef.current = false; // Pas besoin d'agir plus pour l'onboarding
      onboardingStartAttemptedRef.current = false;
      return;
    }

    // --- Étape 6: Éviter actions multiples dans un état stable --- 
    if (hasRunOnboardingCheckRef.current) {
      console.log("[useOnboarding Check - Simple] Action already performed in this stable cycle. Skipping.");
      return;
    }

    // --- Étape 7: ACTION (Démarrage initial / reprise à zéro pour un utilisateur non onboardé) ---
    console.log(`[useOnboarding ACTION - Simple] Stable state for chat ${currentChatId}. Checking if first message needed...`);
    hasRunOnboardingCheckRef.current = true; // Marquer qu'on a évalué ce cycle

    const messagesInStore = useChatStore.getState().messages;
    const hasExistingOnboardingMessages = messagesInStore.some((msg: Message) => !!msg.METADATAONBOARDING);
    const hasNotAttemptedStart = !onboardingStartAttemptedRef.current;

    // Envoyer la première question SEULEMENT si aucune question d'onboarding n'a jamais été envoyée
    // ET qu'on n'a pas déjà essayé de démarrer dans un cycle précédent.
    // ET que isLoadingOnboardingMessage est toujours vrai (ce qui signifie qu'on ne l'a pas encore mis à false via une autre logique)
    if (!hasExistingOnboardingMessages && hasNotAttemptedStart && useChatStore.getState().isLoadingOnboardingMessage) {
      onboardingStartAttemptedRef.current = true; // Marquer la tentative de démarrage
      // Pas besoin de mettre isLoadingOnboardingMessage à true ici, car il est déjà true par défaut.
      console.log("[useOnboarding ACTION - Simple] isLoadingOnboardingMessage est true, on va envoyer le premier message.");

      const isKedgeAtStart = userUniversity === 'kedge';
      if (isKedgeAtStart) {
        // Pour Kedge, on commence toujours par la première question de leur flux (SCHOOL_KEDGE)
        console.log(`🚀 [useOnboarding ACTION - Simple - Kedge] Starting Kedge onboarding at SCHOOL_KEDGE step for chat ${currentChatId}...`);
        sendNextOnboardingMessage(0, messagesInStore); // Envoyer la première question KEDGE (index 0 de onboardingMessagesKedge)
      } else {
        console.log(`🚀 [useOnboarding ACTION - Simple - Non-Kedge] Starting onboarding sequence / Sending first message for chat ${currentChatId}...`);
        sendNextOnboardingMessage(0, messagesInStore); // Envoyer question 0 (standard)
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
    console.time("handleSendINSTAGRAMMessage_total_execution_time");

    // Déterminer l'index suivant AVANT d'appeler handleSendGeneric
    // (même si handleSendGeneric le prend en argument, c'est plus clair ici)
    // Cette partie dépend de l'état de skipLinkedInQuestion qui doit être à jour.
    const userProfileForSkipCheck = useAuthStore.getState().user; 
    setSkipLinkedInQuestion(userProfileForSkipCheck?.linkedin_profile === true);
    const nextIndex = getNextQuestionIndex(2); // 2 est l'index d'INSTAGRAM
    console.log(`[handleSendINSTAGRAMMessage] nextIndex déterminé: ${nextIndex}, skipLinkedIn: ${skipLinkedInQuestion}`);

    // Appeler handleSendGeneric pour la logique standard : ajout msg, sauvegarde, update field, appel sendNext
    console.time("handleSendGeneric_for_instagram_call");
    await handleSendGeneric(instagramMessage, nextIndex, "INSTAGRAM", 'instagram_username');
    console.timeEnd("handleSendGeneric_for_instagram_call");

    // Lancer le scraping Instagram en parallèle SANS await APRÈS que la transition vers la question suivante est initiée par handleSendGeneric
    const currentUserId = useAuthStore.getState().user?.id;
    if (currentUserId && instagramMessage.toLowerCase() !== "don't want to answer") { // Ne pas scraper si l'utilisateur ne veut pas partager
      console.log("[useOnboarding] Lancement SANS AWAIT de scrapeInstagramProfile avec le username:", instagramMessage);
      scrapeInstagramProfile(instagramMessage, currentUserId)
        .then(instagramData => {
          if (instagramData) {
            console.log("[useOnboarding] Scraping Instagram (async) terminé, Firestore devrait être mis à jour et le store suivra.");
          }
        })
        .catch(error => {
          console.error("[useOnboarding] Erreur lors du scraping Instagram (async):", error);
        });
    } else if (instagramMessage.toLowerCase() === "don't want to answer") {
      console.log("[useOnboarding] L'utilisateur ne souhaite pas partager son Instagram, pas de scraping.");
    }

    console.timeEnd("handleSendINSTAGRAMMessage_total_execution_time");

  }, [generateUniqueId, setMessages, saveOnboardingStep, updateUserField, sendNextOnboardingMessage, getNextQuestionIndex, handleSendGeneric, skipLinkedInQuestion, setSkipLinkedInQuestion]); // Ajout handleSendGeneric et gestion skipLinkedIn



  const handleSendLINKEDINMessage = useCallback(async (linkedinMessage: string) => {
    console.time("handleSendLINKEDINMessage_total");

    // L'index suivant après LINKEDIN (index 3) est MAJOR&MINOR (index 4)
    const nextIndex = 4;

    // Appeler handleSendGeneric pour la logique standard
    // Note: handleSendGeneric appelle sendNextOnboardingMessage à l'intérieur
    console.time("handleSendGeneric_for_linkedin_call");
    await handleSendGeneric(linkedinMessage, nextIndex, "LINKEDIN", 'linkedin_url');
    console.timeEnd("handleSendGeneric_for_linkedin_call");
    
    // Lancer le scraping LinkedIn en parallèle SANS await APRÈS que la transition est initiée
    const currentUserId = useAuthStore.getState().user?.id;
    if (currentUserId && linkedinMessage.toLowerCase() !== "don't want to answer") { 
      console.log("[useOnboarding] Lancement SANS AWAIT de scrapeLinkedInProfile avec l'URL:", linkedinMessage);
      scrapeLinkedInProfile(linkedinMessage, currentUserId)
        .then(linkedinData => {
          if (linkedinData) {
            console.log("[useOnboarding] Scraping LinkedIn (async) terminé, Firestore devrait être mis à jour et le store suivra.");
            // La mise à jour Firestore déclenchera l'écouteur dans useAuthStore,
            // qui mettra à jour user.linkedin_profile. 
            // La prochaine fois que getNextQuestionIndex sera appelé (ex: dans handleSendINSTAGRAMMessage),
            // il lira la valeur à jour depuis le store via useAuthStore.getState().user.
          }
        })
        .catch(error => {
          console.error("[useOnboarding] Erreur lors du scraping LinkedIn (async):", error);
        });
    } else if (linkedinMessage.toLowerCase() === "don't want to answer") {
      console.log("[useOnboarding] L'utilisateur ne souhaite pas partager son LinkedIn, pas de scraping.");
      // updateUserField({ linkedin_profile: false }); // Optionnel: Marquer explicitement comme non trouvé/partagé
    }
    console.timeEnd("handleSendLINKEDINMessage_total");
  }, [handleSendGeneric]); // handleSendGeneric est la seule dépendance externe directe nécessaire ici


  const handleSendMAJORMINORMessage = useCallback(({ majors, minors }: { majors: string[]; minors: string[]; }) => {
      const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
      // Pour MAJORMINOR, la mise à jour du profil est gérée par l'objet passé
      handleSendGeneric(content, 5, "MAJOR&MINOR", { major: majors, minor: minors });
  }, [handleSendGeneric]);



  const handleSendCOMPLIANCEMessage = useCallback((payload: { termsAccepted: boolean; ageConfirmed: boolean; }) => {
      // Déterminer le texte du résumé en fonction de l'université
      const currentIsKedgeUser = userUniversity === 'kedge';
      const summary = currentIsKedgeUser
        ? `Termes acceptés : ${payload.termsAccepted ? '✔️' : '❌'} | Âge confirmé : ${payload.ageConfirmed ? '✔️' : '❌'}`
        : `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${payload.ageConfirmed ? '✔️' : '❌'}`;
       // Pour COMPLIANCE, la mise à jour du profil est gérée par l'objet passé
      const nextIndex = currentIsKedgeUser ? onboardingMessagesKedge.findIndex(q => q.metadata === 'COMPLIANCE') + 1 : 6; // Ajuster l'index pour Kedge
      handleSendGeneric(summary, nextIndex, "COMPLIANCE", { complianceAccepted: true, ...payload });
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

  // --- NOUVEAU HANDLER POUR SCHOOL_KEDGE ---
  const handleSendSCHOOLKEDGEMessage = useCallback((programMessage: string) => {
    console.log("[useOnboarding] handleSendSCHOOLKEDGEMessage appelée avec:", programMessage);
    // L'index suivant dans onboardingMessagesKedge est CAMPUS_KEDGE (index 1)
    console.log("[useOnboarding] Appel de handleSendGeneric pour SCHOOL_KEDGE avec index 1, metadata SCHOOL_KEDGE, field faculty, valeur à sauvegarder (dans un tableau):", [programMessage]);
    handleSendGeneric(programMessage, 1, "SCHOOL_KEDGE", 'year', [programMessage]);
}, [handleSendGeneric]);

  // --- NOUVEAU HANDLER POUR CAMPUS_KEDGE ---
  const handleSendCAMPUSKEDGEMessage = useCallback((campusMessage: string) => {
    console.log("[useOnboarding] handleSendCAMPUSKEDGEMessage appelée avec:", campusMessage);
    // L'index suivant dans onboardingMessagesKedge est COMPLIANCE (index 2)
    // Enregistre la valeur du campus dans le champ 'faculty' (qui est string[])
    console.log("[useOnboarding] Appel de handleSendGeneric pour CAMPUS_KEDGE avec index 2, metadata CAMPUS_KEDGE, field faculty, valeur à sauvegarder (dans un tableau):", [campusMessage]);
    handleSendGeneric(campusMessage, 2, "CAMPUS_KEDGE", 'faculty', [campusMessage]); // Enregistre comme [campusMessage]
  }, [handleSendGeneric]);

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
    handleSendSCHOOLKEDGEMessage, // Exporter le nouveau handler
    handleSendCAMPUSKEDGEMessage, // Exporter le nouveau handler
  };
};