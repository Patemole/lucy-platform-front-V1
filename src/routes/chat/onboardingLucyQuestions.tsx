import React, { useState, useEffect, useRef,} from 'react';
import { motion } from 'framer-motion';
import { db } from '../../auth/firebase';
import { doc, updateDoc} from 'firebase/firestore';
import useAuthStore from '../../stores/useAuthStore';
import useChatStore from '../../stores/useChatStore';
import {EventStudentProfile, SocialThread} from '../../interfaces/interfaces_eleve';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  ThemeProvider, TextField, Button, Typography, IconButton,InputAdornment, 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import StopIcon from '@mui/icons-material/Stop';
import { FaArrowDown } from 'react-icons/fa'; // Import an arrow down icon
import '../styles.css'; // Import du fichier CSS pour le gradient
import '../../index.css';
import { useOnboarding } from './hooks/useOnboarding';
import { useMessage } from './hooks/useMessage';
import { useConversations } from './hooks/useConversations';
import { useUserProfile } from './hooks/useUserProfile';
import { useUIState } from './hooks/useUIState';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Popups from './components/Popups';
import ChatContent from './components/ChatContent';
import RelatedQuestions from './components/RelatedQuestions';
import ForcedFeedback, { useForcedFeedback } from '../../components/main_components/ForcedFeedback';


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

  //2. Contexte utilisateur et Authentification (Utilisation des stores Zustand)
  const { user, chatIds } = useAuthStore(); // Use Zustand store
  const {
    conversations,
    setConversations,
    messages,
    isLandingPageVisible,
    setMessages,
    setIsLandingPageVisible,
    isSocialThreadActive,
    setIsSocialThreadActive,
    isCurrentChatPrivate: isPrivate, // Renaming for consistency if needed
    _setIsCurrentChatPrivate: setIsPrivate,
    addNewConversation,
    renameConversation,
    deleteConversation,
    updateConversationPrivacy,
    setActiveChat,
    isStreamingResponse: isStreaming, // Renamed in store
    _setIsStreamingResponse: setIsStreaming, // Action in store
    unreadSocialThreadsCount: unreadCount, // Renamed in store
    _setUnreadSocialThreadsCount: setUnreadCount, // Action in store
    relatedQuestions, // From store
    _setRelatedQuestions: setRelatedQuestions, // Action in store
    abortController, // From store
    setAbortController, // Action in store
    fetchConversations, // Action from store
    fetchSocialThreads, // Action from store
    loadChatMessages, // Action from store
    clearChatState, // Action from store
    updateConversationTitleAndTopic, // Action from store
    markSocialThreadAsRead // Action from store
  } = useChatStore(); // Use Zustand store

  //3. Messages et gestion du Chat - some states might be directly from store now
  const [isComplete, setIsComplete] = useState(false); // Keep local UI state if not in store
  const [inputValue, setInputValue] = useState(''); // Keep local UI state
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false); // Keep local UI state
  const [activeChatId, setActiveChatId] = useState<string | null>(() => chatIds[0] || null); // Initialize from store, avoid localStorage directly here if possible
  const [cancelConversation, setCancelConversation] = useState(false); // Keep local UI state
  const cancelConversationRef = useRef(false); // Keep local ref
  const [selectedAiMessage, setSelectedAiMessage] = useState<string | null>(null); // Keep local UI state
  const [selectedHumanMessage, setSelectedHumanMessage] = useState<string | null>(null); // Keep local UI state
  const [isAtBottom, setIsAtBottom] = useState(true); // Keep local UI state
  const [newMessagesCount, setNewMessagesCount] = useState(0); // Keep local UI state
  const scrollableDivRef = useRef<HTMLDivElement>(null); // Keep local ref
  const endDivRef = useRef<HTMLDivElement>(null); // Keep local ref

  //4. Onboarding
  const hasMetadataOnboarding = Array.isArray(messages) && messages.some(msg => msg.METADATAONBOARDING);
  const [showOnboardingSocialThreadPopup, setShowOnboardingSocialThreadPopup] = useState(false); // Keep local UI state
  const [ShowOnboardingProfilePopup, setShowOnboardingProfilePopup] = useState(false); // Keep local UI state
  const [showOnboardingModifyConvPopup, setShowOnboardingModifyConvPopup] = useState(false); // Keep local UI state

  //5. Conversations et Social Threads
  const [isHistory, setIsHistory] = useState(true); // Keep local UI state
  const { socialThreads } = useChatStore(); // Get social threads from store
  const [isSocialThread, setIsSocialThread] = useState(false); // Use isSocialThreadActive from store?

  //6. Événements et gestion du Calendrier
  const [events, setEvents] = useState<EventStudentProfile[]>([]);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' ou 'events'
  const [eventDisplayMode, setEventDisplayMode] = useState('kanban'); // 'kanban' ou 'calendar'
  const [selectedEvent, setSelectedEvent] = useState<EventStudentProfile | null>(null);


  //7. UI, Modales et Menus
  const [modalOpen, setModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false); // potentiellement doublon avec modalOpen
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const [drawerOpen, setDrawerOpen] = useState(!isSmallScreen);
  const [sidebarOpen, setSidebarOpen] = useState(false); // potentiellement doublon avec drawerOpen
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
  const {
    formatDate,
    menuAnchorEl: conversationsMenuAnchorEl,
    selectedConversationIdForMenu,
    handleMenuOpen,
    handleMenuClose,
    handleConversationClick,
    handleNewConversationClick,
    handleRenameClick,
    handleDeleteClick,
    handlePrivacyToggleClick,
  } = useConversations();

  //from useMessage
  const {
      onSubmit,
      handleSendMessageFromLandingPage,
      handleSendTAKMessage,
      handleSendCOURSEMessage,
      handleSendMessageSocraticLangGraph,
      handleInputKeyPressSocraticLangGraph,
      scrollToBottom,
      scrollToBottomNewMessage,
      handleSourceClick,
      handleSubmitWrongAnswerFeedback,
      handleWrongAnswerClick,
      handleFeedbackClick,
      handleCloseWrongAnswerModal,
  } = useMessage({
      generateUniqueId,
      inputValue,
      setInputValue,
      setHasNewContent,
      scrollableDivRef,
      isAtBottom,
      setIsAtBottom,
      setNewMessagesCount,
      endDivRef,
      setSelectedAiMessage,
      setSelectedHumanMessage,
      setModalOpen,
      setSnackbarOpen,
  });

  //from onboarding
  const {
      handleSendSCHOOLMessage,
      handleSendYEARMessage,
      handleSendLINKEDINMessage,
      handleSendMAJORMINORMessage,
      handleSendCOMPLIANCEMessage,
  } = useOnboarding({
      generateUniqueId,
      hasStartedStreaming,
      setHasStartedStreaming,
      onSubmit,
  });

  const chatSessionId = chatIds[0] || 'default_chat_id';

  // Ajout du hook useForcedFeedback
  const { shouldShowFeedback, feedbackStatus, setFeedbackStatus } = useForcedFeedback();

  /*
   * NOTE: L'initialisation de l'application a été centralisée
   * --------------------------------------------------------
   * L'ancien useEffect qui appelait initializeApp() a été supprimé car l'initialisation
   * est maintenant gérée au niveau global dans App.tsx:
   * 
   * 1. Quand l'application démarre, App.tsx initialise l'écouteur d'authentification Firebase
   *    via useAuthStore.initializeAuthListener()
   * 
   * 2. Une fois l'utilisateur authentifié et ses données chargées, un useEffect dans App.tsx 
   *    déclenche automatiquement initializeAppLogic() 
   * 
   * 3. initializeAppLogic() (dans src/initialization/initializeAppLogic.ts) effectue toutes
   *    les initialisations nécessaires :
   *    - Chargement du profil utilisateur
   *    - Récupération des conversations
   *    - Configuration des écouteurs pour les threads sociaux
   *    - Chargement des messages initiaux
   * 
   * Cette approche centralisée garantit que l'initialisation se produit une seule fois
   * lors du démarrage de l'application, quel que soit le composant affiché en premier.
   */

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
  

  // Récupérer l'état de chargement directement depuis le store
  const isLoadingSocialThreads = useChatStore((state) => state.isLoadingSocialThreads);

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
          <Sidebar
            theme={theme}
            isSmallScreen={isSmallScreen}
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            profilePicture={profilePicture}
            user={user}
            isLandingPageVisible={isLandingPageVisible}
            isHistory={isHistory}
            setIsHistory={setIsHistory}
            profileMenuAnchorEl={profileMenuAnchorEl}
            handleProfileMenuClick={handleProfileMenuClick}
            handleProfileMenuClose={handleProfileMenuClose}
            handleParametersMenuClick={handleParametersMenuClick}
            handleLogout={handleLogout}
            handleDialogOpen={handleDialogOpen}
            conversations={conversations}
            handleNewConversation={handleNewConversationClick}
            setShowOnboardingProfilePopup={setShowOnboardingProfilePopup}
            handleConversationClick={handleConversationClick}
            activeChatId={useChatStore.getState().currentChatId}
            unreadCount={unreadCount}
            menuAnchorEl={conversationsMenuAnchorEl}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleRename={handleRenameClick}
            handleDelete={handleDeleteClick}
            socialThreads={socialThreads}
            loadingSocialThreads={isLoadingSocialThreads}
            topicColors={topicColors}
            setShowOnboardingModifyConvPopup={setShowOnboardingModifyConvPopup}
            setShowOnboardingSocialThreadPopup={setShowOnboardingSocialThreadPopup}
            formatDate={formatDate}
          />


  
          <div
            className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60 pl-5' : 'pl-4'} ${
              iframeSrc ? 'mr-[33vw]' : ''
            }`}
          >

            <TopHeader
              isLandingPageVisible={isLandingPageVisible}
              isSmallScreen={isSmallScreen}
              drawerOpen={drawerOpen}
              toggleDrawer={toggleDrawer}
              handleNewConversation={handleNewConversationClick}
              user={user}
              profilePicture={profilePicture}
              onlineUsers={onlineUsers}
              isLastStep={isLastStep}
              progressPercent={progressPercent}
              theme={theme}
              profileMenuAnchorEl={profileMenuAnchorEl}
              parametersMenuAnchorEl={parametersMenuAnchorEl}
              handleProfileMenuClick={handleProfileMenuClick}
              handleProfileMenuClose={handleProfileMenuClose}
              handleDialogOpen={handleDialogOpen}
              handleParametersMenuClick={handleParametersMenuClick}
              handleParametersMenuClose={handleParametersMenuClose}
              handleDeleteAccount={handleDeleteAccount}
              handleLogout={handleLogout}
              setShowOnboardingProfilePopup={setShowOnboardingProfilePopup}
            />
            
  

            {/* Content Area */}
            <ChatContent
            isLandingPageVisible={isLandingPageVisible}
            inputValue={inputValue}
            setInputValue={setInputValue}
            messages={messages}
            isComplete={isComplete}
            drawerOpen={drawerOpen}
            isSmallScreen={isSmallScreen}
            messageMarginX={messageMarginX}
            endDivRef={endDivRef}
            scrollableDivRef={scrollableDivRef}
            lastAiMessageId={lastAiMessageId}
            relatedQuestions={relatedQuestions}
            handleSendMessageFromLandingPage={handleSendMessageFromLandingPage}
            handleSendTAKMessage={handleSendTAKMessage}
            handleSendCOURSEMessage={handleSendCOURSEMessage}
            handleFeedbackClick={handleFeedbackClick}
            handleWrongAnswerClick={handleWrongAnswerClick}
            handleSourceClick={handleSourceClick}
            isStreaming={isStreaming}
            hasNewContent={hasNewContent}
            handleSendSCHOOLMessage={handleSendSCHOOLMessage}
            handleSendYEARMessage={handleSendYEARMessage}
            handleSendLINKEDINMessage={handleSendLINKEDINMessage}
            handleSendMAJORMINORMessage={handleSendMAJORMINORMessage}
            handleSendCOMPLIANCEMessage={handleSendCOMPLIANCEMessage}
            hasStartedStreaming={hasStartedStreaming}
            handlePrivacyChange={handlePrivacyToggleClick}
            setIsAtBottom={setIsAtBottom}
            setNewMessagesCount={setNewMessagesCount}
          />

          
          <RelatedQuestions relatedQuestions={relatedQuestions} setInputValue={setInputValue} />


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
                    padding: '12px 15px', // Ajuster le padding horizontal
                    minHeight: '70px', // Réduire un peu la hauteur min
                    // maxHeight: 'auto', // Laisser la hauteur s'adapter
                    // overflow: 'hidden', // Peut causer des problèmes avec multiline
                    transition: 'max-height 0.2s ease-in-out',
                    zIndex: 2,
                  }}
                >
                  {shouldShowFeedback() ? (
                    <ForcedFeedback />
                  ) : (
                    <>
                      {/* Nouvelle ligne pour icône, input, bouton envoi */}
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
                        {/* Icône Cadenas cliquable */}
                        <IconButton
                          onClick={() => updateConversationPrivacy(useChatStore.getState().currentChatId || '', !isPrivate)}
                          aria-label={isPrivate ? "Set conversation to public" : "Set conversation to private"}
                          size="medium" // Ajuster la taille si besoin
                          sx={{ color: isPrivate ? theme.palette.text.secondary : theme.palette.primary.main, padding: '6px' /* Ajuster padding */ }}
                        >
                          {isPrivate ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>

                        {/* Champ de saisie occupant l'espace restant */}
                        <TextField
                          variant="outlined"
                          multiline
                          minRows={1}
                          maxRows={4} // Limiter un peu plus ?
                          placeholder="Ask Lucy..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleInputKeyPressSocraticLangGraph} // Utiliser onKeyDown
                          InputProps={{
                            style: {
                              backgroundColor: 'rgba(255,255,255,0.8)', // Légèrement plus opaque pour la lisibilité
                              borderRadius: '15px',
                              padding: '8px 12px', // Ajuster le padding interne
                              fontSize: '1rem',
                              fontWeight: '500',
                              border: 'none',
                              flexGrow: 1, // Important
                              minWidth: 0, // Important pour flexbox
                            },
                          }}
                          inputProps={{ style: { color: '#333' } }}
                          sx={{
                            flexGrow: 1, // Important
                            minWidth: 0, // Important pour flexbox
                            '& fieldset': { border: 'none' },
                          }}
                        />

                        {/* Bouton d'envoi (identique) */}
                        <IconButton
                          onClick={() => {
                            if (isStreaming) {
                              if (abortController) {
                                console.log("Onboarding: Stopping stream via button click...");
                                abortController.abort();
                                setAbortController(null);
                                setIsStreaming(false);
                              }
                            } else {
                              handleSendMessageSocraticLangGraph(inputValue);
                            }
                          }}
                          aria-label={isStreaming ? "Stop response" : "Send message"}
                          size="medium"
                          sx={{
                            backgroundColor: isStreaming ? '#F04261' : theme.palette.button_sign_in,
                            color: '#fff',
                            width: '36px', // Légèrement plus grand ?
                            height: '36px',
                            '&:hover': {
                              backgroundColor: isStreaming ? '#D03050' : theme.palette.augmentColor({ color: { main: theme.palette.button_sign_in } }).dark,
                            }
                          }}
                        >
                          {isStreaming ? (
                            <StopIcon style={{ fontSize: '20px' }} />
                          ) : (
                            <ArrowUpwardIcon style={{ fontSize: '20px' }} />
                          )}
                        </IconButton>
                      </div>

                      {/* Phrase d'information sous le champ de saisie */}
                      <div className="flex justify-center w-full mt-2"> {/* Ajouter un peu de marge top */}
                        <p className="text-center text-[0.6rem] text-[#6F6F6F] opacity-80">
                          Lucy can make mistake. Consider checking important information.
                        </p>
                      </div>
                    </>
                  )}
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
                    {shouldShowFeedback() ? (
                      <ForcedFeedback />
                    ) : (
                      <>
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
                                  <IconButton onClick={() => updateConversationPrivacy(useChatStore.getState().currentChatId || '', !isPrivate)}>
                                    {isPrivate ? <LockIcon/> : <LockOpenIcon/>}
                                    <Typography variant="caption">{isPrivate ? 'Private' : 'Public'}</Typography>
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
                                      if (abortController) {
                                        console.log("Onboarding: Stopping stream via button click...");
                                        abortController.abort();
                                        setAbortController(null);
                                        setIsStreaming(false);
                                      }
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
                                boxShadow: messages.some((msg:any) => msg.TAK && msg.TAK.length > 0)
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
                      </>
                    )}
                  </div>
                </footer>
              )}
            </>
          )}
              
          </div>


          <Popups
            modalOpen={modalOpen}
            onCloseWrongAnswer={handleCloseWrongAnswerModal}
            onSubmitWrongAnswer={handleSubmitWrongAnswerFeedback}
            aiMessageContent={selectedAiMessage}
            humanMessageContent={selectedHumanMessage}
            dialogOpen={dialogOpen}
            onCloseDialog={handleDialogClose}
            setProfilePicture={setProfilePicture}
            selectedEvent={selectedEvent}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={handleCloseSidebar}
            openModal={openModal}
            closeModal={() => setOpenModal(false)}
            showOnboardingSocialThreadPopup={showOnboardingSocialThreadPopup}
            closeOnboardingSocialThread={() => setShowOnboardingSocialThreadPopup(false)}
            showOnboardingProfilePopup={ShowOnboardingProfilePopup}
            closeOnboardingProfile={() => setShowOnboardingProfilePopup(false)}
            showOnboardingModifyConvPopup={showOnboardingModifyConvPopup}
            closeOnboardingModifyConv={() => setShowOnboardingModifyConvPopup(false)}
            snackbarOpen={snackbarOpen}
            snackbarMessage={snackbarMessage}
            closeSnackbar={() => setSnackbarOpen(false)}
          />
  
       </div>

        </motion.div>
      </ThemeProvider>
  );
  
};
export default OnboardingLucyQuestions;