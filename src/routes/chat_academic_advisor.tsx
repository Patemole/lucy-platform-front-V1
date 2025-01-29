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
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
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
import debounce from 'lodash/debounce';

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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

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
  */

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

      for await (const packetBunch of sendMessageFakeDemo({
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




  /* #FONCTION D'ORIGINE
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let answerTAK: AnswerTAK[] = [];
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
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();

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
  */

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
              onClick={() => navigate(`/dashboard/academic-advisor/${uid}`)}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <BarChartIcon />
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
              onClick={() => navigate('dashboard/analytics')}
              sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
            >
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText
                primary="Chat"
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
                <GroupIcon />
              </ListItemIcon>
              <ListItemText
                primary="Group"
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
            {/*
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
            */}
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

            {/*
            {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
              <Button
                variant="outlined"
                onClick={handleMeetingClick}
                sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
              >
                Contact my Academic Advisor
              </Button>
            )}
            */}
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

          {/* Display related questions or default questions just above the input field */}
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
                  Research resources for undergrad
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
                  Upcoming deadlines for registering classes
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
                  Who to contact for career advice?
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
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [conversations, setConversations] = useState<{ chat_id: string, name: string }[]>([]);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
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
      const student_profile = localStorage.getItem('student_profile') || 'no profile for academic advisor';

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
        university: university
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

  // POUR CRÉER UNE NOUVELLE CONVERSATION
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    // Clear messages
    setMessages([]);
  
    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Old Conversation" });
        }
  
        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New Conversation",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
        // Refresh chat sessions
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

  // POUR RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION ET L'AFFICHER
  const handleConversationClick = async (chat_id: string) => {
    // On met le chat_id de la conversation dans le localStorage
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    // Fetch chat history for the selected chat_id
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


  const handleSendTAKMessage = (TAK_message: string) => {
    // Set the TAK message as the input value
    setInputValue(TAK_message);
  
    // Trigger the same send message function for the placeholder
    handleSendMessageSocraticLangGraph();
  };

  // POUR CHANGER DE PAGE QUAND ON CLIQUE SUR TA'S HELP
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

  const handleSourceClick = (link: string) => {
    setIframeSrc(link); // Update the iframe source when a source is clicked
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
            <ListItem button onClick={() => navigate(`/dashboard/academic-advisor/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
            {messages.length > 0 && (
              <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Academic Advisor Dashboard
              </Typography>
            )}
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
                            handleSourceClick={handleSourceClick} //a RAJOUTER POUR OUVRIR LES SOURCES DANS LA PAGE
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



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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
  const [drawerOpen, setDrawerOpen] = useState(true);
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

  // POUR CRÉER UNE NOUVELLE CONVERSATION
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    // Clear messages
    setMessages([]);
  
    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Old Conversation" });
        }
  
        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New Conversation",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
        // Refresh chat sessions
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

  // POUR RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION ET L'AFFICHER
  const handleConversationClick = async (chat_id: string) => {
    // On met le chat_id de la conversation dans le localStorage
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    // Fetch chat history for the selected chat_id
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

  // POUR CHANGER DE PAGE QUAND ON CLIQUE SUR TA'S HELP
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
            <ListItem button onClick={() => navigate(`/dashboard/academic-advisor/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
            {messages.length > 0 && (
              <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Academic Advisor Dashboard
              </Typography>
            )}
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














/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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
  const [drawerOpen, setDrawerOpen] = useState(true);
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

  // POUR CRÉER UNE NOUVELLE CONVERSATION
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    // Clear messages
    setMessages([]);
  
    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
        // Refresh chat sessions
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

  // POUR RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION ET L'AFFICHER
  const handleConversationClick = async (chat_id: string) => {
    // On met le chat_id de la conversation dans le localStorage
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    // Fetch chat history for the selected chat_id
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

  // POUR CHANGER DE PAGE QUAND ON CLIQUE SUR TA'S HELP
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || '';

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
            <ListItem button onClick={() => navigate(`/dashboard/academic-advisor/${userId}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
            {messages.length > 0 && (
              <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Academic Advisor Dashboard
              </Typography>
            )}
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



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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
  const [drawerOpen, setDrawerOpen] = useState(true);
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

  // POUR CRÉER UNE NOUVELLE CONVERSATION
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    // Clear messages
    setMessages([]);
  
    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
        // Refresh chat sessions
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

  // POUR RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION ET L'AFFICHER
  const handleConversationClick = async (chat_id: string) => {
    // On met le chat_id de la conversation dans le localStorage
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    // Fetch chat history for the selected chat_id
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

  // POUR CHANGER DE PAGE QUAND ON CLIQUE SUR TA'S HELP
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || '';

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
            <ListItem button onClick={() => navigate(`/dashboard/academic-advisor/${userId}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
            {messages.length > 0 && (
              <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                Academic Advisor Dashboard
              </Typography>
            )}
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
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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

const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF"];

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

  // POUR CRÉER UNE NOUVELLE CONVERSATION
  const handleNewConversation = async () => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');
  
    // Clear messages
    setMessages([]);
  
    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);
  
    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];
  
        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }
  
        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });
  
        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });
  
        console.log("New conversation created with chat_id:", newChatId);
  
        // Refresh chat sessions
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

  // POUR RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION ET L'AFFICHER
  const handleConversationClick = async (chat_id: string) => {
    // On met le chat_id de la conversation dans le localStorage
    localStorage.setItem('chat_id', chat_id);
    setActiveChatId(chat_id);

    // Fetch chat history for the selected chat_id
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

  // POUR CHANGER DE PAGE QUAND ON CLIQUE SUR TA'S HELP
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



/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Box, Typography, Menu, MenuItem, Avatar, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';
import logo_lucy_face from '../lucy_face.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import '../index.css';
import { AIMessage } from '../components/Messages';
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

const SIDEBAR_WIDTH = 185; // Width of the sidebar

const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF"];

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

    // Clear messages
    setMessages([]);

    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

        console.log("New conversation created with chat_id:", newChatId);

        // Refresh chat sessions
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: SIDEBAR_WIDTH, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate(`/dashboard/academic-advisor/${uid}`)}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/chat/academic-advisor')}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Your Assistant Lucy
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : ''}</Typography>
              <Menu
                anchorEl={profileMenuAnchorEl}
                open={Boolean(profileMenuAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <div className="flex-grow p-4 bg-white overflow-auto">
            {messages.length === 0 ? (
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                  <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">
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
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-4">You</span>
                          <Avatar alt="User Avatar" src={picture_face} sx={{ width: 25, height: 25 }} />
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
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            )}
          </div>

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
          </div>
        </Box>
      </Box>

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






/*
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, Button, Box, Typography, Menu, MenuItem, Avatar, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';
import logo_lucy_face from '../lucy_face.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import '../index.css';
import { AIMessage } from '../components/Messages';
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

const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF"];

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

    // Clear messages
    setMessages([]);

    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

        console.log("New conversation created with chat_id:", newChatId);

        // Refresh chat sessions
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/dashboard/analytics')}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/chat/academic-advisor')}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Your Assistant Lucy
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : ''}</Typography>
              <Menu
                anchorEl={profileMenuAnchorEl}
                open={Boolean(profileMenuAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <div className="flex-grow p-4 bg-white overflow-auto">
            {messages.length === 0 ? (
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                  <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business models do you know?</Button>
                    <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">
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
              <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
                {messages.map((message, index) =>
                  message.type === 'human' ? (
                    <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}>
                      <div className="max-w-3/4 w-full text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="font-bold ml-4">You</span>
                          <Avatar alt="User Avatar" src={picture_face} sx={{ width: 25, height: 25 }} />
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
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            )}
          </div>

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
          </div>
        </Box>
      </Box>

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
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import logo from '../logo_lucy.png';
import icon_verify from '../verify_icon.png';
import logo_greg from '../photo_greg.png';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
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

const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF"];

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

    // Clear messages
    setMessages([]);

    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
      const userRef = doc(db, 'users', uid); // Define userRef here
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const chatsessions = userData.chatsessions || [];

        // Update the old chat session name
        if (oldChatId) {
          await updateDoc(doc(db, "chatsessions", oldChatId), { name: "Conversation history" });
        }

        // Add new chat session
        chatsessions.push(newChatId);
        await updateDoc(userRef, { chatsessions });

        // Add new chat session document
        await setDoc(doc(db, "chatsessions", newChatId), {
          chat_id: newChatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

        console.log("New conversation created with chat_id:", newChatId);

        // Refresh chat sessions
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo} alt="Lucy Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate(`/dashboard/student/${uid}`)}>
            <HomeIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/dashboard/analytics')}>
            <InsightsIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/about')}>
            <InfoIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Your Assistant Lucy
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={logo_greg} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : ''}</Typography>
              <Menu
                anchorEl={profileMenuAnchorEl}
                open={Boolean(profileMenuAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <div className="flex-grow p-4 bg-white overflow-auto">
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
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={endDivRef}></div>
              </div>
            )}
          </div>

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
        </Box>
      </Box>

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


 








/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/dashboard/academic-advisor/:uid')}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/chat/academic-advisor/:uid')}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/

