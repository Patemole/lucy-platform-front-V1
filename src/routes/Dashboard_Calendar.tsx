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
import { Message } from '../interfaces/interfaces_eleve';

interface SocialThread {
  chat_id: string;
  name: string;
  created_at: any;
  topic?: string;
  university?: string;
  thread_type?: string;
}

const topicColors: { [key: string]: string } = {
  Upenn: '#8E44AD',
  'New Chat': '#E74C3C',
  Wharton: '#F1C40F',
  YouTube: '#2980B9',
  Default: '#7F8C8D',
};

const drawerWidth = 270;

// new calendar component
const CalendarComponent: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // hours from 8:00 to 23:00 (inclusive)
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Calendar</h2>
      <p className="text-sm text-gray-500 mb-4">Weekly view for the current week</p>
      <div className="overflow-auto">
        <div className="grid grid-cols-8 border border-gray-300">
          {/* header row: empty cell for the time labels */}
          <div className="border border-gray-300 bg-white"></div>
          {days.map((day) => (
            <div key={day} className="border border-gray-300 bg-white text-center py-2 font-medium">
              {day}
            </div>
          ))}
          {/* rows for each hour */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* time label */}
              <div className="border border-gray-300 bg-white text-center py-2">{`${hour}:00`}</div>
              {/* cells for each day */}
              {days.map((day) => (
                <div key={day + hour} className="border border-gray-300 h-16"></div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [isHistory, setIsHistory] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ chat_id: string; name: string }[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(messages.length === 0);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socialThreads, setSocialThreads] = useState<SocialThread[]>([]);
  const [loadingSocialThreads, setLoadingSocialThreads] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [cancelConversation, setCancelConversation] = useState(false);
  const cancelConversationRef = useRef(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    console.log('Delete Account clicked');
    handleParametersMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in', { replace: true });
  };

  const handleToggleHistory = () => {
    setIsHistory((prev) => !prev);
  };

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

  const handleRename = async () => {
    handleMenuClose();

    if (!selectedConversation) {
      alert('No conversation selected.');
      return;
    }
    const newName = prompt('Enter new name:', '');
    if (!newName) {
      alert('Conversation name cannot be empty.');
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
      alert('Conversation renamed successfully.');
    } catch (error) {
      console.error('Failed to rename the conversation:', error);
      alert('Failed to rename the conversation. Please try again.');
    }
  };

  const handleConversationClick = async (chat_id: string) => {
    setPrimaryChatId(chat_id);
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

  const handleNewConversation = async () => {
    console.log('new conversation');

    if (isLandingPageVisible) {
      console.log('cannot create a new conversation when landing page is visible.');
      return;
    }

    if (isStreaming) {
      setCancelConversation(true);
      cancelConversationRef.current = true;
      console.log('canceling ongoing conversation.');
      await new Promise((resolve) => setTimeout(resolve, 0));
      console.log('after timeout:', cancelConversationRef.current);
    }

    const university = user.university || 'University Name';
    const firstMessageContent = messages.length > 0 ? messages[0].content : 'Conversation history';
    console.log('first message content:', firstMessageContent);

    const newChatId = uuidv4();
    const oldChatId = chatIds[0];

    setIsStreaming(false);
    setMessages([]);
    setRelatedQuestions([]);
    setIsLandingPageVisible(true);
    setPrimaryChatId(newChatId);
    setActiveChatId(newChatId);

    setConversations((prevConversations) => [
      { chat_id: newChatId, name: 'New Chat' },
      ...prevConversations,
    ]);

    if (user.id) {
      const userRef = doc(db, 'users', user.id);
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const chatsessions = userData.chatsessions || [];
          chatsessions.push(newChatId);
          await updateDoc(userRef, { chatsessions });
          await setDoc(doc(db, 'chatsessions', newChatId), {
            chat_id: newChatId,
            name: 'New Chat',
            created_at: serverTimestamp(),
            modified_at: serverTimestamp(),
            university: university,
          });
          console.log(`new chat session created with chat_id: ${newChatId}`);

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
            console.log('updated conversations:', validConversations);
          }
        }
      } catch (error) {
        console.error('error managing user and chats:', error);
      }
    } else {
      console.error('user id is undefined. cannot create a new conversation.');
    }
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (!selectedConversation) {
      alert('No conversation selected.');
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to delete this conversation?');
    if (!confirmDelete) return;
    try {
      const conversationRef = doc(db, 'chatsessions', selectedConversation);
      await deleteDoc(conversationRef);
      setConversations((prev) => prev.filter((conv) => conv.chat_id !== selectedConversation));
      alert('Conversation deleted successfully.');
    } catch (error) {
      console.error('failed to delete the conversation:', error);
      alert('Failed to delete the conversation. Please try again.');
    }
  };

  const fetchSocialThreads = async () => {
    setLoadingSocialThreads(true);
    const university = user.university || 'upenn';
    try {
      const q = query(collection(db, 'chatsessions'), orderBy('created_at', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const threads = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            chat_id: data.chat_id,
            name: data.name,
            created_at: data.created_at,
            topic: data.topic,
            university: data.university || 'upenn',
            thread_type: data.thread_type || 'Public',
          };
        })
        .filter((thread) => thread.university === university && thread.thread_type === 'Public');

      setSocialThreads(threads);
    } catch (error) {
      console.error('error fetching social threads:', error);
    } finally {
      setLoadingSocialThreads(false);
    }
  };

  useEffect(() => {
    if (!isHistory) {
      fetchSocialThreads();
    }
  }, [isHistory]);

  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      if (user.id) {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const chatSessionIds = userData.chatsessions || [];
          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name)
                return { chat_id: chatId, name: chatSnap.data().name };
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
                  '@media (hover: hover) and (pointer: fine)': {
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  },
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
                  '@media (hover: hover) and (pointer: fine)': {
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '35px' }}>
                  {isHistory ? <PeopleIcon sx={{ fontSize: '22px' }} /> : <HistoryIcon sx={{ fontSize: '22px' }} />}
                </ListItemIcon>
                <ListItemText
                  primary={isHistory ? 'Social Thread' : 'Conversation History'}
                  primaryTypographyProps={{
                    style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary },
                  }}
                />
              </ListItem>
            </List>

            <Divider style={{ backgroundColor: 'lightgray' }} />

            <div className="text-center text-black-500 font-semibold mt-5 mb-4 text-sm">
              {isHistory ? 'Conversation History' : 'Last Public Interactions'}
            </div>

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
                            '&:hover': { backgroundColor: 'transparent' },
                            mr: '1px',
                          }}
                        >
                          <MoreHorizIcon fontSize="small" sx={{ color: 'gray', fontSize: '20px' }} />
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
                      const topic = thread.topic || 'Default';
                      const color = topicColors[topic] || topicColors['Default'];
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
                          <Box
                            sx={{
                              width: '9px',
                              minWidth: '9px',
                              height: '38px',
                              backgroundColor: color,
                              borderRadius: '3px',
                              marginRight: '8px',
                            }}
                          />
                          <ListItemText
                            primary={thread.name}
                            secondary={`${formatDate(thread.created_at)} | ${topic}`}
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
                              style: { fontSize: '0.75rem', color: theme.palette.text.secondary },
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
                  Rename
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ padding: '8px', color: 'red', '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                <DeleteIcon fontSize="small" sx={{ marginRight: '8px' }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: '400' }}>
                  Delete
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
                          Log-out
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
                {isSmallScreen ? (
                  <></>
                ) : (
                  <>
                    {profilePicture ? (
                      <>
                        {console.log('Rendering profile picture with URL:', profilePicture)}
                        <img
                          src={profilePicture}
                          alt="Profile"
                          style={{ width: '55px', height: '55px' }}
                          className="rounded-full object-cover cursor-pointer"
                          onClick={(event) =>
                            handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)
                          }
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
                          onClick={(event) =>
                            handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)
                          }
                        />
                      </>
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
                              Edit Profile
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
                              Parameters
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
                              Log-out
                            </Typography>
                          }
                        />
                      </MenuItem>
                    </Menu>

                    <Menu
                      anchorEl={parametersMenuAnchorEl}
                      open={Boolean(parametersMenuAnchorEl)}
                      onClose={handleParametersMenuClose}
                      PaperProps={{
                        style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper },
                      }}
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

            {/* calendar section replaces the previous recommendations and placeholders */}
            <div className="pl-10 pr-4 transition-all duration-300">
              <CalendarComponent />
            </div>
          </div>
        </div>
        {/* render the StudentProfileDialog component */}
        <StudentProfileDialog open={dialogOpen} onClose={handleDialogClose} setProfilePicture={setProfilePicture} />
      </motion.div>
    </ThemeProvider>
  );
};

export default Dashboard_Calendar;