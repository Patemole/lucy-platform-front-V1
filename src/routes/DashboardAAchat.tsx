import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
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
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import logo from '../logo_lucy.png';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';

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
import LandingPage from '../components/LandingPageAA'; // Import du composant LandingPage

const drawerWidth = 240;
const ALLOWED_COURSE_IDS = ['Connf4P2TpKXXGooaQD5', 'tyPR1RAulPfqLLfNgIqF', 'Q1SjXBe30FyX6GxvJVIG', 'moRgToBTOAJZdMQPs7Ci'];

const waitingPhrases = [
  "I'm gathering relevant information from UPenn...",
  "Just a little longer...",
  "I'm pulling together more details for you...",
  "Almost done...",
  "Thank you for your patience...",
  "Just a few more seconds...",
  "I'm verifying the UPenn data...",
  "Still analyzing the information for you...",
  "Putting the final pieces together...",
  "Your answer is arriving shortly!"
];

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
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  //const [isIAResponseReady, setIsIAResponseReady] = useState(false); // Simulation de l'attente
  const [displayedText, setDisplayedText] = useState('');
  const typingTimeoutRef = useRef<number | null>(null);
  const phraseIntervalRef = useRef<number | null>(null);
  const chunkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phraseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const messageMarginX = isSmallScreen ? 'mx-2' : 'mx-20';


  //For display sentence above three dots for waiting
  useEffect(() => {
    if (isStreaming) {
      let isCancelled = false;
  
      // Wait for 5 seconds before starting to display the phrases
      const startDelayTimeout = setTimeout(() => {
        const phrasesCount = waitingPhrases.length;
  
        const startDisplayingPhrase = (phraseIndex: number) => {
          if (isCancelled) return;
  
          const currentPhrase = waitingPhrases[phraseIndex];
          if (!currentPhrase) {
            console.error(`Phrase at index ${phraseIndex} is undefined.`);
            return;
          }
  
          const words = currentPhrase.split(' ');
          let wordIndex = 0;
          setDisplayedText('');
  
          const displayNextWord = () => {
            if (isCancelled) return;
  
            if (wordIndex < words.length) {
              const nextWord = words[wordIndex];
              if (nextWord === undefined) {
                console.error(`Word at index ${wordIndex} is undefined.`);
                return;
              }
  
              setDisplayedText((prevText) =>
                prevText ? `${prevText} ${nextWord}` : nextWord
              );
              wordIndex += 1;
  
              wordTimeoutRef.current = setTimeout(displayNextWord, 100); // Delay between words
            } else {
              // Entire phrase displayed, wait 1 second then move to next phrase
              phraseTimeoutRef.current = setTimeout(() => {
                const nextPhraseIndex = (phraseIndex + 1) % phrasesCount;
                startDisplayingPhrase(nextPhraseIndex);
              }, 1500); // Wait 1 second before next phrase
            }
          };
  
          displayNextWord();
        };
  
        // Start with the first phrase after 5 seconds
        startDisplayingPhrase(0);
      }, 6000); // Delay of 5 seconds before showing any phrases
  
      return () => {
        isCancelled = true;
        if (wordTimeoutRef.current) {
          clearTimeout(wordTimeoutRef.current);
        }
        if (phraseTimeoutRef.current) {
          clearTimeout(phraseTimeoutRef.current);
        }
        if (startDelayTimeout) {
          clearTimeout(startDelayTimeout);  // Clear the delay if the component unmounts
        }
        setDisplayedText('');
      };
    } else {
      // Cleanup when isStreaming becomes false
      if (wordTimeoutRef.current) {
        clearTimeout(wordTimeoutRef.current);
      }
      if (phraseTimeoutRef.current) {
        clearTimeout(phraseTimeoutRef.current);
      }
      setDisplayedText('');
    }
  }, [isStreaming]);


  const splitPhraseIntoChunks = (phrase: string, chunkSize: number): string[] => {
    const words = phrase.split(' ');
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
  };



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

  // Function to handle menu close and course selection
  const handleMenuClose = async (option: string) => {
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

    // Masquer la LandingPage après l'envoi du premier message
    setIsLandingPageVisible(false);

    setRelatedQuestions([]);

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], message);
    setInputValue(''); // Clear the input field after sending
  };

  // Fonction pour envoyer le message à l'AI ou à l'API
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
      const major = localStorage.getItem('major') || 'default_major';
      const minor = localStorage.getItem('minor') || 'default_minor';
      const year = localStorage.getItem('year') || 'default_year';
      const faculty = localStorage.getItem('faculty') || 'default_faculty';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageSocraticLangGraph({
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

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();

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
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    setMessages([]); // Efface les messages
    setRelatedQuestions([]);
    setIsLandingPageVisible(true); // Affiche la LandingPage

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
                onClick={() => navigate('/about')}
                sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Give us feedback"
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
                  
                  {!isSmallScreen && (
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

            {/* Menu for course options */}
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
                    Beta
                  </div>
                  <IconButton onClick={handleNewConversation} sx={{ color: theme.palette.sidebar }}>
                    <MapsUgcRoundedIcon />
                  </IconButton>
                </>
              ) : (
                <>
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
                    Beta
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

          {/* Affichage de la LandingPage ou des messages */}
          {isLandingPageVisible ? (
            <LandingPage onSend={handleSendMessageFromLandingPage} />
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
                          <div className="ml-2 flex flex-col">
                            {/* Affichage des phrases dynamiques */}
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main, marginBottom: '8px' }}>
                              {displayedText}
                            </Typography>
                            {/* Spinner des trois points */}
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


                        {/*
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
                        */}





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

          {/* Champ de saisie en bas */}
          <div
            className="flex justify-center p-4"
            style={{
              backgroundColor: theme.palette.background.default,
              position: 'fixed',
              bottom: 0,
              width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
              transition: 'width 0.3s',
              display: isLandingPageVisible ? 'none' : 'flex', // Masquer quand la LandingPage est visible
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
                      onClick={() => handleSendMessageSocraticLangGraph(inputValue)}
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
