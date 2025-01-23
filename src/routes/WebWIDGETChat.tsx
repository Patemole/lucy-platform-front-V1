import React, { useState, useEffect, KeyboardEvent, useRef, useMemo} from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import '../index.css';
//import { AIMessage } from '../components/Messages';
import { AIMessage } from '../components/MessageWEBWIDGET';
import { Message, Course, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerERROR } from '../interfaces/interfaces_eleve';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory, sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import debounce from 'lodash/debounce';

const drawerWidth = 240;

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [hasNewContent, setHasNewContent] = useState(false); // Nouvel état pour détecter du contenu
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const messageMarginX = isSmallScreen ? 'mx-0' : 'mx-25';
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const generateUniqueId = (): number => Date.now() + Math.floor(Math.random() * 1000);

  
  const lastAiMessageId = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.type === 'ai');
    return lastAiMessage ? lastAiMessage.id : null;
  }, [messages]);


  // Utilitaire pour lire les cookies
const getCookie = (cookieName: string) => {
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
          return cookie.substring(name.length);
      }
  }
  return null;
};

const deleteCookie = (cookieName: string) => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Lecture du cookie dans le useEffect
useEffect(() => {
  console.log('useEffect exécuté une seule fois');
  
  // Ajout d'un drapeau local pour éviter les appels multiples
  let hasExecuted = false;

  const tempMessage = getCookie('tempMessage');
  if (tempMessage && !hasExecuted) {
    console.log('Message récupéré depuis le cookie:', tempMessage);

    // Supprime immédiatement le cookie pour éviter d'autres appels
    deleteCookie('tempMessage');
    console.log('Cookie supprimé.');

    const sendTempMessage = async () => {
      try {
        // Crée une nouvelle conversation
        await handleNewConversation();

        console.log("Message récupéré pour SocraticLangGraph:", tempMessage);
        await handleSendMessageSocraticLangGraph(tempMessage); // Envoie le message

        console.log('Message envoyé avec succès.');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    };

    sendTempMessage();
    hasExecuted = true; // Marque comme exécuté
  } else {
    console.log('Aucun message à récupérer ou déjà traité.');
  }
}, []); // Les dépendances sont vides pour s'assurer que l'effet ne s'exécute qu'une fois.


  const fetchCourseOptionsAndChatSessions = async () => {
    if (uid) {
      const userRef = doc(db, 'users', uid);
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

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);


  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return;

    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };


  const handleSendCOURSEMessage = (COURSE_message: string) => {
    if (COURSE_message.trim() === '') return;

    const newMessage: Message = { id: Date.now(), type: 'human', content: COURSE_message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], COURSE_message);
  };

  const handleSendMessageSocraticLangGraph = (message: string) => {
    if (message.trim() === '') return;
  
    console.log('handleSendMessageSocraticLangGraph called');
    console.log('Input message:', message);
  
    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);
  
    const newMessage: Message = { id: generateUniqueId(), type: 'human', content: message };
    const loadingMessage: Message = { id: generateUniqueId(), type: 'ai', content: '', personaName: 'Lucy' };
  
    console.log('New human message:', newMessage);
    console.log('Loading AI message:', loadingMessage);
  
    // Ajout des messages
    setMessages((prevMessages) => {
      console.log('Previous messages:', prevMessages);
      const updatedMessages = [...prevMessages, newMessage, loadingMessage];
      console.log('Updated messages:', updatedMessages);
      return updatedMessages;
    });
  
    // Appel à onSubmit
    console.log('Calling onSubmit with messageHistory:', [...messages, newMessage, loadingMessage]);
    onSubmit([...messages, newMessage, loadingMessage], message);
  
    setInputValue('');
  };

  // Fonction pour envoyer le message à l'AI ou à l'API
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {

    console.log('onSubmit called');
    console.log('Message history passed to onSubmit:', messageHistory);
    console.log('Input value:', inputValue);

    setIsStreaming(true);
    setHasNewContent(false); // Réinitialise au début de chaque message
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
    let answerYOUTUBE: AnswerYOUTUBE[] = [];
    let answerQUORA: AnswerQUORA[] = [];
    let answerINSTA_CLUB: AnswerINSTA_CLUB[] = [];
    let answerLINKEDIN: AnswerLINKEDIN[] = [];
    let answerERROR: AnswerERROR[] = [];
    let error: string | null = null;

    try {
      console.log('Extracting user and session information');
      //const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      //const chatSessionId = 'chat_id'|| 'default_chat_id';
      const chatSessionId = localStorage.getItem('chat_id_widget')  || 'default_chat_id_widget';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'upenn'; // Changer pour mettre Upenn ou autre en fonction de ou on met le widget
      const major = localStorage.getItem('major') || 'default_major';
      const minor = localStorage.getItem('minor') || 'default_minor';
      const year = localStorage.getItem('year') || 'default_year';
      const faculty = localStorage.getItem('faculty') || 'default_faculty';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log('Session data:', {
        chatSessionId,
        courseId,
        username,
        uid,
        university,
        major,
        minor,
        year,
        faculty,
        student_profile,
      });
  

      const lastMessageIndex = messageHistory.length - 1;

      console.log('Last message index:', lastMessageIndex);

      

      for await (const packetBunch of sendMessageSocraticLangGraph({
      //for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
        major: [major],
        minor: [minor],
        year: year,
        faculty: [faculty],
        isFirstMessage: false

      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              setHasNewContent(true); // Détecte un nouveau contenu
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
            console.log('This is a test')

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
        const flattenedINSTA_CLUB = answerINSTA_CLUB.flat();
        const flattenedLINKEDIN = answerLINKEDIN.flat();
        const flattenedYOUTUBE = answerYOUTUBE.flat();
        const flattenedQUORA = answerQUORA.flat();
        const flattenedCHART = answerCHART.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();
        const flattenedERROR = answerERROR.flat();

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedReasoning array before setting messages:", flattenedReasoning);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedREDDIT array before setting messages:", flattenedREDDIT);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedINSTA array before setting messages:", flattenedINSTA);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedYOUTUBE array before setting messages:", flattenedYOUTUBE);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedQUORA array before setting messages:", flattenedQUORA);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedINSTA_CLUB array before setting messages:", flattenedINSTA_CLUB);

        // Check if `flattenedReasoning` contains data before updating messages
        console.log("Final flattenedLINKEDIN array before setting messages:", flattenedLINKEDIN);

        // Détection de TAK
        if (flattenedTAK.length > 0) {
          const randomMessages = ['Give me some clarification 🤓'];
          answer = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        }

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
            INSTA_CLUB: flattenedINSTA_CLUB,
            LINKEDIN: flattenedLINKEDIN,
            ERROR: flattenedERROR,
          };

          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList);
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: 'Lucy',
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);
    } catch (e: any) {
      const errorMsg = e.message;
      console.error('Error during message processing:', errorMsg);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. Try to send the message again or open a new chat.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph(inputValue); // Passe le message comme paramètre
      event.preventDefault();
    }
  };


  const handleNewConversation = async () => {
    try {
      // Génère un identifiant unique pour la nouvelle conversation
      const newChatId = uuidv4();
      console.log("New chatId genere")
      console.log(newChatId)
      // Réinitialise les états liés aux messages et questions associées
      setMessages([]); // Vide la liste des messages actuels
      setRelatedQuestions([]); // Vide la liste des questions associées
  
      // Met à jour le localStorage avec le nouvel identifiant de conversation
      localStorage.setItem('chat_id_widget', newChatId);
      setActiveChatId(newChatId); // Met à jour l'état local pour la conversation active
  
      // Optionnel : Confirme la création réussie dans la console
      console.log('Nouvelle conversation créée avec succès. Chat ID:', newChatId);
    } catch (error: any) {
      console.error('Erreur dans handleNewConversation:', error);
      setPopup({
        type: 'error',
        message: 'Échec de la création de la nouvelle conversation. Veuillez réessayer.',
      });
    }
  };
  

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  /*
  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);
  */

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollDiv = scrollableDivRef.current;
      if (scrollDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 100; // Ajusté
        setIsAtBottom(atBottom);
        if (atBottom) setNewMessagesCount(0);
      }
    }, 1000); // Délai de 100ms
  
    const scrollDiv = scrollableDivRef.current;
    scrollDiv?.addEventListener('scroll', handleScroll);
  
    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setNewMessagesCount((prevCount) => prevCount + 1);
    }
  }, [messages]);


  useEffect(() => {
    scrollToBottomNewMessage();
  }, [messages]); // Chaque changement dans messages déclenche le défilement


  const scrollToBottom = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessagesCount(0); // Reset new messages count
    }
  };

  const scrollToBottomNewMessage = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find((course) => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find((course) => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const chatId = localStorage.getItem('chat_id') || 'default_chat_id';

    await submitFeedbackWrongAnswer({
      userId: user.id,
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const chatId = localStorage.getItem('chat_id') || 'default_chat_id';

    await submitFeedbackGoodAnswer({
      userId: user.id,
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


  // État pour contrôler l'affichage de la LandingPage
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(messages.length === 0);


  useEffect(() => {
    if (messages.length > 0) {
      setIsLandingPageVisible(false);
    } else {
      setIsLandingPageVisible(true);
    }
  }, [messages]);



  return (
    <ThemeProvider theme={theme}>
      <div
        className="flex h-screen"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // Couleur de fond avec transparence
            backdropFilter: 'blur(20px)', // Ajoute un effet de flou de 20px
            WebkitBackdropFilter: 'blur(20px)', // Pour les navigateurs Webkit comme Safari
        }}
      >

        {/* Main Content Area */}
        <div
          className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${
            iframeSrc ? 'mr-[33vw]' : ''
          }`}
        >

          {/* Content Area */}
          {isLandingPageVisible ? (
            <>
              {/*<LandingPage onSend={handleSendMessageFromLandingPage} />*/}
            </>
          ) : (
            <div
              className="flex-grow overflow-y-auto"
              style={{ backgroundColor: 'transparent', paddingBottom: '60px' }} // Réduction du paddingBottom
            >
              <div className="flex flex-col space-y-2 p-4" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div
                      key={message.id}
                      className={`flex justify-end ${messageMarginX} ${index === 0 ? 'mt-8' : ''}`}
                    >
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          {/* Contenu Commenté */}
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
                              marginRight: '30px',
                              fontSize: '1.05rem', // Taille de la police maintenue
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
                          content={message.content}
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
                          isLoading={isStreaming && message.id === lastAiMessageId}
                          hasNewContent={hasNewContent}
                          redditData={message.REDDIT}
                          instaData={message.INSTA}
                          youtubeData={message.YOUTUBE}
                          quoraData={message.QUORA}
                          instaclubData={message.INSTA_CLUB}
                          linkedinData={message.LINKEDIN}
                          errorData = {message.ERROR}
                        />
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          {/* Related Questions */}
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

          {/* Input Field at the Bottom */}
          <div
            className="flex justify-center p-2" // Réduction du padding de 4 à 2
            style={{
                backgroundColor: 'rgba(240, 240, 240, 0.95)', // Couleur blanche avec une légère transparence
                position: 'fixed',
                bottom: 0,
                width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%', // Utilise la même valeur que drawerWidth
                transition: 'width 0.3s',
                display: isLandingPageVisible ? 'none' : 'flex',
                boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)', // Réduction de l'ombre pour un effet moins prononcé
                borderTopLeftRadius: '10px', // Border radius pour les coins
                borderTopRightRadius: '10px',
            }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
                <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={1} // Maintien d'une hauteur minimale
                maxRows={4} // Réduction du maxRows de 6 à 4 pour limiter la hauteur
                placeholder="Message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        color="primary"
                        onClick={() => handleSendMessageSocraticLangGraph(inputValue)}
                        aria-label="send message"
                        edge="end"
                        >
                        <ArrowForwardIcon style={{ color: theme.palette.button_sign_in }} />
                        </IconButton>
                    </InputAdornment>
                    ),
                    style: {
                    backgroundColor: '#F4F4F4',
                    fontSize: '1rem',
                    padding: '10px 8px', // Réduction du padding de 17px à 10px
                    borderRadius: '20px',
                    fontWeight: '500',
                    color: theme.palette.text.primary, // Directement utiliser la couleur du texte du thème
                    paddingRight: '20px', // Assurer l'espace pour l'icône
                    paddingLeft: '20px', // Assurer l'espace pour l'icône
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Réduction de l'ombre
                    border: 'none', // Supprimer la bordure
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
                        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                    },
                    },
                    '& .MuiInputBase-input::placeholder': {
                    color: '#6F6F6F', // Couleur plus foncée pour le placeholder
                    opacity: 1,
                    },
                }}
                />
            </div>
          </div>
        </div>

        {/* Right-Side Iframe for Sources */}
        {iframeSrc && (
          <div
            className="fixed bottom-0 right-0 h-[45%] w-[30%] shadow-lg border-t"
            style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
          >
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>
                Sources
              </Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe src={iframeSrc} title="Document Viewer" className="w-full h-full" frameBorder="0" />
          </div>
        )}

        {/* Modals and Snackbars */}
        <PopupWrongAnswer
          open={modalOpen}
          onClose={handleCloseWrongAnswerModal}
          selectedFilter={selectedFilter}
          onSubmit={handleSubmitWrongAnswerFeedback}
          aiMessageContent={selectedAiMessage}
          humanMessageContent={selectedHumanMessage}
        />

        <PopupFeedback
          open={feedbackModalOpen}
          onClose={handleFeedbackModalClose}
          selectedFilter={selectedFilter}
          onSubmit={handleSubmitFeedback}
        />

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
      </div>
    </ThemeProvider>
);
}

export default Dashboard_eleve_template;