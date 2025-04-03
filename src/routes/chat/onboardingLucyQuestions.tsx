import React, { useState, useRef,} from 'react';
import { motion } from 'framer-motion';
import { useNavigate,} from 'react-router-dom';

//Firestore, Firebase
import { db } from '../../auth/firebase';
import { doc, updateDoc} from 'firebase/firestore';

//Use Auth for user info
import { useAuth } from '../../auth/hooks/useAuth';
import { useChat } from '../../auth/hooks/useChat';

//Components used
import { AIMessage } from '../../components/main_components/MessagesWEB';
import { usePopup } from '../../components/main_components/Popup/popup';
import PopupWrongAnswer from '../../components/main_components/Popup/PopupWrongAnswer';
import LandingPage from '../../components/main_components/LandingPageImprove'; // Import du composant LandingPage
import StudentProfileDialog from '../../components/main_components/Popup/StudentProfileDialog'; // Import the dialog component
import  PopupEventSoonAvailable  from '../../components/main_components/Popup/PopupEventSoonAvailable';
import  PopupOnboardingSocialThread  from '../../components/main_components/Popup/Popup_Onboarding_SocialThread';
import PopupOnboardingProfile from '../../components/main_components/Popup/Popup_Onboarding_Profile';
import PopupOnboardingModifyConv from '../../components/main_components/Popup/Popup_Onboarding_ModifyConv';
import EventDetailsSidebar from '../../components/main_components/EventDetailsSidebar';
import Calendar from '../../components/main_components/Calendar_StudentProfile';
import Kanban from '../../components/main_components/Kanban_StudentProfile';

//Interfaces
import {EventStudentProfile, SocialThread} from '../../interfaces/interfaces_eleve';
 
//Mui Icons
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit'; // Icône pour "Renommer"
import DeleteIcon from '@mui/icons-material/Delete'; // Icône pour "Supprimer"
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

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
import StopIcon from '@mui/icons-material/Stop';

//Other
import { FaArrowDown } from 'react-icons/fa'; // Import an arrow down icon
import '../styles.css'; // Import du fichier CSS pour le gradient
import '../../index.css';


//Hooks import
import { useOnboarding } from './hooks/useOnboarding';
import { useMessage } from './hooks/useMessage';
import { useConversations } from './hooks/useConversations';
import { useUserProfile } from './hooks/useUserProfile';
import { useUIState } from './hooks/useUIState';




//For Topic of the conversations
const topicColors: { [key: string]: string } = {
  "Financial Aids": "#27AE60", // Vert
  "Events": "#E67E22", // Orange
  "Policies": "#2980B9", // Bleu
  "Housing": "#8E44AD", // Violet
  "Courses": "#EAC117", // Jaune
  "Chitchat": "#7F8C8D", // Jaune
  "Default": "#7F8C8D" // Gris
};

const drawerWidth = 270;

