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

  fetchConversations: () => Promise<void>; // Charge la liste des conversations de l'utilisateur
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
    set({ messages, isLandingPageVisible: messages.length === 0 });
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
    set({ messages: newMessages, isLandingPageVisible: false, isStreamingResponse: true });
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
          return { isStreamingResponse: false }; // Should not happen often
        }

        const updatedMessages = [...currentMessages];
        updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: aiMessageContent.replace(/\|/g, ''), // Final content, remove delimiters
            ...metadata, // Apply all final metadata
            isLoading: false, // Mark as complete
        };
        return { messages: updatedMessages, isStreamingResponse: false };
    });

    // Save the finalized AI message to the backend
    if (currentChatId && user?.id && user?.university) {
         // Trouve le dernier message humain avant le message AI finalisé
         const lastHumanMessage = get().messages.slice(0, -1).reverse().find(m => m.type === 'human')?.content || '';
        try {
             console.log("ChatStore: Saving finalized AI message to backend...");
             await saveMessageAIToBackend({
                message: aiMessageContent.replace(/\|/g, ''), // Use cleaned content
                chatSessionId: currentChatId,
                courseId: 'default_course_id', // Or get dynamically if available
                username: 'Lucy', // Persona name
                type: 'ai',
                uid: user.id,
                input_message: lastHumanMessage, // Pass the preceding human message
                university: user.university,
                // Pass other relevant metadata if needed by backend (sources, confidence score etc.)
                // REMOVED sources as it's not expected by the backend function
                /* sources: metadata.citedDocuments?.map(doc => ({
                    document_id: doc.document_id,
                    link: doc.link,
                    document_name: doc.document_name,
                    source_type: doc.source_type
                })),*/
                // REMOVED confident_score as it's not expected by the backend function
                /* confident_score: metadata.CONFIDENCESCORE?.[0]?.confidenceScore, */
             });
             console.log("ChatStore: Finalized AI message saved successfully.");
        } catch (error) {
             console.error("ChatStore: Failed to save finalized AI message:", error);
             get()._setError("Failed to save AI response.");
        }
    } else {
        console.warn("ChatStore: Cannot save AI message - missing chatId, userId, or university.");
    }
  },

   clearChatState: () => {
        set({
            messages: [],
            conversations: [],
            socialThreads: [],
            currentChatId: null,
            isLandingPageVisible: true,
            isSocialThreadActive: false,
            isCurrentChatPrivate: false,
            isLoadingMessages: false,
            isLoadingConversations: false,
            isLoadingSocialThreads: false,
            isStreamingResponse: false,
            unreadSocialThreadsCount: 0,
            relatedQuestions: [],
            error: null,
        });
        console.log("ChatStore: State cleared.");
    },


  // --- Data Fetching Actions ---

  fetchConversations: async () => {
    const { user, chatIds } = useAuthStore.getState();
    if (!user?.id || !chatIds || chatIds.length === 0) {
        console.log("fetchConversations: No user or chatIds found.");
        set({ conversations: [], isLoadingConversations: false });
        return;
    }
    set({ isLoadingConversations: true });
    try {
      // Utilisation d'une requête Firestore optimisée si possible
      // Alternative: Itérer sur les chatIds si la requête n'est pas viable (trop d'IDs)
      if (chatIds.length > 30) { // Firestore 'in' query limit is 30
          console.warn("fetchConversations: Fetching more than 30 chats individually.");
          const chatPromises = chatIds.map(async (chatId: string) => {
              if (typeof chatId === 'string') {
                  const chatRef = doc(db, 'chatsessions', chatId);
                  const chatSnap = await getDoc(chatRef);
                  if (chatSnap.exists()) {
                      const data = chatSnap.data();
                      return {
                          chat_id: chatId,
                          name: data.name || 'Unnamed Chat', // Provide default name
                          thread_type: data.thread_type || 'Public',
                          topic: data.topic || "Default",
                      } as Conversation; // Cast to Conversation
                  }
              }
              return null;
          });
           const fetchedConversations = (await Promise.all(chatPromises))
                                        .filter((c): c is Conversation => c !== null); // Type guard
           set({ conversations: fetchedConversations, isLoadingConversations: false });
           console.log("ChatStore: Conversations fetched individually.", fetchedConversations);

      } else {
          const q = query(collection(db, 'chatsessions'), where('chat_id', 'in', chatIds));
          const querySnapshot = await getDocs(q);
          const fetchedConversations = querySnapshot.docs.map(docSnap => {
              const data = docSnap.data();
              return {
                  chat_id: docSnap.id,
                  name: data.name || 'Unnamed Chat',
                  thread_type: data.thread_type || 'Public',
                  topic: data.topic || 'Default',
              } as Conversation; // Cast to Conversation
          });
           set({ conversations: fetchedConversations, isLoadingConversations: false });
           console.log("ChatStore: Conversations fetched via 'in' query.", fetchedConversations);
      }

    } catch (error) {
      console.error("ChatStore: Error fetching conversations:", error);
      set({ error: "Failed to load conversations.", isLoadingConversations: false });
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
     if (!chatId) {
         console.warn("loadChatMessages: chatId is invalid.");
         return;
     }
    console.log(`loadChatMessages: Loading messages for chatId: ${chatId}`);
    set({ isLoadingMessages: true, currentChatId: chatId, error: null, relatedQuestions: [] }); // Reset related questions

    try {
      // 1. Fetch message history
      const chatHistory = await getChatHistory(chatId);
      console.log(`loadChatMessages: Fetched ${chatHistory.length} messages for ${chatId}.`);

      // 2. Fetch conversation details
      const chatRef = doc(db, 'chatsessions', chatId);
      const chatSnap = await getDoc(chatRef);
      let isPrivate = false;
      let isSocial = false;
      let conversationTitle = 'Chat'; // Default title

      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        isPrivate = chatData.thread_type === 'Private';
        conversationTitle = chatData.name || 'Chat';

        // Determine if it's a social thread
        const { socialThreads, conversations } = get();
        const isChatInSocial = socialThreads.some(thread => thread.chat_id === chatId);
        const isChatInUserConvos = conversations.some(conv => conv.chat_id === chatId);
        isSocial = isChatInSocial; // A thread can be social even if in user convos

        // 3. Update ReadBy status for the current user
        const { user } = useAuthStore.getState();
        if (user?.id && isChatInSocial) { // Only mark as read if it's a social thread
          const readBy = Array.isArray(chatData.ReadBy) ? chatData.ReadBy : [];
          if (!readBy.includes(user.id)) {
            // Update Firestore document (async, no need to wait)
            updateDoc(chatRef, {
              ReadBy: Array.from(new Set([...readBy, user.id]))
            }).then(() => {
               console.log(`loadChatMessages: Marked social thread ${chatId} as read for user ${user.id}`);
               // Update local state immediately for responsiveness
               set(state => {
                  const threadIndex = state.socialThreads.findIndex(t => t.chat_id === chatId);
                  if (threadIndex > -1 && !state.socialThreads[threadIndex].isRead) {
                      const updatedSocialThreads = [...state.socialThreads];
                      updatedSocialThreads[threadIndex] = { ...updatedSocialThreads[threadIndex], isRead: true };
                      return {
                          socialThreads: updatedSocialThreads,
                          unreadSocialThreadsCount: Math.max(0, state.unreadSocialThreadsCount - 1)
                      };
                  }
                  return {};
               });
            }).catch(err => console.error("Failed to update ReadBy status:", err));
          }
        }
      } else {
          console.warn(`loadChatMessages: No document found for chatId: ${chatId}`);
          // Potentially handle this case, maybe clear state or show error
          set({ error: "Chat not found.", isLoadingMessages: false, messages: [], isLandingPageVisible: true });
          return;
      }

      // 4. Update state
      const { user } = useAuthStore.getState(); // Get user state
      // Check if onboarding is complete BEFORE setting isLandingPageVisible
      const shouldShowLanding = user?.onboardingComplete !== false && chatHistory.length === 0;

      set({
        messages: chatHistory,
        isLandingPageVisible: shouldShowLanding, // NEW LOGIC: Only show if onboarding done AND chat empty
        isCurrentChatPrivate: isPrivate,
        isSocialThreadActive: isSocial,
        isLoadingMessages: false,
      });
      console.log(`loadChatMessages: Chat ${chatId} ("${conversationTitle}") loaded. Landing: ${shouldShowLanding}, Private: ${isPrivate}, Social: ${isSocial}, OnboardingComplete: ${user?.onboardingComplete}`);

    } catch (error) {
      console.error(`ChatStore: Error loading chat messages for ${chatId}:`, error);
      set({ error: "Failed to load messages.", isLoadingMessages: false, messages: [], isLandingPageVisible: true });
    }
  },

  setActiveChat: (chatId: string | null) => {
      if (chatId === get().currentChatId) {
          console.log(`setActiveChat: Chat ${chatId} is already active.`);
          return; // Avoid reloading if already active
      }
       if (get().isStreamingResponse) {
            console.warn("setActiveChat: Switched chat while AI was responding. Stopping stream indicator.");
            set({ isStreamingResponse: false }); // Stop streaming indicator
            // Consider adding stream cancellation logic here if necessary
        }
       if (chatId) {
           // Ensure messages are loaded for the new chat ID
           get().loadChatMessages(chatId);
       } else {
           // Clearing the active chat (e.g., going back to landing or dashboard)
           set({
               currentChatId: null,
               messages: [],
               isLandingPageVisible: true,
               isSocialThreadActive: false,
               isCurrentChatPrivate: false,
               relatedQuestions: [],
               isLoadingMessages: false, // Ensure loading stops
               error: null,
           });
           console.log("setActiveChat: Active chat cleared.");
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
        set({ isStreamingResponse: false });
        // Add logic here if you need to explicitly cancel the backend stream
    }

    set({ isLoadingConversations: true, error: null }); // Indicate loading while creating
    const newChatId = uuidv4();
    console.log(`addNewConversation: Creating new chat with ID: ${newChatId}`);

    // Garder une copie de l'état avant mise à jour optimiste
    const originalConversations = get().conversations;
    const originalCurrentChatId = get().currentChatId;
    const originalMessages = get().messages;
    const originalIsLandingVisible = get().isLandingPageVisible;
    const originalIsPrivate = get().isCurrentChatPrivate;
    const originalIsSocial = get().isSocialThreadActive;

    // Mise à jour optimiste
    const newConversation: Conversation = { chat_id: newChatId, name: 'New Chat', thread_type: 'Private', topic: 'Default' };
    set(state => ({
      conversations: [newConversation, ...state.conversations],
      currentChatId: newChatId,
      messages: [],
      isLandingPageVisible: true, // Afficher landing pour nouveau chat initialement
      isCurrentChatPrivate: true,
      isSocialThreadActive: false,
      isLoadingConversations: false, // Fin du loading spécifique à la création
      error: null
    }));

    try {
      const currentTime = serverTimestamp();
      // 1. Create the chatsessions document
      await setDoc(doc(db, 'chatsessions', newChatId), {
        chat_id: newChatId,
        name: 'New Chat', // Default name
        created_at: currentTime,
        modified_at: currentTime,
        university: user.university,
        thread_type: 'Private', // New chats default to Private for the user
        ReadBy: [user.id] // Creator has read it
      });
      await useAuthStore.getState().addChatIdToStoreAndFirestore(newChatId); // S'assurer que CELLE-CI a aussi un rollback
      console.log(`addNewConversation: Successfully created and activated private chat ${newChatId}`);
      return newChatId;

    } catch (error) {
      console.error("❌ addNewConversation: Failed to create new conversation:", error);
      // !! ROLLBACK !!
      set({
        error: "Failed to create new conversation.",
        isLoadingConversations: false,
        conversations: originalConversations, // Restaurer l'état précédent
        currentChatId: originalCurrentChatId,
        messages: originalMessages,
        isLandingPageVisible: originalIsLandingVisible,
        isCurrentChatPrivate: originalIsPrivate,
        isSocialThreadActive: originalIsSocial,
      });
      // Annuler aussi l'ajout dans AuthStore si possible (ou AuthStore gère son propre rollback)
      useAuthStore.getState().removeChatIdFromStore(newChatId); // Essayer d'annuler côté AuthStore aussi
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
          conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, thread_type: newThreadType } : c),
          isCurrentChatPrivate: wasActiveChat ? isPrivate : state.isCurrentChatPrivate
      }));

       try {
            const conversationRef = doc(db, 'chatsessions', chatId);
            await updateDoc(conversationRef, { thread_type: newThreadType, modified_at: serverTimestamp() });
            console.log(`updateConversationPrivacy: Chat ${chatId} privacy set to ${newThreadType}.`);
            // Le listener fetchSocialThreads devrait gérer l'affichage/masquage dans la liste sociale.
       } catch (error) {
           console.error(`❌ updateConversationPrivacy: Failed for chat ${chatId}:`, error);
            // !! ROLLBACK !!
            set(state => ({
                conversations: state.conversations.map(c => c.chat_id === chatId ? { ...c, thread_type: originalThreadType || 'Public' } : c), // Remettre l'ancien type
                isCurrentChatPrivate: wasActiveChat ? originalIsPrivateForActive : state.isCurrentChatPrivate, // Remettre l'ancien état si c'était l'actif
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