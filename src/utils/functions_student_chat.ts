import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';

// Define allowed course IDs
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

export const getBackgroundColor = (filter: string) => {
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



export const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>, setProfileMenuAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    setProfileMenuAnchorEl(event.currentTarget);
};


export const handleProfileMenuClose = (setProfileMenuAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    setProfileMenuAnchorEl(null);
};

export const handleLogout = (logout: () => void, navigate: ReturnType<typeof useNavigate>) => {
    logout();
    navigate('/auth/sign-in');
};

export const handleDropDownClick = (event: React.MouseEvent<HTMLElement>, setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    setAnchorEl(event.currentTarget);
};


export const handleMenuClose = (
    option: string,
    courseOptions: Course[],
    setSelectedFilter: React.Dispatch<React.SetStateAction<string>>,
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>,
    setPreviousFilter: React.Dispatch<React.SetStateAction<string>>,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    ALLOWED_COURSE_IDS: string[],
    selectedFilter: string
) => {
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

export const handleMenuCloseWithoutSelection = (setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    setAnchorEl(null);
};

export const handleSendMessageSocraticLangGraph = (
    inputValue: string,
    setShowChat: React.Dispatch<React.SetStateAction<boolean>>,
    setIsComplete: React.Dispatch<React.SetStateAction<boolean>>,
    setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
    messages: Message[],
    onSubmit: (messageHistory: Message[], inputValue: string) => Promise<void>
) => {
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

export const onSubmit = async (
    messageHistory: Message[],
    inputValue: string,
    setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    isCancelled: boolean,
    setIsCancelled: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
      const major = localStorage.getItem('major') || 'default_major';
      const minor = localStorage.getItem('minor') || 'default_minor';
      const year = localStorage.getItem('year') || 'default_year';
      const faculty = localStorage.getItem('faculty') || 'default_faculty';
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
          student_profile: student_profile,
          major: [major],
          minor: [minor],
          year: year,
          faculty: [faculty],

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
            university: university,
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

export const handleInputKeyPressSocraticLangGraph = (
    event: KeyboardEvent,
    handleSendMessageSocraticLangGraph: () => void
) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        handleSendMessageSocraticLangGraph();
        event.preventDefault();
    }
};

// POUR CRÉER UNE NOUVELLE CONVERSATION
export const handleNewConversation = async (
    uid: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>,
    setConversations: React.Dispatch<React.SetStateAction<{ chat_id: string, name: string }[]>>
) => {
    const newChatId = uuidv4();
    const oldChatId = localStorage.getItem('chat_id');

    // Clear messages
    setMessages([]);

    // Save new chat ID to localStorage
    localStorage.setItem('chat_id', newChatId);
    setActiveChatId(newChatId);

    if (uid) {
        const userRef = doc(db, 'users', uid);
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
export const handleConversationClick = async (
    chat_id: string,
    setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setShowChat: React.Dispatch<React.SetStateAction<boolean>>,
    setPopup: React.Dispatch<React.SetStateAction<{ type: string, message: string }>>
) => {
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
export const handleMeetingClick = (navigate: ReturnType<typeof useNavigate>) => {
    navigate('/contact/academic_advisor');
};

export const toggleDrawer = (drawerOpen: boolean, setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>) => {
    setDrawerOpen(!drawerOpen);
};


export const handleCloseModal = (
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedFilter: React.Dispatch<React.SetStateAction<string>>,
    previousFilter: string,
    courseOptions: Course[]
) => {
    setModalOpen(false);
    setSelectedFilter(previousFilter);
    localStorage.setItem('course_id', courseOptions.find(course => course.name === previousFilter)?.id || '');
};


export const handleSubmitFeedback = (
    feedback: string,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedFilter: React.Dispatch<React.SetStateAction<string>>,
    previousFilter: string,
    courseOptions: Course[]
) => {
    console.log("Feedback submitted:", feedback);
    setModalOpen(false);
    setSelectedFilter(previousFilter);
    localStorage.setItem('course_id', courseOptions.find(course => course.name === previousFilter)?.id || '');
};






/*

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend, getChatHistory } from '../api/chat';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';

// Define allowed course IDs
const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];

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




// Export functions
export {
  getBackgroundColor,
  handleProfileMenuClick,
  handleProfileMenuClose,
  handleMenuCloseWithoutSelection,
  handleConversationClick,
  handleMeetingClick,
  toggleDrawer,
  handleCloseModal,
  handleSubmitFeedback,
  handleLogout,
  handleDropDownClick,
  handleMenuClose,
  handleSendMessageSocraticLangGraph,
  onSubmit,
  handleInputKeyPressSocraticLangGraph,
  handleNewConversation,
};

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


const ALLOWED_COURSE_IDS = ["Connf4P2TpKXXGooaQD5", "tyPR1RAulPfqLLfNgIqF", "Q1SjXBe30FyX6GxvJVIG"];


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



export { 
    getBackgroundColor, 
    handleProfileMenuClick, 
    handleProfileMenuClose, 
    handleLogout, 
    handleDropDownClick, 
    handleMenuClose, 
    handleMenuCloseWithoutSelection,
    handleSendMessageSocraticLangGraph,
    handleInputKeyPressSocraticLangGraph,
    handleNewConversation,
    handleConversationClick,
    handleMeetingClick,
    toggleDrawer,
    handleCloseModal,
    handleSubmitFeedback };
*/

