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
  Unsubscribe // Importer Unsubscribe pour le retour du listener
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
  setActiveChat: (chatId: string | null, options?: { skipLoadMessages?: boolean }) => void; // Définit le chat actif (peut appeler loadChatMessages)

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
    const userId = useAuthStore.getState().user?.id;
    const university = useAuthStore.getState().user?.university;

    if (!userId || !university) {
      console.warn("[ChatStore] Cannot fetch conversations listener: userId or university missing.");
      setConversations([]);
      _setError("User information missing to fetch conversations.");
      _setIsLoadingConversations(false); // S'assurer que le loading s'arrête
      return () => { console.log("[ChatStore - fetchConversations] Returning No-Op Unsubscribe (no user/university)."); }; // Retourne une fonction vide pour le désabonnement
    }

    console.log(`[ChatStore] Setting up Firestore listener for conversations for user ${userId} in ${university}`);
    _setIsLoadingConversations(true);

    const conversationsRef = collection(db, 'chatsessions');
    const q = query(
      conversationsRef,
      where('user_ids', 'array-contains', userId),
      where('university', '==', university),
      orderBy('modified_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatStore - fetchConversations] onSnapshot triggered. Received ${snapshot.docs.length} conversation documents.`);
      const isInitialLoad = get().isLoadingConversations;

      const fetchedConversations: Conversation[] = snapshot.docs.map(doc => {
         const data = doc.data();
         const threadType = data.thread_type === 'Public' ? 'Public' : 'Private'; // Default to Private if missing/invalid

         return {
             chat_id: doc.id,
             name: data.name || 'Untitled Conversation',
             last_message_preview: data.last_message_preview || '',
             modified_at: (data.modified_at as Timestamp)?.toDate(),
             thread_type: threadType, // <-- Utiliser directement la valeur de Firestore (ou défaut Private)
             topic: data.topic || 'General',
         };
      });

      console.log(`[ChatStore - fetchConversations] Processed ${fetchedConversations.length} conversations.`);
      setConversations(fetchedConversations);
      _setIsLoadingConversations(false);
      _setError(null);

      // --- Logique pour le chat initial ---
      const isInitialOnboardingLoad = isInitialLoad && !useAuthStore.getState().user?.onboardingComplete;
      if (isInitialLoad && !isInitialOnboardingLoad && !get().currentChatId && fetchedConversations.length > 0) {
          const initialChatId = fetchedConversations[0].chat_id;
          console.log(`[ChatStore - fetchConversations] Initial load complete (non-onboarding). Setting initial active chat to: ${initialChatId}`);
          setActiveChat(initialChatId); 
      } else if (isInitialLoad && !isInitialOnboardingLoad && !get().currentChatId && fetchedConversations.length === 0) {
          console.log("[ChatStore - fetchConversations] Initial load complete (non-onboarding). No conversations found, setting active chat to null.");
          setActiveChat(null);
      } else if (isInitialOnboardingLoad) {
          console.log("[ChatStore - fetchConversations] Initial load for onboarding user. Waiting for signup/onboarding flow to set active chat.");
          // Ne rien faire ici, laisser le flux d'inscription/onboarding appeler setActiveChat
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
    //const university = useAuthStore((state) => state.user?.university);
    const university = useAuthStore.getState().user?.university;
   

    // Log l'université utilisée
    console.log(`[ChatStore - fetchSocialThreads] Using university: ${university}`);

    if (!university) {
      console.warn("[ChatStore - fetchSocialThreads] University not found in auth state. Aborting listener setup.");
      set({ isLoadingSocialThreads: false, socialThreads: [], unreadSocialThreadsCount: 0 });
      return () => { console.log("[ChatStore - fetchSocialThreads] Returning No-Op Unsubscribe (no university)."); }; // Return no-op unsubscribe
    }

    set({ isLoadingSocialThreads: true });
    console.log(`[ChatStore - fetchSocialThreads] Setting up Firestore listener for university: ${university}`);

    // Déterminer le nom de conversation par défaut à exclure
    const isKedge = university === 'kedge';
    const defaultChatNameToExclude = isKedge ? "Nouvelle Conversation" : "New Chat";

    const q = query(
      collection(db, "chatsessions"),
      where("university", "==", university),
      where("thread_type", "==", "Public"),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[ChatStore - fetchSocialThreads] onSnapshot triggered. Received ${snapshot.docs.length} documents.`);
      const userId = useAuthStore.getState().user?.id;
      let unreadCount = 0;

      const threads: SocialThread[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Filtrer les noms invalides OU le nom par défaut dynamique
          if (!data || typeof data !== 'object' || !data.name || data.name === defaultChatNameToExclude) {
             console.log(`[ChatStore - fetchSocialThreads] Filtering out doc ${doc.id} due to invalid name or default name.`);
              return null;
          }
          const isRead = !!userId && Array.isArray(data.ReadBy) && data.ReadBy.includes(userId);
          if (!isRead) { unreadCount++; }
          const thread: SocialThread = {
            chat_id: doc.id,
            name: data.name,
            created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : (data.created_at?.seconds ? new Date(data.created_at.seconds * 1000) : new Date(0)),
            topic: data.topic || "Default",
            thread_type: "Public",
            university: data.university || "Default",
            isRead: isRead,
          };
          return thread;
        })
        .filter((thread): thread is SocialThread => thread !== null);

      console.log(`[ChatStore - fetchSocialThreads] Processed ${threads.length} valid social threads. Unread count: ${unreadCount}`);
      set({
        socialThreads: threads,
        unreadSocialThreadsCount: unreadCount,
        isLoadingSocialThreads: false,
        error: null
      });

    }, (error) => {
      console.error("[ChatStore - fetchSocialThreads] onSnapshot listener error:", error);
      set({ error: "Failed to load social threads.", isLoadingSocialThreads: false });
    });

    console.log("[ChatStore - fetchSocialThreads] Returning actual unsubscribe function.");
    return unsubscribe;
  },

  loadChatMessages: async (chatId: string) => {
    const { _setIsLoadingMessages, setMessagesList, _setError, _setCurrentChatId, messages: currentMessages } = get(); // Get current messages
    console.log(`[ChatStore] Loading messages for chatId: ${chatId}`);

    if (!chatId) {
      console.warn("[ChatStore] loadChatMessages called with null/empty chatId.");
      setMessagesList([]);
      _setCurrentChatId(null); // Assure la cohérence
      return;
    }

    _setIsLoadingMessages(true);
    // Ne PAS vider les messages ici. setActiveChat gère cela si nécessaire.
    // setMessagesList([]); // <-- RETIRÉ

    try {
      // Utiliser l'API backend pour récupérer l'historique
      const historyData = await getChatHistory(chatId);
      console.log(`[ChatStore] Received message history for ${chatId}:`, historyData);

      // Transformer les données de l'API en format Message[] si nécessaire
      const formattedMessages: Message[] = historyData || [];

      // Mettre à jour seulement si on a reçu un historique non vide
      if (formattedMessages.length > 0) {
         setMessagesList(formattedMessages);
      } else {
          console.log(`[ChatStore] No message history received for ${chatId}. Keeping existing messages (if any).`);
          // Si pas d'historique, on ne vide pas les messages optimistes potentiels.
          // S'assurer que isLoading est false si on garde les messages existants.
          if (currentMessages.length > 0) {
             _setIsLoadingMessages(false); // Arrêter le chargement explicitement ici
          }
      }

    } catch (error) {
      console.error(`[ChatStore] Error loading messages for chatId ${chatId}:`, error);
      _setError(`Failed to load messages for chat ${chatId}.`);
      // Ne pas réinitialiser les messages en cas d'erreur si certains existent déjà
      // setMessagesList([]); // <-- RETIRÉ
      console.log("[ChatStore] Keeping existing messages on load error.");

    } finally {
      // Assurer que isLoading est false dans tous les scénarios finaux.
      // (le cas où on garde les messages existants est géré dans le bloc try/else)
       _setIsLoadingMessages(false); 
    }
  },

  setActiveChat: (chatId: string | null, options?: { skipLoadMessages?: boolean }) => {
    const currentId = get().currentChatId;
    const { setMessages, setIsLandingPageVisible, _setCurrentChatId, setIsSocialThreadActive, _setIsCurrentChatPrivate, _setIsLoadingMessages, loadChatMessages } = get();

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
        const conv = get().conversations.find(c => c.chat_id === chatId);
        if (conv) {
            isPrivate = conv.thread_type === 'Private';
            isSocial = false;
            console.log(`[ChatStore - setActiveChat] Found in 'conversations'. thread_type: ${conv.thread_type}, Setting isPrivate: ${isPrivate}`);
        } else {
            const social = get().socialThreads.find(t => t.chat_id === chatId);
            if (social) {
                isSocial = true;
                isPrivate = false;
                console.log(`[ChatStore - setActiveChat] Found in 'socialThreads'. Setting isSocial: true, isPrivate: false`);
            } else {
                 console.warn(`[ChatStore - setActiveChat] Chat ID ${chatId} not found in conversations or socialThreads.`);
            }
        }
    }

    _setCurrentChatId(chatId);
    //setIsLandingPageVisible(!chatId);
    setIsSocialThreadActive(isSocial);
    _setIsCurrentChatPrivate(isPrivate);

    // *** Modification Start ***
    // Vider les messages seulement si on change activement d'un chat à un autre,
    // ou si on va vers la landing page.
    // Ne pas vider si on active le premier chat (currentId === null).
    if (chatId !== null && currentId !== null && chatId !== currentId) {
        console.log("[ChatStore - setActiveChat] Switching between existing chats, clearing messages.");
        setMessages([]);
        _setIsLoadingMessages(true);
    } else if (chatId === null) {
        console.log("[ChatStore - setActiveChat] Switching to landing page, clearing messages.");
        setMessages([]);
        _setIsLoadingMessages(false);
    } else if (chatId !== null && currentId === null) {
        // Activating the very first chat (likely onboarding)
        console.log("[ChatStore - setActiveChat] Activating first chat, NOT clearing messages optimistically.");
        // Set loading to true because loadChatMessages will be called
        _setIsLoadingMessages(true);
    } else {
        // Fallback or if chatId === currentId (already handled, but for safety)
        _setIsLoadingMessages(false);
    }
    // *** Modification End ***

    // ---> MODIFICATION : Condition pour appeler loadChatMessages <--- 
    if (chatId && !options?.skipLoadMessages) { // Ne charge que si l'ID existe ET skipLoadMessages n'est pas true
        console.log(`[ChatStore - setActiveChat] Loading messages for chat ${chatId} (isSocial: ${isSocial}, isPrivate: ${isPrivate})`);
        loadChatMessages(chatId); // Appel direct à loadChatMessages défini dans le store
    } else if (chatId && options?.skipLoadMessages) {
        console.log(`[ChatStore - setActiveChat] Active chat set to ${chatId}, but skipping message load as requested.`);
         // Si on skippe le chargement, s'assurer que isLoadingMessages est false
         _setIsLoadingMessages(false); 
    } else {
       console.log("[ChatStore - setActiveChat] Active chat set to null. Landing page visible.");
       // Assurer que isLoadingMessages est false si on passe à la landing page
       _setIsLoadingMessages(false); 
    }
    // ---> FIN MODIFICATION <--- 
  },

  // --- Conversation Management Actions ---

  addNewConversation: async () => {
    // 1. Récupérer l'utilisateur et son université
    const { user } = useAuthStore.getState();
    if (!user?.id || !user.university) {
      console.error("addNewConversation: User ID or University missing.");
      set({ error: "Cannot create conversation: User data missing." });
      return null;
    }

    // 2. Déterminer le nom par défaut
    const isKedge = user.university === 'kedge';
    const defaultChatName = isKedge ? "Nouvelle Conversation" : "New Chat";

    // ... (arrêter le streaming si nécessaire)
    if (get().isStreamingResponse) {
        console.log("addNewConversation: Stopping ongoing AI response.");
        get().abortController?.abort();
        set({ isStreamingResponse: false, abortController: null });
    }

    set({ error: null });
    const newChatId = uuidv4();
    console.log(`addNewConversation: Attempting to create new chat with ID: ${newChatId} and default name: ${defaultChatName}`);

    // ... (sauvegarde de l'état précédent pour rollback - inchangé)
    const originalCurrentChatId = get().currentChatId;
    const originalMessages = get().messages;
    const originalIsLandingVisible = get().isLandingPageVisible;
    const originalIsPrivate = get().isCurrentChatPrivate;
    const originalIsSocial = get().isSocialThreadActive;
    const originalIsLoadingMessages = get().isLoadingMessages;

    // Mise à jour optimiste (inchangée)
    set({
        currentChatId: newChatId,
        isLandingPageVisible: true,
        messages: [],
        isLoadingMessages: false,
        isSocialThreadActive: false,
        isCurrentChatPrivate: false,
    });

    try {
      const currentTime = serverTimestamp();
      // 3. Utiliser le nom par défaut dans les données pour Firestore
      const chatData = {
        chat_id: newChatId,
        name: defaultChatName, // <-- Utilisation du nom déterminé
        created_at: currentTime,
        modified_at: currentTime,
        university: user.university,
        thread_type: 'Public',
        user_ids: [user.id],
        is_private: false,
        last_message_preview: '',
        topic: 'General',
      };
      await setDoc(doc(db, 'chatsessions', newChatId), chatData);
      await useAuthStore.getState().addChatIdToFirestore(newChatId);

      console.log(`addNewConversation: Successfully created Firestore doc for chat ${newChatId}.`);
      return newChatId;

    } catch (error) {
      console.error("❌ addNewConversation: Failed to create new conversation:", error);
      // !! ROLLBACK !! (inchangé)
      set({
          error: "Failed to create new conversation.",
          currentChatId: originalCurrentChatId,
          messages: originalMessages,
          isLandingPageVisible: originalIsLandingVisible,
          isCurrentChatPrivate: originalIsPrivate,
          isSocialThreadActive: originalIsSocial,
          isLoadingMessages: originalIsLoadingMessages,
      });
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
      await useAuthStore.getState().removeChatIdFromFirestore(chatId);
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