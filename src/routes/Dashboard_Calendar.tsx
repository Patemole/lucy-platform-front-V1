import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ThemeProvider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  query,
  collection,
  orderBy,
  limit,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  where
} from 'firebase/firestore';
import {
  sendMessageFakeDemo,
  saveMessageAIToBackend,
  getChatHistory,
  sendMessageSocraticLangGraph,
} from '../api/chat';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import ProfileEdit from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import StudentProfileDialog from '../components/StudentProfileDialog';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { usePopup } from '../components/popup';
import logo_greg from '../student_face.png';
import '../index.css';
import { v4 as uuidv4 } from 'uuid';
import MenuItemMui from '@mui/material/MenuItem';
import ListItemTextMui from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { sendUserInfoToBackend } from '../api/calendar-event-studentProfile';
import { Message,StudentProfile, Course, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR, AnswerACCURACYSCORE, AnswerTITLEANDCATEGORY} from '../interfaces/interfaces_eleve';

// import the custom calendar component (new version with custom events)
import Calendar from '../components/Calendar_StudentProfile';
import Kanban from '../components/Kanban_StudentProfile';
import { EventStudentProfile } from '../interfaces/interfaces_eleve';
import EventDetailsSidebar from '../components/EventDetailsSidebar';

const drawerWidth = 270;

interface SocialThread {
  chat_id: string;
  name: string;
  created_at: any;
  topic?: string;
  university?: string;
  thread_type?: string;
  isRead?: boolean;
}

interface Conversation {
  chat_id: string;
  name: string;
  thread_type: string;
  topic?: string;
}


const topicColors: { [key: string]: string } = {
  'Financial Aids': '#27AE60',
  Events: '#E67E22',
  Policies: '#2980B9',
  Housing: '#8E44AD',
  Courses: '#F39C12',
  Chitchat: '#7F8C8D',
  Default: '#7F8C8D',
};

