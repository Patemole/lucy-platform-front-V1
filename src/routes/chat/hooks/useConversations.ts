import { useState, useRef} from 'react';
import { useEffect} from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useChat } from '../../../auth/hooks/useChat';
import { getDoc, getDocs, doc, updateDoc, deleteDoc, collection, query, where, orderBy, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { getChatHistory } from '../../../api/chat';
import { v4 as uuidv4 } from 'uuid';
import { format, isToday, isYesterday } from 'date-fns';
import {Course, Conversation, SocialThread, Message} from '../../../interfaces/interfaces_eleve';
import { usePopup } from '../../../components/main_components/Popup/popup';

export const useConversations = ({
  isStreaming,
  setSelectedFilter,
  setIsPrivate,
  setCurrentView,
  setRelatedQuestions,
  setUnreadCount,
  setActiveChatId,
  cancelConversationRef,
  setCancelConversation,
  setIsStreaming
}: {
   
  isStreaming: boolean;
  setSelectedFilter: (val: string) => void;
  setIsPrivate: (val: boolean) => void;
  setCurrentView: (val: 'chat' | 'events') => void;
  setRelatedQuestions: (val: string[]) => void;
  setUnreadCount: (val: number) => void;
  //setPopup: (val: { type: string; message: string }) => void;
  setActiveChatId: (val: string) => void;
  cancelConversationRef: React.MutableRefObject<boolean>;
  setCancelConversation: (val: boolean) => void;
  setIsStreaming: (val: boolean) => void;
}) => {
  const { user, chatIds, setPrimaryChatId } = useAuth();
  const { messages, setMessages, conversations, setConversations, setSocialThreads, socialThreads,setIsSocialThread, isLandingPageVisible, setIsLandingPageVisible } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loadingSocialThreads, setLoadingSocialThreads] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const hasInitialized = useRef(false);


  
    //Permet de charger les messages de la derniere conversation en cours quand on charge la page
    useEffect(() => { 
        const loadMessagesFromLocalStorageChatId = async () => {
        const storedChatId = chatIds[0] || 'default_chat_id_loadMessages';
        if (storedChatId) await handleConversationClick(storedChatId);
        
        const shouldShowLanding = !user?.onboardingComplete && messages.length === 0;
        setIsLandingPageVisible(shouldShowLanding);
        };
    
        loadMessagesFromLocalStorageChatId();
    }, [chatIds[0], messages.length, user?.onboardingComplete]);
    


    //This is a test. 
    /*
    useEffect(() => {
        if (hasInitialized.current) return;
      
        const loadMessagesFromLocalStorageChatId = async () => {
          const storedChatId = chatIds[0] || 'default_chat_id_loadMessages';
          if (storedChatId) await handleConversationClick(storedChatId);
      
          const shouldShowLanding = !user?.onboardingComplete && messages.length === 0;
          setIsLandingPageVisible(shouldShowLanding);
          hasInitialized.current = true;
        };
      
        loadMessagesFromLocalStorageChatId();
      }, [user?.onboardingComplete]);
      */


    //Load at first conversation history and after social thread and listen for every new social threds to add in real time
    useEffect(() => {
        const loadConversationsAndThreads = async () => {
          if (!user?.id || !user?.university) return;
      
          console.log("🧩 Chargement des conversations classiques...");
          await fetchCourseOptionsAndChatSessions();
      
          console.log("🌐 Chargement des social threads...");
          const unsubscribe = fetchSocialThreads();
      
          // Stocker la fonction de nettoyage
          return () => {
            console.log("🔁 Nettoyage des listeners des social threads");
            unsubscribe();
          };
        };
      
        const cleanupPromise = loadConversationsAndThreads();
      
        return () => {
          cleanupPromise.then((cleanup) => cleanup && cleanup());
        };
      }, [user?.id, user?.university]);


    useEffect(() => {
        if (user?.id && user?.onboardingComplete) {
          fetchCourseOptionsAndChatSessions();
        }
      }, [user?.id, user?.onboardingComplete]);





    //Permet de charger les conversations historique et social threads avant d etre redirige vers le dashboard
    const loadChatDataBeforeRedirect = async () => {
        if (!user?.id || !user?.university) return;
      
        console.log("⏳ Loading conversations and social threads before redirect...");
        await fetchCourseOptionsAndChatSessions();
        fetchSocialThreads(); // Optional: if you want to listen in real-time after load
      };


     // Fonction pour formater la date des conversations (social threads and conversations history)
    const formatDate = (timestamp: { toDate: () => Date }) => {
        const date = timestamp.toDate();
        if (isToday(date)) {
        return `Today, ${format(date, 'HH:mm')}`;
        } else if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'HH:mm')}`;
        } else {
        return `${format(date, 'dd/MM/yyyy')}, ${format(date, 'HH:mm')}`;
        }
    };

    // Open the menu in a conversation to rename or delete the conversation
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedConversation(chatId);
    };

    //  Class the menu in a conversation to rename or delete the conversation
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedConversation(null);
    };

    const fetchSocialThreads = () => {
        setLoadingSocialThreads(true);
        const university = user?.university || "upenn"; // Université par défaut
    
        // 🔥 Ne filtrer que par "university" dans Firestore
        const q = query(
        collection(db, "chatsessions"),
        where("university", "==", university), // ✅ Filtrer uniquement par université
        orderBy("created_at", "desc") // Trier du plus récent au plus ancien
        );
    
        return onSnapshot(q, (snapshot) => {
        const userId = user?.id; // ID de l'utilisateur actuel
    
        // 🔥 Transformation des threads depuis Firestore
        const threads = snapshot.docs.map((doc) => ({
            chat_id: doc.id,
            name: doc.data().name,
            created_at: doc.data().created_at,
            topic: doc.data().topic || "Default",
            thread_type: doc.data().thread_type || "Public", // 🔥 Si `thread_type` est absent, on met "Public"
            university: doc.data().university || "Default",
            isRead: (doc.data().ReadBy || []).includes(userId),
        }));
    
        // 🔥 Appliquer le filtre `thread_type === "Public"` après récupération
        const filteredThreads = threads.filter(
            (thread) => thread.thread_type === "Public" && thread.name !== "New Chat"
        );
    
        console.log(`📌 Après filtrage manuel, ${filteredThreads.length} conversations sont affichées`);

        console.log("📡 SocialThreads length:", socialThreads.length);
    
        setSocialThreads(filteredThreads);
    
        // 🔥 Mise à jour du compteur des messages non lus
        const unread = filteredThreads.filter((thread) => !thread.isRead).length;
        setUnreadCount(unread);
    
        setLoadingSocialThreads(false);
        });
    };  


    //Permet de changer la conversation en private or public locally, not update in firestore
    const handlePrivacyChange = (newPrivacyState: boolean) => {
        setIsPrivate(newPrivacyState);
        console.log(`Privacy state updated in parent: ${newPrivacyState ? 'Private' : 'Public'}`);
    };

    //Permet de changer localement private ou public d une conversation sur la landing page j ai l impression
    const updateThreadTypeLocally = (threadType: string) => {
        const chatId = chatIds[0];
        if (!chatId) return;
      
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.chat_id === chatId ? { ...conv, thread_type: threadType } : conv
          )
        );
      };


    // Action pour renommer une conversation
    const handleRename = async () => {
        handleMenuClose();
    
        if (!selectedConversation) {
        alert("No conversation selected.");
        return;
        }
        const newName = prompt('Enter new name:', '');
        if (!newName) {
        alert("Conversation name cannot be empty.");
        return;
        }
        try {
        // Référence au document Firestore pour la conversation sélectionnée
        const conversationRef = doc(db, 'chatsessions', selectedConversation);
        // Mise à jour du champ `name` dans Firestore
        await updateDoc(conversationRef, { name: newName });
        // Mise à jour de l'état local après le succès de Firestore
        setConversations((prev) =>
            prev.map((conv) =>
            conv.chat_id === selectedConversation ? { ...conv, name: newName } : conv
            )
        );
        alert("Conversation renamed successfully.");
        } catch (error) {
        console.error("Failed to rename the conversation:", error);
        alert("Failed to rename the conversation. Please try again.");
        }
    };


    const handleDelete = async () => {
        handleMenuClose();
        if (!selectedConversation) {
        alert("No conversation selected.");
        return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
        if (!confirmDelete) return;
        try {
        // Référence au document Firestore pour la conversation sélectionnée
        const conversationRef = doc(db, 'chatsessions', selectedConversation);
        // Suppression du document Firestore
        await deleteDoc(conversationRef);
        // Mise à jour de l'état local après succès de la suppression
        setConversations((prev) => prev.filter((conv) => conv.chat_id !== selectedConversation));
        alert("Conversation deleted successfully.");
        } catch (error) {
        console.error("Failed to delete the conversation:", error);
        alert("Failed to delete the conversation. Please try again.");
        }
    };



    //fonction qui permet d afficher les anciennes conversations dans la sidebar of historic conversation and not social conversation
    const fetchCourseOptionsAndChatSessions = async () => {
        if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const courseIds = userData.courses || [];
            const chatSessionIds = userData.chatsessions || [];

            const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
                const courseRef = doc(db, 'courses', courseId);
                const courseSnap = await getDoc(courseRef);
                if (courseSnap.exists()) return { id: courseId, name: courseSnap.data().name };
            }
            return null;
            });

            const courses = await Promise.all(coursePromises);
            const validCourses = courses.filter((course): course is Course => course !== null);

            // Custom order
            const customOrder = ['Academic Advisor', 'Course Selection', 'Career Advisor', 'Campus Life'];

            // Filter out unwanted courses and sort by custom order
            const filteredAndSortedCourses = validCourses
            .filter((course) => course.name !== 'Study Abroad')
            .sort((a, b) => customOrder.indexOf(a.name) - customOrder.indexOf(b.name));

            //setCourseOptions(filteredAndSortedCourses);

            // Handle current course_id (to display the correct course in dropdown)
            const currentCourseId = localStorage.getItem('course_id');
            if (currentCourseId) {
            const currentCourse = filteredAndSortedCourses.find((course) => course.id === currentCourseId);
            if (currentCourse) {
                setSelectedFilter(currentCourse.name);
            } else {
                setSelectedFilter('Academic Advisor'); // Default fallback if course_id is not found
            }
            }

            // Now handle the chat sessions...
            const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
                const chatRef = doc(db, 'chatsessions', chatId);
                const chatSnap = await getDoc(chatRef);
                if (chatSnap.exists() && chatSnap.data().name) 
                return { 
                chat_id: chatId, 
                name: chatSnap.data().name,
                thread_type: chatSnap.data().thread_type || 'Public', // Inclure thread_type avec valeur par défaut
                topic: chatSnap.data().topic || "Default", // Ajout de `topic` avec une valeur par défaut

                };
            }
            return null;
            });

            const fetchedConversations = await Promise.all(chatPromises);
            const validConversations = fetchedConversations.filter(
            (conversation): conversation is Conversation => conversation !== null
            );
            setConversations(validConversations.reverse());

            if (validConversations.length > 0) {
                const latestChatId = validConversations[0].chat_id;
                setPrimaryChatId(latestChatId);
                setActiveChatId(latestChatId);
            }


        }
        }
    };




    const handleConversationClick = async (chat_id: string) => {
        console.log('On se trouve dans le handleConversationClick')
        setCurrentView('chat');
        setPrimaryChatId(chat_id);
        setActiveChatId(chat_id);
        setRelatedQuestions([]);
        setIsLandingPageVisible(false);
    
        try {
          setSocialThreads((prevThreads: any) => {
            const updatedThreads = prevThreads.map((thread: any) => {
              if (thread.chat_id === chat_id && !thread.isRead) {
                return { ...thread, isRead: true };
              }
              return thread;
            });
        
            const newUnreadCount = updatedThreads.filter((thread: any) => !thread.isRead).length;
            setUnreadCount(newUnreadCount);
        
            return updatedThreads;
          });
        
          const chatHistory = await getChatHistory(chat_id);
          console.log("Chat history retrieved for chat_id", chat_id, ":", chatHistory);
          setMessages(chatHistory);
        } catch (error) {
          console.error('Error fetching chat history or thread_type:', error);
          setIsPrivate(false); // Défaut à Public en cas d'erreur
        }
    };



    const handleNewConversation = async () => {
        console.log('NEW CONVERSATION');
        setCurrentView('chat');
    
        if (isStreaming) {
          setCancelConversation(true);
          cancelConversationRef.current = true;
          console.log("Annulation de la conversation en cours.");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
    
        const university = user?.university || 'University Name';
        const newChatId = uuidv4();
        const oldChatId = chatIds[0];
    
        // Mise à jour immédiate de l'état
        setIsStreaming(false);
        setMessages([]);
        setRelatedQuestions([]);
        setIsLandingPageVisible(true);
        setPrimaryChatId(newChatId);
        setActiveChatId(newChatId);
    
        // Ajout immédiat de la nouvelle conversation dans la liste
        setConversations((prevConversations) => [
          { chat_id: newChatId, name: 'New Chat', thread_type: 'Public'},
          ...prevConversations,
        ]);
    
        // Tâches en arrière-plan
        if (user?.id) {
        const userRef = doc(db, 'users', user.id);
    
        try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
            const userData = userSnap.data();
            const chatsessions = userData.chatsessions || [];
    
            // Ajouter le nouvel ID de chat aux sessions
            chatsessions.push(newChatId);
            await updateDoc(userRef, { chatsessions });
    
            // Créer la nouvelle session de chat avec le champ university
            await setDoc(doc(db, 'chatsessions', newChatId), {
                chat_id: newChatId,
                name: 'New Chat',
                created_at: serverTimestamp(),
                modified_at: serverTimestamp(),
                university: university, // Ajout du champ university 
                thread_type: 'Public', // 🔥 thread_type est bien ajouté ici
                ReadBy:[user.id] //Ajout du champ readby to kown who see the conversation. Has he is the creator, he saw it
            });
            console.log(`Nouvelle session de chat créée avec chat_id: ${newChatId}`);
    
            // Actualiser la liste des conversations
            const refreshedUserSnap = await getDoc(userRef);
            if (refreshedUserSnap.exists()) {
                const refreshedUserData = refreshedUserSnap.data();
                const chatSessionIds = refreshedUserData.chatsessions || [];
                const chatPromises = chatSessionIds.map(async (chatId: string) => {
                if (typeof chatId === 'string') {
                    const chatRef = doc(db, 'chatsessions', chatId);
                    const chatSnap = await getDoc(chatRef);
                    if (chatSnap.exists() && chatSnap.data().name) {
                    return { chat_id: chatId, name: chatSnap.data().name };
                    }
                }
                return null;
                });
    
                const fetchedConversations = await Promise.all(chatPromises);
                const validConversations = fetchedConversations.filter(Boolean);
    
                setConversations(validConversations.reverse());
                console.log("Conversations actualisées:", validConversations);
            }
            }
        } catch (error) {
            console.error("Erreur lors de la gestion de l'utilisateur et des chats:", error);
        }
        } else {
        console.error('UID est undefined. Impossible de créer une nouvelle conversation.');
        }
    };

    return {
        formatDate,
        handleMenuOpen,
        handleMenuClose,
        fetchSocialThreads,
        fetchCourseOptionsAndChatSessions,
        handlePrivacyChange,
        handleRename,
        handleDelete,
        handleConversationClick,
        handleNewConversation,
        updateThreadTypeLocally,
        loadChatDataBeforeRedirect,
      };
};