const OnboardingLucyQuestions: React.FC = ()=> {

  //1. Paramètres graphiques et responsivité
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const messageMarginX = isSmallScreen ? 'mx-2' : 'mx-20';

  //2. Contexte utilisateur et Authentification
  const { user, logout, chatIds } = useAuth();
  const { conversations, setConversations, messages, setMessages, isLandingPageVisible} = useChat();

  //3. Messages et gestion du Chat
  //const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(localStorage.getItem('chat_id')); // TODO : Changer pour ne plus avoir localStorage
  const [cancelConversation, setCancelConversation] = useState(false);
  const cancelConversationRef = useRef(false);
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null);
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  //4. Onboarding
  //const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const hasMetadataOnboarding = messages.some(msg => msg.METADATAONBOARDING);
  const [showOnboardingSocialThreadPopup, setShowOnboardingSocialThreadPopup] = useState(false);
  const [ShowOnboardingProfilePopup, setShowOnboardingProfilePopup] = useState(false);
  const [showOnboardingModifyConvPopup, setShowOnboardingModifyConvPopup] = useState(false);

  //5. Conversations et Social Threads
  //const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHistory, setIsHistory] = useState(true);
  const [socialThreads, setSocialThreads] = useState<SocialThread[]>([]);
  const [loadingSocialThreads, setLoadingSocialThreads] = useState(false);
  const [isSocialThread, setIsSocialThread] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPrivate, setIsPrivate] = useState(false); // false = Public, true = Private

  //6. Événements et gestion du Calendrier
  const [events, setEvents] = useState<EventStudentProfile[]>([]);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' ou 'events'
  const [eventDisplayMode, setEventDisplayMode] = useState('kanban'); // 'kanban' ou 'calendar'
  const [selectedEvent, setSelectedEvent] = useState<EventStudentProfile | null>(null);


  //7. UI, Modales et Menus
  //const [isLandingPageVisible, setIsLandingPageVisible] = useState(!isOnboardingActive && messages.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false); // potentiellement doublon avec modalOpen
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const [drawerOpen, setDrawerOpen] = useState(!isSmallScreen);
  const [sidebarOpen, setSidebarOpen] = useState(false); // potentiellement doublon avec drawerOpen
  const { popup, setPopup } = usePopup();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [parametersMenuAnchorEl, setParametersMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);


  //8. Others
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(Math.floor(Math.random() * 41) + 10);
  const generateUniqueId = (): number => Date.now() + Math.floor(Math.random() * 1000);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [hasNewContent, setHasNewContent] = useState(false);


  //from userprofile
  const {handleProfileMenuClick,handleLogout,handleDeleteAccount,handleProfileMenuClose, handleParametersMenuClick, handleParametersMenuClose } = useUserProfile({setEvents,setProfileMenuAnchorEl,setParametersMenuAnchorEl,setProfilePicture,});

  //from UIstate
  const {toggleDrawer,hasTak,lastAiMessageId} = useUIState({isSmallScreen,messages,drawerOpen,scrollableDivRef,setDrawerOpen,setOnlineUsers,setIsAtBottom,setNewMessagesCount,setParametersMenuAnchorEl,});

  //from conversations
  const {formatDate, handleMenuOpen,handleMenuClose, handlePrivacyChange, handleRename, handleDelete, handleConversationClick, handleNewConversation, updateThreadTypeLocally,} = useConversations({isStreaming, setSelectedFilter,setIsPrivate,setCurrentView,setRelatedQuestions,setUnreadCount,setActiveChatId,cancelConversationRef,setCancelConversation,setIsStreaming,});

  //from useMessage
  const {onSubmit, handleSendMessageFromLandingPage, handleSendTAKMessage, handleSendCOURSEMessage, handleSendMessageSocraticLangGraph, handleInputKeyPressSocraticLangGraph, scrollToBottom, scrollToBottomNewMessage, handleSourceClick, handleSubmitWrongAnswerFeedback, handleWrongAnswerClick, handleFeedbackClick, handleCloseWrongAnswerModal,} = useMessage({generateUniqueId,inputValue, setInputValue, isStreaming, setIsStreaming, setHasNewContent, scrollableDivRef, setIsComplete, setRelatedQuestions, isAtBottom, setIsAtBottom, setNewMessagesCount, endDivRef, cancelConversationRef, setCancelConversation, setSelectedAiMessage, setSelectedHumanMessage, setModalOpen, setSnackbarOpen,});

  //Passing variables like setInputValue needed to run correclty and output the functions
  const {handleSendSCHOOLMessage,handleSendYEARMessage,handleSendLINKEDINMessage,handleSendMAJORMINORMessage,handleSendCOMPLIANCEMessage,} = useOnboarding({setInputValue,setRelatedQuestions,setIsComplete,setIsStreaming,onSubmit,generateUniqueId,hasStartedStreaming,setHasStartedStreaming,});

  

  const onboardingMessages = [
    { question: "What is your current school?", metadata: "SCHOOL" },
    { question: "What year are you in?", metadata: "YEAR" },
    { question: "What is you linkedin URL?", metadata: "LINKEDIN" },
    { question: "What is your major and minor?", metadata: "MAJOR&MINOR" },
    { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" },
  ];

  // Récupère précisément le dernier message qui possède la propriété METADATAONBOARDING
  const currentOnboardingMessage = [...messages].reverse().find(msg => msg.METADATAONBOARDING);
    // Récupère précisément le nom de l'étape actuelle ou une chaîne vide si aucun message n'est trouvé
  const currentMetadataOnboarding = currentOnboardingMessage?.METADATAONBOARDING || '';
    // Détermine l'index de l'étape actuelle dans onboardingMessages
  const currentStepIndex = onboardingMessages.findIndex(
    step => step.metadata === currentMetadataOnboarding
    );
    // Calcule précisément la progression en fonction de l'étape actuelle
  const totalSteps = onboardingMessages.length;
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressPercent = ((completedSteps + 1) / totalSteps) * 100; //dans le return
  // Vérifie précisément si c'est la dernière étape
  const isLastStep = currentStepIndex === totalSteps - 1; //dans le return


  const variants = {
      initial: { opacity: 0, x: -50 }, // Légèrement hors de l'écran à gauche
      animate: { opacity: 1, x: 0 },   // Complètement visible au centre
      exit: { opacity: 0, x: 50 },     // Glisse vers la droite
    };



//des fonctions pour events je sais pas encore ou le mettre pour l instant
  const handleEventClick = (event: EventStudentProfile) => {
    setSelectedEvent(event);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
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
            right: isSmallScreen && drawerOpen ? '20vw' : '0', // Laisse 20% de l'écran à droite si Drawer ouvert
            width: isSmallScreen && drawerOpen ? '80vw' : '100%', // Ajuste la largeur
            overflow: 'hidden', // Désactive le scroll interne
          }}
        >


          {/* Sidebar with menu conversation history or socialThreads */}
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
                zIndex: 49,
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
            {/* header avec boutons de menu et nouvelle conversation */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <IconButton aria-label="open menu" onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                {drawerOpen ? <KeyboardDoubleArrowLeftIcon /> : <MenuIcon />}
              </IconButton>
              {isSmallScreen ? (
                <nav aria-label="mobile profile menu">
                  <Box style={{ padding: '10px', borderTop: `0px solid ${theme.palette.divider}` }}>
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="profile"
                        style={{ width: '50px', height: '50px' }}
                        className="rounded-full object-cover cursor-pointer"
                        //onClick={(event) =>handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                        onClick={(event) => {
                            if (!user?.onboardingComplete) { // quand l onboarding n est pas fini
                              setShowOnboardingProfilePopup(true);
                              return
                            } else {
                              handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);
                            }
                          }}
                      />
                    ) : (
                      <AccountCircleIcon
                        fontSize="inherit"
                        component="svg"
                        style={{
                          color: '#9e9e9e',
                          cursor: 'pointer',
                          margin: '0 auto 0 10px',
                          fontSize: '2.2rem',
                        }}
                        onClick={(event) =>
                          handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)
                        }
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
                      <MenuItem
                        onClick={() => {
                          handleDialogOpen();
                          handleProfileMenuClose();
                          setTimeout(toggleDrawer, 50);
                        }}
                      >
                        <ListItemIcon>
                          <ProfileEdit fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText primary="edit profile" />
                      </MenuItem>
                      <MenuItem
                        onClick={(event) => {
                          handleParametersMenuClick(event);
                          handleProfileMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" sx={{ color: '#011F5B' }} />
                        </ListItemIcon>
                        <ListItemText primary="parameters" />
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                        </ListItemIcon>
                        <ListItemText primary="log-out" />
                      </MenuItem>
                    </Menu>
                  </Box>
                </nav>
              ) : (
                <IconButton
                  onClick={() => {
                    if (!isLandingPageVisible) {
                      handleNewConversation();
                      if (isSmallScreen) toggleDrawer();
                    }
                  }}
                  aria-label="new conversation"
                  sx={{
                    color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                    cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLandingPageVisible || !user?.onboardingComplete}
                >
                  <MapsUgcRoundedIcon />
                </IconButton>
              )}
            </Box>

            {/* navigation de la sidebar */}
            <nav aria-label="sidebar navigation">
              <List component="ul" style={{ padding: '0 10px' }}>
                {/*
                ancien bouton "your events" commenté :
                <ListItem
                  component="li"
                  tabIndex={0}
                  onClick={...}
                  ...
                >
                  <ListItemIcon ...>
                    <DashboardIcon sx={{ fontSize: '22px' }} />
                  </ListItemIcon>
                  <ListItemText primary="your events" ... />
                </ListItem>
                */}

                {/* bouton conversation history */}
                <ListItem
                  component="li"
                  tabIndex={0}
                  onClick={() => {
                    setIsHistory(true);
                    if (isSmallScreen) setTimeout(toggleDrawer, 50);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsHistory(true);
                      if (isSmallScreen) setTimeout(toggleDrawer, 50);
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "8px",
                    backgroundColor: isHistory ? theme.palette.button.background : "transparent",
                    mb: 1,
                    "&:hover": {
                      backgroundColor: isHistory ? theme.palette.button.background : theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isHistory ? theme.palette.primary.main : theme.palette.sidebar,
                      minWidth: "35px",
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: "22px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Conversation history"
                    primaryTypographyProps={{
                      style: {
                        fontWeight: "500",
                        fontSize: "0.875rem",
                        color: isHistory ? theme.palette.primary.main : theme.palette.text.primary,
                      },
                    }}
                  />
                </ListItem>

                {/* bouton social thread */}
                <ListItem
                  component="li"
                  tabIndex={0}
                  onClick={() => {
                    setIsHistory(false);
                    if (isSmallScreen) setTimeout(toggleDrawer, 50);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsHistory(false);
                      if (isSmallScreen) setTimeout(toggleDrawer, 50);
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "8px",
                    backgroundColor: !isHistory ? theme.palette.button.background : "transparent",
                    mb: 1,
                    "&:hover": {
                      backgroundColor: !isHistory ? theme.palette.button.background : theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: !isHistory ? theme.palette.primary.main : theme.palette.sidebar,
                      minWidth: "35px",
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: "22px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color: !isHistory ? theme.palette.primary.main : theme.palette.text.primary,
                          }}
                        >
                          Social thread
                        </Typography>
                        {unreadCount > 0 && (
                          <Box
                            sx={{
                              backgroundColor: "red",
                              color: "white",
                              borderRadius: "8px",
                              padding: "2px 6px",
                              marginLeft: "8px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              minWidth: "20px",
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
            </nav>

            <Divider style={{ backgroundColor: 'lightgray' }} />

            {/* en-tête de la section affichée */}
            <section aria-label={isHistory ? "Conversation History" : "Last Public Interactions"}>
              <div
                className="text-center text-black-500 font-semibold mt-5 mb-2 flex justify-center items-center"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                <span>
                  {isHistory ? "Conversation History" : "Last Public Interactions"}
                </span>
                {!isHistory && unreadCount > 0 && (
                  <div
                    className="ml-2 flex items-center justify-center text-white"
                    style={{
                      backgroundColor: 'red',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      minWidth: '20px',
                      height: '20px',
                    }}
                  >
                    {unreadCount}
                  </div>
                )}
              </div>
            </section>

            {/* conteneur défilant pour la liste */}
            <Box style={{ flexGrow: 1, overflowY: 'auto', padding: '0 5px' }}>
              {isHistory ? (
                <nav
                  aria-label="Conversations list"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      document.getElementById('chat-section')?.focus();
                    }
                  }}
                >
                  <List component="ul">
                    {conversations.length > 0 ? (
                      conversations.map((conversation) => (
                        <ListItem
                          key={conversation.chat_id}
                          component="li"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            handleConversationClick(conversation.chat_id);
                            if (isSmallScreen) toggleDrawer();
                          }}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleConversationClick(conversation.chat_id);
                              if (isSmallScreen) toggleDrawer();
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            borderRadius: '8px',
                            margin: '2px 0',
                            paddingRight: '40px',
                            backgroundColor:
                              activeChatId === conversation.chat_id
                                ? theme.palette.button.background
                                : 'transparent',
                            '& .circle': {
                              backgroundColor:
                                activeChatId === conversation.chat_id
                                  ? conversation.thread_type === 'Private'
                                    ? '#6F6F6F'
                                    : '#4A90E2'
                                  : conversation.thread_type === 'Private'
                                  ? '#BDBDBD'
                                  : '#A9C2E8',
                            },
                            '@media (hover: hover) and (pointer: fine)': {
                              '&:hover': {
                                backgroundColor: theme.palette.button.background,
                                '& .circle': {
                                  backgroundColor:
                                    activeChatId === conversation.chat_id
                                      ? conversation.thread_type === 'Private'
                                        ? '#6F6F6F'
                                        : '#4A90E2'
                                      : conversation.thread_type === 'Private'
                                      ? '#6F6F6F'
                                      : '#4A90E2',
                                },
                              },
                            },
                          }}
                        >
                          <Box
                            className="circle"
                            sx={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              marginRight: '14px',
                              flexShrink: 0,
                            }}
                          />
                          <ListItemText
                            primary={conversation.name}
                            primaryTypographyProps={{
                              style: {
                                fontWeight: '500',
                                fontSize: '0.850rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                            }}
                            secondary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginTop: '2px',
                                }}
                              >
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
                                {conversation.topic && (
                                  <Box
                                    sx={{
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      color: topicColors[conversation.topic] || topicColors["Default"],
                                      backgroundColor: `${(topicColors[conversation.topic] || topicColors["Default"])}20`,
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
                            sx={{
                              maxWidth: 'calc(100% - 40px)',
                              flexShrink: 1,
                            }}
                          />

                          <IconButton
                            edge="end"
                            aria-label="More options"
                            //onClick={(e) => {e.stopPropagation();handleMenuOpen(e, conversation.chat_id);}}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user?.onboardingComplete) {
                                  setShowOnboardingModifyConvPopup(true); // Affiche la popup d'onboarding
                                  return; // Empêche explicitement l'ouverture du menu contextuel
                                }
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
                </nav>
              ) : (
                <nav aria-label="Social Thread list">
                  <List component="ul">
                    {loadingSocialThreads ? (
                      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : socialThreads.length > 0 ? (
                      socialThreads.map((thread) => {
                        const topic = thread.topic || "Default";
                        const color = topicColors[topic] || topicColors["Default"];
                        return (
                          <ListItem
                            key={thread.chat_id}
                            component="li"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                if (!user?.onboardingComplete) {
                                  setShowOnboardingSocialThreadPopup(true);
                                } else {
                                  handleConversationClick(thread.chat_id);
                                  if (isSmallScreen) toggleDrawer();
                                }
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
                            <Box
                              sx={{
                                width: '8px',
                                minWidth: '8px',
                                height: '38px',
                                backgroundColor: color,
                                borderRadius: '3px',
                                marginRight: '10px',
                              }}
                            />
                            <ListItemText
                              primary={thread.name}
                              secondary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    marginTop: '2px',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}
                                  >
                                    {formatDate(thread.created_at).slice(-17)}
                                  </Typography>
                                  {thread.topic && (
                                    <Box
                                      sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        color: topicColors[thread.topic] || topicColors["Default"],
                                        backgroundColor: `${(topicColors[thread.topic] || topicColors["Default"])}20`,
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
                                maxWidth: 'calc(100% - 40px)',
                                flexShrink: 1,
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
                            <Box
                              sx={{
                                width: '7px',
                                minWidth: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: thread.isRead ? 'transparent' : '#3155CC',
                                transition: 'background-color 0.3s ease',
                                marginLeft: 'auto',
                                marginRight: '3px',
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
                </nav>
              )}
            </Box>




            {/* menu contextuel for each conversations to rename or delete */}
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
                aria-label="Rename Conversation"
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
                aria-label="Delete conversation"
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
          </Drawer>






  
          <div
            className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60 pl-5' : 'pl-4'} ${
              iframeSrc ? 'mr-[33vw]' : ''
            }`}
          >
            <div
              className="relative p-4 flex items-center justify-between w-full"
              style={{ 
                backgroundColor: isLandingPageVisible ? '#F0F4FC' : 'transparent',
                borderColor: theme.palette.divider,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!drawerOpen && (
                  <>
                    <IconButton aria-label="Open menu" onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                      <MenuIcon />
                    </IconButton>
                    {!isSmallScreen && !isLandingPageVisible && (
                      <IconButton
                        onClick={handleNewConversation}
                        aria-label="New conversation"
                        sx={{
                          color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                          cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                        }}
                        disabled={isLandingPageVisible || !user?.onboardingComplete}
                      >
                        <MapsUgcRoundedIcon />
                      </IconButton>
                    )}
                  </>
                )}
              </div>

              <header aria-label="University logo header">
                <img 
                  src={theme.logo} 
                  alt="University Logo" 
                  style={{ height: '40px', marginRight: '10px' }} 
                  />
              </header>
              
              {/*
              <img
                src={theme.logo}
                alt="University Logo"
                style={{ height: '40px', marginRight: '10px' }}
              />
              */}
  
              {/* Vignette avec le nombre d'étudiants en ligne */}
              <div className="flex items-center flex-1 gap-x-4 overflow-hidden">
              <section aria-label="Online users" className="shrink-0">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0px',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  border: '1.3px solid #27AE60',
                  backgroundColor: 'transparent',
                  color: '#011F5B',
                  fontSize: '0.83rem',
                }}
              >
                {/*{onlineUsers} online users*/}
                {onlineUsers} {isSmallScreen ? "online" : "online users"}
                <div
                  style={{
                    width: '8.5px',
                    height: '8.5px',
                    borderRadius: '50%',
                    backgroundColor: '#27AE60',
                    marginLeft: '6px',
                  }}
                />
              </div>
              </section>

              {!user?.onboardingComplete && (
                <div className="flex-1">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`
                        h-2 bg-blue-600 rounded-full transition-all duration-500
                        ${isLastStep ? 'animate-[pulse_1.2s_ease-in-out_infinite]  ' : ''}
                        `}
                        style={{
                        width: progressPercent > 0 ? `${progressPercent}%` : '4px'
                        }}
                    />
                    </div>
                </div>
                )}
            </div>
  
              
  
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isSmallScreen ? (
                  <>
                    <IconButton
                      onClick={handleNewConversation}
                      aria-label="New conversation"
                      sx={{
                        color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                        cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isLandingPageVisible || !user?.onboardingComplete}
                    >
                      <MapsUgcRoundedIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <nav aria-label="Profile menu">
                    <IconButton
                      //onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                      onClick={(event) => {
                        if (!user?.onboardingComplete) {
                          setShowOnboardingProfilePopup(true);
                          return
                        } else {
                          handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);
                        }
                      }}
                      aria-label="Open profile menu"
                      aria-haspopup="true"
                      aria-controls={profileMenuAnchorEl ? 'profile-menu' : undefined}
                      aria-expanded={Boolean(profileMenuAnchorEl)}
                      sx={{ padding: 0, marginLeft: '5px' }}
                    >
                    {profilePicture ? (
                      <>
                        {console.log('Rendering profile picture with URL:', profilePicture)}
                        <img
                          src={profilePicture}
                          alt="Profile"
                          style={{
                            width: '55px',
                            height: '55px',
                          }}
                          className="rounded-full object-cover cursor-pointer"
                          //onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
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
                          
                        />
                      </>
                    )}
                    </IconButton>
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
                      
                      <MenuItem onClick={(event) => {
                      handleParametersMenuClick(event);
                      handleProfileMenuClose(); // 🔥 Ferme le menu après le clic
                    }}>

                      
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
                        style: {
                          borderRadius: '12px',
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      sx={{
                        mt: -1,
                        ml: -18,
                      }}
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
                    </nav>
                  </>
                )}
              </div>
            </div>
  







            {/* Content Area */}
            {currentView === 'chat' ? (
              isLandingPageVisible ? (
                <>
                  <LandingPage 
                    onSend={handleSendMessageFromLandingPage} 
                    onPrivacyChange={handlePrivacyChange} 
                    updateThreadTypeLocally={updateThreadTypeLocally}
                  />
                </>
              ) : (
                <section
                  aria-label="Chat content"
                  className="flex-grow overflow-y-auto"
                  style={{ backgroundColor: 'transparent', paddingBottom: '100px' }}
                >
                  <div
                    //className="flex flex-col space-y-2 p-4"
                    className={`flex flex-col space-y-2 ${isSmallScreen ? 'px-1 py-4' : 'p-4'}`}
                    ref={scrollableDivRef}
                    onScroll={() => {
                      const scrollDiv = scrollableDivRef.current;
                      if (scrollDiv) {
                        const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
                        const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
                        setIsAtBottom(atBottom);
                        if (atBottom) setNewMessagesCount(0);
                      }
                    }}
                    style={{
                      overflowY: 'auto',
                      maxHeight: '100%',
                    }}
                  >
                    {messages.map((message, index) =>
                      message.type === 'human' ? (
                        <div
                          key={message.id}
                          className={`flex justify-end ${messageMarginX} ${index === 0 ? 'mt-8' : ''}`}
                        >
                          <div className="max-w-3/4 w-full text-right">
                            <div className="flex items-center justify-end mb-1"></div>
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
                              errorData={message.ERROR}
                              confidenceScoreData={message.CONFIDENCESCORE}
                              instaclubData={message.INSTA_CLUB}
                              linkedinData={message.LINKEDIN}
                              insta2Data={message.INSTA2}
                              metadataOnboarding={message.METADATAONBOARDING || null}
                              handleSendSCHOOLMessage={handleSendSCHOOLMessage}
                              handleSendYEARMessage={handleSendYEARMessage}
                              handleSendLINKEDINMessage={handleSendLINKEDINMessage}
                              handleSendMAJORMINORMessage={handleSendMAJORMINORMessage}
                              handleSendCOMPLIANCEMessage={handleSendCOMPLIANCEMessage}
                              hasStartedStreaming={hasStartedStreaming}
                              
                            
                            />
                          </div>
                        </div>
                      )
                    )}
                    <div ref={endDivRef}></div>
                  </div>
                </section>
              )
            ) : (
              // events view
              
              <section className="events-view p-4" aria-label="Events view">
                <div className="events-toggle flex justify-between mb-4 ml-5">
                  {/* Sur la vue Kanban, afficher le bouton Calendar avec une icône 🗓 */}
                  {eventDisplayMode === 'kanban' ? (
                    <Button
                      variant="contained"
                      onClick={() => setEventDisplayMode('calendar')}
                      sx={{
                        backgroundColor: "#3155CC",
                        color: "white",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        padding: "2px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        "&:hover": {
                          backgroundColor: "#2448B3",
                        },
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />
                      Calendar View
                    </Button>
                  ) : (
                    // Sur la vue Calendar, afficher le bouton Kanban avec une icône 📌
                    <Button
                      variant="contained"
                      onClick={() => setEventDisplayMode('kanban')}
                      sx={{
                        backgroundColor: "#E67E22",
                        color: "white",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        padding: "2px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        "&:hover": {
                          backgroundColor: "#D46310",
                        },
                      }}
                    >
                      <ViewKanbanIcon fontSize="small" />
                      Kanban View
                    </Button>
                  )}

                </div>
              


                {eventDisplayMode === 'kanban' ? (
                  <Kanban events={events} onEventClick={handleEventClick} />
                ) : (
                  <Calendar events={events} onEventClick={handleEventClick} />
                )}
              </section>
            )}
  
            {relatedQuestions.length > 0 && (
              <section className="mt-4 px-8 flex justify-center" aria-label="Related questions">
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
              </section>
            )}
  
            {currentView === 'chat' && !isAtBottom && !isLandingPageVisible && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: 'fixed',
                  bottom: isSmallScreen ? '105px' : '85px',
                  transform: 'translateX(-50%)',
                  left: drawerOpen ? `calc(${drawerWidth}px + 41.5%)` : '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  zIndex: 1000,
                  transition: 'left 0.3s ease-in-out, background 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                }}
                aria-label="Scroll to bottom"
              >
                <FaArrowDown size={12} color="#011F5B" />
              </button>
            )}
            

            {currentView === 'chat' && !isLandingPageVisible && user?.onboardingComplete && (!hasTak || inputValue.trim() !== "") && (
            <>
              {isSmallScreen ? (
                // VERSION MOBILE AVEC MODIFICATIONS
                <div
                  className="fixed bottom-0 left-0 w-full flex flex-col items-center"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.6)', // effet glace avec semi-transparence
                    backdropFilter: 'blur(50px)',
                    WebkitBackdropFilter: 'blur(50px)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    padding: '12px',
                    minHeight: '80px',
                    maxHeight: inputValue.length > 0 ? '300px' : '150px',
                    overflow: 'hidden',
                    transition: 'max-height 0.2s ease-in-out',
                    zIndex: 2,
                  }}
                >
                  {/* Champ de saisie avec placeholder "Ask Lucy..." */}
                  <section id="chat-section" tabIndex={-1} aria-label="Chat section">
                  <TextField
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={1}
                    maxRows={6}
                    placeholder="Ask Lucy..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    InputProps={{
                      style: {
                        backgroundColor: 'rgba(255,255,255,0.6)', // même fond que le container pour homogénéité
                        borderRadius: '15px',
                        padding: '10px 15px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        border: 'none',
                      },
                    }}
                    inputProps={{ style: { color: '#333' } }}
                    sx={{
                      width: '100%',
                      maxWidth: '600px',
                      transition: 'height 0.2s ease-in-out',
                      '& fieldset': { border: 'none' },
                    }}
                  />
                  </section>

                  {/* Conteneur des boutons Public/Private et du bouton d'envoi */}
                  <div
                    className="w-full flex items-center justify-start"
                    style={{
                      maxWidth: '600px',
                      marginTop: '10px',
                      gap: '10px',
                    }}
                  >
                    {/* Bouton Public */}
                    <button
                      aria-label="Set conversation to public"
                      className="py-1 px-3 rounded-full flex items-center text-xs font-medium"
                      style={{
                        backgroundColor: !isPrivate ? '#D6DDF5' : '#E0E0E0', // pour public, fond light-blue (#D6DDF5)
                        color: !isPrivate ? '#3155CC' : '#6F6F6F', // et texte en bleu (#3155CC)
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => setIsPrivate(false)}
                    >
                      <LockOpenIcon fontSize="small" style={{ color: !isPrivate ? '#3155CC' : '#6F6F6F' }} /> Public
                    </button>

                    {/* Bouton Private */}
                    <button
                      aria-label="Set conversation to private"
                      className="py-1 px-3 rounded-full flex items-center text-xs font-medium"
                      style={{
                        backgroundColor: isPrivate ? '#F0F0F0' : '#E0E0E0',
                        //color: isPrivate ? '#6F6F6F' : '#3155CC',
                        color: '#6F6F6F',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => setIsPrivate(true)}
                    >
                      {/*<LockIcon fontSize="small" style={{ color: isPrivate ? '#6F6F6F' : '#3155CC' }} /> Private*/}
                      <LockIcon fontSize="small" style={{ color: '#6F6F6F' }} /> Private
                    </button>

                    {/* Bouton d'envoi (cercle identique à celui de desktop, mais avec flèche vers le haut) */}
                    <button
                      className="rounded-full flex items-center justify-center"
                      onClick={() => handleSendMessageSocraticLangGraph(inputValue)}
                      style={{
                        width: '30px',
                        height: '30px',
                        marginLeft: 'auto', // positionné à droite
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isStreaming ? '#F04261' : theme.palette.button_sign_in,
                      }}
                    >
                      {isStreaming ? (
                        <StopIcon style={{ color: '#fff', fontSize: '16px' }} />
                      ) : (
                        <ArrowUpwardIcon style={{ color: '#fff', fontSize: '16px' }} />
                      )}
                    </button>
                  </div>

                  {/* Phrase d'information sous le champ de saisie (version mobile courte) */}
                  <div className="flex justify-center w-full">
                    <p className="mt-3 mb-1 text-center text-[0.6rem] text-[#6F6F6F] opacity-80">
                      Lucy can make mistake. Consider checking important information.
                    </p>
                  </div>
                </div>
              ) : (
                // VERSION DESKTOP : exactement identique à l'ancien code
                <footer
                  role="contentinfo"
                  aria-label="Chat input footer"
                  className="footer"
                  style={{
                    position: 'fixed',
                    backgroundColor: '#F0F4FC',
                    bottom: 0,
                    left: drawerOpen ? `${drawerWidth}px` : '0',
                    width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
                    backdropFilter: 'blur(50px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: isSmallScreen ? '10px' : '20px',
                    paddingBottom: isSmallScreen ? '1px' : '20px',
                    zIndex: 2,
                    transition: 'left 0.3s, width 0.3s',
                    display: isLandingPageVisible ? 'none' : 'flex',
                  }}
                >
                  <div
                    style={{
                      maxWidth: isSmallScreen ? '90%' : '800px',
                      width: '100%',
                      margin: '0 auto',
                      padding: isSmallScreen ? '10px 0px 30px' : '0',
                      position: 'relative',
                    }}
                  >
                    <section aria-label="Chat input section">
                    <TextField
                      fullWidth
                      variant="outlined"
                      multiline
                      minRows={1}
                      maxRows={6}
                      placeholder={
                        isSmallScreen && drawerOpen
                          ? ""
                          : isSocialThread
                          ? "Write a public message in this discussion..."
                          : "Type your message..."
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                     // onKeyPress={handleInputKeyPressSocraticLangGraph}
                      onKeyDown = {handleInputKeyPressSocraticLangGraph}
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
                                    const docRef = doc(db, 'chatsessions', chatSessionId);
                                    await updateDoc(docRef, { thread_type: currentThreadType });
                                    console.log(`Le thread_type a été mis à jour en ${currentThreadType} pour le chat_id ${chatSessionId}`);
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
                                  setCancelConversation(true);
                                  setIsStreaming(false);
                                  cancelConversationRef.current = true;
                                } else {
                                  handleSendMessageSocraticLangGraph(inputValue);
                                }
                              }}
                              aria-label={isStreaming ? "Stop response" : "Send message"}
                              edge="end"
                            >
                              {isStreaming ? (
                                <div
                                  style={{
                                    backgroundColor: theme.palette.error.main,
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <StopIcon
                                    style={{
                                      color: '#fff',
                                      fontSize: '20px',
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    backgroundColor: theme.palette.button_sign_in,
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <ArrowForwardIcon
                                    style={{
                                      color: '#fff',
                                      fontSize: '20px',
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
                          padding: '17px 8px',
                          borderRadius: '20px',
                          fontWeight: '500',
                          color: theme.palette.text.primary,
                          paddingRight: '20px',
                          paddingLeft: '20px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                          border: 'none',
                        },
                      }}
                      inputProps={{
                        style: { color: theme.palette.text.primary },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': {
                            boxShadow: messages.some((msg) => msg.TAK && msg.TAK.length > 0)
                              ? "none"
                              : "0 4px 8px rgba(0, 0, 0, 0.2)",
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#6F6F6F',
                          opacity: 1,
                        },
                      }}
                    />
                    </section>

                    <div className="flex justify-center w-full">
                      <p
                        className="hidden sm:block mt-3 mb-1 text-center text-[0.6rem] text-[#6F6F6F] opacity-80 sm:mt-3 sm:mb-0"
                      >
                        Lucy can make mistakes. Look at the confidence score and consider checking important information.
                      </p>
                    </div>
                  </div>
                </footer>
              )}
            </>
          )}
              
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
          <EventDetailsSidebar event={selectedEvent} open={sidebarOpen} onClose={handleCloseSidebar} />

          {/* Affichage de la popup si nécessaire */}
          {openModal && <PopupEventSoonAvailable onClose={() => setOpenModal(false)} />}


        {showOnboardingSocialThreadPopup && (
        <PopupOnboardingSocialThread onClose={() => setShowOnboardingSocialThreadPopup(false)} />
        )}
        {ShowOnboardingProfilePopup && (
        <PopupOnboardingProfile onClose={() => setShowOnboardingProfilePopup(false)} />
        )}
        {showOnboardingModifyConvPopup && (
        <PopupOnboardingModifyConv onClose={() => setShowOnboardingModifyConvPopup(false)} />
        )}


  
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="info"
              sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
          </div>
        </motion.div>
      </ThemeProvider>
  );
  
};
export default OnboardingLucyQuestions;