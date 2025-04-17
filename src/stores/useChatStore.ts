import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp, // Importer Timestamp
  Unsubscribe, // Importer Unsubscribe pour le retour du listener
  documentId, // <-- Importer documentId
} from 'firebase/firestore';
import { db} from '../auth/firebase'; // Assurez-vous que le chemin est correct
import { getChatHistory, saveMessageAIToBackend } from '../api/chat'; // Assurez-vous que le chemin est correct
import { v4 as uuidv4 } from 'uuid';
import {
  Message,
  Conversation,
  SocialThread,
  AnswerDocument,
  AnswerTAK,
  AnswerCHART,
  AnswerCourse,
  AnswerWaiting,
  ReasoningStep,
  AnswerREDDIT,
  AnswerINSTA,
  AnswerYOUTUBE,
  AnswerQUORA,
  AnswerINSTA_CLUB,
  AnswerLINKEDIN,
  AnswerINSTA2,
  AnswerERROR,
  AnswerACCURACYSCORE,
  AnswerTITLEANDCATEGORY,
} from '../interfaces/interfaces_eleve'; // Assurez-vous que le chemin est correct
import useAuthStore from './useAuthStore'; // Importer pour accéder à l'état d'authentification
import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

// --- Interface pour l'état du Chat Store ---
interface ChatState {
  // Core State
  messages: Message[];
  conversations: Conversation[]; // Historique des conversations de l'utilisateur
  socialThreads: SocialThread[]; // Threads publics de l'université
  currentChatId: string | null; // ID de la conversation actuellement affichée/active
  isLandingPageVisible: boolean; // Afficher la page d'accueil du chat ?
  isSocialThreadActive: boolean; // Le chat actif est-il un thread social ?
  isCurrentChatPrivate: boolean; // Le chat actif est-il privé ?

  // Loading States
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;
  isLoadingSocialThreads: boolean;
  isStreamingResponse: boolean; // Indique si l'IA est en train de répondre

  // Other UI/Data States
  unreadSocialThreadsCount: number;
  relatedQuestions: string[];
  error: string | null; // Pour les erreurs spécifiques au chat
  abortController: AbortController | null; // Pour gérer l'annulation des requêtes

  // --- Actions ---

