import {
  doc,
  getDoc,
  getDocs,
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
import { db, auth } from '../auth/firebase'; // Assurez-vous que le chemin est correct
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

  fetchConversations: () => Unsubscribe; // Charge la liste des conversations de l'utilisateur
  fetchSocialThreads: () => Unsubscribe; // Initialise le listener pour les threads sociaux
  loadChatMessages: (chatId: string) => Promise<void>; // Charge les messages et détails d'un chat spécifique
  setActiveChat: (chatId: string | null) => void; // Définit le chat actif (peut appeler loadChatMessages)

  addNewConversation: () => Promise<string | null>; // Crée une nouvelle conversation
  renameConversation: (chatId: string, newName: string) => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  updateConversationPrivacy: (chatId: string, isPrivate: boolean) => Promise<void>;
  updateConversationTitleAndTopic: (chatId: string, title: string, category: string) => Promise<void>;
  markSocialThreadAsRead: (chatId: string) => Promise<void>;
}


// --- Création du Store Zustand avec typage explicite ---
const chatStoreCreator: StateCreator<ChatState> = (set, get) => ({
  // --- État Initial ---
  messages: [],
  conversations: [],
  socialThreads: [],
  currentChatId: null,
  isLandingPageVisible: false, // Commence sur la landing page par défaut
  isSocialThreadActive: false,
  isCurrentChatPrivate: false,
  isLoadingMessages: false,
  isLoadingConversations: false,
  isLoadingSocialThreads: false,
  isStreamingResponse: false,
  unreadSocialThreadsCount: 0,
  relatedQuestions: [],
  error: null,
  abortController: null, // Initialiser à null

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

  // --- Public Actions ---

  setMessagesList: (messages: Message[]) => {
    set({ messages }); // Ne fait que mettre à jour les messages
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
    const { currentChatId } = get();
    const { user } = useAuthStore.getState(); // Get current user info

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

        return { messages: updatedMessages, isStreamingResponse: false, relatedQuestions: [] }; // Fin du streaming, reset related questions
    });

    // Sauvegarde finale en backend
    if (currentChatId && user?.id) {
        try {
            // ---> CORRECTION Linter Error 1 : Revenir à l'appel API original <---
            // Récupérer le dernier message AI finalisé
            const finalAiMessage = get().messages.slice().reverse().find(m => m.type === 'ai' && !m.isLoading);
            // Récupérer le message humain qui le précède
            const lastHumanMessage = get().messages.slice(0, get().messages.length - 1).reverse().find(m => m.type === 'human')?.content || '';

            if (finalAiMessage) {
                console.log("ChatStore: Saving finalized AI message to backend...");
                await saveMessageAIToBackend({
                   message: finalAiMessage.content, // Utiliser le contenu final
                   chatSessionId: currentChatId,
                   courseId: 'default_course_id', // Ou récupérer dynamiquement si nécessaire
                   username: 'Lucy', // Nom du persona
                   type: 'ai',
                   uid: user.id,
                   input_message: lastHumanMessage,
                   university: user.university || '',
                   // Inclure d'autres métadonnées si attendues par l'API
                   // (Ex: sources, confidence score, etc. si finalAiMessage les contient)
                   sources: finalAiMessage.citedDocuments, // Utiliser directement citedDocuments si le format correspond
                   confident_score: finalAiMessage.CONFIDENCESCORE && finalAiMessage.CONFIDENCESCORE.length > 0 ? parseFloat(finalAiMessage.CONFIDENCESCORE[0].confidenceScore) : null, // Extraire et convertir le score
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
  },

  // --- Data Fetching Actions ---

  fetchConversations: () => {
    const { _setIsLoadingConversations, setConversations, _setError, setActiveChat } = get();
    const user = useAuthStore.getState().user; // Récupérer l'objet user entier
    const userId = user?.id;
    const university = user?.university;
    const userChatIds = user?.chatsessions || []; // <-- Récupérer les chat IDs de l'utilisateur

    if (!userId || !university) {
      console.warn("[ChatStore] Cannot fetch conversations listener: userId or university missing.");
      setConversations([]);
      _setError("User information missing to fetch conversations.");
      _setIsLoadingConversations(false);
      return () => { console.log("[ChatStore - fetchConversations] Returning No-Op Unsubscribe (no user/university)."); };
    }

    // Si l'utilisateur n'a pas de conversations, ne rien faire et retourner une fonction de désabonnement vide
    if (userChatIds.length === 0) {
      console.log("[ChatStore - fetchConversations] User has no chat sessions. Setting empty list.");
      setConversations([]);
      _setIsLoadingConversations(false);
      setActiveChat(null); // Assure qu'aucun chat n'est actif
      return () => { console.log("[ChatStore - fetchConversations] Returning No-Op Unsubscribe (no chats)."); };
    }

    console.log(`[ChatStore] Setting up Firestore listener for conversations for user ${userId} using ${userChatIds.length} chat IDs.`);
    _setIsLoadingConversations(true);

    const conversationsRef = collection(db, 'chatsessions');
    // Utiliser 'documentId()' et 'in' pour écouter spécifiquement les chats de l'utilisateur
    // Attention: l'opérateur 'in' est limité à 30 éléments (auparavant 10). Gérer si > 30.
    // Pour l'instant, on suppose <= 30 pour la simplicité.
    const q = query(
      conversationsRef,
      where(documentId(), 'in', userChatIds.slice(0, 30)), // Utiliser les IDs du user
      // On ne peut pas utiliser 'where university' avec 'where documentId in'
      // Il faudra filtrer côté client si nécessaire, ou s'assurer que les IDs sont corrects
      orderBy('modified_at', 'desc') // Garder le tri
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatStore - fetchConversations] onSnapshot triggered. Received ${snapshot.docs.length} matching conversation documents.`);
      const isInitialLoad = get().isLoadingConversations;

      const fetchedConversations: Conversation[] = snapshot.docs
          // Filtrage côté client pour l'université, car non possible dans la requête 'in'
         .filter(doc => doc.data().university === university)
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

      console.log(`[ChatStore - fetchConversations] Processed ${fetchedConversations.length} conversations after client-side filtering.`);
      setConversations(fetchedConversations);
      _setIsLoadingConversations(false);
      _setError(null);

      // --- Logique pour le chat initial ---
      if (isInitialLoad && !get().currentChatId && fetchedConversations.length > 0) {
          // Trier à nouveau par date après le filtre client pour s'assurer que le plus récent est sélectionné
          // Correction Linter: Utiliser les timestamps directement s'ils existent, sinon 0.
          const sortedConversations = [...fetchedConversations].sort((a, b) => {
            const timeA = a.modified_at instanceof Date ? a.modified_at.getTime() : 0;
            const timeB = b.modified_at instanceof Date ? b.modified_at.getTime() : 0;
            return timeB - timeA;
          });
          const initialChatId = sortedConversations[0].chat_id;
          console.log(`[ChatStore - fetchConversations] Initial load complete. Setting initial active chat to: ${initialChatId}`);
          setActiveChat(initialChatId);
      } else if (isInitialLoad && !get().currentChatId && fetchedConversations.length === 0) {
          console.log("[ChatStore - fetchConversations] Initial load complete. No matching conversations found after filtering, setting active chat to null.");
          setActiveChat(null);
      }

    }, (error) => {
      console.error("[ChatStore - fetchConversations] onSnapshot listener error:", error);
      _setError("Failed to load conversation history listener.");
      setConversations([]);
      _setIsLoadingConversations(false);
    });

    console.log("[ChatStore - fetchConversations] Returning Firestore unsubscribe function.");
    return unsubscribe;
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
    const { setMessages, setIsLandingPageVisible, _setCurrentChatId, setIsSocialThreadActive, _setIsCurrentChatPrivate, _setIsLoadingMessages } = get();

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
    let isPrivate = false; // Default to false

    if (chatId) {
        // Chercher dans les conversations personnelles/publiques de l'utilisateur
        const conv = get().conversations.find(c => c.chat_id === chatId);
        if (conv) {
            // ---> MODIFICATION: Déterminer la privacité basée sur thread_type <---
            isPrivate = conv.thread_type === 'Private';
            isSocial = false; // Une conversation dans cette liste n'est pas un "social thread" pur
            console.log(`[ChatStore - setActiveChat] Found in 'conversations'. thread_type: ${conv.thread_type}, Setting isPrivate: ${isPrivate}`);
        } else {
            // Si non trouvé dans conversations, chercher dans les threads sociaux généraux
            const social = get().socialThreads.find(t => t.chat_id === chatId);
            if (social) {
                isSocial = true;
                isPrivate = false; // Les threads sociaux généraux sont toujours publics
                console.log(`[ChatStore - setActiveChat] Found in 'socialThreads'. Setting isSocial: true, isPrivate: false`);
            } else {
                 console.warn(`[ChatStore - setActiveChat] Chat ID ${chatId} not found in conversations or socialThreads.`);
                 // Garder isPrivate = false, isSocial = false par défaut
            }
        }
    }

    // Mettre à jour l'état global
    _setCurrentChatId(chatId);
    setIsLandingPageVisible(!chatId); // Afficher landing si chatId est null
    setIsSocialThreadActive(isSocial);
    _setIsCurrentChatPrivate(isPrivate); // Utiliser la valeur calculée
    setMessages([]); // Vider les messages
    _setIsLoadingMessages(!!chatId); // Mettre en chargement si un chat est sélectionné

    if (chatId) {
        console.log(`[ChatStore - setActiveChat] Loading messages for chat ${chatId} (isSocial: ${isSocial}, isPrivate: ${isPrivate})`);
        get().loadChatMessages(chatId);
    } else {
       console.log("[ChatStore - setActiveChat] Active chat set to null. Landing page visible.");
    }
  },

  // --- Conversation Management Actions ---

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

    // --- Mise à jour optimiste de l'état pour un NOUVEAU chat ---
    // Sauvegarder l'état précédent au cas où la création Firestore échoue
    const originalCurrentChatId = get().currentChatId;
    const originalMessages = get().messages;
    const originalIsLandingVisible = get().isLandingPageVisible;
    const originalIsPrivate = get().isCurrentChatPrivate;
    const originalIsSocial = get().isSocialThreadActive;
    const originalIsLoadingMessages = get().isLoadingMessages;

    // Définir l'état directement: nouveau chat ID actif, landing page visible, pas de messages, pas de chargement
    set({
        currentChatId: newChatId,
        isLandingPageVisible: true, // <-- Afficher la landing page !
        messages: [],
        isLoadingMessages: false, // <-- Pas besoin de charger pour un nouveau chat
        isSocialThreadActive: false, // Les nouveaux chats sont privés par défaut
        isCurrentChatPrivate: true, // Les nouveaux chats sont privés par défaut
    });
    console.log(`[ChatStore - addNewConversation] Optimistically set state for new chat ${newChatId}. Landing page should be visible.`);


    try {
      const currentTime = serverTimestamp();
      const chatData = {
        chat_id: newChatId,
        name: 'New Chat', // Sera mis à jour par le backend si nécessaire
        created_at: currentTime,
        modified_at: currentTime,
        university: user.university,
        thread_type: 'Private',
        is_private: true,
        last_message_preview: '', // Vide au début
        topic: 'General', // Default topic
      };
      await setDoc(doc(db, 'chatsessions', newChatId), chatData);
      // L'ajout à la liste de l'utilisateur est crucial
      await useAuthStore.getState().addChatIdToStoreAndFirestore(newChatId);

      console.log(`addNewConversation: Successfully created Firestore doc for chat ${newChatId}. Listener should pick it up.`);
      // Le listener mettra à jour la liste `conversations` dans la sidebar. L'état actif est déjà bon.
      return newChatId;

    } catch (error) {
      console.error("❌ addNewConversation: Failed to create new conversation:", error);
      // !! ROLLBACK !!
      set({
          error: "Failed to create new conversation.",
          // Restaurer l'état précédent
          currentChatId: originalCurrentChatId,
          messages: originalMessages,
          isLandingPageVisible: originalIsLandingVisible,
          isCurrentChatPrivate: originalIsPrivate,
          isSocialThreadActive: originalIsSocial,
          isLoadingMessages: originalIsLoadingMessages, // Restaurer aussi l'état de chargement
      });
      // Annuler aussi l'ajout dans AuthStore si l'erreur vient de Firestore
      useAuthStore.getState().removeChatIdFromStore(newChatId);
      return null;
    }
  },

  renameConversation: async (chatId: string, newName: string) => {
     if (!chatId || !newName?.trim()) {
         console.warn("renameConversation: Invalid chatId or newName.");
         return;
     }
     const trimmedNewName = newName.trim();
     const originalConversation = get().conversations.find(c => c.chat_id === chatId);
     const originalSocialThread = get().socialThreads.find(t => t.chat_id === chatId);
     const originalName = originalConversation?.name || originalSocialThread?.name; // Nom original

     if (!originalName || originalName === trimmedNewName) return; // Pas de changement ou non trouvé

     // Mise à jour optimiste
     set(state => ({
         conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, name: trimmedNewName } : c),
         socialThreads: state.socialThreads.map(t => t.chat_id === chatId ? { ...t, name: trimmedNewName } : t)
     }));

     try {
        const conversationRef = doc(db, 'chatsessions', chatId);
        await updateDoc(conversationRef, { name: trimmedNewName, modified_at: serverTimestamp() });
        console.log(`renameConversation: Chat ${chatId} renamed to "${trimmedNewName}" in Firestore.`);
     } catch (error) {
         console.error(`❌ renameConversation: Failed to rename chat ${chatId} in Firestore:`, error);
         // !! ROLLBACK !!
         set(state => ({
             conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, name: originalName } : c), // Remettre l'ancien nom
             socialThreads: state.socialThreads.map(t => t.chat_id === chatId ? { ...t, name: originalName } : t), // Remettre l'ancien nom
             error: "Failed to rename conversation."
         }));
     }
  },

  deleteConversation: async (chatId: string) => {
    if (!chatId) {
        console.warn("deleteConversation: Invalid chatId.");
        return;
    }
    const { conversations, currentChatId, socialThreads } = get();
    const conversationToDelete = conversations.find(c => c.chat_id === chatId);

    // If the conversation isn't in the user's list, maybe it's just a social thread?
    // For now, we only allow deleting conversations the user "owns" (in their list).
    if (!conversationToDelete) {
        console.warn(`deleteConversation: Conversation ${chatId} not found in user's list. Cannot delete.`);
        // Optionally add logic to "unfollow" a social thread if needed.
        return;
    }

    // Sauvegarde état avant modif optimiste
    const originalConversations = [...conversations];
    const originalSocialThreads = [...socialThreads];
    const originalCurrentChatId = currentChatId;
    const originalMessages = get().messages; // Sauvegarder les messages si on switch
    const originalLandingVisible = get().isLandingPageVisible;
    const originalPrivate = get().isCurrentChatPrivate;
    const originalSocialActive = get().isSocialThreadActive;


    // Mise à jour optimiste UI
    const updatedConversations = conversations.filter(c => c.chat_id !== chatId);
    const updatedSocialThreads = socialThreads.filter(t => t.chat_id !== chatId);
    let nextActiveChatId: string | null = currentChatId;
    if (currentChatId === chatId) {
        nextActiveChatId = updatedConversations[0]?.chat_id || updatedSocialThreads[0]?.chat_id || null;
    }

    set({ conversations: updatedConversations, socialThreads: updatedSocialThreads });
    // Switch de chat optimiste SI on supprime le chat actif
    if(currentChatId === chatId) {
        // Simuler l'état après setActiveChat(nextActiveChatId) sans l'appel API
        set({
            currentChatId: nextActiveChatId,
            messages: [], // On vide en attendant le chargement réel (qui n'aura pas lieu si rollback)
            isLandingPageVisible: true,
            isCurrentChatPrivate: false, // Reset par défaut
            isSocialThreadActive: false, // Reset par défaut
            isLoadingMessages: !!nextActiveChatId, // Mettre en chargement si on switch vers un autre chat
            error: null,
         });
    }

    try {
      const conversationRef = doc(db, 'chatsessions', chatId);
      await deleteDoc(conversationRef);
      await useAuthStore.getState().removeChatIdFromStore(chatId); // Celle-ci DOIT réussir ou avoir son rollback
      console.log(`deleteConversation: Chat ${chatId} deleted successfully.`);
      // Si succès, et qu'on avait switché, lancer le vrai chargement
       if (currentChatId === chatId && nextActiveChatId) {
            get().loadChatMessages(nextActiveChatId); // Lancer le chargement réel des messages du nouveau chat
       } else if (currentChatId === chatId && !nextActiveChatId) {
            set({ isLoadingMessages: false }); // Arrêter le loading si on n'a pas switché vers un autre chat
       }
    } catch (error) {
      console.error(`❌ deleteConversation: Failed to delete chat ${chatId}:`, error);
      // !! ROLLBACK !!
      set({
          conversations: originalConversations,
          socialThreads: originalSocialThreads,
          currentChatId: originalCurrentChatId, // Revenir au chat ID original
          // Restaurer l'état du chat original si on avait switché
          messages: currentChatId === chatId ? originalMessages : get().messages,
          isLandingPageVisible: currentChatId === chatId ? originalLandingVisible : get().isLandingPageVisible,
          isCurrentChatPrivate: currentChatId === chatId ? originalPrivate : get().isCurrentChatPrivate,
          isSocialThreadActive: currentChatId === chatId ? originalSocialActive : get().isSocialThreadActive,
          isLoadingMessages: false, // Arrêter le loading dans tous les cas d'erreur
          error: "Failed to delete conversation."
      });
       // Annuler aussi la suppression dans AuthStore si possible
       // (removeChatIdFromStore n'a pas de DB call, donc pas besoin de rollback ici, mais si addChatIdToStore échoue, son propre rollback est nécessaire)
    }
  },

  updateConversationPrivacy: async (chatId: string, isPrivate: boolean) => {
    if (!chatId) return;
    const newThreadType = isPrivate ? 'Private' : 'Public';
    const originalConversation = get().conversations.find(c => c.chat_id === chatId);
    // Sauvegarde état avant modif optimiste
    const originalThreadType = originalConversation?.thread_type;
    const wasActiveChat = get().currentChatId === chatId;
    const originalIsPrivateForActive = get().isCurrentChatPrivate;

    // Mise à jour optimiste
    set(state => ({
        conversations: state.conversations.map(c =>
            c.chat_id === chatId
            ? { ...c, thread_type: newThreadType }
            : c
        ),
        isCurrentChatPrivate: wasActiveChat ? isPrivate : state.isCurrentChatPrivate
    }));

     try {
          const conversationRef = doc(db, 'chatsessions', chatId);
          await updateDoc(conversationRef, {
              thread_type: newThreadType,
              modified_at: serverTimestamp()
          });
          console.log(`updateConversationPrivacy: Chat ${chatId} privacy set to ${newThreadType}.`);
     } catch (error) {
         console.error(`❌ updateConversationPrivacy: Failed for chat ${chatId}:`, error);
          // !! ROLLBACK !!
          set(state => ({
              conversations: state.conversations.map(c =>
                  c.chat_id === chatId
                  ? { ...c, thread_type: originalThreadType || 'Public' }
                  : c
              ),
              isCurrentChatPrivate: wasActiveChat ? originalIsPrivateForActive : state.isCurrentChatPrivate,
              error: "Failed to update conversation privacy."
          }));
     }
  },

   updateConversationTitleAndTopic: async (chatId: string, title: string, category: string) => {
        if (!chatId || !title?.trim() || !category?.trim()) {
            console.warn("updateConversationTitleAndTopic: Invalid chatId, title, or category.");
            return;
        }
        const trimmedTitle = title.trim();
        const trimmedCategory = category.trim();
        const { conversations, socialThreads } = get();
        const originalConv = conversations.find(c => c.chat_id === chatId);
        const originalSocial = socialThreads.find(t => t.chat_id === chatId);
        // Sauvegarde état avant modif optimiste
        const originalName = originalConv?.name || originalSocial?.name;
        const originalTopic = originalConv?.topic || originalSocial?.topic;


         // Mise à jour optimiste
         set(state => ({
            conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, name: trimmedTitle, topic: trimmedCategory } : c),
            socialThreads: state.socialThreads.map(t => t.chat_id === chatId ? { ...t, name: trimmedTitle, topic: trimmedCategory } : t)
        }));

        try {
             const conversationRef = doc(db, 'chatsessions', chatId);
             await updateDoc(conversationRef, { name: trimmedTitle, topic: trimmedCategory, modified_at: serverTimestamp() });
             console.log(`updateConversationTitleAndTopic: Chat ${chatId} updated.`);
        } catch (error) {
             console.error(`❌ updateConversationTitleAndTopic: Failed for chat ${chatId}:`, error);
              // !! ROLLBACK !!
             set(state => ({
                conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, name: originalName || 'New Chat', topic: originalTopic || 'Default' } : c),
                socialThreads: state.socialThreads.map(t => t.chat_id === chatId ? { ...t, name: originalName || 'New Chat', topic: originalTopic || 'Default' } : t),
                error: "Failed to update conversation title/topic."
             }));
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

const useChatStore = create(chatStoreCreator);

export default useChatStore; 