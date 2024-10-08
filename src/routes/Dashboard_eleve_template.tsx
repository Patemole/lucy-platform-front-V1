//CODE QUI FONCTIONNE POUR TOUT
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course, AnswerTAK, AnswerCourse, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory, sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG', 'moRgToBTOAJZdMQPs7Ci'];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const messageMarginX = isSmallScreen ? 'mx-2' : 'mx-20';

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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

        // Your custom order
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

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };


    /* FONCTION MARCHE
  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };
  */

  //Nouvelle fonction qui permet de navigate vers une autre page si le course selection est choisi
  /*
  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (selectedCourse.id === 'moRgToBTOAJZdMQPs7Ci') {
        navigate(`/dashboard/student/course_selection/${uid}`);
      } else if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };
  */
  
  //Nouvelle fonction qui permet de navigate vers courseselection si courseselection est choisi
  //Enregistre l'ancien chat_id, créer un nouveau chat_id pour utiliser une nouvelle conversation de chat dans course_selection
  const handleMenuClose = async (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {

      //BOUT DE CODE À CHANGER POUR AFFICHER UNE POPUP DE COMING SOON POUR COURSE SELECTION
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };


      //BOUT DE CODE RESTANT PERMETTANT D'ALLER SUR COURSE SELECTION POUR L'INSTANT METTRE EN COMMENTAIRE SI EN PROD ON NE VEUT PAS SWITCHER
      /*
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
  
      if (selectedCourse.id === 'moRgToBTOAJZdMQPs7Ci') {
        // Handle Course Selection behavior
        const oldChatId = localStorage.getItem('chat_id');
  
        const lastCourseSelectionChatId = localStorage.getItem('LastCourseSelectionChat_id');
        let newChatId = '';
  
        if (lastCourseSelectionChatId) {
          // Use LastCourseSelectionChat_id if it exists
          newChatId = lastCourseSelectionChatId;
          localStorage.setItem('chat_id', newChatId);
          setActiveChatId(newChatId);
          setMessages([]); // Clear messages for new conversation
        } else {
          // Otherwise, create a new chat_id
          newChatId = uuidv4();
          localStorage.setItem('chat_id', newChatId);
          setActiveChatId(newChatId);
          setMessages([]); // Clear messages for new conversation
  
          // Create a new chat session in the backend
          if (uid) {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
  
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const chatsessions = userData.chatsessions || [];
  
              chatsessions.push(newChatId);
              await updateDoc(userRef, { chatsessions });
  
              await setDoc(doc(db, 'chatsessions', newChatId), {
                chat_id: newChatId,
                name: 'New chat',
                created_at: serverTimestamp(),
                modified_at: serverTimestamp(),
              });
  
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
                const validConversations = fetchedConversations.filter(
                  (conversation): conversation is { chat_id: string; name: string } => conversation !== null
                );
                setConversations(validConversations.reverse());
              }
            }
          }
        }
  
        // Save the previous chat_id before switching
        if (oldChatId) {
          localStorage.setItem('lastAcademicAdvisorChat_id', oldChatId);
        }
  
        // Navigate to course selection page
        navigate(`/dashboard/student/course_selection/${uid}`);
      } else if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        // For other course types (e.g., Career Advisor), show the feedback modal
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      } else {
        // Ensure that if the modal closes, we default back to Academic Advisor
        setSelectedFilter('Academic Advisor');
        localStorage.setItem('course_id', '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2'); // Academic Advisor course_id
      }
    }
  
    setAnchorEl(null);
  };
  */


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

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerCourse: AnswerCourse[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      //for await (const packetBunch of sendMessageFakeDemo({
      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
              answerCourse.push((packet as any).answer_COURSE_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);
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

        console.log('Raw answerTAK data before flattening:', answerTAK);

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();

        // Detection de TAK
        if (flattenedTAK.length > 0) {
          const randomMessages = [
              "Give me some clarification 🤓",
          ];
      
          // Choisir une chaîne de manière aléatoire
          answer = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      }


        console.log('Raw answerTAK data after flattening:', flattenedTAK);

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
            type: 'ai',
            content: answer,
            //content: 'This is a test',
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK,
            COURSE: flattenedCourse,
            waitingMessages: flattenedwaitingdata,
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
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, 'chatsessions', oldChatId), { name: 'Conversation history' });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, 'chatsessions', newChatId), {
          chat_id: newChatId,
          name: 'New chat',
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } => conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error('UID is undefined. Cannot create new conversation.');
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
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

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{
            style: {
              width: drawerWidth,
              borderRadius: '0 0 0 0',
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            <List style={{ padding: '0 15px' }}>
              <ListItem
                button
                onClick={() => navigate(`/dashboard/student/${uid}`)}
                sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Home"
                  primaryTypographyProps={{
                    style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                  }}
                />
              </ListItem>
              <ListItem
                button
                onClick={() => navigate('/dashboard/analytics')}
                sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                  <InsightsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Analytics"
                  primaryTypographyProps={{
                    style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                  }}
                />
              </ListItem>
              <ListItem
                button
                onClick={() => navigate('/about')}
                sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText
                  primary="About"
                  primaryTypographyProps={{
                    style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                  }}
                />
              </ListItem>
              <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <ListItem
                    button
                    key={conversation.chat_id}
                    onClick={() => handleConversationClick(conversation.chat_id)}
                    sx={{
                      borderRadius: '8px',
                      margin: '5px 0',
                      backgroundColor:
                        activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.button.background,
                        color: theme.palette.text_human_message_historic,
                      },
                      '& .MuiTypography-root': {
                        color:
                          activeChatId === conversation.chat_id
                            ? theme.palette.text_human_message_historic
                            : theme.palette.text.primary,
                      },
                    }}
                  >
                    <ListItemText
                      primary={conversation.name}
                      primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }}
                    />
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
          </div>
          {isSmallScreen && (
            <Box style={{ padding: '16px', borderTop: `1px solid ${theme.palette.divider}` }}>
              <img
                src={logo_greg}
                alt="Logo face"
                className="h-10 w-auto"
                style={{ cursor: 'pointer', margin: '0 auto' }}
                onClick={handleProfileMenuClick}
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
            className="relative p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!drawerOpen && (
                <>
                  <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                    <MenuIcon />
                  </IconButton>
                  {isSmallScreen && (
                    <img
                      src={theme.logo}
                      alt="University Logo"
                      style={{ height: '40px', marginLeft: '10px', marginRight: '10px' }}
                    />
                  )}
                  {!isSmallScreen && (
                    <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                      <MapsUgcRoundedIcon />
                    </IconButton>
                  )}
                </>
              )}
              <div style={{ width: '16px' }} />
              {/* Commented out course_id dropdown menu */}
              {/*
              <div
                onClick={handleDropDownClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  ...getBackgroundColor(selectedFilter),
                  backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    marginRight: '8px',
                    color: getBackgroundColor(selectedFilter).color,
                  }}
                >
                  {selectedFilter}
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
              </div>
              */}
            </div>
  
            {/* Menu for course options (kept active so it works when uncommented) */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
  
            <div style={{ flexGrow: 1 }}></div>
  
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isSmallScreen ? (
                <>
                  <div
                    style={{
                      backgroundColor: '#FEEAEA',
                      color: '#F04261',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      marginRight: '10px',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                    onClick={toggleBetaView}
                  >
                    Beta V1.3
                  </div>
                  <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                    <MapsUgcRoundedIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
                    <Button
                      variant="outlined"
                      onClick={handleMeetingClick}
                      sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
                    >
                      Contact my Academic Advisor
                    </Button>
                  )}
                  <div
                    style={{
                      backgroundColor: '#FEEAEA',
                      color: '#F04261',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      marginLeft: '10px',
                      marginRight: '10px',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                    onClick={toggleBetaView}
                  >
                    Beta V1.3
                  </div>
                  <img
                    src={logo_greg}
                    alt="Logo face"
                    className="h-10 w-auto"
                    style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }}
                    onClick={handleProfileMenuClick}
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
                </>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div
              className="flex-grow flex flex-col items-center justify-center w-full"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div
                className="w-full h-full p-8 flex flex-col items-center justify-center"
                style={{ backgroundColor: theme.palette.background.default }}
              >
                <h1
                  className="text-4xl font-bold text-center mb-6"
                  style={{ color: theme.palette.text.primary }}
                >
                  Your Assistant Lucy
                </h1>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '5px',
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                      fontSize: isSmallScreen ? '0.75rem' : '1rem',
                      padding: isSmallScreen ? '4px 8px' : '8px 16px',
                      whiteSpace: 'nowrap',
                    }}
                    endIcon={
                      <img
                        src={certifiate_icon}
                        alt="Verify Icon"
                        style={{ width: '20px', height: '20px' }}
                      />
                    }
                  >
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>

                <div className="mt-8 px-8 flex justify-center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outlined"
                      onClick={() => setInputValue('How to be involved in research')}
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
                      How to be involved in research
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setInputValue('Who to contact for career advice')}
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
                      Who to contact for career advice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-grow overflow-y-auto"
              style={{ backgroundColor: theme.palette.background.default, paddingBottom: '100px' }}
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
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>
                            You
                          </span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
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
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar
                              alt="Lucy Avatar"
                              src={logo_lucy_face}
                              sx={{ width: 25, height: 25 }}
                            />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick}
                            images={message.images}
                            takData={message.TAK}
                            CourseData={message.COURSE}
                            waitingMessages={message.waitingMessages}
                            drawerOpen={drawerOpen}
                            handleSendTAKMessage={handleSendTAKMessage}
                            handleSendCOURSEMessage={handleSendCOURSEMessage}
                          />
                        )}
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

          <div
            className="flex justify-center p-4"
            style={{
              backgroundColor: theme.palette.background.default,
              position: 'fixed',
              bottom: 0,
              width: '100%',
            }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={handleSendMessageSocraticLangGraph}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        bottom: '25px',
                        transform: 'translateY(50%)',
                      }}
                    >
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
          </div>
        </div>

        {iframeSrc && (
          <div
            className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l"
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
      </div>

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
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course, AnswerTAK, AnswerCourse, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory, sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG', 'moRgToBTOAJZdMQPs7Ci'];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
  
        // Your custom order
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

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /* FONCTION MARCHE
  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };
  */

  //Nouvelle fonction qui permet de navigate vers une autre page si le course selection est choisi
  /*
  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (selectedCourse.id === 'moRgToBTOAJZdMQPs7Ci') {
        navigate(`/dashboard/student/course_selection/${uid}`);
      } else if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };
  *
  
  //Nouvelle fonction qui permet de navigate vers courseselection si courseselection est choisi
  //Enregistre l'ancien chat_id, créer un nouveau chat_id pour utiliser une nouvelle conversation de chat dans course_selection
  const handleMenuClose = async (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {

      //BOUT DE CODE À CHANGER POUR AFFICHER UNE POPUP DE COMING SOON POUR COURSE SELECTION
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };


      //BOUT DE CODE RESTANT PERMETTANT D'ALLER SUR COURSE SELECTION POUR L'INSTANT METTRE EN COMMENTAIRE SI EN PROD ON NE VEUT PAS SWITCHER
      /*
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
  
      if (selectedCourse.id === 'moRgToBTOAJZdMQPs7Ci') {
        // Handle Course Selection behavior
        const oldChatId = localStorage.getItem('chat_id');
  
        const lastCourseSelectionChatId = localStorage.getItem('LastCourseSelectionChat_id');
        let newChatId = '';
  
        if (lastCourseSelectionChatId) {
          // Use LastCourseSelectionChat_id if it exists
          newChatId = lastCourseSelectionChatId;
          localStorage.setItem('chat_id', newChatId);
          setActiveChatId(newChatId);
          setMessages([]); // Clear messages for new conversation
        } else {
          // Otherwise, create a new chat_id
          newChatId = uuidv4();
          localStorage.setItem('chat_id', newChatId);
          setActiveChatId(newChatId);
          setMessages([]); // Clear messages for new conversation
  
          // Create a new chat session in the backend
          if (uid) {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
  
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const chatsessions = userData.chatsessions || [];
  
              chatsessions.push(newChatId);
              await updateDoc(userRef, { chatsessions });
  
              await setDoc(doc(db, 'chatsessions', newChatId), {
                chat_id: newChatId,
                name: 'New chat',
                created_at: serverTimestamp(),
                modified_at: serverTimestamp(),
              });
  
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
                const validConversations = fetchedConversations.filter(
                  (conversation): conversation is { chat_id: string; name: string } => conversation !== null
                );
                setConversations(validConversations.reverse());
              }
            }
          }
        }
  
        // Save the previous chat_id before switching
        if (oldChatId) {
          localStorage.setItem('lastAcademicAdvisorChat_id', oldChatId);
        }
  
        // Navigate to course selection page
        navigate(`/dashboard/student/course_selection/${uid}`);
      } else if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        // For other course types (e.g., Career Advisor), show the feedback modal
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      } else {
        // Ensure that if the modal closes, we default back to Academic Advisor
        setSelectedFilter('Academic Advisor');
        localStorage.setItem('course_id', '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2'); // Academic Advisor course_id
      }
    }
  
    setAnchorEl(null);
  };
  *
  
  
  
  
  

  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the TAK_message
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };



  const handleSendCOURSEMessage = (COURSE_message: string) => {
    if (COURSE_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: COURSE_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the COURSE_message
    onSubmit([...messages, newMessage, loadingMessage], COURSE_message);
  };
  
  

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };


  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerCourse: AnswerCourse[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      //for await (const packetBunch of sendMessageFakeDemo({
      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
              answerCourse.push((packet as any).answer_COURSE_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
            answerCourse.push((packetBunch as any).answer_COURSE_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;

            console.log("relatedQuestionList")
            console.log(relatedQuestionsList)

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
            answerWaiting = (packetBunch as any).answer_waiting;

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();
        
        console.log("ANSWER WAITING QUESTIONS")
        console.log(answerWaiting)
        console.log("\n")
        console.log("ANSWER WAITING QUESTIONS WITH FLATT")
        console.log(flattenedwaitingdata)
        console.log("\n")
        console.log("ANSWER COURSE WITH FLATT")
        console.log(flattenedCourse)

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
            COURSE: flattenedCourse,
            waitingMessages: flattenedwaitingdata, // Ajouter les messages d'attente ici
          };

          console.log("Updated message before setting state:", updatedMessages[lastMessageIndex]);

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
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, 'chatsessions', oldChatId), { name: 'Conversation history' });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, 'chatsessions', newChatId), {
          chat_id: newChatId,
          name: 'New chat',
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } => conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error('UID is undefined. Cannot create new conversation.');
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
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

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem
              button
              onClick={() => navigate(`/dashboard/student/${uid}`)}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/analytics')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/about')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="About"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor:
                      activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    },
                    '& .MuiTypography-root': {
                      color:
                        activeChatId === conversation.chat_id
                          ? theme.palette.text_human_message_historic
                          : theme.palette.text.primary,
                    },
                  }}
                >
                  <ListItemText
                    primary={conversation.name}
                    primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }}
                  />
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
        </Drawer>

        <div
          className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${
            iframeSrc ? 'mr-[33vw]' : ''
          }`}
        >
          <div
            className="relative p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}
          >
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div
              onClick={handleDropDownClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}
            >
              <Typography
                sx={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginRight: '8px',
                  color: getBackgroundColor(selectedFilter).color,
                }}
              >
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div
              style={{
                backgroundColor: '#FEEAEA',
                color: '#F04261',
                padding: '4px 8px',
                borderRadius: '8px',
                marginRight: '10px',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              onClick={toggleBetaView}
            >
              Beta V1.3
            </div>

            <img
              src={logo_greg}
              alt="Logo face"
              className="h-10 w-auto"
              style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }}
              onClick={handleProfileMenuClick}
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
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>
                  }
                />
              </MenuItem>
            </Menu>

            {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
              <Button
                variant="outlined"
                onClick={handleMeetingClick}
                sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
              >
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div
              className="flex-grow flex items-center justify-center w-full"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>
                  Your Assistant Lucy
                </h1>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '5px',
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    }}
                    endIcon={
                      <img
                        src={certifiate_icon}
                        alt="Verify Icon"
                        style={{ width: '20px', height: '20px' }}
                      />
                    }
                  >
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                {/*
                <div className="flex justify-center mt-6 space-x-4">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/about')}
                    sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
                  >
                    Give us some feedbacks
                  </Button>
                </div>
                  *

                {/* Display default questions on the welcome screen *
                <div className="mt-8 px-8 flex justify-center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outlined"
                      onClick={() => setInputValue('How to be involved in research')}
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
                      How to be involved in research
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setInputValue('Who to contact for career advice')}
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
                      Who to contact for career advice
                    </Button>
                    {/*
                    <Button
                      variant="outlined"
                      onClick={() => setInputValue('Need help applying for internships')}
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
                      Need help applying for internships
                    </Button>
                    *
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-grow p-4 overflow-auto"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>
                            You
                          </span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
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
                              fontSize: '1.05rem',
                              color: theme.palette.text_human_message_historic,
                            }}
                          >
                            {message.fileType ? (
                              <embed
                                src={message.content}
                                type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'}
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
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick}
                            images={message.images}
                            takData={message.TAK} // Assurez-vous que TAK est bien passé ici
                            CourseData={message.COURSE}
                            waitingMessages={message.waitingMessages}
                            drawerOpen={drawerOpen}
                            handleSendTAKMessage={handleSendTAKMessage}
                            handleSendCOURSEMessage={handleSendCOURSEMessage}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          {/* Display related questions if available *
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

          <div
            className="flex justify-center p-4 relative"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={handleSendMessageSocraticLangGraph}
                      style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}
                    >
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar src={logo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div
            className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l"
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
      </div>

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
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/






/*
//Test related questions (fonctionne mais on a plus les questions du début)
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course, AnswerTAK, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG'];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find((course) => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

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

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the TAK_message
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };
  
  

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };


  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;

            console.log("relatedQuestionList")
            console.log(relatedQuestionsList)

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
            answerWaiting = (packetBunch as any).answer_waiting;

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedwaitingdata = answerWaiting.flat();
        
        console.log("ANSWER WAITING QUESTIONS")
        console.log(answerWaiting)
        console.log("\n")
        console.log("ANSWER WAITING QUESTIONS WITH FLATT")
        console.log(flattenedwaitingdata)

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
            waitingMessages: flattenedwaitingdata, // Ajouter les messages d'attente ici
          };

          console.log("Updated message before setting state:", updatedMessages[lastMessageIndex]);

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
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, 'chatsessions', oldChatId), { name: 'Conversation history' });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, 'chatsessions', newChatId), {
          chat_id: newChatId,
          name: 'New chat',
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } => conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error('UID is undefined. Cannot create new conversation.');
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
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

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem
              button
              onClick={() => navigate(`/dashboard/student/${uid}`)}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/analytics')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/about')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="About"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor:
                      activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    },
                    '& .MuiTypography-root': {
                      color:
                        activeChatId === conversation.chat_id
                          ? theme.palette.text_human_message_historic
                          : theme.palette.text.primary,
                    },
                  }}
                >
                  <ListItemText
                    primary={conversation.name}
                    primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }}
                  />
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
        </Drawer>

        <div
          className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${
            iframeSrc ? 'mr-[33vw]' : ''
          }`}
        >
          <div
            className="relative p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}
          >
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div
              onClick={handleDropDownClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}
            >
              <Typography
                sx={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginRight: '8px',
                  color: getBackgroundColor(selectedFilter).color,
                }}
              >
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div
              style={{
                backgroundColor: '#FEEAEA',
                color: '#F04261',
                padding: '4px 8px',
                borderRadius: '8px',
                marginRight: '10px',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              onClick={toggleBetaView}
            >
              Beta V1.3
            </div>

            <img
              src={logo_greg}
              alt="Logo face"
              className="h-10 w-auto"
              style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }}
              onClick={handleProfileMenuClick}
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
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>
                  }
                />
              </MenuItem>
            </Menu>

            {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
              <Button
                variant="outlined"
                onClick={handleMeetingClick}
                sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
              >
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div
              className="flex-grow flex items-center justify-center w-full"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>
                  Your Assistant Lucy
                </h1>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '5px',
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    }}
                    endIcon={
                      <img
                        src={certifiate_icon}
                        alt="Verify Icon"
                        style={{ width: '20px', height: '20px' }}
                      />
                    }
                  >
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/about')}
                    sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
                  >
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-grow p-4 overflow-auto"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>
                            You
                          </span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
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
                              fontSize: '1.05rem',
                              color: theme.palette.text_human_message_historic,
                            }}
                          >
                            {message.fileType ? (
                              <embed
                                src={message.content}
                                type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'}
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
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick}
                            images={message.images}
                            takData={message.TAK} // Assurez-vous que TAK est bien passé ici
                            waitingMessages={message.waitingMessages}
                            drawerOpen={drawerOpen}
                            handleSendTAKMessage={handleSendTAKMessage}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}


          {/* Display related questions if available *
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

          <div
            className="flex justify-center p-4 relative"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={handleSendMessageSocraticLangGraph}
                      style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}
                    >
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar src={logo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div
            className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l"
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
      </div>

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
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/




/*
// FICHIER QUI FONCTIONNE POUR LA DÉMO MAIS avec TAK ET SANS WAITING ANSWER - tput fonctionne ici
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course, AnswerTAK, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG'];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find((course) => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

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

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  /*
  const handleSendTAKMessage = (TAK_message: string) => {
    // Set the TAK message as the input value
    console.log("This is the value that we have in TAK_message")
    console.log(TAK_message)
    setInputValue(TAK_message);
  
    // Trigger the same send message function for the placeholder
    handleSendMessageSocraticLangGraph();
  };
  *

  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the TAK_message
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };
  
  

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };


  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;

            console.log("relatedQuestionList")
            console.log(relatedQuestionsList)

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
            answerWaiting = (packetBunch as any).answer_waiting;

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedwaitingdata = answerWaiting.flat();
        
        console.log("ANSWER WAITING QUESTIONS")
        console.log(answerWaiting)
        console.log("\n")
        console.log("ANSWER WAITING QUESTIONS WITH FLATT")
        console.log(flattenedwaitingdata)

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
            waitingMessages: flattenedwaitingdata, // Ajouter les messages d'attente ici
          };

          console.log("Updated message before setting state:", updatedMessages[lastMessageIndex]);

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
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, 'chatsessions', oldChatId), { name: 'Conversation history' });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, 'chatsessions', newChatId), {
          chat_id: newChatId,
          name: 'New chat',
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } => conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error('UID is undefined. Cannot create new conversation.');
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
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

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem
              button
              onClick={() => navigate(`/dashboard/student/${uid}`)}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/analytics')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/about')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="About"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                }}
              />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor:
                      activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    },
                    '& .MuiTypography-root': {
                      color:
                        activeChatId === conversation.chat_id
                          ? theme.palette.text_human_message_historic
                          : theme.palette.text.primary,
                    },
                  }}
                >
                  <ListItemText
                    primary={conversation.name}
                    primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }}
                  />
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
        </Drawer>

        <div
          className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${
            iframeSrc ? 'mr-[33vw]' : ''
          }`}
        >
          <div
            className="relative p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}
          >
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div
              onClick={handleDropDownClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}
            >
              <Typography
                sx={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginRight: '8px',
                  color: getBackgroundColor(selectedFilter).color,
                }}
              >
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography
                    sx={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div
              style={{
                backgroundColor: '#FEEAEA',
                color: '#F04261',
                padding: '4px 8px',
                borderRadius: '8px',
                marginRight: '10px',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              onClick={toggleBetaView}
            >
              Beta V1.3
            </div>

            <img
              src={logo_greg}
              alt="Logo face"
              className="h-10 w-auto"
              style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }}
              onClick={handleProfileMenuClick}
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
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>
                  }
                />
              </MenuItem>
            </Menu>

            {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
              <Button
                variant="outlined"
                onClick={handleMeetingClick}
                sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
              >
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div
              className="flex-grow flex items-center justify-center w-full"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>
                  Your Assistant Lucy
                </h1>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '5px',
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic,
                    }}
                    endIcon={
                      <img
                        src={certifiate_icon}
                        alt="Verify Icon"
                        style={{ width: '20px', height: '20px' }}
                      />
                    }
                  >
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/about')}
                    sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
                  >
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-grow p-4 overflow-auto"
              style={{ backgroundColor: theme.palette.background.default }}
            >
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>
                            You
                          </span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
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
                              fontSize: '1.05rem',
                              color: theme.palette.text_human_message_historic,
                            }}
                          >
                            {message.fileType ? (
                              <embed
                                src={message.content}
                                type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'}
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
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick}
                            images={message.images}
                            takData={message.TAK} // Assurez-vous que TAK est bien passé ici
                            waitingMessages={message.waitingMessages}
                            drawerOpen={drawerOpen}
                            handleSendTAKMessage={handleSendTAKMessage}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}


          {/* Display related questions or default questions just above the input field *
          {messages.length === 0 && (
            <div className="mt-4 px-8 flex justify-center">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outlined"
                  onClick={() => setInputValue('How to be involved in research')}
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
                  How to be involved in research
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setInputValue('Who to contact for career advice')}
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
                  Who to contact for career advice
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setInputValue('Need help applying for internships')}
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
                  Need help applying for internships
                </Button>
              </div>
            </div>
          )}




          <div
            className="flex justify-center p-4 relative"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={handleSendMessageSocraticLangGraph}
                      style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}
                    >
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar src={logo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div
            className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l"
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
      </div>

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
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/



/* CODE QUI FONCTIONNE PARFAITEMENT MAIS ON SOUHAITE AJOUTER LES 3 QUESTIONS POUR DONNER DES IDÉES 
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close'; // Icon to close iframe
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course, AnswerTAK } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // Beta button view
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Source link
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  //NOUVELLE FONCTION AVEC AJOUT DE TAK
  
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = [];
    let answerTAK: AnswerTAK[] = []; // Declaration for TAK data
    let relatedQuestionsList: string[] = [];
    let error: string | null = null;
  
    try {
      // Extract stored user and session data
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';
  
      const lastMessageIndex = messageHistory.length - 1;
  
      // Simulate message streaming by iterating through packets
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Handle the received packets (which might come as an array or an object)
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          // Handle packet if it's an object
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }
  
        // Flatten the TAK and image data arrays after receiving the packets
        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
  
        console.log("This is flattenedImages:", flattenedImages);
        console.log("This is flattenedTAK:", flattenedTAK);
  
        // Update messages with the new information received
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
  
          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK, // Use TAK field here as per the Message interface
          };
  
          console.log("Updated message with TAK:", updatedMessages[lastMessageIndex]);
  
          return updatedMessages;
        });
  
        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }
  
      // Set related questions list after streaming is completed
      setRelatedQuestions(relatedQuestionsList);
      setIsStreaming(false);
  
      // Save AI-generated message to the backend
      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };
  
      await saveMessageAIToBackend(Message_AI_to_save);
  
    } catch (e: any) {
      // Handle errors by logging and updating the UI accordingly
      const errorMsg = e.message;
      console.error("Error during message processing:", errorMsg);
  
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
  
      setIsStreaming(false);
    }
  };
  
  

/*
  // FONCTION POUR GÉRER LE TEXTE, IMAGE SOURCES
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = [];
    let answerTAK: { document_id: string, question: string, answer_options: string[], other_specification?: { label: string, placeholder: string } }[] = []; // Déclaration similaire à answerImages
    let relatedQuestionsList: string[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;

            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);

            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              const image = (packet as any).image_data;
              answerImages.push(image);

            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              const TAK = (packet as any).answer_TAK_data;
              answerTAK.push(TAK);

            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;

            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          if (typeof packetBunch === 'object' && packetBunch !== null) {

            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);

            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
              const image = (packetBunch as any).image_data;
              answerImages.push(image);

            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
              const TAK = (packetBunch as any).answer_TAK_data;
              answerTAK.push(TAK);

            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
              relatedQuestionsList = (packetBunch as any).related_questions;

            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const flattenedImages = answerImages.flat();
          const flattenedTAK = answerTAK.flat();
          console.log("This is flattenedImages:")
          console.log(flattenedImages)
          console.log("\n")
          console.log("This is flattenedTAK:")
          console.log(flattenedTAK)
          
          console.log("Flattened TAK before setting in state:", flattenedTAK);
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK,

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
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };
  *






  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    setRelatedQuestions([]);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link);
  };

  const handleIframeClose = () => {
    setIframeSrc(null);
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${iframeSrc ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView}
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick}
                            images={message.images}
                            waitingMessages={message.waitingMessages} // Assurez-vous que waitingMessages est bien passé ici
                            drawerOpen={drawerOpen} // Pass if the sidebar is open
                          />
                        )}
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
                {relatedQuestions.map((question, index) => (
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
                      borderRadius: '8px'
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>Sources</Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe
              src={iframeSrc}
              title="Document Viewer"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}

      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/








//CODE QUI FONCTIONNE MAIS PROBLÈME HOVERLAP AVEC L'IMAGE QUAND ON CLIQUE DESSUS 
/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close'; // Icon to close iframe
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // Beta button view
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Source link
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]); // Variable pour les related questions

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    // Reset related questions when sending a new message
    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  // Nouvelle fonction pour prendre en compte en plus les images et les related questions
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = []; // Variable pour stocker les images
    let relatedQuestionsList: string[] = []; // Variable pour stocker les related questions
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      // Pour chaque paquet de la réponse
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Vérifie si packetBunch est itérable (tableau) ou un objet unique
        if (Array.isArray(packetBunch)) {
          // Si packetBunch est un tableau, on traite chaque paquet
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              const image = (packet as any).image_data;
              answerImages.push(image); // Stocker les images reçues
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
          if (typeof packetBunch === 'object' && packetBunch !== null) {
            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
              const image = (packetBunch as any).image_data;
              answerImages.push(image); // Stocker l'image reçue
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
              relatedQuestionsList = (packetBunch as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const flattenedImages = answerImages.flat(); // Aplatir les tableaux imbriqués
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments, // Stocker les documents
            images: flattenedImages, // Stocker les images
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList); // Enregistrer les related questions
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);
    setRelatedQuestions([]); // Reset related questions when creating a new conversation

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    setRelatedQuestions([]); // Reset related questions when switching conversations

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link); // Update iframe source
  };

  const handleIframeClose = () => {
    setIframeSrc(null); // Close iframe
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${iframeSrc ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick} // Pass the handler
                            images={message.images} // Pass images to AIMessage component
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          {/* Related questions display *
          {relatedQuestions.length > 0 && (
            <div className="mt-4 px-8 flex justify-center"> {/* Centered Related Questions *
              <div className="flex flex-wrap gap-2 justify-center"> {/* Ensure that related questions are centered *
                {relatedQuestions.map((question, index) => (
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
                      borderRadius: '8px'
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>Sources</Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe
              src={iframeSrc}
              title="Document Viewer"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}

      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/





/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close'; // Icon to close iframe
import { useTheme } from '@mui/material/styles';
import { Circles } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // Beta button view
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Source link
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]); // Variable pour les related questions

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    // Reset related questions when sending a new message
    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  // Nouvelle fonction pour prendre en compte en plus les images et les related questions
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = []; // Variable pour stocker les images
    let relatedQuestionsList: string[] = []; // Variable pour stocker les related questions
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      // Pour chaque paquet de la réponse
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Vérifie si packetBunch est itérable (tableau) ou un objet unique
        if (Array.isArray(packetBunch)) {
          // Si packetBunch est un tableau, on traite chaque paquet
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              const image = (packet as any).image_data;
              answerImages.push(image); // Stocker les images reçues
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
          if (typeof packetBunch === 'object' && packetBunch !== null) {
            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
              const image = (packetBunch as any).image_data;
              answerImages.push(image); // Stocker l'image reçue
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
              relatedQuestionsList = (packetBunch as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const flattenedImages = answerImages.flat(); // Aplatir les tableaux imbriqués
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments, // Stocker les documents
            images: flattenedImages, // Stocker les images
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList); // Enregistrer les related questions
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link); // Update iframe source
  };

  const handleIframeClose = () => {
    setIframeSrc(null); // Close iframe
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${iframeSrc ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <Circles height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick} // Pass the handler
                            images={message.images} // Pass images to AIMessage component
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          {/* Related questions display *
          {relatedQuestions.length > 0 && (
            <div className="mt-4 px-8 flex justify-center"> {/* Centered Related Questions *
              <div className="flex flex-wrap gap-2 justify-center"> {/* Ensure that related questions are centered *
                {relatedQuestions.map((question, index) => (
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
                      borderRadius: '8px'
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>Sources</Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe
              src={iframeSrc}
              title="Document Viewer"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}

      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/








/*
//code pour afficher les related questions et les images en plus des sources séparés 
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close'; // Icon to close iframe
import { useTheme } from '@mui/material/styles';
import { Circles } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageSocraticLangGraph, sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // Beta button view
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Source link
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]); // Variable pour les related questions

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  // Nouvelle fonction pour prendre en compte en plus les images et les related questions
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = []; // Variable pour stocker les images
    let relatedQuestionsList: string[] = []; // Variable pour stocker les related questions
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      // Pour chaque paquet de la réponse
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Vérifie si packetBunch est itérable (tableau) ou un objet unique
        if (Array.isArray(packetBunch)) {
          // Si packetBunch est un tableau, on traite chaque paquet
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              const image = (packet as any).image_data;
              answerImages.push(image); // Stocker les images reçues
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
          if (typeof packetBunch === 'object' && packetBunch !== null) {
            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
              const image = (packetBunch as any).image_data;
              answerImages.push(image); // Stocker l'image reçue
              console.log("This is the answerImages")
              console.log(answerImages)
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
              relatedQuestionsList = (packetBunch as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const flattenedImages = answerImages.flat(); // Aplatir les tableaux imbriqués
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments, // Stocker les documents
            images: flattenedImages, // Stocker les images
          };
          console.log("This is the flattenedImages", flattenedImages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList); // Enregistrer les related questions
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link); // Update iframe source
  };

  const handleIframeClose = () => {
    setIframeSrc(null); // Close iframe
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousCourse.name);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${iframeSrc ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <Circles height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick} // Pass the handler
                            images={message.images} // Pass images to AIMessage component
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          {/* Related questions display *
          {relatedQuestions.length > 0 && (
            <div className="flex justify-center mb-1">
              <div className="flex space-x-2">
                {relatedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: '10px',
                      padding: '10px',
                      boxShadow: theme.shadows[2],
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.background.default,
                      },
                    }}
                    onClick={() => setInputValue(question)} // When clicked, the question is set as input value
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>Sources</Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe
              src={iframeSrc}
              title="Document Viewer"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}

      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/







/*
//NOUVEAU CODE POUR OUVRIR LA SOURCE SUR LE CÔTÉ ET PAS SUR UNE NOUVELLE PAGE
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close'; // Icon to close iframe
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage, } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageSocraticLangGraph, sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // Beta button view
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Source link
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };


  //nouvelles fonction pour prendre en compte en plus les images et les related questions 
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string, image_url: string, image_description?: string }[] = []; // Variable pour stocker les images
    let relatedQuestions: string[] = []; // Variable pour stocker les related questions
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      // Pour chaque paquet de la réponse
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Vérifie si packetBunch est itérable (tableau) ou un objet unique
        if (Array.isArray(packetBunch)) {
          // Si packetBunch est un tableau, on traite chaque paquet
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              const image = (packet as any).image_data;
              answerImages.push(image); // Stocker les images reçues
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestions = (packet as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
          if (typeof packetBunch === 'object' && packetBunch !== null) {
            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
              const image = (packetBunch as any).image_data;
              answerImages.push(image); // Stocker l'image reçue
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
              relatedQuestions = (packetBunch as any).related_questions; // Stocker les related questions
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments, // Stocker les documents
            images: answerImages, // Stocker les images
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };



  /* //Fonction qui permet d'afficher le texte et les sources
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      // Pour chaque paquet de la réponse
      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        // Vérifie si packetBunch est itérable (tableau) ou un objet unique
        if (Array.isArray(packetBunch)) {
          // Si packetBunch est un tableau, on traite chaque paquet
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, "");
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              const document = (packet as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else {
          // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
          if (typeof packetBunch === 'object' && packetBunch !== null) {
            if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
              const document = (packetBunch as AnswerDocumentPacket).answer_document;
              answerDocuments.push(document);
            } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
              error = (packetBunch as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,  // Log the documents being added here
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);

      setIsStreaming(false);
    }
  };
  *



  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  const handleSourceClick = (link: string) => {
    setIframeSrc(link); // Update iframe source
  };

  const handleIframeClose = () => {
    setIframeSrc(null); // Close iframe
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${iframeSrc ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                            handleSourceClick={handleSourceClick} // Pass the handler
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {iframeSrc && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <Typography variant="body1" style={{ color: theme.palette.text.primary }}>Sources</Typography>
              <IconButton onClick={handleIframeClose}>
                <CloseIcon sx={{ color: theme.palette.error.main }} />
              </IconButton>
            </div>
            <iframe
              src={iframeSrc}
              title="Document Viewer"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}

      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/











/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageSocraticLangGraph, sendMessageFakeDemo, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };



  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
        const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
        const courseId = localStorage.getItem('course_id') || 'default_course_id';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const username = user.name || 'default_user';
        const uid = user.id || 'default_uid';
        const university = localStorage.getItem('university') || 'default_university';
        const student_profile = localStorage.getItem('student_profile') || '';

        const lastMessageIndex = messageHistory.length - 1;

        console.log("Starting onSubmit");
        console.log("Initial messageHistory:", messageHistory);

        // Pour chaque paquet de la réponse
        for await (const packetBunch of sendMessageFakeDemo({
            message: inputValue,
            chatSessionId: chatSessionId,
            courseId: courseId,
            username: username,
            university: university,
            student_profile: student_profile
        })) {
            console.log("Packet bunch received:", packetBunch);

            // Vérifie si packetBunch est itérable (tableau) ou un objet unique
            if (Array.isArray(packetBunch)) {
                // Si packetBunch est un tableau, on traite chaque paquet
                for (const packet of packetBunch) {
                    if (typeof packet === 'string') {
                        answer = packet.replace(/\|/g, "");
                        console.log("Received text packet:", answer);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
                        answer = (packet as AnswerPiecePacket).answer_piece;
                        console.log("Received answer piece:", answer);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
                        const document = (packet as AnswerDocumentPacket).answer_document;
                        answerDocuments.push(document);
                        console.log("Received document packet:", document);
                        console.log("Current citedDocuments array:", answerDocuments);
                    } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
                        error = (packet as StreamingError).error;
                        console.error("Received error packet:", error);
                    }
                }
            } else {
                // Si packetBunch est un objet unique (comme un document JSON), le traiter directement
                if (typeof packetBunch === 'object' && packetBunch !== null) {
                    console.log("Received a single object packet:", packetBunch);
                    if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
                        const document = (packetBunch as AnswerDocumentPacket).answer_document;
                        answerDocuments.push(document);
                        console.log("Received document packet:", document);
                        console.log("Current citedDocuments array:", answerDocuments);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
                        error = (packetBunch as StreamingError).error;
                        console.error("Received error packet:", error);
                    }
                }
            }

            console.log("Updated answer:", answer);
            console.log("Updated citedDocuments:", answerDocuments);

            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[lastMessageIndex] = {
                    id: prevMessages[lastMessageIndex].id,
                    type: 'ai',
                    content: answer,
                    personaName: 'Lucy',
                    citedDocuments: answerDocuments,  // Log the documents being added here
                };
                console.log("Updated messages with citedDocuments:", updatedMessages);
                return updatedMessages;
            });

            if (isCancelled) {
                console.warn("Operation cancelled by user.");
                setIsCancelled(false);
                break;
            }
        }

        setIsStreaming(false);
        console.log("Streaming completed. Final answer:", answer);
        console.log("Final citedDocuments:", answerDocuments);

        const Message_AI_to_save = {
            message: answer,
            chatSessionId: chatSessionId,
            courseId: courseId,
            username: "Lucy",
            type: 'ai',
            uid: uid,
            input_message: inputValue,
            university: university,
        };

        console.log("Saving message to backend:", Message_AI_to_save);
        await saveMessageAIToBackend(Message_AI_to_save);
        console.log("Message saved successfully.");

    } catch (e: any) {
        const errorMsg = e.message;
        console.error("Error in onSubmit:", errorMsg);

        setMessages(prevMessages => [
            ...prevMessages,
            {
                id: Date.now(),
                type: 'error',
                content: "An error occurred. The API endpoint might be down.",
            },
        ]);

        setIsStreaming(false);
    }
};









  //CODE D'ORIGINE
  /*
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      //for await (const packetBunch of sendMessageSocraticLangGraph({
      for await (const packetBunch of sendMessageFakeDemo ({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        for (const packet of packetBunch) {
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };
  *



  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.text_human_message_historic, // Text color on hover
                    },
                    '& .MuiTypography-root': {
                      color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary, // Default text color
                    }
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.text_human_message_historic }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" onClick={() => navigate('/about')} sx={{borderColor: theme.palette.button_sign_in,  color: theme.palette.button_sign_in,}}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.button_sign_in }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <iframe
              //src="https://www.wharton.upenn.edu/"
              //src="http://localhost:5001/static/yc_popup/syllabus_cis_5190.html"
              //src="http://localhost:5001/static/yc_popup/syllabus_cis_5200.html"
              src="http://localhost:5001/static/yc_popup/course_path@penn.html"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/






/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { db } from '../auth/firebase';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { popup, setPopup } = usePopup();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
        setCourseOptions(validCourses);

        if (validCourses.length > 0) {
          const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
          const initialCourse = validCourses.find(course => course.id === initialCourseId);
          setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
          localStorage.setItem('course_id', initialCourseId);
        }

        const chatPromises = chatSessionIds.map(async (chatId: string) => {
          if (typeof chatId === 'string') {
            const chatRef = doc(db, 'chatsessions', chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists() && chatSnap.data().name) return { chat_id: chatId, name: chatSnap.data().name };
          }
          return null;
        });

        const fetchedConversations = await Promise.all(chatPromises);
        const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
        setConversations(validConversations.reverse());
      }
    }
  };

  useEffect(() => {
    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) await handleConversationClick(storedChatId);
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        for (const packet of packetBunch) {
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        }

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) handleAutoScroll(endDivRef, scrollableDivRef);
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
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

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0', backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text_human_message_historic } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter),
                backgroundColor: getBackgroundColor(selectedFilter).backgroundColor,
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
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
                <ListItemText primary={<Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{borderColor: theme.palette.sidebar,  color: theme.palette.sidebar,}}>
              Contact my Academic Advisor
              </Button>
              
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="w-full h-full p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
                <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.palette.text.primary }}>Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" sx={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto" style={{ backgroundColor: theme.palette.background.default }}>
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem', color: theme.palette.text_human_message_historic }}>
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index)}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 relative" style={{ backgroundColor: theme.palette.background.default }}>
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
            <iframe
              src="https://www.wharton.upenn.edu/"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/





/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import certifiate_icon from '../certifiate.png';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // State to control Beta button view
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                     // backgroundColor: '#F5F5F5',
                     backgroundColor: theme.palette.button.background
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-[33vw]' : ''}`}> {/* Adjusted Beta view *
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  {/*<Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>*
                  <Button variant="contained" style={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text, }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                  
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          {/*<div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7 text-lg"> {/* Taille de la police augmentée *
                          <div style={{ backgroundColor: theme.palette.button.background, padding: '8px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', maxWidth: '75%', marginRight: '30px', fontSize: '1.05rem' }}> {/*Ici on peut modifier la taille de la police de AImessage*
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem', // Augmentation de la taille de la police dans le placeholder
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && ( // Conditionally render the embedded view
          <div className="fixed top-0 right-0 h-full w-[33vw] bg-white shadow-lg border-l border-gray-200"> {/* Updated to 50vw *
            <iframe
              src="https://www.wharton.upenn.edu/"
              //src="https://dining.business-services.upenn.edu/locations-hours-menus/residential-dining"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert, Switch
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/Brightness3';  // Moon icon
import LightModeIcon from '@mui/icons-material/WbSunny';  // Sun icon
import logo from '../logo_lucy.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import certifiate_icon from '../certifiate.png';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG'];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // State to control Beta button view
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(false);  // Add state for dark mode

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={darkMode ? theme.darkMode : theme.lightMode}>  {/* Adjust theme based on dark mode *
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                     // backgroundColor: '#F5F5F5',
                     backgroundColor: theme.palette.button.background
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-[33vw]' : ''}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <IconButton
              onClick={handleDarkModeToggle}
              sx={{ color: theme.palette.primary.main }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text, }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                  
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7 text-lg">
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && (
          <div className="fixed top-0 right-0 h-full w-[33vw] bg-white shadow-lg border-l border-gray-200">
            <iframe
              src="https://www.wharton.upenn.edu/"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/





/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logo from '../logo_lucy.png';
import logo_greg from '../student_new_face_contour2.png';
import { createTheme, useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import {
  AnswerDocument,
  AnswerPiecePacket,
  AnswerDocumentPacket,
  StreamingError,
} from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import {
  sendMessageSocraticLangGraph,
  saveMessageAIToBackend,
  getChatHistory,
} from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import {
  submitFeedbackAnswer,
  submitFeedbackWrongAnswer,
  submitFeedbackGoodAnswer,
} from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = [
  'Connf4P2TpKXXGooaQD5',
  'tyPR1RAulPfqLLfNgIqF',
  'Q1SjXBe30FyX6GxvJVIG',
];

const Dashboard_eleve_template: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(
    null
  );
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] =
    useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<
    { chat_id: string; name: string }[]
  >([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    localStorage.getItem('chat_id')
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic theme switching between light and dark
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#011F5B', // Upenn theme primary color
      },
      secondary: {
        main: '#990000', // Upenn theme secondary color
      },
      background: {
        default: darkMode ? '#2e2e2e' : '#ffffff', // Gray background for dark mode
        paper: darkMode ? '#1c1c1c' : '#f4f4f4', // Darker background for sidebar in dark mode
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000', // White text in dark mode
      },
      button: {
        background: darkMode ? '#2e2e2e' : '#D6EAF8', // Button background color
        text: darkMode ? '#ffffff' : '#011F5B', // White text for buttons in dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2e2e2e' : '#D6EAF8', // Adjust button background
            color: darkMode ? '#ffffff' : '#011F5B', // Adjust button text color
            borderColor: darkMode ? '#ffffff' : undefined, // White border in dark mode
            borderWidth: darkMode ? '1px' : undefined,
            '&:hover': {
              backgroundColor: darkMode ? '#454545' : '#B0E0E6', // Hover effect for buttons in dark mode
            },
          },
        },
      },
    },
  });

  const getBackgroundColor = (filter: string) => {
    // Specific colors per course, independent of dark or light mode
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
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
              if (courseSnap.exists()) {
                return { id: courseId, name: courseSnap.data().name };
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId =
              localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(
              (course) => course.id === initialCourseId
            );
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } =>
              conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    const messageHistory = [...messages, newMessage, loadingMessage];
    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        for (const packet of packetBunch) {
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, '');
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[prevMessages.length - 1] = {
            id: prevMessages[prevMessages.length - 1].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: 'Lucy',
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      await saveMessageAIToBackend(Message_AI_to_save);
    } catch (e: any) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]);

    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        if (oldChatId) {
          await updateDoc(doc(db, 'chatsessions', oldChatId), {
            name: 'Conversation history',
          });
        }

        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        await setDoc(doc(db, 'chatsessions', newChatId), {
          chat_id: newChatId,
          name: 'New chat',
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

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
          const validConversations = fetchedConversations.filter(
            (conversation): conversation is { chat_id: string; name: string } =>
              conversation !== null
          );
          setConversations(validConversations.reverse());
        }
      }
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

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

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

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
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className="flex h-screen"
        style={{ backgroundColor: theme.palette.background.default }}
      >
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{
            style: {
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper, // Sidebar background color
              color: theme.palette.text.primary,
              borderRadius: '0 0 0 0',
            },
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.text.primary }}>
              <MenuIcon />
            </IconButton>
            <IconButton
              onClick={handleNewConversation}
              sx={{ color: theme.palette.text.primary }}
            >
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem
              button
              onClick={() => navigate(`/dashboard/student/${uid}`)}
              style={{ borderRadius: '8px' }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem' },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/analytics')}
              style={{ borderRadius: '8px' }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem' },
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/about')}
              style={{ borderRadius: '8px' }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="About"
                primaryTypographyProps={{
                  style: { fontWeight: '500', fontSize: '0.875rem' },
                }}
              />
            </ListItem>
            <Divider style={{ backgroundColor: darkMode ? '#454545' : 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor:
                      activeChatId === conversation.chat_id
                        ? theme.palette.button.background
                        : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.button.background,
                    },
                  }}
                >
                  <ListItemText
                    primary={conversation.name}
                    primaryTypographyProps={{
                      style: { fontWeight: '500', fontSize: '0.875rem' },
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography
                align="center"
                style={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: 'gray',
                  marginTop: '30px',
                }}
              >
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div
          className={`flex flex-col flex-grow transition-all duration-300 ${
            drawerOpen ? 'ml-60' : ''
          } ${betaViewOpen ? 'mr-[33vw]' : ''}`}
        >
          <div
            className="relative p-4 flex items-center justify-between border-b"
            style={{ borderColor: darkMode ? '#454545' : '#e0e0e0' }} // Light gray border in dark mode
          >
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.text.primary }}>
                  <MenuIcon />
                </IconButton>

                <IconButton
                  onClick={handleNewConversation}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div
              onClick={handleDropDownClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                ...getBackgroundColor(selectedFilter),
              }}
            >
              <Typography
                sx={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginRight: '8px',
                  color: getBackgroundColor(selectedFilter).color,
                }}
              >
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon
                sx={{
                  fontSize: '1rem',
                  color: getBackgroundColor(selectedFilter).color,
                }}
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography
                    style={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div
              style={{
                backgroundColor: '#FEEAEA',
                color: '#F04261',
                padding: '4px 8px',
                borderRadius: '8px',
                marginRight: '10px',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              onClick={toggleBetaView}
            >
              Beta V1.3
            </div>

            <IconButton
              onClick={handleToggleDarkMode}
              sx={{ marginRight: '15px', color: theme.palette.text.primary }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <img
              src={logo_greg}
              alt="Logo face"
              className="h-10 w-auto"
              style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }}
              onClick={handleProfileMenuClick}
            />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleToggleDarkMode}>
                <ListItemIcon>
                  {darkMode ? (
                    <Brightness7Icon fontSize="small" />
                  ) : (
                    <Brightness4Icon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </Typography>
                  }
                />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}
                    >
                      Log-out
                    </Typography>
                  }
                />
              </MenuItem>
            </Menu>

            {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div
                className="w-full h-full p-8 flex flex-col items-center justify-center"
                style={{ backgroundColor: theme.palette.background.default }}
              >
                <h1
                  className="text-4xl font-bold text-center mb-6"
                  style={{ color: theme.palette.text.primary }}
                >
                  Your Assistant Lucy
                </h1>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="contained"
                    style={{
                      borderRadius: '5px',
                      backgroundColor: theme.palette.button.background,
                      color: theme.palette.button.text,
                      borderColor: theme.palette.button.text, // Border color for buttons in dark mode
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                    endIcon={
                      <img
                        src={logo}
                        alt="Verify Icon"
                        style={{ width: '20px', height: '20px' }}
                      />
                    }
                  >
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div
                      key={message.id}
                      className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}
                    >
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span
                            className="font-bold mr-2"
                            style={{ color: theme.palette.text.primary }}
                          >
                            You
                          </span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div
                            className="p-2 rounded-xl inline-block text-left max-w-3/4 mr-7 text-lg"
                            style={{
                              backgroundColor: darkMode
                                ? theme.palette.button.background
                                : theme.palette.button.background, // Use dynamic background color for human message container
                              color: theme.palette.text.primary,
                            }}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div
            className="flex justify-center p-4 relative"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={handleSendMessageSocraticLangGraph}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        bottom: '25px',
                        transform: 'translateY(50%)',
                      }}
                    >
                      <SendIcon style={{ color: darkMode ? '#ffffff' : theme.palette.primary.main }} /> {/* White icon in dark mode *
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '1rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px',
                    borderColor: darkMode ? '#ffffff' : undefined, // White border in dark mode
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: darkMode ? '#ffffff' : undefined, // White border in dark mode
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? '#ffffff' : undefined, // White border on hover in dark mode
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#ffffff' : undefined, // White text in input field
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar src={logo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
            </Box>
          </div>
        </div>

        {betaViewOpen && (
          <div className="fixed top-0 right-0 h-full w-[33vw] shadow-lg border-l border-gray-200">
            <iframe
              src="https://www.wharton.upenn.edu/"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/









 //CODE D'ORIGINE DE BASE 






/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import certifiate_icon from '../certifiate.png';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // State to control Beta button view
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                     // backgroundColor: '#F5F5F5',
                     backgroundColor: theme.palette.button.background
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-[33vw]' : ''}`}> {/* Adjusted Beta view 
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  {/*<Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text, }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                  
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7">
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && ( // Conditionally render the embedded view
          <div className="fixed top-0 right-0 h-full w-[33vw] bg-white shadow-lg border-l border-gray-200"> {/* Updated to 50vw 
            <iframe
              src="https://www.wharton.upenn.edu/"
              //src="https://undergrad-inside.wharton.upenn.edu/first-year-registration/"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import certifiate_icon from '../certifiate.png';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const [betaViewOpen, setBetaViewOpen] = useState(false); // State to control Beta button view
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleBetaView = () => {
    setBetaViewOpen(!betaViewOpen); // Toggle the Beta view
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                     // backgroundColor: '#F5F5F5',
                     backgroundColor: theme.palette.button.background
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : ''} ${betaViewOpen ? 'mr-96' : ''}`}> {/* Adjust class based on Beta view*
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem',
                cursor: 'pointer' // Enable clicking
              }}
              onClick={toggleBetaView} // Open/Close the embedded page
            >
              Beta
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  {/*<Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>*
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text, }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                  
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7">
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>

        {betaViewOpen && ( // Conditionally render the embedded view
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg border-l border-gray-200">
            <iframe
              src="https://github.com/Patemole/lucy-platform-front-V1/blob/dev/src/api/fetchStudentsData.js"
              //src="https://undergrad-inside.wharton.upenn.edu/first-year-registration/"
              title="Courses at Upenn"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )}
      </div>

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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/


/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../api/feedback_wrong_answer';
import { Certificate } from 'crypto';
import certifiate_icon from '../certifiate.png';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
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
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                    '&:hover': {
                     // backgroundColor: '#F5F5F5',
                     backgroundColor: theme.palette.button.background
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem'
              }}
            >
              Beta
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  {/*<Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px', backgroundColor: theme.palette.button.background, color: theme.palette.button.text, }} endIcon={<img src={certifiate_icon} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                  
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7">
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                              if (feedbackType === 'like') handleFeedbackClick(index);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/






/*
//DERNIER CODE À JOUR QUI FONCTIONNE AVEC BETA ET JUSTICIATION CORRECT DES MESSAGES
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
  };

  const handleCloseWrongAnswerModal = () => {
    setModalOpen(false);
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? '#EBE2FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem'
              }}
            >
              Beta
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary" endIcon={<img src={icon_verify} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-custom p-2 rounded-xl inline-block text-left max-w-3/4 mr-7">
                            {message.fileType ? (
                              <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
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

      <PopupFeedback
        open={feedbackModalOpen}
        onClose={handleFeedbackModalClose}
        selectedFilter={selectedFilter}
        onSubmit={handleSubmitFeedback}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
  };

  const handleCloseWrongAnswerModal = () => {
    setModalOpen(false);
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? '#EBE2FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary" endIcon={<img src={icon_verify} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-2 mr-2">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="bg-custom p-2 rounded-xl inline-block text-left">
                          {message.fileType ? (
                            <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
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

      <PopupFeedback
        open={feedbackModalOpen}
        onClose={handleFeedbackModalClose}
        selectedFilter={selectedFilter}
        onSubmit={handleSubmitFeedback}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/




/* CODE DE BASE AVANT MODIDIFICATION 
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../student_new_face_contour2.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback';
import { submitFeedbackAnswer, submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);

  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true);
    handleFeedbackModalClose();
  };

  const handleSubmitWrongAnswerFeedback = async (feedback: string) => {
    console.log("Wrong answer feedback submitted:", feedback);

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
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true);
  };

  const handleCloseWrongAnswerModal = () => {
    setModalOpen(false);
    setButtonHovered(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? '#EBE2FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary" endIcon={<img src={icon_verify} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-4">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="bg-custom p-2 rounded-xl inline-block text-left">
                          {message.fileType ? (
                            <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px'
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
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

      <PopupFeedback
        open={feedbackModalOpen}
        onClose={handleFeedbackModalClose}
        selectedFilter={selectedFilter}
        onSubmit={handleSubmitFeedback}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/




/*
//DERNIER CODE À JOUR QUI FONCTIONNE
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupWrongAnswer from '../components/PopupWrongAnswer';
import PopupFeedback from '../components/PopupFeedback'; // Import the PopupFeedback component
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

// Largeur du tiroir de navigation
const drawerWidth = 240;

// Identifiants de cours autorisés pour un traitement spécial
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

// Composant principal du tableau de bord de l'élève
const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>(); // Extraction de l'identifiant utilisateur des paramètres de l'URL
  const [showChat, setShowChat] = useState(false); // État pour afficher ou masquer la fenêtre de chat
  const [messages, setMessages] = useState<Message[]>([]); // Liste des messages du chat
  const [isComplete, setIsComplete] = useState(false); // Indicateur de complétion du chat
  const [inputValue, setInputValue] = useState(''); // Valeur de l'input de message
  const [isStreaming, setIsStreaming] = useState(false); // Indicateur de streaming de la réponse
  const [isCancelled, setIsCancelled] = useState(false); // Indicateur d'annulation
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null); // Feedback en cours
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null); // Message sélectionné pour afficher les documents
  const [drawerOpen, setDrawerOpen] = useState(false); // État d'ouverture du tiroir de navigation
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]); // Liste des conversations
  const navigate = useNavigate(); // Hook pour la navigation
  const { popup, setPopup } = usePopup(); // Hook pour les popups
  const { logout } = useAuth(); // Hook pour la déconnexion
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Référence pour l'input de texte
  const scrollableDivRef = useRef<HTMLDivElement>(null); // Référence pour la div défilable
  const endDivRef = useRef<HTMLDivElement>(null); // Référence pour la div de fin de défilement
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // État pour le menu déroulant
  const [selectedFilter, setSelectedFilter] = useState<string>(''); // Filtre sélectionné pour les cours
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null); // État pour le menu du profil
  const [courseOptions, setCourseOptions] = useState<Course[]>([]); // Liste des options de cours
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id')); // Identifiant de la conversation active
  const [modalOpen, setModalOpen] = useState(false); // État d'ouverture du modal
  const [previousFilter, setPreviousFilter] = useState<string>(''); // Filtre précédent
  const courseId = localStorage.getItem('course_id'); // Identifiant du cours stocké localement
  const universityDomain = localStorage.getItem('university') || 'example.edu'; // Domaine de l'université

  // Nouvel état pour les feedbacks
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false); // Nouvel état pour le modal de feedback
  const [buttonHovered, setButtonHovered] = useState<boolean>(false); // État pour le survol du bouton
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false); // État pour le snackbar

  // Fonction pour obtenir la couleur de fond en fonction du filtre
  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

  // Utilisation de useEffect pour récupérer les options de cours et les sessions de chat
  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);


  // Chargement des messages à partir de l'ID de chat stocké localement
  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);

  // Gestion de l'ouverture du menu du profil
  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  // Gestion de la fermeture du menu du profil
  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  // Gestion de l'ouverture du menu déroulant des cours
  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Gestion de la sélection d'un cours dans le menu déroulant
  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setFeedbackModalOpen(true); // Open feedback modal instead of the previous one
      }
    }
    setAnchorEl(null);
  };

  
  // Fermeture du menu sans sélection
  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  // Gestion de l'envoi d'un message
  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };

  // Soumission des messages pour traitement
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  // Gestion de la pression de la touche Enter dans l'input de message
  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  // Création d'une nouvelle conversation
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };

  // Gestion de la sélection d'une conversation
  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };

  // Gestion du clic pour contacter le conseiller académique
  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  // Ouverture et fermeture du tiroir de navigation
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Défilement automatique en fonction de l'état de streaming
  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  // Défilement automatique lors de la mise à jour des messages
  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  // Fermeture du modal
  const handleCloseModal = () => {
    setModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  // Fermeture du modal de feedback
  const handleFeedbackModalClose = () => {
    setFeedbackModalOpen(false);
    const previousCourse = courseOptions.find(course => course.name === previousFilter);
    if (previousCourse) {
      setSelectedFilter(previousFilter);
      localStorage.setItem('course_id', previousCourse.id);
      console.log("Reverted to previous course ID in localStorage:", previousCourse.id);
    }
  };

  // Soumission du feedback
  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Feedback submitted:", feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

    setSnackbarOpen(true); // Open snackbar
    handleFeedbackModalClose(); // Close the feedback modal
  };


  // Gestion du clic sur "Wrong Answer"
  const handleWrongAnswerClick = (index: number) => {
    const currentMessage = messages[index];
    const previousMessage = index > 0 ? messages[index - 1] : null;
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
    setSelectedAiMessage(currentMessage.content);
    setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
    setModalOpen(true);
    setButtonHovered(true); // Set button to hover state
  };

  // Fermeture du modal de "Wrong Answer"
  const handleCloseWrongAnswerModal = () => {
    setModalOpen(false);
    setButtonHovered(false); // Reset button hover state
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
           
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? '#EBE2FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          
          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary" endIcon={<img src={icon_verify} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-4">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="bg-custom p-2 rounded-xl inline-block text-left">
                          {message.fileType ? (
                            <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)} // Pass the index here
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          
          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px' // Pour l'espace à droite afin que le texte n'écrive pas sur l'icône
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>
      </div>

      
      <PopupWrongAnswer
        open={modalOpen}
        onClose={handleCloseWrongAnswerModal}
        selectedFilter={selectedFilter}
        onSubmit={handleSubmitFeedback}
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
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;









/* DERNIER CODE A JOUR QUI AFFICHE LES MESSAGE IA ET STUDENT
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import PopupFeedback from '../components/PopupFeedback';

const drawerWidth = 240;

const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id'));
  const [modalOpen, setModalOpen] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';



  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };


  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);


  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);


  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    console.log("Selected option from menu:", option);
    const selectedCourse = courseOptions.find(course => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      console.log("Updated course ID in localStorage:", selectedCourse.id);
      if (ALLOWED_COURSE_IDS.includes(selectedCourse.id)) {
        setPreviousFilter(selectedFilter);
        setModalOpen(true);
      }
    }
    setAnchorEl(null);
  };


  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };


  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    console.log("User sending a message:", newMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding new human message:", prevMessages);
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages state after adding new human message:", updatedMessages);
      return updatedMessages;
    });

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    console.log("Adding Lucy's loading message:", loadingMessage);

    setMessages((prevMessages) => {
      console.log("Messages state before adding loading message:", prevMessages);
      const updatedMessages = [...prevMessages, loadingMessage];
      console.log("Messages state after adding loading message:", updatedMessages);
      return updatedMessages;
    });

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];
    console.log("Message history before submission:", messageHistory);

    onSubmit(messageHistory, inputValue);
  };


  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid'
      const university = localStorage.getItem('university') || 'default_university';

      console.log("Retrieved from localStorage:", {
        chatSessionId,
        courseId,
        username,
        university,
        uid,
      });

      const lastMessageIndex = messageHistory.length - 1;
      console.log("Last message index before streaming:", lastMessageIndex);

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university
      })) {
        console.log("Received a bunch of response packets:", packetBunch);

        for (const packet of packetBunch) {
          console.log("Packet:", packet);
          if (typeof packet === 'string') {
            answer = packet.replace(/\|/g, "");
            console.log("Accumulated partial answer so far: (for string)", answer);
          } else {
            if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
              console.log("Accumulated answer so far:", answer);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
              console.log("Accumulated cited documents so far:", answerDocuments);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
              console.log("Error encountered during streaming:", error);
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: prevMessages[lastMessageIndex].id,
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          console.log("Messages state after processing a packet:", updatedMessages);
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: "Lucy",
        type: 'ai',
        uid: uid,
        input_message: inputValue,
      };

      console.log("Message AI to be saved:", Message_AI_to_save);

      await saveMessageAIToBackend(Message_AI_to_save);

    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error during submission:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };


  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    setMessages([]);
  
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
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
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          setConversations(validConversations.reverse());
        }
      }
    } else {
      console.error("UID is undefined. Cannot create new conversation.");
    }
  };


  const handleConversationClick = async (chat_id: string) => {
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    try {
      const chatHistory = await getChatHistory(chat_id);
      setMessages(chatHistory);
      setShowChat(true);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setPopup({
        type: 'error',
        message: "Failed to fetch chat history. Please try again later.",
      });
    }
  };


  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };


  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };


  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);


  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);


  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFilter(previousFilter);
    localStorage.setItem('course_id', courseOptions.find(course => course.name === previousFilter)?.id || '');
  };


  const handleSubmitFeedback = (feedback: string) => {
    console.log("Feedback submitted:", feedback);
    setModalOpen(false);
    setSelectedFilter(previousFilter);
    localStorage.setItem('course_id', courseOptions.find(course => course.name === previousFilter)?.id || '');
  };


  const handleWrongAnswerClick = (index: number) => {
    const currentMessage = messages[index];
    const previousMessage = index > 0 ? messages[index - 1] : null;
    console.log("Previous Message:", previousMessage);
    console.log("Current Message:", currentMessage);
  };






  //CODE FOR DISPLAY
  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.chat_id}
                  onClick={() => handleConversationClick(conversation.chat_id)}
                  sx={{
                    borderRadius: '8px',
                    margin: '5px 0',
                    backgroundColor: activeChatId === conversation.chat_id ? '#EBE2FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
                </ListItem>
              ))
            ) : (
              <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
                You have no conversations yet
              </Typography>
            )}
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>

                <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div 
              onClick={handleDropDownClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                ...getBackgroundColor(selectedFilter) 
              }}>
              <Typography 
                sx={{ 
                  fontWeight: '500', 
                  fontSize: '0.875rem', 
                  marginRight: '8px', 
                  color: getBackgroundColor(selectedFilter).color 
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: getBackgroundColor(selectedFilter).color 
                }} 
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary" endIcon={<img src={icon_verify} alt="Verify Icon" style={{ width: '20px', height: '20px' }} />}>
                    Based on verified data from {universityDomain}.edu
                  </Button>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <Button variant="outlined" color="primary" onClick={() => navigate('/about')}>
                    Give us some feedbacks
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow p-4 bg-white overflow-auto">
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-4">You</span>
                          <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                        </div>
                        <div className="bg-custom p-2 rounded-xl inline-block text-left">
                          {message.fileType ? (
                            <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start mx-20">
                      <div className="max-w-3/4 w-full flex items-center">
                        {message.content === '' ? (
                          <div className="flex items-center">
                            <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                            <div className="ml-2">
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
                            </div>
                          </div>
                        ) : (
                          <AIMessage
                            messageId={message.id}
                            content={message.content}
                            personaName={message.personaName}
                            citedDocuments={message.citedDocuments}
                            isComplete={isComplete}
                            hasDocs={!!message.citedDocuments?.length}
                            handleFeedback={(feedbackType: FeedbackType) => {
                              console.log(`Feedback received: ${feedbackType}`);
                            }}
                            handleWrongAnswerClick={() => handleWrongAnswerClick(index)} // Pass the index here
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                maxRows={6}
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph} style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                    paddingRight: '48px' // Pour l'espace à droite afin que le texte n'écrive pas sur l'icône
                  },
                }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>
      </div>

      <PopupFeedback
        open={modalOpen}
        onClose={handleCloseModal}
        selectedFilter={selectedFilter}
        onSubmit={handleSubmitFeedback}
      />
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;
*/

