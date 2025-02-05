// src/components/Dashboard_eleve_template.tsx

import React, { useState, useEffect, KeyboardEvent, useRef, useMemo } from 'react';
import StopIcon from '@mui/icons-material/Stop';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {
  ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Divider, IconButton, Snackbar, InputAdornment, Alert, CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import ProfileEdit from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, deleteDoc, query, collection, orderBy, limit, getDocs, where, startAfter, QueryDocumentSnapshot, DocumentData} from 'firebase/firestore';
import logo_greg from '../student_face.png';
import '../index.css';
import { AIMessage } from '../components/MessagesWEB';
import { Message, Course, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR, AnswerACCURACYSCORE, AnswerTITLEANDCATEGORY} from '../interfaces/interfaces_eleve';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory, sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import LandingPage from '../components/LandingPageImprove'; // Import du composant LandingPage
import StudentProfileDialog from '../components/StudentProfileDialog'; // Import the dialog component
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Import de l'icône des trois petits points
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ShareIcon from '@mui/icons-material/Share'; // Icône pour "Partager"
import EditIcon from '@mui/icons-material/Edit'; // Icône pour "Renommer"
import ArchiveIcon from '@mui/icons-material/Archive'; // Icône pour "Archiver"
import DeleteIcon from '@mui/icons-material/Delete'; // Icône pour "Supprimer"
import SettingsIcon from '@mui/icons-material/Settings';
import './styles.css'; // Import du fichier CSS pour le gradient
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import debounce from 'lodash/debounce';
import { FaArrowDown } from 'react-icons/fa'; // Import an arrow down icon
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import { format, isToday, isYesterday } from 'date-fns';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';



// Définir l'interface pour une conversation de thread social (social conversation)
interface SocialThread {
  chat_id: string;
  name: string;
  created_at: any; // ou un type plus précis comme firebase.Timestamp
  topic?: string;
  university?: string;
  thread_type?: string;
  isRead?: boolean; // Ajout de la propriété isRead
}

// Definis l interface pour une conversation mais de l historique pas de social conversation
interface Conversation {
  chat_id: string;
  name: string;
  thread_type: string;
  topic?: string;
}

/*
const topicColors: { [key: string]: string } = {
  "Upenn": "#8E44AD",
  "New Chat": "#E74C3C",
  "Wharton": "#F1C40F",
  "YouTube": "#2980B9",
  "Default": "#7F8C8D"
};
*/

const topicColors: { [key: string]: string } = {
  "Financial Aids": "#27AE60", // Vert
  "Events": "#E67E22", // Orange
  "Policies": "#2980B9", // Bleu
  "Housing": "#8E44AD", // Violet
  "Courses": "#F39C12", // Jaune
  "Chitchat": "#7F8C8D", // Jaune
  "Default": "#7F8C8D" // Gris
};


