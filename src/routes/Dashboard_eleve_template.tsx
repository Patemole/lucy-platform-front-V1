
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