const Dashboard_Calendar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, chatIds, setPrimaryChatId } = useAuth();
  const { popup, setPopup } = usePopup();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [parametersMenuAnchorEl, setParametersMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isHistory, setIsHistory] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(messages.length === 0);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socialThreads, setSocialThreads] = useState<SocialThread[]>([]);
  const [loadingSocialThreads, setLoadingSocialThreads] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [cancelConversation, setCancelConversation] = useState(false);
  const cancelConversationRef = useRef(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<number>(Math.floor(Math.random() * 41) + 10);
  const [isSocialThread, setIsSocialThread] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [events, setEvents] = useState<EventStudentProfile[]>([]); // on charge les événements du backend ici
  const [isCalendarView, setIsCalendarView] = useState(false); // état pour savoir si on est en vue calendar ou pas
  const [selectedEvent, setSelectedEvent] = useState<EventStudentProfile | null>(null); // événement sélectionné lors d'un clic
  const [sidebarOpen, setSidebarOpen] = useState(false); // si la sidebar est ouverte ou pas
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return;
      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfilePicture(userData.profile_picture || null);
          console.log('fetched profile picture:', userData.profile_picture || 'no profile picture found');
        } else {
          console.warn('user document does not exist.');
        }
      } catch (error) {
        console.error('error fetching profile picture:', error);
      }
    };
    fetchProfilePicture();
  }, [user?.id]);

  const handleEventClick = (event: EventStudentProfile) => {
    setSelectedEvent(event);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // fonction de basculement de vue entre le calendar et le kanban
  const toggleView = () => {
    setIsCalendarView((prev) => !prev);
  };

  // fonction pour envoyer les infos de l'utilisateur au backend et récupérer les événements
  const fetchUserInfo = async () => {
    if (!user) {
      console.warn('User data is unavailable.');
      return;
    }
  
    const userInfo: StudentProfile = {
      username: user.name || 'default_username',
      university: user.university || 'University Name',
      year: user.year || 'Null',
      studentProfile: localStorage.getItem('student_profile') || 'Brief profile description',
      interests: Array.isArray(user.interests) ? user.interests : ['No interests now'], //Adding interest to the student profile
      registered_club_status: user.registered_club_status || 'No registered_club_status',
      registered_clubs: user.registered_clubs || 'No registered_clubs',
      major: Array.isArray(user.major) ? user.major : ['None_Default'],
      minor: Array.isArray(user.minor) ? user.minor : ['None_Default'],
      faculty: Array.isArray(user.faculty) ? user.faculty : ['None_Default'],
      email: user.email || 'No email provided',
      userId: user.id || 'No ID',
      role: user.role || 'No role',
      createdAt: user.createdAt || 'Unknown',
      lastLogin: user.lastLogin || 'Unknown',
      profilePicture: user.profilePicture || 'No profile picture',
      name: user.name || 'default_username',
      academic_advisor: user.academic_advisor || 'Unknown',
    };
  
    console.log('Fetched user info:', userInfo);
  
    try {
      const response = await sendUserInfoToBackend(userInfo);
      if (response && response.events) {
        setEvents(response.events);
        console.log('Events successfully retrieved:', response.events);
      } else {
        console.warn('No events found in response.');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleParametersMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setParametersMenuAnchorEl(event.currentTarget);
  };

  const handleParametersMenuClose = () => {
    setParametersMenuAnchorEl(null);
  };

  const handleDeleteAccount = () => {
    console.log('delete account clicked');
    handleParametersMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in', { replace: true });
  };


  const handleToggleHistory = () => {
    setIsHistory((prev) => {
      const newIsHistory = !prev;
      
      // 🔥 Toujours recharger les Social Threads, que l'on active ou désactive l'historique
      fetchSocialThreads();
  
      return newIsHistory;
    });
  };



  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    if (isToday(date)) {
      return `today, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `yesterday, ${format(date, 'HH:mm')}`;
    } else {
      return `${format(date, 'dd/MM/yyyy')}, ${format(date, 'HH:mm')}`;
    }
  };

  const handleRename = async () => {
    handleMenuClose();
    if (!selectedConversation) {
      alert('no conversation selected.');
      return;
    }
    const newName = prompt('enter new name:', '');
    if (!newName) {
      alert('conversation name cannot be empty.');
      return;
    }
    try {
      const conversationRef = doc(db, 'chatsessions', selectedConversation);
      await updateDoc(conversationRef, { name: newName });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.chat_id === selectedConversation ? { ...conv, name: newName } : conv
        )
      );
      alert('conversation renamed successfully.');
    } catch (error) {
      console.error('failed to rename the conversation:', error);
      alert('failed to rename the conversation. please try again.');
    }
  };

  const handleConversationClick = (chat_id: string) => {
    // 🔥 Redirige vers la page du chat avec `chat_id` dans l'URL
    navigate(`/dashboard/student/${user.id}?chat_id=${chat_id}`);
  };
  

  const handleNewConversation = async () => {
    console.log('NEW CONVERSATION');
  
    if (isLandingPageVisible) {
      console.log("Impossible de créer une nouvelle conversation, la landing page est visible.");
      return;
    }
  
    if (isStreaming) {
      setCancelConversation(true);
      cancelConversationRef.current = true;
      console.log("Annulation de la conversation en cours.");
      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log("Après le timeout:", cancelConversationRef.current);
    }
  
    const university = user.university || 'University Name'; // Définition de la valeur du champ university
    const firstMessageContent = messages.length > 0 ? messages[0].content : 'Conversation history';
    console.log("Contenu du premier message capturé:", firstMessageContent);
  
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
      { chat_id: newChatId, name: 'New Chat', thread_type: 'Public'}, //toujours public pour une nouvelle conversation
      ...prevConversations,
    ]);
  
    /*
    // Affiche une roue tournante pour l'ancienne conversation
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.chat_id === oldChatId
          ? { ...conversation, name: 'Updating...' }
          : conversation
      )
    );
    */
  
    // Tâches en arrière-plan
    if (user.id) {
      const userRef = doc(db, 'users', user.id);
  
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const chatsessions = userData.chatsessions || [];
  
          /*
          // Renommer l'ancienne conversation
          if (oldChatId) {
            const oldChatRef = doc(db, 'chatsessions', oldChatId);
            const oldChatSnap = await getDoc(oldChatRef);
  
            if (oldChatSnap.exists()) {
              try {
                await updateDoc(oldChatRef, { name: firstMessageContent });
                console.log(`Renommage de l'ancienne conversation (${oldChatId}) en "${firstMessageContent}"`);
              } catch (error) {
                console.error(`Erreur lors du renommage de l'ancienne conversation (${oldChatId}):`, error);
              }
            } else {
              console.warn(`Aucune conversation trouvée avec chat_id: ${oldChatId}`);
            }
          }
          */
  
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


  const updateThreadTypeLocally = (threadType: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.chat_id === activeChatId
          ? { ...conv, thread_type: threadType }
          : conv
      )
    );
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (!selectedConversation) {
      alert('no conversation selected.');
      return;
    }
    const confirmDelete = window.confirm('are you sure you want to delete this conversation?');
    if (!confirmDelete) return;
    try {
      const conversationRef = doc(db, 'chatsessions', selectedConversation);
      await deleteDoc(conversationRef);
      setConversations((prev) => prev.filter((conv) => conv.chat_id !== selectedConversation));
      alert('conversation deleted successfully.');
    } catch (error) {
      console.error('failed to delete the conversation:', error);
      alert('failed to delete the conversation. please try again.');
    }
  };

  const fetchSocialThreads = () => {
    setLoadingSocialThreads(true);
    const university = user.university || "upenn"; // Université par défaut
  
    // 🔥 Ne filtrer que par "university" dans Firestore
    const q = query(
      collection(db, "chatsessions"),
      where("university", "==", university), // ✅ Filtrer uniquement par université
      orderBy("created_at", "desc") // Trier du plus récent au plus ancien
    );
  
    return onSnapshot(q, (snapshot) => {
      const userId = user.id; // ID de l'utilisateur actuel
  
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
  
      setSocialThreads(filteredThreads);
  
      // 🔥 Mise à jour du compteur des messages non lus
      const unread = filteredThreads.filter((thread) => !thread.isRead).length;
      setUnreadCount(unread);
  
      setLoadingSocialThreads(false);
    });
  };

  /*
  useEffect(() => {
    if (!isHistory) {
      fetchSocialThreads();
    }
  }, [isHistory]);
  */



  //fonction qui permet d afficher les anciennes conversations dans la sidebar of historic conversation and not social conversation
  const fetchCourseOptionsAndChatSessions = async () => {
    if (user.id) {
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

        setCourseOptions(filteredAndSortedCourses);

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
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [user.id]);




  const variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(chatId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversation(null);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* background et éléments décoratifs */}
      <div className="background-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        <div className="frosted-glass"></div>
      </div>
      {/* bouton de basculement fixe en haut à droite */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1100,
        }}
      >
        <Button variant="outlined" onClick={toggleView} sx={{ mt: 1.6, mr: 8.5 }}>
          {isCalendarView ? 'Kanban View' : 'Calendar View'}
        </Button>

      </Box>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.5 }}
        style={{ display: 'contents' }}
      >
        <div
          className="main-content flex h-screen"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: isSmallScreen && drawerOpen ? '20vw' : '0',
            width: isSmallScreen && drawerOpen ? '80vw' : '100%',
            overflow: 'hidden',
          }}
        >
          <Drawer
            variant={isSmallScreen ? 'temporary' : 'persistent'}
            anchor="left"
            open={drawerOpen}
            onClose={isSmallScreen ? toggleDrawer : undefined}
            PaperProps={{
              style: {
                width: isSmallScreen ? '80vw' : drawerWidth,
                borderRadius: '0',
                position: 'fixed',
                height: '100%',
                top: 0,
                left: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(255, 255, 255, 0.3)',
              },
            }}
            ModalProps={{
              keepMounted: true,
              BackdropProps: {
                style: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (!isLandingPageVisible) {
                    handleNewConversation();
                    if (isSmallScreen) toggleDrawer();
                  }
                }}
                sx={{
                  color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                  cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                }}
                disabled={isLandingPageVisible}
              >
                <MapsUgcRoundedIcon />
              </IconButton>
            </Box>
            <List style={{ padding: '0 10px' }}>
              <ListItem
                button
                onClick={() => {
                  navigate(`/dashboard/student/${user?.id || 'defaultId'}`);
                  if (isSmallScreen) toggleDrawer();
                }}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  mb: 1,
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '35px' }}>
                  <ChatIcon sx={{ fontSize: '22px' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Back to chat"
                  primaryTypographyProps={{
                    style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                  }}
                />
              </ListItem>
              <ListItem
                button
                onClick={handleToggleHistory}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  mb: 2,
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '35px' }}>
                {isHistory ? <PeopleIcon sx={{ fontSize: '22px' }}/> : <HistoryIcon sx={{ fontSize: '22px' }}/>}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}
                    >
                      {isHistory ? "Social Thread" : "Conversation History"}
                    </Typography>
                    {/* Ajouter la vignette uniquement si c'est Social Thread */}
                    {isHistory && unreadCount > 0 && (
                      <Box
                        sx={{
                          backgroundColor: 'red',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '2px 6px',
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minWidth: '20px', // Taille minimale pour la vignette
                        }}
                      >
                        {unreadCount}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          </List>

            <Divider style={{ backgroundColor: 'lightgray' }} />
            
      
          <div 
          className="text-center text-black-500 font-semibold mt-5 mb-2 flex justify-center items-center"
          style={{
                  fontSize: '0.95rem', // 🔥 Ajuste la taille (1rem = 16px, ici 1.25rem = 20px)
                  fontWeight: '700', // 🔥 Rend le texte plus épais (700 = bold)
                  marginBottom: '8px', // 🔥 Ajuste l’espacement en dessous
                }}
            >
            <span>
              {isHistory ? "Conversation History" : "Last Public Interactions"}
            </span>
            {/* Ajouter la vignette uniquement si c'est Last Public Interactions */}
            {!isHistory && unreadCount > 0 && (
              <div
                className="ml-2 flex items-center justify-center text-white"
                style={{
                  backgroundColor: 'red',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  minWidth: '20px', // Taille minimale pour un affichage cohérent
                  height: '20px', // Hauteur constante pour garder l'alignement
                }}
              >
                {unreadCount}
              </div>
            )}
          </div>


            {/* Conteneur défilant uniquement pour la liste */}
          <Box style={{ flexGrow: 1, overflowY: 'auto', padding: '0 5px' }}>
            {isHistory ? (
              <List>
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <ListItem
                      key={conversation.chat_id}
                      button
                      onClick={() => {
                        handleConversationClick(conversation.chat_id);
                        if (isSmallScreen) toggleDrawer();
                      }}
                      sx={{
                        position: 'relative',
                        borderRadius: '8px',
                        margin: '2px 0',
                        paddingRight: '40px',
                        backgroundColor:
                          activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                        '& .circle': {
                          backgroundColor:
                            activeChatId === conversation.chat_id
                              ? conversation.thread_type === 'Private'
                                ? '#6F6F6F' // Gris foncé pour conversation privée sélectionnée
                                : '#4A90E2' // Bleu pour conversation publique sélectionnée
                              : conversation.thread_type === 'Private'
                              ? '#BDBDBD'
                              : '#A9C2E8',
                        },
                        '@media (hover: hover) and (pointer: fine)': {
                          '&:hover': {
                            backgroundColor:
                              activeChatId === conversation.chat_id
                                ? theme.palette.button.background // Pas de changement pour une conversation sélectionnée
                                : theme.palette.button.background,
                            '& .circle': {
                              backgroundColor:
                                activeChatId === conversation.chat_id
                                  ? conversation.thread_type === 'Private'
                                    ? '#6F6F6F' // Pas de changement pour une conversation privée sélectionnée
                                    : '#4A90E2' // Pas de changement pour une conversation publique sélectionnée
                                  : conversation.thread_type === 'Private'
                                  ? '#6F6F6F' // Gris clair pour hover privé non sélectionné
                                  : '#4A90E2', // Bleu clair pour hover public non sélectionné
                            },
                          },
                        },
                      }}
                    >
                      {/* Cercle coloré indiquant le type de conversation */}
                      <Box
                        className="circle"
                        sx={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          marginRight: '14px',
                          //marginLeft: '1px',
                          flexShrink: 0,
                        }}
                      />

                      <ListItemText
                        primary={conversation.name}
                        primaryTypographyProps={{
                          style: {
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                        secondary={
                          <Box
                            sx={{
                              display: 'flex', // 🔥 Permet d'afficher "Public/Private" et "Topic" côte à côte
                              alignItems: 'center', // 🔥 Assure un alignement parfait
                              gap: '8px', // 🔥 Espacement entre les deux rectangles
                              marginTop: '2px',
                            }}
                          >
                            {/* Badge Public / Private */}
                            <Box
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                color: conversation.thread_type === 'Private' ? '#6F6F6F' : '#4A90E2',
                                backgroundColor: conversation.thread_type === 'Private' ? '#F0F0F0' : '#E0F2FF',
                                padding: '2px 6px',
                                borderRadius: '5px',
                                display: 'inline-block',
                              }}
                            >
                              {conversation.thread_type === 'Private' ? 'Private' : 'Public'}
                            </Box>
                        
                            {/* Badge Topic */}
                            {conversation.topic && (
                              <Box
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  color: topicColors[conversation.topic] || topicColors["Default"], // Texte coloré
                                  backgroundColor: `${(topicColors[conversation.topic] || topicColors["Default"])}20`, // Fond en version claire
                                  padding: '2px 6px',
                                  borderRadius: '5px',
                                  display: 'inline-block',
                                }}
                              >
                                {conversation.topic}
                              </Box>
                            )}
                          </Box>
                        }                        
                        
                        
                      />
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, conversation.chat_id);
                        }}
                        sx={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: theme.palette.text.primary,
                          opacity: activeChatId === conversation.chat_id ? 1 : 0,
                          pointerEvents: activeChatId === conversation.chat_id ? 'auto' : 'none',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                          mr: '1px',
                        }}
                      >
                        <MoreHorizIcon
                          fontSize="small"
                          sx={{
                            color: 'gray',
                            fontSize: '20px',
                          }}
                        />
                      </IconButton>
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.secondary,
                      marginTop: '30px',
                    }}
                  >
                    You have no conversations yet
                  </Typography>
                )}
              </List>
            ) : (
              <List>
                {loadingSocialThreads ? (
                  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : socialThreads.length > 0 ? (
                  socialThreads.map((thread) => {
                    const topic = thread.topic || "Default"; // Fallback au topic "Upenn"
                    const color = topicColors[topic] || topicColors["Default"]; // Couleur associée ou par défaut

                    return (
                      <ListItem
                        key={thread.chat_id}
                        button
                        onClick={() => {
                          handleConversationClick(thread.chat_id);
                          if (isSmallScreen) toggleDrawer();
                        }}
                        sx={{
                          position: 'relative',
                          borderRadius: '8px',
                          margin: '0.5px 0',
                          paddingRight: '20px',
                          backgroundColor:
                            activeChatId === thread.chat_id ? theme.palette.button.background : 'transparent',
                          '& .MuiIconButton-root': {
                            opacity: activeChatId === thread.chat_id ? 1 : 0,
                            pointerEvents: activeChatId === thread.chat_id ? 'auto' : 'none',
                          },
                          '& .MuiTypography-root': {
                            color:
                              activeChatId === thread.chat_id
                                ? theme.palette.text_human_message_historic
                                : theme.palette.text.primary,
                          },
                          '@media (hover: hover) and (pointer: fine)': {
                            '&:hover': {
                              backgroundColor: theme.palette.button.background,
                              color: theme.palette.text_human_message_historic,
                              '& .MuiIconButton-root': {
                                opacity: 1,
                                pointerEvents: 'auto',
                              },
                            },
                          },
                        }}
                      >
                        
                        {/* Barre Colorée à gauche */}
                        <Box
                          sx={{
                            width: '8px', // Augmenter la largeur
                            minWidth: '8px', // Empêche la largeur d'être réduite
                            height: '38px', // Hauteur explicite pour tester
                            //backgroundColor: color,
                            backgroundColor: color,
                            borderRadius: '3px',
                            marginRight: '10px',
                          }}
                        />

                        {/* Texte Principal et Secondaire */}
                        <ListItemText
                          primary={thread.name}
                          secondary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px', // 🔥 Espacement entre la date et le topic
                                whiteSpace: 'nowrap', // 🔥 Empêche le retour à la ligne
                                marginTop: '2px',
                              }}
                            >
                              {/* Date */}
                              <Typography
                                variant="caption"
                                sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}
                              >
                                {formatDate(thread.created_at).slice(-17)}
                              </Typography>

                              {/* Badge Topic */}
                              {thread.topic && (
                                <Box
                                  sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    color: topicColors[thread.topic] || topicColors["Default"], // Texte coloré
                                    backgroundColor: `${(topicColors[thread.topic] || topicColors["Default"])}20`, // Fond clair basé sur la couleur du topic
                                    padding: '2px 6px',
                                    borderRadius: '5px',
                                    display: 'inline-block',
                                  }}
                                >
                                  {thread.topic}
                                </Box>
                              )}
                            </Box>
                          }
                          sx={{
                            maxWidth: 'calc(100% - 40px)', // Réduit la largeur du texte pour laisser de la place au cercle
                            flexShrink: 1, // Évite que le texte empiète sur le cercle
                          }}
                          primaryTypographyProps={{
                            style: {
                              fontWeight: '500',
                              fontSize: '0.850rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                          }}
                        />

                        {/* Cercle indiquant si la conversation est lue */}
                        <Box
                          sx={{
                            width: '7px', // Taille du cercle
                            minWidth: '7px', // Empêche la largeur d'être réduite
                            height: '7px',
                            borderRadius: '50%', // Cercle parfait
                            backgroundColor: thread.isRead ? 'transparent' : '#3155CC ', // Vert si non lu, transparent sinon
                            transition: 'background-color 0.3s ease', // Transition douce
                            //marginRight: '10px',
                            marginLeft: 'auto', // Pousse le cercle complètement à droite
                          marginRight: '3px', // Ajoute un léger espacement par rapport au bord
                          }}
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.secondary,
                      marginTop: '30px',
                    }}
                  >
                    You have no social threads yet
                  </Typography>
                )}
              </List>
            )}
          </Box>


            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  margin: '8px',
                  borderRadius: '16px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '4px',
                },
              }}
            >
              <MenuItem onClick={handleRename} sx={{ padding: '8px', '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                <EditIcon fontSize="small" sx={{ marginRight: '8px' }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: '400' }}>
                  rename
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ padding: '8px', color: 'red', '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                <DeleteIcon fontSize="small" sx={{ marginRight: '8px' }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: '400' }}>
                  delete
                </Typography>
              </MenuItem>
            </Menu>
            {isSmallScreen && (
              <Box style={{ padding: '16px', borderTop: `1px solid ${theme.palette.divider}` }}>
                <AccountCircleIcon
                  fontSize="large"
                  component="svg"
                  style={{ color: '#9e9e9e', cursor: 'pointer', margin: '0 auto' }}
                  onClick={(event) => {
                    handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);
                    if (isSmallScreen) toggleDrawer();
                  }}
                />
                <Menu
                  anchorEl={profileMenuAnchorEl}
                  open={Boolean(profileMenuAnchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
                >
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                          log-out
                        </Typography>
                      }
                    />
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Drawer>


          <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''}`}>
            <div
              className="relative p-4 flex items-center justify-between"
              style={{ backgroundColor: 'transparent', borderColor: theme.palette.divider }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!drawerOpen && (
                  <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                    <MenuIcon />
                  </IconButton>
                )}
              </div>
              <img
                src={theme.logo}
                alt="University Logo"
                style={{
                  height: '40px',
                  marginRight: '10px',
                  paddingLeft: drawerOpen ? '40px' : '0px',
                  transition: 'padding-left 0.3s ease-in-out',
                }}
              />
              <div style={{ flexGrow: 1 }}></div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isSmallScreen ? null : (
                  <>
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        style={{ width: '55px', height: '55px' }}
                        className="rounded-full object-cover cursor-pointer"
                        onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                      />
                    ) : (
                      <AccountCircleIcon
                        fontSize="inherit"
                        component="svg"
                        style={{
                          color: '#9e9e9e',
                          cursor: 'pointer',
                          margin: '0 auto 0 16px',
                          fontSize: '2.5rem',
                        }}
                        onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                      />
                    )}


                    <Menu
                      anchorEl={profileMenuAnchorEl}
                      open={Boolean(profileMenuAnchorEl)}
                      onClose={handleProfileMenuClose}
                      PaperProps={{
                        style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper },
                      }}
                    >
                      <MenuItem onClick={handleDialogOpen}>
                        <ListItemIcon>
                          <ProfileEdit fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                              edit profile
                            </Typography>
                          }
                        />
                      </MenuItem>
                      <MenuItem onClick={handleParametersMenuClick}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                              parameters
                            </Typography>
                          }
                        />
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                              log-out
                            </Typography>
                          }
                        />
                      </MenuItem>
                    </Menu>
                    
                    <Menu
                      anchorEl={parametersMenuAnchorEl}
                      open={Boolean(parametersMenuAnchorEl)}
                      onClose={handleParametersMenuClose}
                      PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      sx={{ mt: -1, ml: -18 }}
                    >
                      <MenuItem onClick={handleDeleteAccount}>
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" sx={{ color: '#F04261' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                              delete account
                            </Typography>
                          }
                        />
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </div>
            </div>


            {/* conteneur regroupant le titre et le sous-titre (sans le bouton) */}
            <div className="pl-10 pr-4 transition-all duration-300 flex flex-col h-full">
              <div className="sticky top-0 z-20 mb-4 ml-5 flex items-center">
                <div>
                  <Typography variant="h5" component="h1" style={{ fontWeight: 500 }}>
                    {isCalendarView ? 'Calendar' : 'Your Weekly Event'}
                  </Typography>
                  <Typography variant="subtitle2" component="h2" style={{ color: theme.palette.text.secondary }}>
                    {isCalendarView ? 'Your personnalized events based on your student profile' : 'Your personnalized events based on your student profile'}
                  </Typography>
                </div>
              </div>
              <div className="flex-grow h-full flex flex-col min-w-0 overflow-x-auto">
                {isCalendarView ? (
                  <Calendar onEventClick={handleEventClick} events={events} />
                ) : (
                  <Kanban onEventClick={handleEventClick} events={events} />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <EventDetailsSidebar event={selectedEvent} open={sidebarOpen} onClose={handleCloseSidebar} />
      <StudentProfileDialog open={dialogOpen} onClose={handleDialogClose} setProfilePicture={setProfilePicture} />
    </ThemeProvider>
  );
};

export default Dashboard_Calendar;