const drawerWidth = 270;

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { user, logout, chatIds, addChatId, setPrimaryChatId } = useAuth();
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id')); //TODO CHANGER ICI POUR NE PLUS AVOIR LE LOCALSTORAGE 
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState('');
  const phraseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasNewContent, setHasNewContent] = useState(false); 
  const [cancelConversation, setCancelConversation] = useState(false);
  const cancelConversationRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false); 
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const messageMarginX = isSmallScreen ? 'mx-2' : 'mx-20';
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(messages.length === 0);
  const generateUniqueId = (): number => Date.now() + Math.floor(Math.random() * 1000);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
   // État pour gérer le basculement entre History et Social Thread
  const [isHistory, setIsHistory] = useState(false);
  const [parametersMenuAnchorEl, setParametersMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [userScrollingManually, setUserScrollingManually] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  // État pour stocker les conversations sociales
  const [socialThreads, setSocialThreads] = useState<SocialThread[]>([]);
  const [loadingSocialThreads, setLoadingSocialThreads] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false); // false = Public, true = Private
  const [profilePicture, setProfilePicture] = useState<string | null>(null); // null signifie qu'aucune image n'est définie
  const [unreadCount, setUnreadCount] = useState<number>(0); //Count for number of conversation social thread dont opened
  const [onlineUsers, setOnlineUsers] = useState<number>(Math.floor(Math.random() * 41) + 10);
  const [isSocialThread, setIsSocialThread] = useState(false); // Permet de savoir si c'est un Social Thread
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);


  //Change the fake number of online student every 15 secondes
  useEffect(() => {
    const updateOnlineUsers = () => {
      setOnlineUsers((prev) => {
        let variation = Math.floor(Math.random() * 7) - 3; // Variation entre -3 et +3
        let newCount = prev + variation;
  
        if (newCount < 10) newCount = 10;
        if (newCount > 50) newCount = 50;
  
        return newCount;
      });
  
      const nextUpdate = Math.floor(Math.random() * 60000) + 1000; // Entre 1s et 60s
      setTimeout(updateOnlineUsers, nextUpdate);
    };
  
    const initialTimeout = setTimeout(updateOnlineUsers, Math.floor(Math.random() * 60000) + 1000);
    return () => clearTimeout(initialTimeout);
  }, []);


  useEffect(() => {
    console.log("isPrivate changed to:", isPrivate);
  }, [isPrivate]);


  const togglePrivacy = () => {
    setIsPrivate((prev) => !prev);
  };

  // Fonction pour formater la date
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


  const updateThreadTypeLocally = (threadType: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.chat_id === activeChatId
          ? { ...conv, thread_type: threadType }
          : conv
      )
    );
  };

  /*
  
  //RECUPERE LES SOCIAL CONVERSATION PAR NOM D UNIVERSITY ET CELLE QUI SONT PUBLIC - ANCIENNE VERSION QUI N AFFICHAIT PAS TOUT
  const fetchSocialThreads = async () => {
    setLoadingSocialThreads(true);
    const university = user.university || 'upenn'; // par défaut si user.university n'existe pas
  
    try {
      const q = query(
        collection(db, 'chatsessions'),
        orderBy('created_at', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);

      const userId = user.id; // ID de l'utilisateur actuel
  
      // Transformation des threads depuis Firestore
      const threads = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          chat_id: data.chat_id,
          name: data.name,
          created_at: data.created_at,
          topic: data.topic || "Default",
          thread_type: data.thread_type || "Public",
          university: data.university || "Default",
          isRead: (data.ReadBy || []).includes(userId), // Marque comme lu si userId est dans ReadBy
          
        };
      });

      // Filtrer les threads publics pour l'université actuelle
      const filteredThreads = threads.filter(
        (thread) => thread.university === university && thread.thread_type === 'Public' && thread.name != 'New Chat'
      );

      // Met à jour les threads sociaux avec les threads filtrés
      setSocialThreads(filteredThreads);

      // Calculer le nombre de conversations non lues parmi les threads filtrés
      const unread = filteredThreads.filter((thread) => !thread.isRead).length;
      setUnreadCount(unread); // Mettre à jour l'état du compteur


    } catch (error) {
      console.error('Erreur lors de la récupération des social threads :', error);
    } finally {
      setLoadingSocialThreads(false);
    }
  };
  */
  
  const fetchSocialThreads = async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    setLoadingSocialThreads(true);
    const university = user.university || "upenn"; // Valeur par défaut si non défini
  
    try {
      let q = query(
        collection(db, "chatsessions"),
        where("university", "==", university), 
        where("thread_type", "==", "Public"),  // 🔥 Ne récupère que les publics
        orderBy("created_at", "desc"),
        limit(50)
      );
  
      if (lastDoc) {
        q = query(q, startAfter(lastDoc)); // 🔥 Pagination si un dernier document existe
      }
  
      const querySnapshot = await getDocs(q);
      const userId = user.id; // ID de l'utilisateur actuel
  
      // Transformer les résultats Firestore
      const threads = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            chat_id: data.chat_id,
            name: data.name,
            created_at: data.created_at,
            topic: data.topic || "Default",
            thread_type: data.thread_type || "Public",
            university: data.university || "Default",
            isRead: Array.isArray(data.ReadBy) ? data.ReadBy.includes(userId) : false, // 🔥 Sécurisation du ReadBy
          };
        })
        .filter((thread) => thread.name !== "New Chat"); // 🚨 Exclure "New Chat"
  
      // Ajoute les nouveaux threads aux existants (pagination)
      setSocialThreads((prevThreads) => [...prevThreads, ...threads]);
  
      // Stocke le dernier document récupéré pour la pagination
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
  
      // Compte les conversations non lues
      const unread = threads.filter((thread) => !thread.isRead).length;
      setUnreadCount((prevCount) => prevCount + unread); // 🔥 Ajoute aux non lus sans écraser la valeur précédente
  
    } catch (error) {
      console.error("Erreur lors de la récupération des social threads :", error);
    } finally {
      setLoadingSocialThreads(false);
    }
  };




  /*
  //RECUPERE LES SOCIAL CONVERSATION PAR NOM D UNIVERSITY ET CELLE QUI SONT PUBLIC 
  //Recupere egalement pour l utilisateur en cours les threads qu il n a pas encore lu et les ajoute dans le thread comme ca on peut afficher ou pas
  //le cercle montrant qu il a lu ou pas la conversation.  
  const fetchSocialThreads = async () => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const unreadThreads = userData.unread_social_threads || []; // Threads non lus
  
      const q = query(
        collection(db, 'chatsessions'),
        orderBy('created_at', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
  
      const threads = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          chat_id: data.chat_id,
          name: data.name,
          created_at: data.created_at,
          topic: data.topic || "Default",
          thread_type: data.thread_type || "Public",
          isRead: !unreadThreads.includes(data.chat_id), // Si non dans la liste, alors lu
        };
      });
  
      setSocialThreads(threads);
    }
  };
  */



  const updateConversationPrivacy = (chatId: string, newThreadType: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.chat_id === chatId
          ? { ...conv, thread_type: newThreadType }
          : conv
      )
    );
  };


  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return;
  
      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfilePicture(userData.profile_picture || null); // Met à jour avec l'URL ou null
          console.log('Fetched profile picture:', userData.profile_picture || 'No profile picture found');
        } else {
          console.warn('User document does not exist.');
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };
  
    fetchProfilePicture();
  }, [user?.id]);


  // Utilisez useEffect pour récupérer les social threads lorsque l'état change vers Social Thread
  useEffect(() => {
    if (!isHistory) {
      fetchSocialThreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHistory]);
  

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollDiv = scrollableDivRef.current;
      if (scrollDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 100; // Adjust threshold as needed
        setIsAtBottom(atBottom);
        if (atBottom) setNewMessagesCount(0);
      }
    }, 100); // Delay of 100ms
  
    const scrollDiv = scrollableDivRef.current;
    scrollDiv?.addEventListener('scroll', handleScroll);
  
    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
  }, []);


  // Autoscroll logic based on isAtBottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setNewMessagesCount((prevCount) => prevCount + 1);
    }
  }, [messages, isAtBottom]); // Depend on messages and isAtBottom


  const scrollToBottom = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true); // Mettre à jour l'état pour refléter que nous sommes en bas
      setNewMessagesCount(0); // Réinitialiser le compteur de nouveaux messages
    }
  };

  const handlePrivacyChange = (newPrivacyState: boolean) => {
    setIsPrivate(newPrivacyState);
    console.log(`Privacy state updated in parent: ${newPrivacyState ? 'Private' : 'Public'}`);
  };

  const scrollToBottomNewMessage = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
    }
  };

  // Fonction pour gérer le clic sur le bouton History/Social Thread
  const handleToggleHistory = () => {
    setIsHistory((prev) => !prev);
  };


  const lastAiMessageId = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.type === 'ai');
    return lastAiMessage ? lastAiMessage.id : null;
  }, [messages]);


  const variants = {
    initial: { opacity: 0, x: -50 }, // Légèrement hors de l'écran à gauche
    animate: { opacity: 1, x: 0 },   // Complètement visible au centre
    exit: { opacity: 0, x: 50 },     // Glisse vers la droite
  };


  // Ouvrir le menu au clic gauche
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(chatId);
  };

  // Fermer le menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversation(null);
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

  // Action pour supprimer une conversation
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
    
  const handleParametersMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setParametersMenuAnchorEl(event.currentTarget);
  };
  
  const handleParametersMenuClose = () => {
    setParametersMenuAnchorEl(null);
  };
  

  const handleDeleteAccount = () => {
    console.log('Delete Account clicked');
    handleParametersMenuClose();
  };

  // Compute if the latest AI message has a TAK
  const hasTak = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.type === 'ai');
    return lastAiMessage?.TAK && lastAiMessage.TAK.length > 0;
  }, [messages]);


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

  //permet d afficher les anciennes conversations dans la sidebar
  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [user.id]);





  //permet d aller chercher le dernier chatid on chargerement de la page pour afficher la derniere conversation
  useEffect(() => { 
    const loadMessagesFromLocalStorageChatId = async () => {
      //const storedChatId = localStorage.getItem('chat_id');
      const storedChatId = chatIds[0] || 'default_chat_id';
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);


  //permet d afficher ou non la landing page en fonction si il y a deja des messages
  useEffect(() => {
    if (messages.length > 0) {
      setIsLandingPageVisible(false);
    } else {
      setIsLandingPageVisible(true);
    }
  }, [messages]);

  //gere l ouverture du menu de log-out
  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  //gere la fermeture du menu de log-out
  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  //gestion du log-out
  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in', { replace: true });
  };


  //pernmet d envoyer le message qu on a choisi dans tak en cliquant sur le composant
  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return;

    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };


  //permet d envoyer le message qu on a choisi dans le coursemessage en cliquant sur le composant
  const handleSendCOURSEMessage = (COURSE_message: string) => {
    if (COURSE_message.trim() === '') return;

    const newMessage: Message = { id: Date.now(), type: 'human', content: COURSE_message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], COURSE_message);
  };


   /*
   // Fonction pour gérer les messages envoyés par le composant LandingPage
   const handleSendMessageFromLandingPage = (message: string) => {
    if (message.trim() !== '') {
      const newMessage: Message = { id: Date.now(), type: 'human', content: message };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
      setMessages((prevMessages) => [...prevMessages, loadingMessage]);

      onSubmit([...messages, newMessage, loadingMessage], message);

      setInputValue(''); // Effacer le champ de saisie après l'envoi

      // Masquer la LandingPage après l'envoi d'un message
      setIsLandingPageVisible(false);
    }
  };
  */


  //NOUVELLE FONCTION A IMPLEMENTER 
  /*
  const handleSendMessageFromLandingPage = (message: string) => {
    if (message.trim() !== '') {
      const newMessage: Message = { id: Date.now(), type: 'human', content: message };
      const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
  
      // Mettre à jour les messages localement
      const newMessagesArray = [...messages, newMessage, loadingMessage];
      setMessages(newMessagesArray);
  
      // Envoyer les messages au backend
      onSubmit(newMessagesArray, message);
  
      // Réinitialiser l'input et masquer la Landing Page
      setInputValue('');
      setIsLandingPageVisible(false);
    }
  };
  */


  //ANCIENNE FONCTION A MODIFIER AVEC LA LOGIQUE DE MODIFICATION DU TITLE FROM THE BACK OPENAI
  const handleSendMessageFromLandingPage = (message: string) => {
    console.log("handleSendMessageFromLandingPage called with message:", message);
    console.log("Before adding message, messages.length:", messages.length);
    console.log("activeChatId:", activeChatId);
  
    if (message.trim() !== '') {
      const wasEmpty = (messages.length === 0);
      console.log("wasEmpty (was the conversation empty before this message?):", wasEmpty);
  
      const newMessage: Message = { id: Date.now(), type: 'human', content: message };
      const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
  
      // Créer un nouveau tableau de messages, incluant le message humain et le message "en cours"
      const newMessagesArray = [...messages, newMessage, loadingMessage];
      console.log("New messages array length after adding newMessage and loadingMessage:", newMessagesArray.length);
  
      // Met à jour l'état des messages
      setMessages(newMessagesArray);
  
      /*
      // Si c'est le premier message et qu'on a un activeChatId, on tente de renommer la conversation
      if (wasEmpty && activeChatId) {
        const firstMessageContent = message || 'Conversation history';
        console.log("Attempting to rename conversation since it's the first message.");
        console.log("Renaming conversation:", activeChatId, "to:", firstMessageContent);
  
        // Mettre à jour localement le nom de la conversation à "Updating..." pendant la mise à jour backend
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.chat_id === activeChatId
              ? { ...conv, name: 'Updating...' }
              : conv
          )
        );
  
        const currentChatRef = doc(db, 'chatsessions', activeChatId);
        getDoc(currentChatRef)
          .then(currentChatSnap => {
            if (currentChatSnap.exists()) {
              console.log("Conversation document found. Attempting updateDoc...");
              updateDoc(currentChatRef, { name: firstMessageContent })
                .then(() => {
                  console.log(`Conversation (${activeChatId}) renamed to "${firstMessageContent}" successfully.`);
  
                  // Une fois mis à jour en back, mettre à jour localement le nom final
                  setConversations((prevConversations) =>
                    prevConversations.map((conv) =>
                      conv.chat_id === activeChatId
                        ? { ...conv, name: firstMessageContent }
                        : conv
                    )
                  );
                })
                .catch(error => {
                  console.error(`Error renaming conversation (${activeChatId}):`, error);
                });
            } else {
              console.warn(`No conversation found with chat_id: ${activeChatId}`);
            }
          })
          .catch(error => {
            console.error("Error getting doc for renaming chat:", error);
          });
      } else {
        console.log("No rename triggered. Conditions not met.");
        console.log("wasEmpty:", wasEmpty, "| activeChatId:", activeChatId);
      }
      */
  
      console.log("Calling onSubmit with newMessagesArray and message:", message);
      onSubmit(newMessagesArray, message);
  
      setInputValue('');
      setIsLandingPageVisible(false);
    } else {
      console.log("Message was empty, no action taken.");
    }
  };


  //fonction qui gere differents etats et les messages avant d aller traiter la reponse par onsubmit
  const handleSendMessageSocraticLangGraph = (message: string) => {
    if (message.trim() === '') return;

    // Masquer la LandingPage après l'envoi du premier message
    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: generateUniqueId(), type: 'human', content: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: generateUniqueId() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], message);
    setInputValue('');
  };


  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (isStreaming) {
        console.warn("Cannot send a new message while the AI is responding. Please stop the current response first.");
        event.preventDefault(); // Prevents sending the message
      } else {
        event.preventDefault();
        handleSendMessageSocraticLangGraph(inputValue);
      }
    }
  };


  // Fonction pour envoyer le message à l'AI ou à l'API
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true); 
    setHasNewContent(false); // Reset new content detection at the start of each message
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerCHART: AnswerCHART[] = [];
    let answerCourse: AnswerCourse[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let answerReasoning: ReasoningStep[] = [];
    let answerREDDIT: AnswerREDDIT[] = [];
    let answerINSTA: AnswerINSTA[] = [];
    let answerINSTA2: AnswerINSTA2[] = [];
    let answerYOUTUBE: AnswerYOUTUBE[] = [];
    let answerQUORA: AnswerQUORA[] = [];
    let answerINSTA_CLUB: AnswerINSTA_CLUB[] = [];
    let answerLINKEDIN: AnswerLINKEDIN[] = [];
    let answerERROR: AnswerERROR[] = [];
    let answerACCURACYSCORE: AnswerACCURACYSCORE[] = [];
    let answerTITLEANDCATEGORY: AnswerTITLEANDCATEGORY[] = [];
    let error: string | null = null;


    const abortController = new AbortController(); // Crée un AbortController
    cancelConversationRef.current = false; // Réinitialiser l'état d'annulation au début

    try {
        const chatSessionId = chatIds[0] || 'default_chat_id';
        const courseId = 'default_course_id';
        const username = user.name || 'default_username';
        const university = user.university || 'University Name';
        const year = user.year || 'Null';
        const student_profile = localStorage.getItem('student_profile') || 'Brief profile description';
        const major = Array.isArray(user.major) ? user.major : ['None_Default'];
        const minor = Array.isArray(user.minor) ? user.minor : ['None_Default'];
        const faculty = Array.isArray(user.faculty) ? user.faculty : ['None_Default'];

        console.log('chatSessionId:', chatSessionId);
        console.log('username:', username);
        console.log('university:', university);
        console.log('major:', major);
        console.log('minor:', minor);
        console.log('year:', year);
        console.log('faculty:', faculty);

        const lastMessageIndex = messageHistory.length - 1;

        
        const currentConversation = conversations.find((conv) => conv.chat_id === chatSessionId);
        const isFirstMessage = currentConversation?.name === 'New Chat'; // Vérifie si le titre est par défaut
        console.log("This is the name of the current conversation", currentConversation?.name)
        console.log("This is the value of isfirstmessage", isFirstMessage)
        
        /*
        const isFirstMessage = (lastMessageIndex === -1); // Vérifie si l'historique est vide

        console.log(`lastMessageIndex: ${lastMessageIndex}`);
        console.log(`messageHistory.length: ${messageHistory.length}`);
        console.log(`Is this the first message? ${lastMessageIndex === -1}`);
        */

        for await (const packetBunch of sendMessageSocraticLangGraph({
            message: inputValue,
            chatSessionId: chatSessionId,
            courseId: courseId,
            username: username,
            university: university,
            student_profile: student_profile,
            major: major,
            minor: minor,
            year: year,
            faculty: faculty,
            isFirstMessage: isFirstMessage,
        },
        abortController.signal // Passez le signal ici
      )) {

            // Vérifier si la conversation a été annulée
            if (cancelConversationRef.current) {
              console.log("Conversation a été annulée.");
              abortController.abort(); // Arrête immédiatement la requête
              break; // Sortir de la boucle pour arrêter le traitement des paquets
          }

            // Process each packet in the packet bunch
            if (Array.isArray(packetBunch)) {
                for (const packet of packetBunch) {
                    if (typeof packet === 'string') {
                        setHasNewContent(true); // Detects new content
                        answer = packet.replace(/\|/g, '');
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
                        answer = (packet as AnswerPiecePacket).answer_piece;
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
                        answerImages.push((packet as any).image_data);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
                        answerTAK.push((packet as any).answer_TAK_data);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_CHART_data')) {
                        answerCHART.push((packet as any).answer_CHART_data);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
                        answerCourse.push((packet as any).answer_COURSE_data);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'reasoning_steps')) {
                        answerReasoning.push((packet as any).reasoning_steps);
                        console.log("Étapes de raisonnement ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'reddit')) {
                        answerREDDIT.push((packet as any).reddit);
                        console.log("Reddit ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'insta')) {
                        answerINSTA.push((packet as any).insta);
                        console.log("Insta ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'insta2')) {
                        answerINSTA2.push((packet as any).insta2);
                        console.log("Insta2 ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'insta_club')) {
                        answerINSTA_CLUB.push((packet as any).insta_club);
                        console.log("Insta club ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'linkedin')) {
                        answerLINKEDIN.push((packet as any).linkedin);
                        console.log("Linkedin ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'youtube')) {
                        answerYOUTUBE.push((packet as any).youtube);
                        console.log("Youtube ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'quora')) {
                        answerQUORA.push((packet as any).quora);
                        console.log("Quora ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'error_back')) {
                        answerERROR.push((packet as any).error_back);
                        console.log("Error ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'accuracy_score')) {
                        answerACCURACYSCORE.push((packet as any).accuracy_score);
                        console.log("Accuracy score ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'classification_title_result')) {
                        answerTITLEANDCATEGORY.push((packet as any).classification_title_result);
                        console.log("title and category ajoutées");
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
                        answerWaiting = (packet as any).answer_waiting;
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
                        error = (packet as StreamingError).error;
                    }
                }
            } else if (typeof packetBunch === 'object' && packetBunch !== null) {
                if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
                    answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);
                    console.log('This is a test');
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
                    answerImages.push((packetBunch as any).image_data);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
                    answerTAK.push((packetBunch as any).answer_TAK_data);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reasoning_steps')) {
                    answerReasoning.push((packetBunch as any).reasoning_steps);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reddit')) {
                    answerREDDIT.push((packetBunch as any).reddit);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta')) {
                    answerINSTA.push((packetBunch as any).insta);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta2')) {
                    answerINSTA2.push((packetBunch as any).insta2);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta_club')) {
                    answerINSTA_CLUB.push((packetBunch as any).insta_club);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'linkedin')) {
                    answerLINKEDIN.push((packetBunch as any).linkedin);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'youtube')) {
                    answerYOUTUBE.push((packetBunch as any).youtube);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'quora')) {
                    answerQUORA.push((packetBunch as any).quora);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error_back')) {
                    answerERROR.push((packetBunch as any).error_back);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'accuracy_score')) {
                    answerACCURACYSCORE.push((packetBunch as any).accuracy_score);

                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'classification_title_result')) {
                    answerTITLEANDCATEGORY.push((packetBunch as any).classification_title_result);

                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_CHART_data')) {
                    answerCHART.push((packetBunch as any).answer_CHART_data);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
                    answerCourse.push((packetBunch as any).answer_COURSE_data);
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
                    relatedQuestionsList = (packetBunch as any).related_questions;
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
                    answerWaiting = (packetBunch as any).answer_waiting;
                } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
                    error = (packetBunch as StreamingError).error;
                }
            }

            console.log("Valeur brute de answerTITLEANDCATEGORY :", answerTITLEANDCATEGORY);

            const flattenedImages = answerImages.flat();
            const flattenedTAK = answerTAK.flat();
            const flattenedReasoning = answerReasoning.flat();
            const flattenedREDDIT = answerREDDIT.flat();
            const flattenedINSTA = answerINSTA.flat();
            const flattenedINSTA2 = answerINSTA2.flat();
            const flattenedINSTA_CLUB = answerINSTA_CLUB.flat();
            const flattenedLINKEDIN = answerLINKEDIN.flat();
            const flattenedYOUTUBE = answerYOUTUBE.flat();
            const flattenedQUORA = answerQUORA.flat();
            const flattenedERROR = answerERROR.flat();
            // Log before flattening `answerACCURACYSCORE`
            console.log("Raw answerACCURACYSCORE received:", answerACCURACYSCORE);

            const flattenedACCURACYSCORE = answerACCURACYSCORE.flat();

            const flattenedTITLEANDCATEGORY = answerTITLEANDCATEGORY.flat();
            console.log("Flattened answerTITLEANDCATEGORY:", flattenedTITLEANDCATEGORY);



            //permet de pouvoir update le topic de la conversation en cours en fonction de la question de l utilisateur
            
            if (flattenedTITLEANDCATEGORY.length > 0) {
              const { category: newCategory, conversation_title: newTitle } = flattenedTITLEANDCATEGORY[0];
            
              // Mise à jour locale du topic et du titre
              setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                  conv.chat_id === chatSessionId
                    ? { ...conv, topic: newCategory, name: newTitle } // Mise à jour locale
                    : conv
                )
              );

              // Mise à jour locale du topic pour `socialThreads`
              setSocialThreads((prevSocialThreads) =>
                prevSocialThreads.map((thread) =>
                  thread.chat_id === chatSessionId
                    ? { ...thread, topic: newCategory, name: newTitle } // Mise à jour locale
                    : thread
                )
              );
            
              // Mise à jour dans Firestore pour le topic et le titre
              const updateThreadData = async (chatId: string, data: { topic: string; name: string }) => {
                try {
                  const docRef = doc(db, "chatsessions", chatId); // Référence au document Firestore
                  await updateDoc(docRef, data); // Mise à jour des champs `topic` et `name`
                  console.log(`Thread ${chatId} updated with topic: ${data.topic} and title: ${data.name}`);
                } catch (error) {
                  console.error("Erreur lors de la mise à jour du thread :", error);
                }
              };
            
              // Appel de la mise à jour persistante
              updateThreadData(chatSessionId, { topic: newCategory, name: newTitle });
            }

            //const flattenedTITLEANDCATEGORY = [
            //  { category: "Financial Aids", conversation_title: "Scholarship Details" }
            //];

            // Log after flattening `answerACCURACYSCORE`
            console.log("Flattened answerACCURACYSCORE:", flattenedACCURACYSCORE);
            const flattenedCHART = answerCHART.flat();
            const flattenedCourse = answerCourse.flat();
            const flattenedwaitingdata = answerWaiting.flat();

            // Update the messages if conversation was not cancelled
            if (!cancelConversationRef.current) {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[lastMessageIndex] = {
                        ...prevMessages[lastMessageIndex],
                        type: 'ai',
                        content: answer,
                        personaName: 'Lucy',
                        citedDocuments: answerDocuments,
                        images: flattenedImages,
                        TAK: flattenedTAK,
                        CHART: flattenedCHART,
                        COURSE: flattenedCourse,
                        waitingMessages: flattenedwaitingdata,
                        ReasoningSteps: flattenedReasoning,
                        REDDIT: flattenedREDDIT,
                        INSTA: flattenedINSTA,
                        YOUTUBE: flattenedYOUTUBE,
                        QUORA: flattenedQUORA,
                        ERROR: flattenedERROR,
                        CONFIDENCESCORE: flattenedACCURACYSCORE,
                        INSTA_CLUB: flattenedINSTA_CLUB,
                        LINKEDIN: flattenedLINKEDIN,
                        INSTA2: flattenedINSTA2,
                    };
                    return updatedMessages;
                });
            }
        }

        // Mettre à jour les questions liées et arrêter le streaming si non annulé
        if (!cancelConversationRef.current) {
          setRelatedQuestions(relatedQuestionsList);
          setIsStreaming(false);
        }

        if (!user.id) {
          throw new Error("L'ID utilisateur (uid) est manquant dans l'URL.");
        }

        // Save AI message to backend if conversation is still active
        if (!cancelConversationRef.current) {
            await saveMessageAIToBackend({
                message: answer,
                chatSessionId: chatSessionId,
                courseId: courseId,
                username: 'Lucy',
                type: 'ai',
                uid: user.id,
                input_message: inputValue,
                university: university,
            });
        }
    } catch (e: any) {
        if (e.name === 'AbortError') {
          console.log('Requête interrompue par l’utilisateur.');
          setIsStreaming(false); // Mettre à jour l'état ici
          setHasNewContent(false); // Réinitialiser si nécessaire
          // Optionnel : Ajouter une indication à l’UI pour signaler que la réponse est stoppée
        } else {
          console.error('Erreur lors du traitement des messages :', e.message);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: Date.now(),
                type: 'error',
                content: 'An error occurred. Try to send the message again or open a new chat.',
            },
        ]);
        }
    } finally {
        setIsStreaming(false); // Ensure streaming is set to false after completion or error
        if (cancelConversationRef.current) {
          cancelConversationRef.current = false;
          setCancelConversation(false);
          console.log("cancelConversation réinitialisé à false après annulation.");
      }
    }
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




