// src/components/Dashboard_eleve_template.tsx

import React, { useState, useEffect, KeyboardEvent, useRef, useMemo } from 'react';
import StopIcon from '@mui/icons-material/Stop';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Divider, IconButton, Snackbar, InputAdornment, Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import ProfileEdit from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import logo_greg from '../student_face.png';
import '../index.css';
import { AIMessage } from '../components/MessagesWEB';
import { Message, Course, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR} from '../interfaces/interfaces_eleve';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory, sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import LandingPage from '../components/LandingPage'; // Import du composant LandingPage
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


const drawerWidth = 240;

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
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
  const [parametersMenuAnchorEl, setParametersMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [userScrollingManually, setUserScrollingManually] = useState(false);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);


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

  const scrollToBottomNewMessage = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
    }
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


  //fonction qui permet d afficher les anciennes conversations dans la sidebar (a modifier pour enlever la logique de course_id)
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
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter(
          (conversation): conversation is { chat_id: string; name: string } => conversation !== null
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

  if (isStreaming) {
      setCancelConversation(true);
      cancelConversationRef.current = true;
      console.log("Annulation de la conversation en cours.");
      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log("Après le timeout:", cancelConversationRef.current);
  }

  // Capture du contenu du premier message
  const firstMessageContent = messages.length > 0 ? messages[0].content : 'Conversation history';
  console.log("Contenu du premier message capturé:", firstMessageContent);

  // Création immédiate d'une nouvelle conversation à l'écran
  const newChatId = uuidv4();
  const oldChatId = chatIds[0];

  // Mettre à jour l'état pour refléter immédiatement la nouvelle conversation
  setIsStreaming(false);
  setMessages([]); // Réinitialiser les messages
  setRelatedQuestions([]);
  setIsLandingPageVisible(true);
  setPrimaryChatId(newChatId);
  setActiveChatId(newChatId);

  // Ajout immédiat de la nouvelle conversation à la liste affichée
  setConversations((prevConversations) => [
      { chat_id: newChatId, name: 'New Chat' },
      ...prevConversations,
  ]);

  // Affiche une roue qui tourne pour l'ancienne conversation
  setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
          conversation.chat_id === oldChatId
              ? { ...conversation, name: 'Updating...' }
              : conversation
      )
  );

  // Tâches en arrière-plan
  if (user.id) {
      const userRef = doc(db, 'users', user.id);

      try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
              const userData = userSnap.data();
              const chatsessions = userData.chatsessions || [];

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

              // Ajouter le nouvel ID de chat aux sessions
              chatsessions.push(newChatId);
              await updateDoc(userRef, { chatsessions });

              // Créer la nouvelle session de chat
              await setDoc(doc(db, 'chatsessions', newChatId), {
                  chat_id: newChatId,
                  name: 'New Chat',
                  created_at: serverTimestamp(),
                  modified_at: serverTimestamp(),
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


  //permet d ouvir la sidebar (change l etat de ouvir/fermer)
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };


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
      variant={isSmallScreen ? "temporary" : "persistent"} // Variant conditionnel basé sur la taille de l'écran
      anchor="left"
      open={drawerOpen}
      onClose={isSmallScreen ? toggleDrawer : undefined} // Ajout de onClose uniquement pour les petits écrans
      PaperProps={{
        style: {
          width: isSmallScreen ? '80vw' : drawerWidth, // 80% de la largeur de l'écran sur petits écrans
          borderRadius: '0 0 0 0',
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // Effet de verre dépoli
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)', // Optionnel : bordure pour séparer visuellement
        },
      }}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // Ajustez l'opacité pour un effet plus clair
          },
        },
      }}
    >
      {/* Header avec boutons de menu et nouvelle conversation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        {/* Bouton de fermeture/ouverture de la sidebar */}
        <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
          <MenuIcon />
        </IconButton>
        
        {/* Bouton de nouvelle conversation avec fermeture automatique sur petits écrans */}
        <IconButton
          onClick={() => {
            handleNewConversation();
            if (isSmallScreen) toggleDrawer(); // Fermer la sidebar sur petits écrans
          }}
          sx={{ color: theme.palette.sidebar }}
        >
          <MapsUgcRoundedIcon />
        </IconButton>
      </Box>
      
      {/* Contenu de la sidebar */}
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <List style={{ padding: '0 10px' }}>
          {/* Profil avec fermeture automatique sur petits écrans */}
          <ListItem
            button
            onClick={() => {
              handleDialogOpen();
              if (isSmallScreen) toggleDrawer(); // Fermer la sidebar sur petits écrans
            }}
            sx={{
              borderRadius: '8px',
              backgroundColor: 'transparent', // Rendre transparent pour l'effet de verre dépoli
              mb: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              // Appliquer les styles de survol uniquement si le dispositif supporte le hover
              '@media (hover: hover) and (pointer: fine)': {
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <ProfileEdit />
            </ListItemIcon>
            <ListItemText
              primary="Your Profile"
              primaryTypographyProps={{
                style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
              }}
            />
          </ListItem>

          <Divider style={{ backgroundColor: 'lightgray', margin: '10px 0' }} />

          {/* Liste des conversations */}
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ListItem
                key={conversation.chat_id}
                button
                onClick={() => {
                  handleConversationClick(conversation.chat_id);
                  if (isSmallScreen) toggleDrawer(); // Fermer la sidebar sur petits écrans
                }}
                sx={{
                  position: 'relative',
                  borderRadius: '8px',
                  margin: '5px 0',
                  paddingRight: '40px',
                  backgroundColor:
                    activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                  // Styles par défaut pour les dispositifs tactiles
                  '& .MuiIconButton-root': {
                    opacity: activeChatId === conversation.chat_id ? 1 : 0,
                    pointerEvents: activeChatId === conversation.chat_id ? 'auto' : 'none',
                  },
                  '& .MuiTypography-root': {
                    color:
                      activeChatId === conversation.chat_id
                        ? theme.palette.text_human_message_historic
                        : theme.palette.text.primary,
                  },
                  // Appliquer les styles de survol uniquement si le dispositif supporte le hover
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
                {/* Icône des trois points - visible uniquement au survol ou si actif */}
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
          {/* Menu items */}
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
      </div>

      {/* Section Profil pour petits écrans avec fermeture automatique */}
      {isSmallScreen && (
        <Box style={{ padding: '16px', borderTop: `1px solid ${theme.palette.divider}` }}>
          <AccountCircleIcon
            fontSize="large"
            component="svg"
            style={{
              color: '#9e9e9e', // Couleur grise neutre
              cursor: 'pointer',
              margin: '0 auto',
            }}
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
                      <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
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

              <div style={{ flexGrow: 1 }}></div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isSmallScreen ? (
                  <>
                    <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                      <MapsUgcRoundedIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <AccountCircleIcon
                      fontSize="inherit" // Permet un contrôle précis de la taille via CSS
                      component="svg"
                      style={{
                        color: '#9e9e9e', // Couleur grise neutre
                        cursor: 'pointer',
                        margin: '0 auto 0 16px', // Ajoute une marge à droite (16px)
                        fontSize: '2.5rem', // Augmente la taille de l'icône
                      }}
                      onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                    />
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
                      {/* Nouvelle option Parameters */}
                      <MenuItem onClick={handleParametersMenuClick}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" sx={{ color: '#4A90E2' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#4A90E2' }}>
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
                <LandingPage onSend={handleSendMessageFromLandingPage} />
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
            {!isAtBottom && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: 'fixed',
                  bottom: '85px', // Ajustez cette valeur en fonction de la hauteur de votre champ de saisie
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
                  padding: isSmallScreen ? '0 10px' : '0', // Ajoute une marge interne sur petits écrans
                  position: 'relative',
                }}>
                  <TextField
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={1} // Adjust `minRows` to change the minimum height of the TextField
                  maxRows={6}
                  placeholder={isSmallScreen && drawerOpen ? "" : (isStreaming ? "Type your message..." : "Type your message...")}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleInputKeyPressSocraticLangGraph}
                  InputProps={{
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
          selectedFilter={selectedFilter}
          onSubmit={handleSubmitWrongAnswerFeedback}
          aiMessageContent={selectedAiMessage}
          humanMessageContent={selectedHumanMessage}
        />

        

        {/* Render the StudentProfileDialog component */}
        <StudentProfileDialog open={dialogOpen} onClose={handleDialogClose} />

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