  // Internal Setters (optionnel, pour la clarté)
  setMessages: (messages: Message[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setSocialThreads: (threads: SocialThread[]) => void;
  _setCurrentChatId: (chatId: string | null) => void;
  setIsLandingPageVisible: (isVisible: boolean) => void;
  setIsSocialThreadActive: (isActive: boolean) => void;
  _setIsCurrentChatPrivate: (isPrivate: boolean) => void;
  _setIsLoadingMessages: (isLoading: boolean) => void;
  _setIsLoadingConversations: (isLoading: boolean) => void;
  _setIsLoadingSocialThreads: (isLoading: boolean) => void;
  _setIsStreamingResponse: (isStreaming: boolean) => void;
  _setUnreadSocialThreadsCount: (count: number) => void;
  _setRelatedQuestions: (questions: string[]) => void;
  _setError: (error: string | null) => void;
  setAbortController: (controller: AbortController | null) => void; // Action pour définir l'AbortController

  // Public Actions / Business Logic
  addOptimisticMessage: (humanMessageContent: string) => Message[]; // Ajoute message humain + placeholder AI
  updateLastAiMessage: (packet: any) => void; // Met à jour le dernier message AI pendant le streaming
  finalizeAiMessage: (aiMessageContent: string, metadata: Partial<Message>) => Promise<void>; // Finalise le message AI et le sauvegarde
  setMessagesList: (messages: Message[]) => void; // Remplace la liste complète des messages
  clearChatState: () => void; // Réinitialise l'état du chat (utile à la déconnexion)

  fetchSocialThreads: () => Unsubscribe; // Initialise le listener pour les threads sociaux
  loadChatMessages: (chatId: string) => Promise<void>; // Charge les messages et détails d'un chat spécifique
  setActiveChat: (chatId: string | null) => void; // Définit le chat actif (peut appeler loadChatMessages)

  addNewConversation: () => Promise<string | null>; // Crée une nouvelle conversation
  renameConversation: (chatId: string, newName: string) => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  updateConversationPrivacy: (chatId: string, isPrivate: boolean) => Promise<void>;
  updateConversationTitleAndTopic: (chatId: string, title: string, category: string) => Promise<void>;
  markSocialThreadAsRead: (chatId: string) => Promise<void>;

  // --- Nouvelles actions/états pour le listener dynamique des conversations ---
  _conversationListenerUnsubscribe: Unsubscribe | null; // Stocker l'unsubscribe du listener conversations
  _setConversationListenerUnsubscribe: (unsubscribe: Unsubscribe | null) => void; // Setter
  _listenToConversations: (chatIds: string[]) => void; // La fonction qui met en place le listener
  cleanupConversationListener: () => void; // Pour arrêter le listener
}


// --- Création du Store Zustand avec typage explicite ---
const chatStoreCreator: StateCreator<ChatState> = (set, get) => ({
  // --- État Initial ---
  messages: [],
  conversations: [],
  socialThreads: [],
  currentChatId: null,
  isLandingPageVisible: true, // Commence sur la landing page par défaut
  isSocialThreadActive: false,
  isCurrentChatPrivate: false,
  isLoadingMessages: false,
  isLoadingConversations: false, // Sera géré par le nouveau listener
  isLoadingSocialThreads: false,
  isStreamingResponse: false,
  unreadSocialThreadsCount: 0,
  relatedQuestions: [],
  error: null,
  abortController: null, 
  _conversationListenerUnsubscribe: null, // <-- Initialiser à null

  // --- Internal Setters ---
  setMessages: (messages: Message[]) => set({ messages }),
  setConversations: (conversations: Conversation[]) => set({ conversations }),
  setSocialThreads: (threads: SocialThread[]) => set({ socialThreads: threads }),
  _setCurrentChatId: (chatId: string | null) => set({ currentChatId: chatId }),
  setIsLandingPageVisible: (isVisible: boolean) => set({ isLandingPageVisible: isVisible }),
  setIsSocialThreadActive: (isActive: boolean) => set({ isSocialThreadActive: isActive }),
  _setIsCurrentChatPrivate: (isPrivate: boolean) => set({ isCurrentChatPrivate: isPrivate }),
  _setIsLoadingMessages: (isLoading: boolean) => set({ isLoadingMessages: isLoading, error: null }), // Clear error on load
  _setIsLoadingConversations: (isLoading: boolean) => set({ isLoadingConversations: isLoading, error: null }),
  _setIsLoadingSocialThreads: (isLoading: boolean) => set({ isLoadingSocialThreads: isLoading, error: null }),
  _setIsStreamingResponse: (isStreaming: boolean) => set({ isStreamingResponse: isStreaming }),
  _setUnreadSocialThreadsCount: (count: number) => set({ unreadSocialThreadsCount: count }),
  _setRelatedQuestions: (questions: string[]) => set({ relatedQuestions: questions }),
  _setError: (error: string | null) => set({ error: error, isLoadingMessages: false, isLoadingConversations: false, isLoadingSocialThreads: false }), // Stop loading on error
  setAbortController: (controller) => set({ abortController: controller }), // Implémenter l'action
  _setConversationListenerUnsubscribe: (unsubscribe) => set({ _conversationListenerUnsubscribe: unsubscribe }), // <-- Implémenter le setter

  // --- Public Actions ---

  setMessagesList: (messages: Message[]) => {
    get().setMessages(messages); // Utilise le setter interne
  },

  addOptimisticMessage: (humanMessageContent: string) => {
    const uniqueHumanId = Date.now(); // Simple unique ID generation
    const uniqueAiId = uniqueHumanId + 1;

    const humanMessage: Message = {
      id: uniqueHumanId,
      type: 'human',
      content: humanMessageContent,
      // timestamp: new Date().toISOString() // Optionally add timestamp
    };
    const loadingAiMessage: Message = {
      id: uniqueAiId,
      type: 'ai',
      content: '', // Placeholder content
      personaName: 'Lucy',
      isLoading: true, // Indique que le message est en cours de chargement
      // timestamp: new Date().toISOString()
    };

    const newMessages = [...get().messages, humanMessage, loadingAiMessage];
    set({ messages: newMessages, isStreamingResponse: true });
    return newMessages; // Return the updated array for potential use in onSubmit
  },

  updateLastAiMessage: (packet: any) => {
    // This needs careful implementation based on how `onSubmit` provides packets
    // It should find the last message with isLoading: true and update its content/metadata
    set((state) => {
        const currentMessages = state.messages;
        // Trouve le dernier message AI qui est marqué comme 'isLoading'
        const lastMessageIndex = currentMessages.findIndex(m => m.type === 'ai' && m.isLoading === true);

        if (lastMessageIndex === -1) {
          console.warn("updateLastAiMessage: No loading AI message found to update.");
          return {}; // No loading message found
        }

        const updatedMessages = [...currentMessages];
        const currentAiMessage = updatedMessages[lastMessageIndex];

        // ---> MODIFICATION : Déterminer si c'est la première mise à jour pour ce message <--- 
        const isFirstUpdate = currentAiMessage.isLoading === true;

        let newContent = currentAiMessage.content;
        let newMetadata: Partial<Message> = {};

        // Logic to parse the packet and update content/metadata
        // (Adapt this based on the actual structure of `packet` from useMessage's onSubmit)
        if (typeof packet === 'string') {
            // Si le packet est juste une string, on assume que c'est `answer_piece`
            newContent += packet; // Accumule le contenu texte
        } else if (packet && typeof packet === 'object') {
             if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
                // Accumule le contenu texte du paquet 'answer_piece'
                newContent += (packet as { answer_piece: string }).answer_piece;
            } else {
                // Accumulate metadata (documents, images, TAK, etc.)
                 if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) newMetadata.citedDocuments = [...(currentAiMessage.citedDocuments || []), (packet as { answer_document: AnswerDocument }).answer_document];
                 if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) newMetadata.images = [...(currentAiMessage.images || []), (packet as { image_data: any }).image_data];
                 if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) newMetadata.TAK = [...(currentAiMessage.TAK || []), (packet as { answer_TAK_data: AnswerTAK }).answer_TAK_data];
                 if (Object.prototype.hasOwnProperty.call(packet, 'answer_CHART_data')) newMetadata.CHART = [...(currentAiMessage.CHART || []), (packet as { answer_CHART_data: AnswerCHART }).answer_CHART_data];
                 if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) newMetadata.COURSE = [...(currentAiMessage.COURSE || []), (packet as { answer_COURSE_data: AnswerCourse }).answer_COURSE_data];
                 if (Object.prototype.hasOwnProperty.call(packet, 'reasoning_steps')) newMetadata.ReasoningSteps = [...(currentAiMessage.ReasoningSteps || []), (packet as { reasoning_steps: ReasoningStep }).reasoning_steps];
                 if (Object.prototype.hasOwnProperty.call(packet, 'waitingMessages')) newMetadata.waitingMessages = [...(currentAiMessage.waitingMessages || []), (packet as { waitingMessages: AnswerWaiting }).waitingMessages];
                 if (Object.prototype.hasOwnProperty.call(packet, 'REDDIT')) newMetadata.REDDIT = [...(currentAiMessage.REDDIT || []), (packet as { REDDIT: AnswerREDDIT }).REDDIT];
                 if (Object.prototype.hasOwnProperty.call(packet, 'INSTA')) newMetadata.INSTA = [...(currentAiMessage.INSTA || []), (packet as { INSTA: AnswerINSTA }).INSTA];
                 if (Object.prototype.hasOwnProperty.call(packet, 'YOUTUBE')) newMetadata.YOUTUBE = [...(currentAiMessage.YOUTUBE || []), (packet as { YOUTUBE: AnswerYOUTUBE }).YOUTUBE];
                 if (Object.prototype.hasOwnProperty.call(packet, 'QUORA')) newMetadata.QUORA = [...(currentAiMessage.QUORA || []), (packet as { QUORA: AnswerQUORA }).QUORA];
                 if (Object.prototype.hasOwnProperty.call(packet, 'ERROR')) newMetadata.ERROR = [...(currentAiMessage.ERROR || []), (packet as { ERROR: AnswerERROR }).ERROR];
                 if (Object.prototype.hasOwnProperty.call(packet, 'CONFIDENCESCORE')) newMetadata.CONFIDENCESCORE = [...(currentAiMessage.CONFIDENCESCORE || []), (packet as { CONFIDENCESCORE: AnswerACCURACYSCORE }).CONFIDENCESCORE];
                 if (Object.prototype.hasOwnProperty.call(packet, 'INSTA_CLUB')) newMetadata.INSTA_CLUB = [...(currentAiMessage.INSTA_CLUB || []), (packet as { INSTA_CLUB: AnswerINSTA_CLUB }).INSTA_CLUB];
                 if (Object.prototype.hasOwnProperty.call(packet, 'LINKEDIN')) newMetadata.LINKEDIN = [...(currentAiMessage.LINKEDIN || []), (packet as { LINKEDIN: AnswerLINKEDIN }).LINKEDIN];
                 if (Object.prototype.hasOwnProperty.call(packet, 'INSTA2')) newMetadata.INSTA2 = [...(currentAiMessage.INSTA2 || []), (packet as { INSTA2: AnswerINSTA2 }).INSTA2];
                 if (Object.prototype.hasOwnProperty.call(packet, 'METADATAONBOARDING')) newMetadata.METADATAONBOARDING = (packet as { METADATAONBOARDING: string }).METADATAONBOARDING;
                 if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) get()._setRelatedQuestions((packet as { related_questions: string[] }).related_questions);
                 if (Object.prototype.hasOwnProperty.call(packet, 'TITLEANDCATEGORY')) {
                   const titleAndCategory = (packet as { TITLEANDCATEGORY: AnswerTITLEANDCATEGORY }).TITLEANDCATEGORY;
                   // Mettre à jour le titre et le sujet de la conversation active
                   const currentChatId = get().currentChatId;
                   if (currentChatId && titleAndCategory.conversation_title && titleAndCategory.category) {
                     get().updateConversationTitleAndTopic(currentChatId, titleAndCategory.conversation_title, titleAndCategory.category);
                   }
                 }

            }
        }