const handleConversationClick = async (chat_id: string) => {
  setPrimaryChatId(chat_id); // Met à jour le chat_id principal
  setActiveChatId(chat_id); // Définit la conversation active
  setRelatedQuestions([]);

  try {
    // *1️⃣ Met à jour l'état des Social Threads (Marque comme lu)*
    setSocialThreads((prevThreads) => {
      const updatedThreads = prevThreads.map((thread) => {
        if (thread.chat_id === chat_id && !thread.isRead) {
          return { ...thread, isRead: true };
        }
        return thread;
      });

      // Recalcul du nombre total d'éléments non lus
      const newUnreadCount = updatedThreads.filter((thread) => !thread.isRead).length;
      setUnreadCount(newUnreadCount);

      return updatedThreads;
    });

    // *2️⃣ Récupère l'historique des messages*
    const chatHistory = await getChatHistory(chat_id);
    setMessages(chatHistory);
    setShowChat(true);

    // *3️⃣ Récupère les détails de la conversation*
    const chatRef = doc(db, 'chatsessions', chat_id);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const chatData = chatSnap.data();

      // *4️⃣ Vérifie si la conversation est privée ou publique*
      const isConversationPrivate = chatData.thread_type === 'Private';
      setIsPrivate(isConversationPrivate);
      //console.log('Conversation is now ${isConversationPrivate ? 'Private' : 'Public'}'⁠);

      // *5️⃣ Détermine si c'est un Social Thread*
      const isChatInSocialThreads = socialThreads.some(thread => thread.chat_id === chat_id);
      const isChatInConversations = conversations.some(conv => conv.chat_id === chat_id);

      // Un vrai Social Thread est une conversation publique qui *n'est pas* dans les conversations personnelles
      const isThreadSocial = isChatInSocialThreads && !isChatInConversations;

      // Met à jour l'état de isSocialThread
      setIsSocialThread(isThreadSocial);

      // Affichage dans la console pour vérification
      if (isThreadSocial) {
        console.log('✅ Chat ${chat_id} est un vrai Social Thread');
      } else if (isChatInSocialThreads && isChatInConversations) {
        console.log('Chat ${chat_id} est une conversation publique personnelle');
      } else {
        console.log('🔒 Chat ${chat_id} est une conversation privée.');
      }

      // *6️⃣ Ajoute l'utilisateur à ⁠ ReadBy ⁠ s'il ne l'a pas encore lu*
      const userId = user.id;
      const readBy = chatData.ReadBy || [];

      if (!readBy.includes(userId)) {
        console.log('Ajout de l utilisateur ${userId} à ReadBy pour la conversation ${chat_id}');

        try {
          // Met à jour Firestore avec un ⁠ Set ⁠ pour éviter les doublons
          await updateDoc(chatRef, { ReadBy: Array.from(new Set([...readBy, userId])) });
          console.log('ReadBy mis à jour avec succès dans Firestore');
        } catch (updateError) {
          console.error('Erreur lors de la mise à jour de ReadBy dans Firestore :', updateError);
        }
      }
    } else {
      //console.warn(⁠ No chat session found with chat_id: ${chat_id}. Defaulting to Public. ⁠);
      setIsPrivate(false); // Par défaut, on considère que c'est public si la donnée est absente
    }
  } catch (error) {
    console.error('Error fetching chat history or thread_type:', error);
    setPopup({
      type: 'error',
      message: 'Failed to fetch chat history. Please try again later.',
    });
    setIsPrivate(false); // Défaut à Public en cas d'erreur
  }
};




  /*
  //Permet de mettre a jour la conversation active quand on clique sur une une conversation deja presente dans l historique
  const handleConversationClick = async (chat_id: string) => {
    //localStorage.setItem('chat_id', chat_id);
    setPrimaryChatId(chat_id); //Context API qui permet de mettre a jour le nouveau chat_id 
    setActiveChatId(chat_id);

    setRelatedQuestions([]);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: 'Failed to fetch chat history. Please try again later.',
      });
    }
  };
  */


  /*
  //Fonction qui gere quand on clique sur une conversation
  const handleConversationClick = async (chat_id: string) => {
    setPrimaryChatId(chat_id); // Met à jour le chat_id principal
    setActiveChatId(chat_id); // Définit la conversation active
    setRelatedQuestions([]);
  
    try {

      setSocialThreads((prevThreads) => {
        const updatedThreads = prevThreads.map((thread) => {
          if (thread.chat_id === chat_id && !thread.isRead) {
            return { ...thread, isRead: true };
          }
          return thread;
        });
      
        // Recalcul global du compteur d'éléments non lus
        const newUnreadCount = updatedThreads.filter((thread) => !thread.isRead).length;
        setUnreadCount(newUnreadCount);
      
        return updatedThreads;
      });
      


      // Récupère l'historique des messages
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);

  
      // Récupère les détails de la conversation pour vérifier si elle est Public ou Private
      const chatRef = doc(db, 'chatsessions', chat_id);
      const chatSnap = await getDoc(chatRef);
  
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        // Vérifie et met à jour l'état isPrivate
        if (chatData.thread_type) {
          const isConversationPrivate = chatData.thread_type === 'Private';
          setIsPrivate(isConversationPrivate);
          console.log(`Conversation is now ${isConversationPrivate ? 'Private' : 'Public'}`);
        } else {
          console.warn('No thread_type field found in chat session document. Defaulting to Public.');
          setIsPrivate(false); // Défaut à Public si thread_type est absent
        }


        // Ajoutez le code ici pour vérifier et mettre à jour `ReadBy`
        const userId = user.id; // Récupère l'ID de l'utilisateur actuel
        const readBy = chatData.ReadBy || []; // Liste des utilisateurs ayant lu la conversation


        
        if (!readBy.includes(userId)) {
          console.log(`Ajout de l'utilisateur ${userId} à ReadBy pour la conversation ${chat_id}`);


      
          try {
            // Met à jour Firestore pour inclure l'utilisateur dans ReadBy
            //await updateDoc(chatRef, { ReadBy: [...readBy, userId] });
            await updateDoc(chatRef, { ReadBy: Array.from(new Set([...readBy, userId])) });
          
            console.log('ReadBy mis à jour avec succès dans Firestore');
          } catch (updateError) {
            console.error('Erreur lors de la mise à jour de ReadBy dans Firestore :', updateError);
          }
        }


      } else {
        console.warn(`No chat session found with chat_id: ${chat_id}. Defaulting to Public.`);
        setIsPrivate(false); // Défaut à Public si le document est introuvable
      }


    } catch (error) {
      console.error('Error fetching chat history or thread_type:', error);
      setPopup({
        type: 'error',
        message: 'Failed to fetch chat history. Please try again later.',
      });
      setIsPrivate(false); // Défaut à Public en cas d'erreur
    }
  };
  */


  //permet d ouvir la sidebar (change l etat de ouvir/fermer)
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };


  /*
  //Recupere les informations d un feedback pouce vers le bas et les envoie au backend
  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    const uid = user.id || 'default_uid';
    const chatId = chatIds[0] || 'default_chat_id';

    await submitFeedbackWrongAnswer({
      userId: uid,
      chatId,
      aiMessageContent: selectedAiMessage || 'default_ai_message',
      humanMessageContent: selectedHumanMessage || 'default_human_message',
      feedback,
    });

    setSnackbarOpen(true);
    handleCloseWrongAnswerModal();
  };

  */

  const handleSubmitWrongAnswerFeedback = async (
    feedback: string,
    aiMessageContent: string | null,
    humanMessageContent: string | null,
    ratings: { relevance?: number; accuracy?: number; format?: number; sources?: number; overall_satisfaction?: number }
  ) => {
    const uid = user.id || 'default_uid';
    const chatId = chatIds[0] || 'default_chat_id';
  
    await submitFeedbackWrongAnswer({
      userId: uid,
      chatId,
      aiMessageContent: aiMessageContent || 'default_ai_message',
      humanMessageContent: humanMessageContent || 'default_human_message',
      feedback,
      ...ratings,
    });
  
    setSnackbarOpen(true);
    handleCloseWrongAnswerModal();
  };

  const handleWrongAnswerClick = (index: number) => {
    const currentMessage = messages[index];
    const previousMessage = index > 0 ? messages[index - 1] : null;
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
  };

  const handleFeedbackClick = async (index: number) => {
    const currentMessage = messages[index];
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const uid = user.id || 'default_uid';
    const chatId = chatIds[0] || 'default_chat_id';

    await submitFeedbackGoodAnswer({
      userId: uid,
      chatId,
      aiMessageContent: currentMessage.content || 'default_ai_message',
      humanMessageContent: previousMessage ? previousMessage.content : 'default_human_message',
      feedback: 'positive',
    });

    setSnackbarOpen(true);
  };

  const handleCloseWrongAnswerModal = () => {
    setModalOpen(false);
  };


  return (
    <ThemeProvider theme={theme}>
      {/* Éléments d'arrière-plan */}
      <div className="background-container"> 
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        <div className="frosted-glass"></div>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.5 }}
        style={{ display: 'contents' }} // Ne crée pas de conteneur visuel
      >
        <div
          className="main-content flex h-screen"
          style={{
            position: 'fixed', // Fixe le conteneur
            top: 0,
            left: 0,
            //width: '100vw', // Assure que le conteneur occupe toute la largeur
            //height: '100vh', // Assure que le conteneur occupe toute la hauteur
            right: isSmallScreen && drawerOpen ? '20vw' : '0', // Laisse 20% de l'écran à droite si Drawer ouvert
            width: isSmallScreen && drawerOpen ? '80vw' : '100%', // Ajuste la largeur
            overflow: 'hidden', // Désactive le scroll interne
          }}
        >
        <Drawer
          variant={isSmallScreen ? "temporary" : "persistent"}
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
              style: {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          {/* Header avec boutons de menu et nouvelle conversation */}
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

          {/* Contenu fixe avant la liste */}
          <List style={{ padding: '0 10px' }}>
            {/* Profil avec fermeture automatique sur petits écrans */}
            <ListItem
              button
              onClick={() => {
                navigate(`/dashboard/dashboard/student/${user?.id || 'defaultId'}`); // Naviguer vers la page Dashboard_Dashboard
                if (isSmallScreen) toggleDrawer();
              }}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'transparent',
                mb: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '35px' }}>
                <DashboardIcon sx={{ fontSize: '22px' }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>

            {/* Nouveau Bouton History/Social Thread */}
            <ListItem
              button
              onClick={handleToggleHistory}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'transparent',
                mb: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
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

          <Divider style={{ backgroundColor: 'lightgray',  }} />

          {/* Titre de l'état actuel */}
          <div className="text-center text-black-500 font-semibold mt-5 mb-4 text-sm flex justify-center items-center">
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
                  fontSize: '0.75rem',
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
          <Box style={{ flexGrow: 1, overflowY: 'auto', padding: '0 10px' }}>
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
                        margin: '5px 0',
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
                          marginRight: '8px',
                          marginLeft: '8px',
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
                          margin: '1px 0',
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
                          secondary={`${formatDate(thread.created_at)} | ${topic}`}
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
                          secondaryTypographyProps={{
                            style: {
                              fontSize: '0.75rem',
                              color: theme.palette.text.secondary,
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

          {/* Menu contextuel */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                margin: '8px',
                borderRadius: '16px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '4px',
              },
            }}
          >
            <MenuItem
              onClick={handleRename}
              sx={{
                padding: '8px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <EditIcon fontSize="small" sx={{ marginRight: '8px' }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: '400',
                }}
              >
                Rename
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={handleDelete}
              sx={{
                padding: '8px',
                color: 'red',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <DeleteIcon fontSize="small" sx={{ marginRight: '8px' }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: '400',
                }}
              >
                Delete
              </Typography>
            </MenuItem>
          </Menu>

          {/* Section Profil pour petits écrans avec fermeture automatique */}
          {isSmallScreen && (
            <Box style={{ padding: '16px', borderTop: `1px solid ${theme.palette.divider}` }}>
              {profilePicture ? (
                    <>
                      {console.log('Rendering profile picture with URL:', profilePicture)}
                      <img
                        src={profilePicture}
                        alt="Profile"
                        style={{
                          width: '55px', // Largeur personnalisée
                          height: '55px', // Hauteur personnalisée
                        }}
                        className="rounded-full object-cover cursor-pointer"
                        onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                      />
                    </>
                  ) : (
                    <>
                      {console.log('Rendering default AccountCircleIcon')} 
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
                    </>
                  )}
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
                        Log-out
                      </Typography>
                    }
                  />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Drawer>

          <div
            className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${
              drawerOpen ? 'ml-60 pl-5' : 'pl-4'}
              iframeSrc ? 'mr-[33vw]' : ''
            }`}
          >
            <div
              className="relative p-4 flex items-center justify-between "
              style={{ 
                //backgroundColor: 'transparent', 
                backgroundColor: isLandingPageVisible ? '#F0F4FC' : 'transparent',
                borderColor: theme.palette.divider }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!drawerOpen && (
                  <>
                    <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                      <MenuIcon />
                    </IconButton>
                    

                    {!isSmallScreen && !isLandingPageVisible && (
                      <IconButton
                      onClick={handleNewConversation}
                      sx={{
                        color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                        cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isLandingPageVisible}
                    >
                      <MapsUgcRoundedIcon />
                    </IconButton>
                    )}
                  </>
                )}
                
              </div>
              <img
                        src={theme.logo}
                        alt="University Logo"
                        style={{ height: '40px', marginRight: '10px' }}
              />



              {/* Vignette avec le nombre d'étudiants en ligne */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0px',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  border: '1.3px solid #27AE60', // Bordure verte
                  backgroundColor: 'transparent', // Fond transparent
                  color: '#011F5B', // Texte vert
                  //fontWeight: 'semi-bold',
                  fontSize: '0.83rem',
                }}
              >
                {onlineUsers} online users
                <div
                  style={{
                    width: '8.5px',
                    height: '8.5px',
                    borderRadius: '50%',
                    backgroundColor: '#27AE60', // Cercle vert
                    marginLeft: '6px',
                  }}
                />
              </div>
          

              <div style={{ flexGrow: 1 }}></div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isSmallScreen ? (
                  <>
                    <IconButton
                      onClick={handleNewConversation}
                      sx={{
                        color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                        cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isLandingPageVisible}
                    >
                      <MapsUgcRoundedIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    {profilePicture ? (
                    <>
                      {console.log('Rendering profile picture with URL:', profilePicture)}
                      <img
                        src={profilePicture}
                        alt="Profile"
                        style={{
                          width: '55px', // Largeur personnalisée
                          height: '55px', // Hauteur personnalisée
                        }}
                        className="rounded-full object-cover cursor-pointer"
                        onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                      />
                    </>
                  ) : (
                    <>
                      {console.log('Rendering default AccountCircleIcon')} 
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
                    </>
                  )}
                    <Menu
                      anchorEl={profileMenuAnchorEl}
                      open={Boolean(profileMenuAnchorEl)}
                      onClose={handleProfileMenuClose}
                      PaperProps={{
                        style: {
                          borderRadius: '12px',
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                    >

                      {/* Change the function to trigger here to show popup*/}
                      <MenuItem onClick={handleDialogOpen}> 
                        <ListItemIcon>
                          <ProfileEdit fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                              Edit Profile
                            </Typography>
                          }
                        />
                      </MenuItem>

                      {/* Nouvelle option Parameters */}
                      <MenuItem onClick={handleParametersMenuClick}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                              Parameters
                            </Typography>
                          }
                        />
                      </MenuItem>

                      {/* Option Log-out */}
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                              Log-out
                            </Typography>
                          }
                        />
                      </MenuItem>
                    </Menu>

                    {/* Menu pour Parameters */}
                    <Menu
                      anchorEl={parametersMenuAnchorEl}
                      open={Boolean(parametersMenuAnchorEl)}
                      onClose={handleParametersMenuClose}
                      PaperProps={{
                        style: {
                          borderRadius: '12px',
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right', // Origine à droite par rapport à l'élément déclencheur
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left', // Position du menu à gauche
                      }}
                      // Optionnel : Ajouter un décalage pour éviter le chevauchement
                      sx={{
                        mt: -1, // Marge supérieure
                        ml: -18, // Déplacer légèrement vers la gauche
                      }}
                    >
                      {/* Option Delete Account */}
                      <MenuItem onClick={handleDeleteAccount}>
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" sx={{ color: '#F04261' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                              Delete Account
                            </Typography>
                          }
                        />
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </div>
            </div>




            {/* Content Area */}
            {isLandingPageVisible ? (
              // Utilisez un fragment React pour envelopper Spline et LandingPage
              <>
                <LandingPage onSend={handleSendMessageFromLandingPage} onPrivacyChange={handlePrivacyChange} updateThreadTypeLocally={updateThreadTypeLocally}/>
              </>
            ) : (
              <div
                className="flex-grow overflow-y-auto"
                style={{ backgroundColor: 'transparent', paddingBottom: '100px' }}
              >
                <div
                  className="flex flex-col space-y-2 p-4"
                  ref={scrollableDivRef}
                  onScroll={() => {
                    const scrollDiv = scrollableDivRef.current;
                    if (scrollDiv) {
                      const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
                      const atBottom = scrollTop + clientHeight >= scrollHeight - 5; // Marge de 100px
                      setIsAtBottom(atBottom); // Met à jour l'état si l'utilisateur est en bas
                      if (atBottom) setNewMessagesCount(0); // Réinitialise les nouveaux messages si en bas
                    }
                  }}
                  style={{
                    overflowY: 'auto', // Assure que le contenu est défilable
                    maxHeight: '100%', // Limite la hauteur pour activer le défilement
                  }}
                >
                  {messages.map((message, index) =>
                    message.type === 'human' ? (
                      <div
                        key={message.id}
                        className={`flex justify-end ${messageMarginX} ${index === 0 ? 'mt-8' : ''}`}
                      >
                        <div className="max-w-3/4 w-full text-right">
                          <div className="flex items-center justify-end mb-1">
                          </div>
                          <div className="flex justify-end">
                            <div
                              style={{
                                backgroundColor: theme.palette.button.background,
                                padding: '8px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                textAlign: 'left',
                                maxWidth: '75%',
                                marginRight: '12px',
                                fontSize: '1.05rem',
                                color: theme.palette.text_human_message_historic,
                              }}
                            >
                              {message.fileType ? (
                                <embed
                                  src={message.content}
                                  type={
                                    message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'
                                  }
                                  width="100%"
                                  height="200px"
                                />
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={message.id} className={`flex justify-start ${messageMarginX}`}>
                        <div className="max-w-3/4 w-full flex items-center">
                        <AIMessage
                          messageId={message.id}
                          content={message.content}  // Utilisez displayedText si le content est vide
                          personaName={message.personaName}
                          citedDocuments={message.citedDocuments}
                          isComplete={isComplete}
                          hasDocs={!!message.citedDocuments?.length}
                          handleFeedback={(feedbackType) => handleFeedbackClick(index)}
                          handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          handleSourceClick={handleSourceClick}
                          images={message.images}
                          takData={message.TAK}
                          CourseData={message.COURSE}
                          waitingMessages={message.waitingMessages}
                          ReasoningSteps={message.id === lastAiMessageId ? message.ReasoningSteps : undefined} 
                          chartData={message.CHART}
                          drawerOpen={drawerOpen}
                          handleSendTAKMessage={handleSendTAKMessage}
                          handleSendCOURSEMessage={handleSendCOURSEMessage}
                          isLoading={isStreaming && message.id === lastAiMessageId} // Utilise lastAiMessageId
                          hasNewContent={hasNewContent}
                          redditData= {message.REDDIT}
                          instaData = {message.INSTA}
                          youtubeData= {message.YOUTUBE}
                          quoraData = {message.QUORA}
                          errorData = {message.ERROR}
                          confidenceScoreData = {message.CONFIDENCESCORE}
                          instaclubData = {message.INSTA_CLUB}
                          linkedinData = {message.LINKEDIN}
                          insta2Data = {message.INSTA2}

                          />
                        </div>
                      </div>
                    )
                  )}
                  <div ref={endDivRef}></div>
                </div>
              </div>
            )}



            
            {relatedQuestions.length > 0 && (
              <div className="mt-4 px-8 flex justify-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  {relatedQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={() => setInputValue(question)}
                      sx={{
                        borderColor: theme.palette.button_sign_in,
                        color: theme.palette.button_sign_in,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        padding: '4px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}


            {/* Bouton pour défiler vers le bas */}
            {!isAtBottom && !isLandingPageVisible && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: 'fixed',
                  bottom: isSmallScreen ? '105px' : '85px', // Ajustez cette valeur en fonction de la hauteur de votre champ de saisi
                  //left: '50%',
                  transform: 'translateX(-50%)',
                  left: drawerOpen ? `calc(${drawerWidth}px + 41.5%)` : '50%',
                  //transition: 'left 0.3s', // Ajoutez une transition douce pour un effet fluide
                  background: 'rgba(255, 255, 255, 0.2)', // Fond semi-transparent
                  border: '1px solid rgba(255, 255, 255, 0.3)', // Bordure subtile
                  borderRadius: '50%',
                  width: '30px', // Augmenté pour une meilleure visibilité
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Ombre légère
                  backdropFilter: 'blur(10px)', // Effet de flou
                  WebkitBackdropFilter: 'blur(10px)', // Support pour Safari
                  zIndex: 1000, // Assurez-vous que le bouton apparaît au-dessus des autres éléments
                  transition: 'left 0.3s ease-in-out, background 0.3s ease-in-out, box-shadow 0.3s ease-in-out', // Transition fluide
                }}
                aria-label="Scroll to bottom" // Accessibilité
              >
                <FaArrowDown size={12} color="#011F5B" /> {/* Icône avec la couleur spécifiée */}
              </button>
            )}

            {/* Champ de saisie en bas */}
            {/* Input Field */}
            {(!hasTak || inputValue.trim() !== "") && ( 
            <div
            className="footer"
            style={{
              position: 'fixed',
              backgroundColor: '#F0F4FC', // Couleur blanche avec une légère transparence
              bottom: 0, // Le footer s'étend jusqu'en bas de la page
              left: drawerOpen ? `${drawerWidth}px` : '0',
              width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
              //backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              //display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: isSmallScreen ? '10px' : '20px', // Moins de marge au-dessus sur petits écrans
              paddingBottom: isSmallScreen ? '10px' : '20px', // Moins de marge en dessous sur petits écrans
              zIndex: 2,
              transition: 'left 0.3s, width 0.3s',
              display: isLandingPageVisible ? 'none' : 'flex',
            }}
          >
              <div style={{
                  maxWidth: isSmallScreen ? '90%' : '800px', // Réduit à 90% pour petits écrans, max 800px pour grands écrans
                  width: '100%',
                  margin: '0 auto', // Centre horizontalement le champ
                  padding: isSmallScreen ? '10px 0px 30px' : '0', // Ajoute une marge interne sur petits écrans
                  position: 'relative',
                }}>
                  <TextField
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={1} // Adjust `minRows` to change the minimum height of the TextField
                  maxRows={6}
                  //placeholder={isSmallScreen && drawerOpen ? "" : (isStreaming ? "Type your message..." : "Type your message...")}

                  placeholder={isSmallScreen && drawerOpen
                    ? ""
                    : isSocialThread
                      ? "Write a public message in this discussion..."
                      : "Type your message..."
                  }

                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleInputKeyPressSocraticLangGraph}
                  InputProps={{
                    startAdornment: (
                      !isSocialThread && (
                        <InputAdornment position="start">
                          <IconButton
                            onClick={async () => {
                              try {
                                const newPrivacyState = !isPrivate; 
                                setIsPrivate(newPrivacyState); 
                      
                                const currentThreadType = newPrivacyState ? 'Private' : 'Public';
                                const chatSessionId = chatIds[0] || 'default_chat_id';
                      
                                // On récupère la référence du document dans chatsessions
                                const docRef = doc(db, 'chatsessions', chatSessionId);
                      
                                // Mise à jour du champ thread_type
                                await updateDoc(docRef, { thread_type: currentThreadType });
                      
                                console.log(`Le thread_type a été mis à jour en ${currentThreadType} pour le chat_id ${chatSessionId}`);
                                // Mettre à jour localement le thread_type de la conversation active
                                setConversations((prevConversations) =>
                                  prevConversations.map((conv) =>
                                    conv.chat_id === chatSessionId
                                      ? { ...conv, thread_type: currentThreadType }
                                      : conv
                                  )
                                );
                              } catch (error) {
                                console.error('Erreur lors de la mise à jour du thread_type :', error);
                              }
                            }}
                            edge="start"
                            aria-label={isPrivate ? "Set to Public" : "Set to Private"}
                            sx={{
                              backgroundColor: isPrivate ? '#E0E0E0' : '#D6DDF5',
                              color: isPrivate ? '#6F6F6F' : '#3155CC',
                              borderRadius: '12px',
                              padding: '4px 8px',
                              marginRight: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              width: '80px',
                              height: '30px',
                              '&:hover': {
                                backgroundColor: isPrivate ? '#D5D5D5' : '#C4A4D8',
                                color: isPrivate ? '#5A5A5A' : '#4A0B8A',
                              },
                            }}
                            ref={(el) => {
                              if (el) {
                                console.log("Background color applied:", getComputedStyle(el).backgroundColor);
                              }
                            }}
                          >
                            {isPrivate ? (
                              <>
                                <LockIcon fontSize="small" sx={{ marginRight: '4px' }} />
                                <Typography variant="caption" sx={{ color: '#000' }}>
                                  Private
                                </Typography>
                              </>
                            ) : (
                              <>
                                <LockOpenIcon fontSize="small" sx={{ marginRight: '4px' }} />
                                <Typography variant="caption" sx={{ color: '#3155CC' }}>
                                  Public
                                </Typography>
                              </>
                            )}
                          </IconButton>
                      
                      </InputAdornment>
                      )
                    ),
                    
                      endAdornment: (
                      <InputAdornment position="end">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              if (isStreaming) {
                                // Stop the AI response
                                setCancelConversation(true);
                                setIsStreaming(false);
                                cancelConversationRef.current = true;
                              } else {
                                // Send the message
                                handleSendMessageSocraticLangGraph(inputValue);
                              }
                            }}
                            aria-label={isStreaming ? "Stop response" : "Send message"}
                            edge="end"
                          >
                            {isStreaming ? (
                            <div
                              style={{
                                backgroundColor: theme.palette.error.main, // Couleur de fond pour StopIcon
                                borderRadius: '50%', // Cercle parfait
                                width: '30px', // Dimensions du bouton
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <StopIcon
                                style={{
                                  color: '#fff', // Couleur blanche pour l'icône
                                  fontSize: '20px', // Taille de l'icône
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                backgroundColor: theme.palette.button_sign_in, // Couleur de fond pour ArrowForwardIcon
                                borderRadius: '50%', // Cercle parfait
                                width: '30px', // Dimensions du bouton
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <ArrowForwardIcon
                                style={{
                                  color: '#fff', // Couleur blanche pour l'icône
                                  fontSize: '20px', // Taille de l'icône
                                }}
                              />
                            </div>
                          )}
                          </IconButton>
                      </InputAdornment>
                      ),
                      style: {
                      backgroundColor: '#F4F4F4',
                      fontSize: '1rem',
                      padding: '17px 8px', // Adjust `padding` to change the height of the TextField
                      borderRadius: '20px',
                      fontWeight: '500',
                      color: theme.palette.text.primary, // Directly use the text color from the theme
                      paddingRight: '20px', // Ensure space for the icon
                      paddingLeft: '20px', // Ensure space for the icon
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Constant shadow around the field
                      border: 'none', // Remove the border
                      //paddingBottom: isSmallScreen ? '30px' : '', // Ajoute un espace en bas
                      //paddingBottom: isSmallScreen ? '30px' : '17px', // Ajouter une marge plus importante sur petits écrans
                      },
                  }}
                  inputProps={{
                      style: { color: theme.palette.text.primary },
                  }}
                  sx={{
                      '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                          border: 'none',
                      },
                      '&:hover fieldset': {
                        boxShadow: messages.some((msg) => msg.TAK && msg.TAK.length > 0)
                        ? "none" // Supprime l'ombre au hover si TAK est présent
                        : "0 4px 8px rgba(0, 0, 0, 0.2)", // Ombre normale sinon
                      },
                      },
                      '& .MuiInputBase-input::placeholder': {
                      color: '#6F6F6F', // Darker color for the placeholder
                      opacity: 1,
                      
                      },
                  }}
                  />
              </div>
              </div>
            )}
          </div>
            
        </div>

        <PopupWrongAnswer
          open={modalOpen}
          onClose={handleCloseWrongAnswerModal}
          onSubmit={handleSubmitWrongAnswerFeedback}
          aiMessageContent={selectedAiMessage}
          humanMessageContent={selectedHumanMessage}
        />

        

        {/* Render the StudentProfileDialog component */}
        <StudentProfileDialog open={dialogOpen} onClose={handleDialogClose} setProfilePicture={setProfilePicture} />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}
          >
            Feedback submitted successfully. Thank you!
          </Alert>
        </Snackbar>
      </motion.div>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;