         // Update the specific AI message
        updatedMessages[lastMessageIndex] = {
            ...currentAiMessage,
            content: newContent.replace(/\|/g, ''), // Remove potential delimiters and update content
            ...newMetadata, // Merge new metadata
            // ---> MODIFICATION : Mettre isLoading à false dès la première update <--- 
            isLoading: isFirstUpdate ? false : currentAiMessage.isLoading, // Set to false on first update, keep current state otherwise (should be false after first)
        };

        return { messages: updatedMessages };
    });
  },

  finalizeAiMessage: async (aiMessageContent: string, metadata: Partial<Message>) => {
    let finalAiMessageFromState: Message | undefined;
    set((state) => {
        const currentMessages = state.messages;
        // Trouve le dernier message AI marqué comme isLoading
        const lastMessageIndex = currentMessages.findIndex(m => m.type === 'ai' && m.isLoading === true);

        if (lastMessageIndex === -1) {
          console.warn("finalizeAiMessage: No loading AI message found to finalize.");
          return {}; // Rien à faire
        }

        const updatedMessages = [...currentMessages];
        const finalAiMessage: Message = {
            ...updatedMessages[lastMessageIndex], // Copie le message existant (avec métadonnées accumulées)
            content: aiMessageContent, // Met à jour le contenu final
            isLoading: false, // Marque comme non en chargement
            ...metadata, // Fusionne les métadonnées finales (au cas où)
        };

        updatedMessages[lastMessageIndex] = finalAiMessage;
        finalAiMessageFromState = finalAiMessage;

        return { messages: updatedMessages, isStreamingResponse: false, relatedQuestions: [] }; // Fin du streaming, reset related questions
    });

    // Sauvegarde finale en backend
    if (get().currentChatId && useAuthStore.getState().user?.id && finalAiMessageFromState) {
        try {
            // ---> CORRECTION Linter Error 1 : Revenir à l'appel API original <---
            // Récupérer le dernier message AI finalisé
            const lastHumanMessage = get().messages.slice(0, get().messages.length - 1).reverse().find(m => m.type === 'human')?.content || '';

            if (finalAiMessageFromState) {
                console.log("ChatStore: Saving finalized AI message to backend...");
                await saveMessageAIToBackend({
                   message: finalAiMessageFromState.content, // Utiliser le contenu final
                   chatSessionId: get().currentChatId!,
                   courseId: 'default_course_id', // Ou récupérer dynamiquement si nécessaire
                   username: 'Lucy', // Nom du persona
                   type: 'ai',
                   uid: useAuthStore.getState().user!.id,
                   input_message: lastHumanMessage,
                   university: useAuthStore.getState().user!.university || '',
                   // Inclure d'autres métadonnées si attendues par l'API
                   // (Ex: sources, confidence score, etc. si finalAiMessage les contient)
                   sources: finalAiMessageFromState.citedDocuments, // Utiliser directement citedDocuments si le format correspond
                   confident_score: finalAiMessageFromState.CONFIDENCESCORE && finalAiMessageFromState.CONFIDENCESCORE.length > 0 ? parseFloat(finalAiMessageFromState.CONFIDENCESCORE[0].confidenceScore) : null, // Extraire et convertir le score
                });
                 console.log("ChatStore: Finalized AI message saved successfully.");
            } else {
                 console.warn("finalizeAiMessage: Last AI message not found for saving.");
            }
        } catch (error) {
            console.error("finalizeAiMessage: Failed to save AI message to backend:", error);
            get()._setError("Failed to save response.");
        }
    }
  },

  clearChatState: () => {
    console.log("[ChatStore] Clearing chat state (logout or error).");
    set({
      messages: [],
      conversations: [],
      socialThreads: [],
      currentChatId: null,
      isLandingPageVisible: true, // Réinitialiser sur la landing page
      isSocialThreadActive: false,
      isCurrentChatPrivate: false,
      isLoadingMessages: false,
      isLoadingConversations: false,
      isLoadingSocialThreads: false,
      isStreamingResponse: false,
      unreadSocialThreadsCount: 0,
      relatedQuestions: [],
      error: null,
      abortController: null,
    });
    get().cleanupConversationListener();
  },

  // --- Data Fetching Actions --- (Modifiées/Nouvelles)

  // Nouvelle fonction interne pour mettre en place le listener
  _listenToConversations: (chatIds) => {
    const { 
        conversations: currentConversations, // Récupérer les conversations actuelles
        setConversations, 
        _setError, 
        _setIsLoadingConversations, 
        setActiveChat, 
        cleanupConversationListener, // Utiliser pour nettoyer avant de relancer
        _setConversationListenerUnsubscribe 
    } = get();
    const university = useAuthStore.getState().user?.university; // Besoin de l'université pour le filtre client

    // 1. Nettoyer l'ancien listener s'il existe
    cleanupConversationListener();
    console.log("[ChatStore - _listenToConversations] Starting listener setup.");

    if (!university) {
      console.warn("[ChatStore - _listenToConversations] University missing. Cannot listen to conversations.");
      setConversations([]);
      _setError("University information missing.");
      _setIsLoadingConversations(false);
      return; // Ne rien faire
    }

    if (!chatIds || chatIds.length === 0) {
      console.log("[ChatStore - _listenToConversations] No chat IDs provided. Setting empty list and stopping loading.");
      setConversations([]);
      _setIsLoadingConversations(false);
      // Si l'utilisateur actif était dans la liste précédente, le désactiver ?
      // Ou laisser InitializeAppLogic gérer la sélection initiale.
      // Pour l'instant, on vide juste la liste.
      return; // Ne rien faire
    }

    console.log(`[ChatStore - _listenToConversations] Setting up listener for ${chatIds.length} chat IDs.`);
    _setIsLoadingConversations(true);

    const conversationsRef = collection(db, 'chatsessions');
    // Gérer le cas > 30 IDs si nécessaire (plusieurs listeners)
    // Pour l'instant: slice(0, 30)
    const q = query(
      conversationsRef,
      where(documentId(), 'in', chatIds.slice(0, 30)), 
      orderBy('modified_at', 'desc') 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatStore - _listenToConversations] Snapshot received ${snapshot.docs.length} docs.`);
      // Note: isLoadingConversations est déjà à true, pas besoin de le re-vérifier ici pour la logique initiale
      
      const fetchedConversations: Conversation[] = snapshot.docs
         .filter(doc => doc.data().university === university) // Filtre client université
         .map(doc => {
            const data = doc.data();
            const threadType = data.thread_type === 'Public' ? 'Public' : 'Private';
            return {
                chat_id: doc.id,
                name: data.name || 'Untitled Conversation',
                modified_at: (data.modified_at as Timestamp)?.toDate(),
                thread_type: threadType,
                topic: data.topic || 'General',
            };
         });

      // Tri côté client car Firestore ne garantit pas l'ordre avec la clause 'in'
      const sortedConversations = [...fetchedConversations].sort((a, b) => {
        const timeA = a.modified_at instanceof Date ? a.modified_at.getTime() : 0;
        const timeB = b.modified_at instanceof Date ? b.modified_at.getTime() : 0;
        return timeB - timeA;
      });

      // ---> AJOUT : Comparer avec l'état actuel avant de mettre à jour <---
      // Utilisation de JSON.stringify pour une comparaison simple. Pour de grandes listes,
      // une comparaison plus optimisée pourrait être nécessaire.
      const currentConversationsString = JSON.stringify(currentConversations);
      const newConversationsString = JSON.stringify(sortedConversations);

      if (currentConversationsString !== newConversationsString) {
          console.log(`[ChatStore - _listenToConversations] Conversation data changed. Updating state.`);
          setConversations(sortedConversations);
      } else {
           console.log(`[ChatStore - _listenToConversations] Conversation data has not changed. Skipping state update.`);
      }
      // Mettre à jour isLoading et error quel que soit le changement de données
      _setIsLoadingConversations(false);
      _setError(null);

      // Gérer la sélection initiale/désélection si le chat actif disparaît
      const currentChatId = get().currentChatId;
      // ---> Utiliser sortedConversations pour la vérification <---
      const activeChatExists = currentChatId && sortedConversations.some(c => c.chat_id === currentChatId);
      
      if (currentChatId && !activeChatExists) {
          console.log(`[ChatStore - _listenToConversations] Active chat ${currentChatId} no longer exists in fetched list. Setting active chat to null.`);
          // On pourrait sélectionner la première conv de la nouvelle liste, ou null
          setActiveChat(null); // Option simple: revenir à landing
      } 
      // La logique pour sélectionner le *premier* chat lors du chargement initial
      // devrait être gérée par l'orchestrateur (InitializeAppLogic)

    }, (error) => {
      console.error("[ChatStore - _listenToConversations] Listener error:", error);
      _setError("Failed to load conversation history listener.");
      setConversations([]);
      _setIsLoadingConversations(false);
      _setConversationListenerUnsubscribe(null); // Assurer le nettoyage en cas d'erreur listener
    });

    // Stocker la fonction de désabonnement
    _setConversationListenerUnsubscribe(unsubscribe);
    console.log("[ChatStore - _listenToConversations] Listener setup complete.");
  },

  // Nouvelle fonction pour nettoyer le listener
  cleanupConversationListener: () => {
      const unsubscribe = get()._conversationListenerUnsubscribe;
      if (unsubscribe) {
          console.log("[ChatStore] Cleaning up previous conversation listener.");
          unsubscribe();
          set({ _conversationListenerUnsubscribe: null });
      }
  },

  fetchSocialThreads: () => {
    // Log au début de l'action
    console.log("[ChatStore - fetchSocialThreads] Action started.");
    const { user } = useAuthStore.getState();
    const university = user?.university;

    // Log l'université utilisée
    console.log(`[ChatStore - fetchSocialThreads] Using university: ${university}`);

    if (!university) {
      console.warn("[ChatStore - fetchSocialThreads] University not found in auth state. Aborting listener setup.");
      set({ isLoadingSocialThreads: false, socialThreads: [], unreadSocialThreadsCount: 0 });
      return () => { console.log("[ChatStore - fetchSocialThreads] Returning No-Op Unsubscribe (no university)."); }; // Return no-op unsubscribe
    }

    set({ isLoadingSocialThreads: true });
    console.log(`[ChatStore - fetchSocialThreads] Setting up Firestore listener for university: ${university}`);

    const q = query(
      collection(db, "chatsessions"),
      where("university", "==", university),
      where("thread_type", "==", "Public"), // Firestore filter for Public
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Log quand le listener reçoit des données
      console.log(`[ChatStore - fetchSocialThreads] onSnapshot triggered. Received ${snapshot.docs.length} documents.`);
      const userId = useAuthStore.getState().user?.id; // Re-fetch user state in case it changed? Safer.
      let unreadCount = 0;

      const threads: SocialThread[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Log les données brutes de chaque document reçu
          // console.log(`[ChatStore - fetchSocialThreads] Processing doc ${doc.id}:`, data);
          if (!data || typeof data !== 'object' || !data.name || data.name === "New Chat") {
             console.log(`[ChatStore - fetchSocialThreads] Filtering out doc ${doc.id} due to invalid name or data.`);
              return null; // Filter out invalid threads
          }
          const isRead = !!userId && Array.isArray(data.ReadBy) && data.ReadBy.includes(userId);
          if (!isRead) {
            unreadCount++;
          }
          const thread: SocialThread = {
            chat_id: doc.id,
            name: data.name,
            // Safely handle timestamp conversion
            created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : (data.created_at?.seconds ? new Date(data.created_at.seconds * 1000) : new Date(0)),
            topic: data.topic || "Default",
            thread_type: "Public",
            university: data.university || "Default", // Ensure university is added if missing in source data
            isRead: isRead,
          };
          return thread;
        })
        .filter((thread): thread is SocialThread => thread !== null); // Type guard to remove nulls

      // Log le résultat final avant de mettre à jour l'état
      console.log(`[ChatStore - fetchSocialThreads] Processed ${threads.length} valid social threads. Unread count: ${unreadCount}`);
      console.log("[ChatStore - fetchSocialThreads] Updating state with processed threads.");
      set({
        socialThreads: threads,
        unreadSocialThreadsCount: unreadCount,
        isLoadingSocialThreads: false,
        error: null
      });

    }, (error) => {
      // Log crucial en cas d'erreur du listener
      console.error("[ChatStore - fetchSocialThreads] onSnapshot listener error:", error);
      set({ error: "Failed to load social threads.", isLoadingSocialThreads: false });
    });

    console.log("[ChatStore - fetchSocialThreads] Returning actual unsubscribe function.");
    return unsubscribe; // Return the unsubscribe function for cleanup
  },

  loadChatMessages: async (chatId: string) => {
    const { _setIsLoadingMessages, setMessagesList, _setError, _setCurrentChatId } = get();
    console.log(`[ChatStore] Loading messages for chatId: ${chatId}`);

    if (!chatId) {
      console.warn("[ChatStore] loadChatMessages called with null/empty chatId.");
      setMessagesList([]);
      _setCurrentChatId(null); // Assure la cohérence
      return;
    }

    _setIsLoadingMessages(true);
    _setCurrentChatId(chatId); // Met à jour le chat actif dès le début du chargement
    setMessagesList([]); // Vide la liste actuelle avant de charger (c'est ok car setActiveChat gère la landing page)

    try {
      // Utiliser l'API backend pour récupérer l'historique
      const historyData = await getChatHistory(chatId);
      console.log(`[ChatStore] Received message history for ${chatId}:`, historyData);

      // Transformer les données de l'API en format Message[] si nécessaire
      // ---> CORRECTION Linter Error 3 : Supposer que historyData est Message[] <---
      const formattedMessages: Message[] = historyData || [];

      setMessagesList(formattedMessages);

    } catch (error) {
      console.error(`[ChatStore] Error loading messages for chatId ${chatId}:`, error);
      _setError(`Failed to load messages for chat ${chatId}.`);
      setMessagesList([]); // Reset messages on error
      // Ne pas remettre currentChatId à null ici, l'utilisateur est toujours sur ce chat même si les messages n'ont pas chargé
    } finally {
      _setIsLoadingMessages(false);
    }
  },

  setActiveChat: (chatId: string | null) => {
    const currentId = get().currentChatId;
    const { setMessages, setIsLandingPageVisible, _setCurrentChatId, setIsSocialThreadActive, _setIsCurrentChatPrivate, _setIsLoadingMessages, loadChatMessages, conversations, socialThreads } = get(); // Ajouter conversations et socialThreads

    if (chatId === currentId && chatId !== null) {
        console.log(`[ChatStore - setActiveChat] Chat ${chatId} is already active.`);
        return;
    }
    if (chatId === null && currentId === null) {
        console.log(`[ChatStore - setActiveChat] Already on landing page (active chat is null).`);
        if (!get().isLandingPageVisible) setIsLandingPageVisible(true);
        return;
    }

    console.log(`[ChatStore - setActiveChat] Setting active chat from ${currentId} to: ${chatId}`);

    let isSocial = false;
    let isPrivate = false;
    let chatExists = false; // Flag pour savoir si le chat ID est valide

    if (chatId) {
        // Chercher dans les conversations GÉRÉES PAR LE LISTENER
        const conv = conversations.find(c => c.chat_id === chatId);
        if (conv) {
            isPrivate = conv.thread_type === 'Private';
            isSocial = false;
            chatExists = true;
            console.log(`[ChatStore - setActiveChat] Found in 'conversations' (via listener). Type: ${conv.thread_type}`);
        } else {
            // Si non trouvé, chercher dans les threads sociaux généraux
            const social = socialThreads.find(t => t.chat_id === chatId);
            if (social) {
                isSocial = true;
                isPrivate = false; // Les threads sociaux sont publics
                chatExists = true;
                console.log(`[ChatStore - setActiveChat] Found in 'socialThreads'.`);
                // Marquer comme lu SI c'est un thread social et qu'on clique dessus
                // Attention: A faire peut-être dans le composant Sidebar pour plus de clarté
                // get().markSocialThreadAsRead(chatId); 
            } else {
                 console.warn(`[ChatStore - setActiveChat] Chat ID ${chatId} not found in local lists.`);
                 // Ne pas changer de chat si l'ID n'est pas valide
                 return; 
            }
        }
    }

    // Mettre à jour l'état seulement si chatID est null ou valide
    _setCurrentChatId(chatId);
    setIsLandingPageVisible(!chatId); 
    setIsSocialThreadActive(isSocial);
    _setIsCurrentChatPrivate(isPrivate); 
    setMessages([]); 
    _setIsLoadingMessages(!!chatId); // Mettre en chargement si un chat est sélectionné

    if (chatId && chatExists) { // S'assurer que le chat existe avant de charger
        console.log(`[ChatStore - setActiveChat] Loading messages for chat ${chatId}`);
        loadChatMessages(chatId); // Utiliser l'action existante
    } else {
       console.log("[ChatStore - setActiveChat] Active chat set to null or ID was invalid. Landing page visible.");
    }
  },

  // addNewConversation: Appelle addChatIdToStoreAndFirestore, le listener s'occupera du reste
  addNewConversation: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id || !user.university) {
      console.error("addNewConversation: User ID or University missing.");
      set({ error: "Cannot create conversation: User data missing." });
      return null;
    }

    // Stop any ongoing streaming response
    if (get().isStreamingResponse) {
        console.log("addNewConversation: Stopping ongoing AI response.");
        get().abortController?.abort();
        set({ isStreamingResponse: false, abortController: null });
    }

    set({ error: null });
    const newChatId = uuidv4();
    console.log(`addNewConversation: Attempting to create new chat with ID: ${newChatId}`);

    // Sauvegarder l'état précédent uniquement pour le switch d'UI
    //const originalMessages = get().messages; // Pas besoin de sauvegarder/restaurer les messages ici
    const originalIsLandingVisible = get().isLandingPageVisible;
    const originalIsPrivate = get().isCurrentChatPrivate;
    const originalIsSocial = get().isSocialThreadActive;
    //const originalIsLoadingMessages = get().isLoadingMessages;

    // Switch UI optimiste vers un état "nouveau chat en attente"
    // Pas besoin de définir currentChatId ici, on attend que le listener le ramène
    // On pourrait afficher un indicateur de chargement global ?
    // Pour l'instant, on ne change pas l'UI active, on attend le listener.
     set({ isLandingPageVisible: true }); // Revenir à la landing page temporairement ? Ou garder l'ancien chat?
     console.log("[ChatStore - addNewConversation] Creating backend resources...");

    try {
      const currentTime = serverTimestamp();
      const chatData = {
        chat_id: newChatId,
        name: 'New Chat',
        created_at: currentTime,
        modified_at: currentTime,
        university: user.university,
        thread_type: 'Private',
        is_private: true, 
        topic: 'General',
        // PAS DE user_ids
        // PAS DE last_message_preview
      };
      await setDoc(doc(db, 'chatsessions', newChatId), chatData);
      
      // L'étape cruciale: ajouter l'ID au document utilisateur
      // Cette opération va déclencher le listener dans useAuthStore,
      // qui va mettre à jour user.chatsessions,
      // ce qui (via l'orchestrateur React) déclenchera _listenToConversations
      await useAuthStore.getState().addChatIdToStoreAndFirestore(newChatId);

      console.log(`addNewConversation: Successfully created Firestore doc ${newChatId} and added ID to user doc.`);
      // Le listener fera le reste. On pourrait vouloir sélectionner ce chat automatiquement.
      // On peut retourner l'ID pour que l'appelant puisse faire setActiveChat si besoin.
      return newChatId;

    } catch (error) {
      console.error("❌ addNewConversation: Failed to create new conversation or update user doc:", error);
      set({ 
          error: "Failed to create new conversation.",
          // Restaurer l'état UI original si on avait changé quelque chose
          isLandingPageVisible: originalIsLandingVisible, 
          // currentChatId: originalCurrentChatId, // Garder l'ancien chat actif
          isCurrentChatPrivate: originalIsPrivate,
          isSocialThreadActive: originalIsSocial,
      });
      // Pas besoin d'annuler l'ajout dans AuthStore, car addChatIdToStoreAndFirestore gère son propre rollback.
      return null;
    }
  },

  // deleteConversation: Doit supprimer de Firestore ET du tableau user.chatsessions
  deleteConversation: async (chatId: string) => {
    if (!chatId) return;
    
    const { user } = useAuthStore.getState();
    if (!user || !user.id) {
      console.error("deleteConversation: User not logged in.");
      return;
    }

    const userId = user.id;

    // Optionnel : Vérifier si le chat appartient bien à l'utilisateur (présent dans ses chatIds actuels)
    // if (!useAuthStore.getState().user?.chatsessions?.includes(chatId)) { ... }

    // Pas de mise à jour optimiste de l'UI ici, car le listener s'en charge.
    // On pourrait afficher un indicateur de suppression ?

    try {
      // 1. Supprimer le document chatsession
      const conversationRef = doc(db, 'chatsessions', chatId);
      await deleteDoc(conversationRef);
      console.log(`deleteConversation: Firestore doc ${chatId} deleted.`);

      // 2. Supprimer l'ID du tableau chatsessions de l'utilisateur
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
          let currentDbChatIds: string[] = userSnap.data().chatsessions || []; // Assurer le type string[]
          if (currentDbChatIds.includes(chatId)) {
              // Ajouter le type explicite pour 'id' dans le filtre
              currentDbChatIds = currentDbChatIds.filter((id: string) => id !== chatId);
              await updateDoc(userDocRef, { chatsessions: currentDbChatIds });
              console.log(`deleteConversation: ChatId ${chatId} removed from user ${userId} chatsessions.`);
          } else {
               console.warn(`deleteConversation: ChatId ${chatId} not found in user ${userId} chatsessions.`);
          }
      } else {
           console.error(`deleteConversation: User document ${userId} not found.`);
      }

      // Si le chat supprimé était actif, setActiveChat(null) sera appelé par le listener
      // via la logique dans _listenToConversations qui détecte que l'ID actif n'est plus dans la liste.
      console.log(`deleteConversation: Chat ${chatId} deletion process complete. Listeners will update UI.`);

    } catch (error) {
      console.error(`❌ deleteConversation: Failed to delete chat ${chatId}:`, error);
      set({ error: "Failed to delete conversation." });
      // Pas de rollback UI nécessaire ici, car la suppression échouée n'aura pas déclenché les listeners.
    }
  },

  // renameConversation, updateConversationPrivacy, updateConversationTitleAndTopic: 
  // Ces fonctions modifient juste le document chatsession.
  // Le listener _listenToConversations mettra à jour l'UI.
  // Il faut juste s'assurer qu'elles mettent à jour `modified_at` pour le tri.
  renameConversation: async (chatId: string, newName: string) => {
     if (!chatId || !newName?.trim()) return;
     const trimmedNewName = newName.trim();
     // Pas de mise à jour optimiste, le listener s'en charge
     try {
        const conversationRef = doc(db, 'chatsessions', chatId);
        await updateDoc(conversationRef, { name: trimmedNewName, modified_at: serverTimestamp() });
        console.log(`renameConversation: Chat ${chatId} updated. Listener will refresh.`);
     } catch (error) {
         console.error(`❌ renameConversation: Failed for chat ${chatId}:`, error);
         set({ error: "Failed to rename conversation." });
     }
  },

  updateConversationPrivacy: async (chatId: string, isPrivate: boolean) => {
     if (!chatId) return;
     const newThreadType = isPrivate ? 'Private' : 'Public';
      // Pas de mise à jour optimiste
     try {
          const conversationRef = doc(db, 'chatsessions', chatId);
          await updateDoc(conversationRef, {
              thread_type: newThreadType,
              modified_at: serverTimestamp() // Important pour le tri
          });
          console.log(`updateConversationPrivacy: Chat ${chatId} updated. Listener will refresh.`);
     } catch (error) {
         console.error(`❌ updateConversationPrivacy: Failed for chat ${chatId}:`, error);
         set({ error: "Failed to update conversation privacy." });
     }
  },

   updateConversationTitleAndTopic: async (chatId: string, title: string, category: string) => {
        if (!chatId || !title?.trim() || !category?.trim()) return;
        const trimmedTitle = title.trim();
        const trimmedCategory = category.trim();
         // Pas de mise à jour optimiste
        try {
             const conversationRef = doc(db, 'chatsessions', chatId);
             await updateDoc(conversationRef, { 
                 name: trimmedTitle, 
                 topic: trimmedCategory, 
                 modified_at: serverTimestamp() // Important pour le tri
                });
             console.log(`updateConversationTitleAndTopic: Chat ${chatId} updated. Listener will refresh.`);
        } catch (error) {
             console.error(`❌ updateConversationTitleAndTopic: Failed for chat ${chatId}:`, error);
             set({ error: "Failed to update conversation title/topic." });
        }
    },

   markSocialThreadAsRead: async (chatId: string) => {
       if (!chatId) return;
       const { user } = useAuthStore.getState();
       if (!user?.id) return; // Need user ID

       const { socialThreads } = get();
       const threadIndex = socialThreads.findIndex(t => t.chat_id === chatId);
       const thread = threadIndex > -1 ? socialThreads[threadIndex] : null;

       // Only proceed if the thread exists and is currently marked as unread locally
       if (thread && !thread.isRead) {
            // Sauvegarde état avant modif optimiste
            const originalUnreadCount = get().unreadSocialThreadsCount;
            const originalSocialThreads = [...socialThreads]; // Copie complète

            // Mise à jour optimiste
            set(state => {
                const updatedSocialThreads = [...state.socialThreads];
                updatedSocialThreads[threadIndex] = { ...thread, isRead: true };
                return {
                    socialThreads: updatedSocialThreads,
                    unreadSocialThreadsCount: Math.max(0, state.unreadSocialThreadsCount - 1)
                };
            });

           try {
                const threadRef = doc(db, 'chatsessions', chatId);
                const threadSnap = await getDoc(threadRef); // Lire d'abord est plus sûr
                if (threadSnap.exists()) {
                    const currentReadBy = Array.isArray(threadSnap.data().ReadBy) ? threadSnap.data().ReadBy : [];
                    if (!currentReadBy.includes(user.id)) {
                         await updateDoc(threadRef, { ReadBy: Array.from(new Set([...currentReadBy, user.id])) });
                         console.log(`markSocialThreadAsRead: Thread ${chatId} marked read.`);
                    }
                } else { console.warn(`markSocialThreadAsRead: Doc ${chatId} not found.`); }
           } catch (error) {
                console.error(`❌ markSocialThreadAsRead: Failed for thread ${chatId}:`, error);
                 // !! ROLLBACK !!
                set({
                    socialThreads: originalSocialThreads, // Restaurer la liste originale
                    unreadSocialThreadsCount: originalUnreadCount, // Restaurer le compte original
                    error: "Failed to mark thread as read."
                });
           }
       } else {
           console.log(`markSocialThreadAsRead: Thread ${chatId} not found locally or already marked as read.`);
       }
   },


});

// --- Enveloppe DevTools --- 
const useChatStore = create<ChatState>()(
  devtools(
    chatStoreCreator, 
    { name: "ChatStore" } 
  )
);

export default useChatStore; 