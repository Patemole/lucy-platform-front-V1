import React, { useState, useEffect, useRef } from "react";
import {
  FiCheck,
  FiCopy,
  FiThumbsDown,
  FiThumbsUp,
  FiSend,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from 'react-router-dom';
import {
  AnswerCourse,
  AnswerDocument,
  AnswerImage,
  AnswerTAK,
  AnswerWaiting,
  ReasoningStep,
  AnswerREDDIT,
  AnswerINSTA,
  AnswerYOUTUBE,
  AnswerQUORA,
  AnswerINSTA_CLUB,
  AnswerLINKEDIN,
  AnswerINSTA2,
  AnswerERROR,
  AnswerACCURACYSCORE,
  Message

} from "../../interfaces/interfaces_eleve";
import { IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FeedbackType } from "../types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import LanguageIcon from '@mui/icons-material/Language';
import lucy_face_logotest from "../../testlucy3.png";
import certifiate_icon from "../../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from 'highcharts/highcharts-more';
import TrackPopup from './Popup/TrackPopup';
import { ThreeDots } from 'react-loader-spinner';
import remarkBreaks from 'remark-breaks';
import './MessageWEBCSS.css';
import { FiRefreshCw } from "react-icons/fi";
import { FiMessageSquare } from "react-icons/fi";
import { ListItemText } from "@mui/material";
import { Box,Drawer, Typography, ListItem, List } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from "@mui/material/Tooltip";

import useAuthStore from '../../stores/useAuthStore';
import { saveFeedback } from '../../api/chat';
import { Snackbar } from '@mui/material';
import useChatStore from '../../stores/useChatStore';
import useFeedbackStore from '../../stores/useFeedbackStore';





HighchartsMore(Highcharts);

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ChartData {
  chartType:
    | "line"
    | "bar"
    | "pie"
    | "column"
    | "doughnut"
    | "scatter"
    | "pyramid"
    | "gauge"
    | "bubble"
    | "treemap"
    | "waterfall";
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  series: {
    seriesName: string;
    data: { label: string; x: number; y: number; z?: number }[];
  }[];
}

interface AnswerCHART {
  answer_chart?: ChartData;
  answer_charts?: ChartData[];
}

interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  isGloballyStreaming?: boolean; // Renommée depuis isLoading
  isMessageLoading?: boolean; // Nouvelle prop pour l'état du message
  hasNewContent?: boolean;
  hasDocs?: boolean;
  images?: AnswerImage[] | null;
  takData?: AnswerTAK[] | null;
  CourseData?: AnswerCourse[] | null;
  waitingMessages?: AnswerWaiting[] | null;
  ReasoningSteps?: ReasoningStep[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;

  handleSendTAKMessage: (TAK_message: string) => void;
  handleSendSCHOOLMessage?: (school_message: string) => void; // 👈 optionnel
  handleSendYEARMessage?: (year_message: string) => void; // 👈 optionnel
  handleSendLINKEDINMessage?: (url: string) => void; // 👈 optionnel
  handleSendINSTAGRAMMessage?: (instagram_message: string) => void; // 👈 optionnel
  handleSendMAJORMINORMessage?: (data: { majors: string[]; minors: string[] }) => void;
  handleSendCOMPLIANCEMessage?: (payload: {termsAccepted: boolean; ageConfirmed: boolean;}) => void;

  handleSendCOURSEMessage: (COURSE_message: string) => void;
  drawerOpen: boolean;
  chartData?: AnswerCHART[] | null;
  redditData?: AnswerREDDIT[] | null;
  instaData?: AnswerINSTA[] | null;
  youtubeData?: AnswerYOUTUBE[] | null;
  quoraData?: AnswerQUORA[] | null;
  errorData?: AnswerERROR[] | null;
  confidenceScoreData?: AnswerACCURACYSCORE[] | null;
  instaclubData?: AnswerINSTA_CLUB[] | null;
  linkedinData?: AnswerLINKEDIN[]| null;
  insta2Data?: AnswerINSTA2[] | null;
  metadataOnboarding?: string | null; //for onboarding
  hasStartedStreaming?: boolean; // ✅ indique que le stream a démarré
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  isGloballyStreaming = false,
  isMessageLoading = false,
  hasNewContent = false,
  hasDocs,
  images,
  takData,
  CourseData,
  waitingMessages,
  ReasoningSteps,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  handleSendTAKMessage,
  handleSendSCHOOLMessage,
  handleSendYEARMessage,
  handleSendLINKEDINMessage,
  handleSendMAJORMINORMessage,
  handleSendCOMPLIANCEMessage,
  handleSendINSTAGRAMMessage,
  handleSendCOURSEMessage,
  drawerOpen,
  chartData,
  redditData,
  instaData,
  youtubeData,
  quoraData,
  errorData,
  confidenceScoreData,
  instaclubData,
  linkedinData,
  insta2Data,
  metadataOnboarding,
  hasStartedStreaming
}) => {
  // États pour la gestion des interactions utilisateur
  const { user } = useAuthStore(); // Au lieu de useAuth()
  const { currentChatId } = useChatStore();
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTrackPopupOpen, setIsTrackPopupOpen] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false);
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  
  const [selectedSchools, setSelectedSchools] = useState(
    user && Array.isArray(user.faculty) && user.faculty.length > 0 ? user.faculty : ['']
  );
  
  const [majors, setMajors] = useState(
    user && Array.isArray(user.major) && user.major.length > 0 ? user.major : ['']
  );
  
  const [minors, setMinors] = useState(
    user && Array.isArray(user.minor) && user.minor.length > 0 ? user.minor : ['']
  );
  const [learnerType, setLearnerType] = useState(user?.year || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [instagramUsername, setInstagramUsername] = useState(user?.instagram_username || '');
  const [termsChecked, setTermsChecked] = useState(user?.termsAccepted || false);
  const [ageChecked, setAgeChecked] = useState(user?.ageConfirmed || false); 
  

  const [isTextDisplayed, setIsTextDisplayed] = useState(false);
  const [showShadowSources, setShowShadowSources] = useState(false); // État pour afficher les shadow sources
  const [hasLoadedSources, setHasLoadedSources] = useState(false); // Suivi du chargement effectif des sources



  // États pour la gestion des messages
  const [messages, setMessages] = useState<string[]>([]);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  // État pour les étapes de raisonnement
  const [displayedReasoningSteps, setDisplayedReasoningSteps] = useState<ReasoningStep[]>([]);

  const [readyToDisplayStep, setReadyToDisplayStep] = useState(false);
  const prevIsMessageLoadingRef = useRef(isMessageLoading); // Pour détecter le changement

  //const showLoadingIndicator = isLoading && !hasNewContent;
  const showLoadingIndicator = isMessageLoading && content.trim() === '';

  const isResponseReceived = !isMessageLoading;

  // Thème et responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Ajustement de la taille de la police en fonction de la taille de l'écran
  const messageFontSize = isSmallScreen ? "custom-phone" : "text-lg";



  const yearOptions = [
    { label: "Freshman (1st year)", value: "Freshman" },
    { label: "Sophomore (2nd year)", value: "Sophomore" },
    { label: "Junior (3rd year)", value: "Junior" },
    { label: "Senior (4th year)", value: "Senior" },
    { label: "Grad 1 (5th year)", value: "Grad 1" },
    { label: "Grad 2 (6th year)", value: "Grad 2" },
  ];

  const navigate = useNavigate();

  console.log("🔍 citedDocuments:", citedDocuments);



  // ⏳ Ce useEffect permet d'ajouter un léger délai (400ms) après la fin du message de Lucy 
// avant d'afficher le bloc d'onboarding (ex: YEAR, SCHOOL, etc.). 
// Cela améliore la fluidité de l'expérience utilisateur en évitant que le bloc apparaisse 
// immédiatement en même temps que le texte IA.
  useEffect(() => {
    if (isResponseReceived) {
      const timeout = setTimeout(() => {
        setReadyToDisplayStep(true);
      }, 200);
  
      return () => clearTimeout(timeout);
    } else {
      setReadyToDisplayStep(false);
    }
  }, [isResponseReceived]);


// Dès que les Reasoning Steps commencent, on affiche les shadow sources
useEffect(() => {
  if (ReasoningSteps && ReasoningSteps.length > 0) {
    console.log("🔹 Reasoning Steps en cours → Affichage des shadow sources.");
    setShowShadowSources(true);
    setHasLoadedSources(false); // Reset du suivi des sources car on commence une nouvelle séquence
  }
}, [ReasoningSteps]);

// Dès que les sources réelles sont disponibles, on remplace les shadow sources
useEffect(() => {
  console.log("🔍 Écoute de citedDocuments :", citedDocuments);
  
  if (citedDocuments && Array.isArray(citedDocuments) && citedDocuments.length > 0) {
    console.log("✅ Sources disponibles → Masquage des shadow sources.");
    setShowShadowSources(false);
    setHasLoadedSources(true); // Marque que les sources ont été chargées
  }
}, [citedDocuments]);


useEffect(() => {
  if (confidenceScoreData && confidenceScoreData.length > 0) {
    // Dès que le score de confiance est reçu, on masque les shadow sources
    setShowShadowSources(false);
  }
}, [confidenceScoreData]);
  


  //RELOAD LE MESSAGE SI IL Y A EU UNE ERREUR
  const handleReload = (errorIndex: number) => {
    // Implement your reload logic here
    console.log(`Reload clicked for error at index ${errorIndex}`);
    // Example: You might want to call a prop function like props.onReloadError(errorIndex)
  };

  // Initialisation des messages avec le contenu initial
  useEffect(() => {
    if (content) {
      setMessages([content]);
    }
  }, [content]);


  // 2. Utilisez useEffect pour gérer l'affichage progressif des étapes
  useEffect(() => {
    // Si toutes les étapes ne sont pas encore affichées
    if (currentStepIndex < displayedReasoningSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prevIndex) => prevIndex + 1); // Incrémente l'index après 2 secondes
      }, 2000);

      // Nettoie le timer au cas où le composant serait démonté
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, displayedReasoningSteps.length]);


  useEffect(() => {
    console.log("Received testtttt ReasoningSteps:", ReasoningSteps);
    if (ReasoningSteps && ReasoningSteps.length > 0) {
      const interval = setInterval(() => {
        setDisplayedReasoningSteps((prev) => {
          if (prev.length < ReasoningSteps.length) {
            console.log("Adding new reasoning step:", ReasoningSteps[prev.length]);
            return [...prev, ReasoningSteps[prev.length]];
          } else {
            clearInterval(interval);
            console.log("All reasoning steps displayed.");
            return prev;
          }
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [ReasoningSteps]);

  // Gestion de l'affichage des étapes de raisonnement
  useEffect(() => {
    if (ReasoningSteps && ReasoningSteps.length > 0) {
      setDisplayedReasoningSteps(ReasoningSteps);
    }
  }, [ReasoningSteps]);

  // Efface les étapes de raisonnement lorsque la réponse est complète
  useEffect(() => {
    if (isComplete) {
      setDisplayedReasoningSteps([]);
    }
  }, [isComplete]);

  // Gestion de l'affichage unique de la waitingSentence
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0) {
      const waitingSentence = waitingMessages[0].Sentence1;

      if (!isWaiting) {
        setMessages((prevMessages) => {
          if (prevMessages.length >= 1 && prevMessages[1] !== waitingSentence) {
            const newMessages = [...prevMessages];
            newMessages.splice(1, 0, waitingSentence);
            return newMessages;
          }
          return prevMessages;
        });

        setIsWaiting(true);

        timer = setTimeout(() => {
          setMessages((prevMessages) =>
            prevMessages.filter((msg, idx) => !(idx === 1 && msg === waitingSentence))
          );
          setIsWaiting(false);
        }, 2000);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [waitingMessages, isWaiting]);

  // Gestion des mises à jour du contenu supplémentaire
  useEffect(() => {
    if (content) {
      setMessages((prevMessages) => {
        if (prevMessages[0] !== content) {
          if (isWaiting && prevMessages.length > 1) {
            return [...prevMessages.slice(0, 2), content, ...prevMessages.slice(2)];
          } else {
            return [...prevMessages, content];
          }
        }
        return prevMessages;
      });
    }
  }, [content, isWaiting]);

  // Fonction pour copier le contenu dans le presse-papiers
  const handleCopyClick = () => {
    navigator.clipboard.writeText(content);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  // Fonction pour gérer les retours d'information "mauvaise réponse"
  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    handleWrongAnswerClick(content);
    setTimeout(() => setFeedbackClicked(false), 500);
  };

  const handleTrackDataClick = () => {
    setIsTrackPopupOpen(true);
  };

  const handleChartSelection = (uniqueId: string) => {
    setSelectedCharts((prevSelected) =>
      prevSelected.includes(uniqueId)
        ? prevSelected.filter((id) => id !== uniqueId)
        : [...prevSelected, uniqueId]
    );
  };

  const handleConfirmTrack = () => {
    if (!chartData) {
      console.error("No chart data available to track.");
      return;
    }

    const chartsToTrack: AnswerCHART[] = selectedCharts.map((uniqueId) => {
      const [chartIndexStr, subChartIndexStr] = uniqueId.split('-');
      const chartIndex = parseInt(chartIndexStr, 10);
      const subChartIndex = parseInt(subChartIndexStr, 10);

      const chart = chartData[chartIndex];
      if (!chart) {
        console.error(`No chart found at index ${chartIndex}`);
        return undefined;
      }

      if (chart.answer_chart && subChartIndex === 0) {
        return { answer_chart: chart.answer_chart };
      } else if (chart.answer_charts && chart.answer_charts[subChartIndex]) {
        return { answer_chart: chart.answer_charts[subChartIndex] };
      } else {
        console.error(`No sub-chart found at index ${subChartIndex} for chartIndex ${chartIndex}`);
        return undefined;
      }
    }).filter(Boolean) as AnswerCHART[];

    if (chartsToTrack.length === 0) {
      console.warn("No valid charts selected to track.");
      return;
    }

    const userID = localStorage.getItem('userID');
    if (userID) {
      navigate(`/dashboard/enrollment/${userID}`, { state: { trackedCharts: chartsToTrack } });
    } else {
      console.error("User ID is not available in localStorage.");
    }

    setIsTrackPopupOpen(false);
    setSelectedCharts([]);
  };

  const handleReportClick = () => {
    console.log("Report is in building");
  };


  // Fonction pour gérer les clics sur le pouce en l'air
  const handleThumbsUp = async () => {
    if (!messageId || !currentChatId || !user?.id) return;
    
    // Trouver le message actuel et le message humain précédent dans les messages du store
    const allMessages = useChatStore.getState().messages;
    const currentMessage = allMessages.find(msg => msg.id === messageId);
    const currentMessageIndex = allMessages.findIndex(msg => msg.id === messageId);
    const previousHumanMessage = currentMessageIndex > 0 ? 
      allMessages.slice(0, currentMessageIndex).reverse().find(msg => msg.type === 'human') : 
      null;

    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    setThumbsUpClicked(true);
    setThumbsDownClicked(false);
    useFeedbackStore.getState().setFeedbackStatus(messageId, true);
    
    try {
      await saveFeedback({
        messageId,
        chatSessionId: currentChatId,
        isPositive: true,
        userId: user.id,
        aiMessageContent: currentMessage?.content || '',
        humanMessageContent: previousHumanMessage?.content || ''
      });

      setSnackbarMessage('Merci pour votre feedback positif !');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving positive feedback:', error);
      setSnackbarMessage('Une erreur est survenue lors de l\'enregistrement du feedback, mais votre choix a été pris en compte localement');
      setSnackbarOpen(true);
    }
  };

  const handleThumbsDown = async () => {
    if (!messageId || !currentChatId || !user?.id) return;
    
    // Trouver le message actuel et le message humain précédent dans les messages du store
    const allMessages = useChatStore.getState().messages;
    const currentMessage = allMessages.find(msg => msg.id === messageId);
    const currentMessageIndex = allMessages.findIndex(msg => msg.id === messageId);
    const previousHumanMessage = currentMessageIndex > 0 ? 
      allMessages.slice(0, currentMessageIndex).reverse().find(msg => msg.type === 'human') : 
      null;

    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    setThumbsDownClicked(true);
    setThumbsUpClicked(false);
    useFeedbackStore.getState().setFeedbackStatus(messageId, true);
    
    try {
      await saveFeedback({
        messageId,
        chatSessionId: currentChatId,
        isPositive: false,
        userId: user.id,
        aiMessageContent: currentMessage?.content || '',
        humanMessageContent: previousHumanMessage?.content || ''
      });

      setSnackbarMessage('Merci pour votre feedback négatif !');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving negative feedback:', error);
      setSnackbarMessage('Une erreur est survenue lors de l\'enregistrement du feedback, mais votre choix a été pris en compte localement');
      setSnackbarOpen(true);
    }
  };

  // Fonction pour gérer le clic sur une image
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fonction pour fermer l'image agrandie
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Fonction pour gérer les changements de checkbox
  const handleCheckboxChange = (option: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(option)
        ? prev.filter((answer) => answer !== option)
        : [...prev, option]
        
    );
  };

  // Fonction pour gérer les changements de l'input "Autre"
  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };





  // Fonction pour envoyer les réponses TAK
  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(", ");
    handleSendTAKMessage(message);
    setSelectedAnswers([]);
    setOtherInput("");
  };

  //To send selected school from onboarding message
  const handleSendSCHOOLClick = () => {
    const message = selectedSchools.join(", ");
    if (handleSendSCHOOLMessage && message) {
      handleSendSCHOOLMessage(message);
    }
    //setSelectedSchools([]);
  };


  const handleSendYEARClick = (year: string) => {
    if (handleSendYEARMessage && year) {
      handleSendYEARMessage(year);
    }
  };

  const handleSendLINKEDINClick = () => {
    if (handleSendLINKEDINMessage && linkedinUrl) {
      handleSendLINKEDINMessage(linkedinUrl);
    }
    //setLinkedinUrl('');
  };

  const handleSendINSTAGRAMClick = () => {
    if (handleSendINSTAGRAMMessage && instagramUsername) {
      handleSendINSTAGRAMMessage(instagramUsername);
    }
    //setInstagramUsername('');
  };

  const handleSendMajorMinorClick = () => {
    const cleanedMajors = majors.filter((m: string) => m.trim() !== '');
    const cleanedMinors = minors.filter((m: string) => m.trim() !== '');
  
    if (handleSendMAJORMINORMessage) {
      handleSendMAJORMINORMessage({ majors: cleanedMajors, minors: cleanedMinors });
    }
  
    // reset if needed
    //setMajors(['']);
    //setMinors(['']);
  };


  const handleSendCompliance = () => {
    if (handleSendCOMPLIANCEMessage) {
      handleSendCOMPLIANCEMessage({
        termsAccepted: true,
        ageConfirmed: true,
      });
    }
  
    // Reset si besoin
    //setTermsChecked(false);
    //setAgeChecked(false);
  };





  // Désactiver le bouton "Envoyer" si aucune réponse n'est sélectionnée ou si l'input "Autre" est vide
  const isSendDisabled =
    selectedAnswers.length === 0 && otherInput.trim() === "";

  // Logs pour vérifier le contenu de chartData
  useEffect(() => {
    console.log("ChartData reçu:", chartData);
  }, [chartData]);

  // Logs pour vérifier le contenu de chartData
  useEffect(() => {
    console.log("Condident score received:", confidenceScoreData);
  }, [confidenceScoreData]);

  const hasSocialThread =
  (redditData && redditData.length > 0) ||
  (instaData && instaData.length > 0) ||
  (youtubeData && youtubeData.length > 0) ||
  (quoraData && quoraData.length > 0) ||
  (instaclubData && instaclubData.length > 0) ||
  (linkedinData && linkedinData.length > 0) ||
  (insta2Data && insta2Data.length > 0);

  // --- Correction pour les blocs d'onboarding (Condition simplifiée) ---
  // Dépend maintenant uniquement de la présence de metadata et de la fin du chargement du message
  const shouldDisplaySchoolBlock = metadataOnboarding === 'SCHOOL' && !isMessageLoading;
  const shouldDisplayYearBlock = metadataOnboarding === 'YEAR' && !isMessageLoading;
  const shouldDisplayInstagramBlock = metadataOnboarding === 'INSTAGRAM' && !isMessageLoading;
  const shouldDisplayLinkedInBlock = metadataOnboarding === 'LINKEDIN' && !isMessageLoading;
  const shouldDisplayMajorMinorBlock = metadataOnboarding === 'MAJOR&MINOR' && !isMessageLoading;
  const shouldDisplayComplianceBlock = metadataOnboarding === 'COMPLIANCE' && !isMessageLoading;

  return (
    //<div className="py-5 px-5 flex -mr-6 w-full relative">
    <section
      role="main"
      aria-label="AI conversation content"
      className={`py-5 ${isSmallScreen ? "px-1" : "px-5"} flex -mr-6 w-full relative`}
     >
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
        >
          <img
            src={selectedImage}
            alt="Vue agrandie"
            className="shadow-lg"
            style={{
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar
                  alt="Avatar Lucy"
                  src={lucy_face_logotest}
                  sx={{ width: 28, height: 28 }}
                />
              </div>
            </div>
            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img
                src={certifiate_icon}
                alt="Icône de certificat"
                className="ml-1 w-4 h-4"
              />
            </div>
          </div>

          {displayedReasoningSteps && displayedReasoningSteps.length > 0 && (
            <div
                className={`mt-2 mb-4 ${!isSmallScreen ? "ml-8" : ""} text-justify ${messageFontSize}`}
                style={{ color: theme.palette.text.primary }}
            >
                <div className="flex items-center justify-between">
                    {showAllSteps ? (
                        // Mode "expand" : affichage vertical de toutes les étapes jusqu'à `currentStepIndex`
                        <ol className="ml-3">
                            {displayedReasoningSteps.slice(0, currentStepIndex + 1).map((step, index) => (
                                <li key={step.step} className="flex items-center mb-2">
                                             <div
                                               className="flex items-center justify-between rounded-full px-4 py-1"
                                               style={{
                                                 backgroundColor: isResponseReceived ? '#E0E3E6' : '#D6DDF5',
                                                 color: isResponseReceived ? '#7F8285' : '#3155CC',
                                                 fontSize: '0.875rem',
                                                 fontWeight: 'bold',
                                                 maxWidth: 'fit-content',
                                                 flex: 1,
                                               }}
                                             >
                                               <span className="mr-2">{step.step}.</span>
                                               <span>{step.description}</span>
                                             </div>
                                             {index === 0 && (
                                               <IconButton
                                                 aria-label="Collapse reasoning steps"
                                                 onClick={() => setShowAllSteps(false)}
                                                 style={{ marginLeft: '10px' }}
                                               >
                                                 <ExpandLessIcon />
                                               </IconButton>
                                             )}
                                          </li>

                            ))}
                        </ol>
                    ) : (
                        // Mode "normal" : affichage d'une seule étape (la plus récente)
                        <div className="flex items-center justify-between">
                            {currentStepIndex < displayedReasoningSteps.length ? (
                                <>
                                    <li
                                        className="flex items-center rounded-full px-4 py-1"
                                        style={{
                                            backgroundColor: isResponseReceived ? '#E0E3E6' : '#D6DDF5',
                                            color: isResponseReceived ? '#7F8285' : '#3155CC',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            maxWidth: 'fit-content',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span className="mr-2">{displayedReasoningSteps[currentStepIndex]?.step}.</span>
                                        <span>{displayedReasoningSteps[currentStepIndex]?.description}</span>
                                    </li>
                                    <IconButton aria-label="Expand reasoning steps" onClick={() => setShowAllSteps(true)} style={{ marginLeft: '10px' }}>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </>
                            ) : (
                                // Affiche "Reasoning Steps" lorsque toutes les étapes ont été montrées
                                <>
                                    <div
                                        className="flex items-center rounded-full px-4 py-1"
                                        style={{
                                            backgroundColor: '#E0E3E6',
                                            color: '#7F8285',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            maxWidth: 'fit-content',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span>Reasoning Steps</span>
                                    </div>
                                    {/* Icône pour expander même lorsque "Reasoning Steps" est affiché */}
                                    <IconButton aria-label="Expand reasoning steps" onClick={() => setShowAllSteps(true)} style={{ marginLeft: '10px' }}>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}



        {/* Bloc des sources : il s'affiche uniquement si le texte n'est pas encore affiché 
          et que soit le loader est actif, soit des sources réelles sont disponibles */}
        {!isTextDisplayed && (showShadowSources || (citedDocuments && citedDocuments.length > 0)) && (
          <div className={`mt-0 ${!isSmallScreen ? "ml-8" : ""} pb-3`}>
            {/* Titre : affiché uniquement si des sources réelles sont disponibles */}
            {(showShadowSources || (citedDocuments && citedDocuments.length > 0)) && (
              <div className="flex items-center mb-3">
                <LanguageIcon sx={{ width: 20, height: 20, marginRight: 1 }} />
                <span className="font-bold text-gray-900" style={{ fontSize: "1.1rem" }}>
                  Sources
                </span>
              </div>
            )}

    {/* Contenu : si le loader est actif, on affiche les boîtes skeleton avec les mêmes styles que les vraies sources */}
    {showShadowSources ? (
      <div
        className="sources-grid mt-2 grid grid-cols-5 gap-2"
        style={{ 
          width: "800px", 
          maxWidth: "100%" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded bg-gray-300"
            style={{
              height: "45px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 12px",
              flex: "1",
              minWidth: "0px",
            }}
          ></div>
        ))}
        <div
          className="animate-pulse rounded bg-gray-300"
          style={{
            height: "45px",
            width: "150px", // ✅ Contraindre chaque boîte à une largeur fixe
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 12px",
            flex: "1",
            //minWidth: "0px",
          }}
        ></div>
      </div>
    ) : (
      <div
        className="sources-grid mt-2 grid grid-cols-5 gap-2"
        style={{ width: "100%" }}
      >
        {citedDocuments?.slice(0, 4).map((document) => (
          <a
            key={document.document_id}
            className="group p-2 rounded-lg cursor-pointer flex items-center shadow transition-shadow duration-200 ease-in-out hover:shadow-lg"
            href="#"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              height: "45px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              flex: "1",
              minWidth: "0px",
            }}
            aria-label={`Open source: ${document.document_name}`}
            onClick={() => handleSourceClick(document.link)}
          >
            <div className="flex items-center w-full">
              <div style={{ width: "24px", height: "24px", flexShrink: 0 }}>
                <img
                  src={theme.logo}
                  alt="Source Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    aspectRatio: "1/1",
                    marginRight: "6px",
                  }}
                />
              </div>

              {/* Ajout de Tooltip autour du titre du document */}
              <Tooltip title={document.document_name} arrow>
              <span
                className="text-sm truncate group-hover:underline transition duration-200 ease-in-out"
                style={{
                  maxWidth: "75%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {document.document_name}
              </span>
              </Tooltip>
            </div>
          </a>
        ))}

        {citedDocuments && citedDocuments.length > 4 && (
          <div
            className="group p-2 rounded-lg cursor-pointer flex items-center justify-center shadow transition-shadow duration-200 ease-in-out hover:shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#555",
              height: "45px",
              minWidth: "80px",
              width: "auto",
              textAlign: "center",
              whiteSpace: "nowrap",
              padding: "0 12px",
            }}
            onClick={() => setShowSourcesSidebar(true)}
          >
            <span className="no-underline group-hover:underline transition duration-200 ease-in-out">
              View {citedDocuments.length - 4}+
            </span>
          </div>
        )}
      </div>
    )}
  </div>
)}



{showSourcesSidebar && (
  <Drawer
    anchor="right"
    open={showSourcesSidebar}
    onClose={() => setShowSourcesSidebar(false)}
    PaperProps={{
      sx: {
        width: 420, // ✅ Augmentation légère de la largeur
        p: 3,
        backgroundColor: "rgba(255, 255, 255, 0.4)", // ✅ Effet Glassmorphism plus clair
        backdropFilter: "blur(10px)", // ✅ Appliquer le flou uniquement sur la sidebar
        boxShadow: "none",
        borderRadius: "15px 0 0 15px",
      },
    }}
    BackdropProps={{
      style: { backgroundColor: "rgba(0, 0, 0, 0.1)" },
    }}
  >
    <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Titre */}
      <Typography variant="h6" sx={{ pb: 2, fontWeight: "bold", color: "black" }}>
        📖 All Sources
      </Typography>

      {/* Bouton Fermer (aligné avec le titre) */}
      <IconButton
        onClick={() => setShowSourcesSidebar(false)}
        sx={{ color: "red" }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Liste des sources */}
    {citedDocuments && citedDocuments.length > 0 ? (
      <List>
        {citedDocuments.map((document, index) => (
          <ListItem 
            key={index} 
            sx={{
              mb: 1,
              borderRadius: "10px", // ✅ Coins plus arrondis
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              padding: "12px", // ✅ Augmentation de l'espace autour des éléments
              display: "flex",
              alignItems: "center",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.8)" },
            }}
            button
            component="a"
            href={document.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Logo à gauche */}
            <Box sx={{ width: "28px", height: "28px", flexShrink: 0, marginRight: "12px" }}>
              <img
                src={theme.logo}
                alt="Source Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  aspectRatio: "1/1",
                }}
              />
            </Box>

            {/* Texte de la source */}
            <ListItemText
              primary={document.document_name}
              primaryTypographyProps={{
                fontSize: "1rem", // ✅ Texte légèrement plus grand
                fontWeight: "500",
                color: "black",
              }}
            />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography variant="body2" sx={{ color: "black" }}>
        No sources available.
      </Typography>
    )}
  </Drawer>
)}


            

          {/* Affichez l'indicateur de chargement tant que isLoading est vrai */}
          {(!takData || takData.length === 0) ? (
            showLoadingIndicator && (
              <div className="flex justify-start mt-2 pl-10 mb-2">
                <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
              </div>
            )
          ) : (
            <div>
              {/* Ajoutez ici le contenu pour le cas où `takData` existe et contient des éléments */}
            </div>
          )}


            {/* Social Thread Section */}
            {/* Social Thread Section */}
            {(redditData || instaData || youtubeData || quoraData || instaclubData || linkedinData) && (
            <>
                {/* Divider and Title, only displayed once */}
                {(redditData && redditData.length > 0) ||
                (instaData && instaData.length > 0) ||
                (youtubeData && youtubeData.length > 0) ||
                (quoraData && quoraData.length > 0) ||
                (instaclubData && instaclubData.length > 0) ||
                (linkedinData && linkedinData.length > 0) ? (
                <>
                    {/*<hr className="my-4 border-gray-300 ml-8 animate-fadeIn" /> {/* Animation ajoutée */}
                    <div
                    className="font-bold mb-3 ml-8 animate-fadeIn"
                    style={{
                        color: theme.palette.text.primary,
                        fontSize: '15px',
                    }}
                    >
                    Social Thread
                    </div>
                </>
                ) : null}

                {/* Reddit Section */}
                {redditData && redditData.length > 0 && (
                <div className="ml-8 mt-4">
                    {redditData.map((redditItem, index) => (
                    <div
                        key={index}
                        className="flex items-center p-2 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 animate-fadeInUp"
                        style={{
                        backgroundColor: '#F7F7F7',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                        animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                        }}
                    >
                        <div className="mr-3 flex-shrink-0">
                        <img
                            src="/logos/reddit_logo.png"
                            alt="Reddit Logo"
                            className="w-8 h-8"
                            style={{ width: '32px', height: '32px' }} // Ensures fixed dimensions
                        />
                        </div>
                        <div
                        className="flex-grow"
                        style={{ color: theme.palette.text.primary, fontSize: '14.5px' }}
                        >
                        {redditItem.comment}
                        </div>
                        <div className="flex items-center ml-3 space-x-1">
                        <button>
                            <FiThumbsUp className="text-gray-500 hover:text-orange-500" />
                        </button>
                        <span className="text-gray-700 font-bold">{redditItem.score}</span>
                        <button>
                            <FiThumbsDown className="text-gray-500 hover:text-blue-500" />
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* Quora Section */}
                {quoraData && quoraData.length > 0 && (
                <div className="ml-8 mt-4">
                    {quoraData.map((quoraItem, index) => (
                    <div
                        key={index}
                        className="flex items-center p-2 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 animate-fadeInUp"
                        style={{
                        backgroundColor: '#F7F7F7',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                        animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                        }}
                    >
                        <div className="mr-3 flex-shrink-0">
                        <img
                            src="/logos/medium_logo.png"
                            alt="Medium Logo"
                            className="w-8 h-8"
                            style={{ width: '32px', height: '32px' }} // Ensures fixed dimensions
                        />
                        </div>
                        <div
                        className="flex-grow text-sm"
                        style={{ color: theme.palette.text.primary }}
                        >
                        {quoraItem.comment}
                        </div>
                        <div className="flex items-center ml-3 space-x-1">
                        <button>
                            <FiThumbsUp className="text-gray-500 hover:text-orange-500" />
                        </button>
                        <span className="text-gray-700 font-bold">{quoraItem.score}</span>
                        <button>
                            <FiThumbsDown className="text-gray-500 hover:text-blue-500" />
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* YouTube, Instagram Reels, Instagram Club, and LinkedIn Combined Section */}
                {(youtubeData || instaData || instaclubData || linkedinData) && (
                <div className="ml-8 mt-4">
                    <div className="flex flex-wrap -mx-2">
                    {/* YouTube Items */}
                    {youtubeData?.map((youtubeItem, index) => {
                        const videoId = youtubeItem.link.split("v=")[1] || youtubeItem.link.split("/").pop();
                        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                        return (
                        <div key={`youtube-${index}`} className="p-2 w-full sm:w-1/2 lg:w-1/3" style={{ maxWidth: '300px' }}>
                            <div className="shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 animate-fadeInUp" style={{
                            backgroundColor: '#F7F7F7',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                            animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                            }}>
                            <a href={youtubeItem.link} target="_blank" rel="noopener noreferrer" className="relative block" style={{ width: '100%', height: '150px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                                <img src={thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black opacity-20" style={{ borderRadius: '8px 8px 0 0' }}></div>
                                <img src="/logos/youtube_logo.png" alt="YouTube Play Icon" className="absolute inset-0 w-12 h-12 m-auto" />
                            </a>
                            <div className="flex justify-between items-center p-2" style={{
                                paddingTop: '6px',
                                paddingBottom: '6px',
                                backgroundColor: '#F7F7F7',
                                borderTop: '1px solid #E0E0E0',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                            }}>
                                <div className="text-sm" style={{
                                color: theme.palette.text.primary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '75%',
                                }}>
                                {youtubeItem.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                {youtubeItem.nbr_view} views
                                </div>
                            </div>
                            </div>
                        </div>
                        );
                    })}

                    {/* Instagram Reels Items */}
                    {instaData?.map((instaItem, index) => (
                        <div key={`insta-${index}`} className="p-2 w-full sm:w-1/2 lg:w-1/3" style={{ maxWidth: '300px' }}>
                        <div
                            className="shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 animate-fadeInUp"
                            style={{
                            backgroundColor: '#F7F7F7',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                            animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                            }}
                        >
                            <a
                            href={instaItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block"
                            style={{
                                width: '100%',
                                height: '280px',
                                overflow: 'hidden',
                                borderRadius: '8px 8px 0 0',
                            }}
                            >
                            <img
                                src={instaItem.picture}
                                alt="Instagram Short Thumbnail"
                                className="w-full h-full object-cover rounded-t-md"
                                style={{ aspectRatio: '3/4' }}
                            />
                            <div
                                className="absolute inset-0 bg-black opacity-20"
                                style={{ borderRadius: '8px 8px 0 0' }}
                            ></div>
                            </a>
                            <div
                            className="flex justify-between items-center p-2 animate-fadeIn"
                            style={{
                                paddingTop: '6px',
                                paddingBottom: '6px',
                                backgroundColor: '#F7F7F7',
                                borderTop: '1px solid #E0E0E0',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                            }}
                            >
                            {/* Titre avec Image Instagram Personnalisée */}
                            <div
                                className="flex items-center text-sm"
                                style={{
                                color: theme.palette.text.primary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '70%',
                                }}
                            >
                                <img
                                src="/logos/insta_logo.png" // Remplacez par le chemin de votre image Instagram
                                alt="Instagram Icon"
                                className="mr-2"
                                style={{
                                    width: '16px', // Taille de l'icône Instagram
                                    height: '16px',
                                }}
                                />
                                {instaItem.title}
                            </div>
                            <div className="text-xs text-gray-500">
                                {instaItem.nbr_view} views
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}

            
                    {/* Instagram Club Items */}
                    {instaclubData?.map((clubItem, index) => (
                        <div key={`instaclub-${index}`} className="p-2 w-full sm:w-1/2 lg:w-1/3" style={{ maxWidth: '300px' }}>
                        <div className="shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 animate-fadeInUp" style={{
                            backgroundColor: '#F7F7F7',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                            animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                        }}>
                            <a href={clubItem.link} target="_blank" rel="noopener noreferrer" className="relative block animate-fadeIn" style={{ width: '100%', height: '88px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                            <img src={clubItem.picture} alt="Club Thumbnail" className="w-full h-full object-cover rounded-t-md" />
                            <div className="absolute inset-0 bg-black opacity-20" style={{ borderRadius: '8px 8px 0 0' }}></div>
                            </a>
                            <div className="p-2">
                            <div className="flex items-center">
                                <img src={clubItem.picture} alt="Club Avatar" className="w-8 h-8 rounded-full mr-2" />
                                <a href={clubItem.link} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 text-sm truncate" style={{ maxWidth: '70%' }}>
                                {clubItem.username}
                                </a>
                            </div>
                            <div className="mt-1 text-sm flex items-center" style={{
                                color: theme.palette.text.primary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {/* Instagram Logo in Front of the Title */}
                                <img
                                src="/logos/insta_logo.png" // Replace with your Instagram logo path
                                alt="Instagram Logo"
                                className="mr-1 ml-1"
                                style={{
                                    width: '14px',
                                    height: '14px',
                                }}
                                />
                                {clubItem.title}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>{clubItem.followers} followers</span>
                                <span>{clubItem.posts} posts</span>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}

                    {/* LinkedIn Items */}
                    {linkedinData && linkedinData.length > 0 && (
                        linkedinData.map((linkedinItem, index) => (
                        <div key={`linkedin-${index}`} className="p-2 w-full sm:w-1/2 lg:w-1/3" style={{ maxWidth: '300px' }}>
                            <div
                            className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center animate-fadeInUp"
                            style={{
                                backgroundColor: '#F7F7F7',
                                border: '1px solid #E0E0E0',
                                borderRadius: '8px',
                                boxShadow: '1px 1px 1px rgba(0.1, 0.1, 0.1, 0.1)',
                                height: '186px', // Adjust the height as needed
                                position: 'relative',
                                animationDelay: `${index * 100}ms`, // Optionnel : Délais pour stagger
                            }}
                            >
                            {/* Headline Banner */}
                            <div className="w-full h-24 overflow-hidden rounded-t-md animate-fadeIn">
                                <img
                                src={linkedinItem.headline}
                                alt="LinkedIn Headline"
                                className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Profile Picture */}
                            <div className="absolute top-16 flex justify-center w-full animate-fadeInUp">
                                <img
                                src={linkedinItem.picture}
                                alt={`${linkedinItem.name} Profile`}
                                className="w-16 h-16 rounded-full border-2 border-white"
                                style={{
                                    marginTop: '-50px', // Adjust to position the picture below the banner
                                }}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="mt-6 text-center px-4 flex flex-col items-center flex-grow">
                                <div
                                className="text-gray-700 mb-1 animate-fadeIn"
                                style={{
                                    color: '#555555',
                                }}
                                >
                                {linkedinItem.sentence}
                                </div>
                                <div className="mt-auto mb-4">
                                <a
                                    href={linkedinItem.link} // Navigates to the link when clicked
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center mt-3 px-4 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition duration-200 animate-fadeIn"
                                    style={{
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    }}
                                >
                                    <img
                                    src="/logos/linkedin_logo.png" // Replace with the path to your LinkedIn icon
                                    alt="LinkedIn Icon"
                                    className="mr-2"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                    }}
                                    />
                                    Connect
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </div>
                )}
            </>
            )}

      
            {/* ✅ Afficher "Answer" uniquement s'il y a des messages */}
            {messages.length > 0 && (!takData || takData.length === 0) && (
              <div className={`mt-0 ${!isSmallScreen ? "ml-8" : ""} pb-2 flex items-center`}>
                <FiMessageSquare style={{ width: 20, height: 20, marginRight: 8, color: theme.palette.text.primary }} />
                <span className="font-bold text-gray-900" style={{ fontSize: "1.1rem" }}>
                  Answer
                </span>
              </div>
            )}

            {/* Affichage des messages accumulés */}
            <div className="mobile-fullScreen-container">
              {!takData || takData.length === 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words ${
                      !isSmallScreen ? "ml-8" : ""
                    } text-left sm:text-justify leading-snug`}
                    style={{ color: theme.palette.text.primary }}
                  >
                    <ReactMarkdown
                      className="max-w-full"
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p
                            className="m-0 mb-md-gap leading-loose"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="inline-block font-semibold text-gray-800" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-500 hover:text-blue-700 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-4 space-y-2 leading-snug" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-snug" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal ml-4 mb-lg-gap leading-loose" {...props} />
                        ),
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-100 text-red-500 px-1 rounded" {...props}>
                              {children}
                            </code>
                          );
                        },
                        br: () => <br className="mb-sm-gap leading-extra-tight" />,
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold mt-lg-gap mb-md-gap leading-tight" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-semibold mt-md-gap mb-sm-gap leading-snug" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-medium mt-sm-gap mb-sm-gap leading-snug" {...props} />
                        ),
                      }}
                    >
                      {msg.replace(/\n/g, "  \n")}
                    </ReactMarkdown>
                  </div>
                ))
              ) : null}
            </div>






          {/* Add this section where appropriate in your JSX, e.g., after citedDocuments */}
          {errorData && errorData.length > 0 && (
            <div className={`mt-4 ${!isSmallScreen ? "ml-8" : ""} flex flex-col gap-4`}>
              {errorData.map((error, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center border border-red-500 bg-red-100 p-4 rounded-md"
                >
                  <span className="text-red-700 flex-grow">{error.errorSentence}</span>
                  <button
                    onClick={() => handleReload(index)}
                    className="mt-2 sm:mt-0 sm:ml-4 flex items-center text-red-700 hover:text-red-900"
                  >
                    <FiRefreshCw className="mr-2" />
                    Reload
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* VERSION QUI FONCTIONNE MAIS SANS LE TOOLTIP
          {confidenceScoreData && confidenceScoreData.length > 0 && (
            <div
              className={`mt-4 flex items-center ${
                !isSmallScreen ? "ml-8" : ""
              } gap-2`}
              style={{
                fontSize: "0.90rem",
                color: theme.palette.text.primary,
              }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  width: "14px", // Ajustez la largeur ici
                  height: "14px", // Ajustez la hauteur ici
                  backgroundColor:
                  parseFloat(confidenceScoreData[0].confidenceScore) >= 80
                      ? "#3DD957"
                      : parseFloat(confidenceScoreData[0].confidenceScore) >= 30
                      ? "#F97315"
                      : "#EF4361",
                }}
              ></div>
              <span style={{ fontWeight: 600 }}>Confidence score</span>
              <span>
                {confidenceScoreData[0].confidenceScore}%
              </span>
            </div>
          )}
          */}

          {/* VERSION AVEC LE TOOLTIP*/}
          {confidenceScoreData && confidenceScoreData.length > 0 && (
            //<Tooltip title="This score represents the level of confidence of the answer based on the sources available.\n The higher the value, the more reliable the response.">
            <Tooltip title={
              <>
                This score represents the level of confidence of the answer based on the sources available.<br />
                The higher the value, the more reliable the response.
              </>
            }>
              <div
                className={`mt-4 flex items-center ${!isSmallScreen ? "ml-8" : ""} gap-2 cursor-pointer`}
                style={{
                  fontSize: "0.90rem",
                  color: theme.palette.text.primary,
                }}
              >
                {/* Cercle de couleur */}
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    width: "14px",
                    height: "14px",
                    backgroundColor:
                      parseFloat(confidenceScoreData[0].confidenceScore) >= 80
                        ? "#3DD957"
                        : parseFloat(confidenceScoreData[0].confidenceScore) >= 30
                        ? "#F97315"
                        : "#EF4361",
                  }}
                ></div>

                {/* Texte + Pourcentage */}
                <span style={{ fontWeight: 600 }}>Confidence score</span>
                <span>{confidenceScoreData[0].confidenceScore}%</span>
              </div>
            </Tooltip>
          )}

            


          {/* Gestion des images */}
          {images && images.length > 0 && (
            <div
              className={`mt-4 flex justify-start ${
                !isSmallScreen ? "ml-8" : ""
              } gap-4`}
            >
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-1 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="w-120 h-64 object-cover rounded-lg shadow-lg"
                  />
                  {image.image_description && (
                    <p
                      className="text-sm mt-2 text-left"
                      style={{ color: theme.palette.text.secondary }}
                    >
                      {image.image_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}


          
          {/* Gestion des données TAK *
          {takData && takData.length > 0 && (
            <div
              className={`mt-4 p-4 rounded-lg shadow ${
                !isSmallScreen ? "ml-8" : ""
              } mb-6 `} // Ajout de "mb-6" pour plus de marge en dessous
              style={{ 
                maxWidth: "max-content",
                backgroundColor: theme.palette.background.paper,
                border: "0.5px solid #D1D5DB", // Bordure fine grise (#D1D5DB correspond à gray-300)

               }} // Utilisation de la largeur dynamique
            >
              {takData.map((tak, idx) => (
                <div key={idx} className="mb-4">
                  {/* Question *
                  <p className="text-left text-gray-800">{tak.question}</p>

                  {/* Options *
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 max-w-full">
                    {tak.answer_options.map((option, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${idx}-${i}`}
                          value={option}
                          checked={selectedAnswers.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                          className="mr-2 h-4 w-4 border-gray-300 rounded checked:bg-gray-500 checked:border-gray-600 focus:ring-gray-500"
                        />
                        <label
                          htmlFor={`option-${idx}-${i}`}
                          className="text-gray-800"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Other Specification *
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label
                        htmlFor={`other-${idx}`}
                        className="block mb-1 text-gray-800"
                      >
                        If other, please specify
                      </label>
                      <input
                        type="text"
                        id={`other-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Buttons *
                  <div className="flex justify-end mt-4 gap-x-4">
                    <button
                      onClick={() => console.log("Ignoré")}
                      className="flex items-center px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
                    </button>
                    <button
                      onClick={handleSendClick}
                      disabled={isSendDisabled}
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg ${
                        isSendDisabled
                          ? "bg-gray-300 cursor-not-allowed"
                          : "text-white bg-gray-800 hover:bg-gray-900"
                      } transition-colors`}
                    >
                      <FiSend className="mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gestion des données TAK */}
          {takData && takData.length > 0 && (
            <div
              className={`p-4 rounded-lg shadow ${
                !isSmallScreen ? "ml-8" : ""
              } mb-3`} // Ajout de "mt-6" pour une marge égale en haut et en bas
              style={{ 
                maxWidth: "max-content",
                backgroundColor: "rgba(255, 255, 255, 0.5)", // Effet glass
                backdropFilter: "blur(60px)", // Flou de l'arrière-plan
                border: "1px solid rgba(255, 255, 255, 0.2)", // Bordure transparente
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" // Ombre légère
              }}
              tabIndex={0} // Rendre le conteneur focusable
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSendDisabled && (!selectedAnswers.includes("Other") || otherInput)) {
                  handleSendClick();
                }
              }}
            >
              {takData.map((tak, idx) => (
                <div key={idx} className="mb-4">
                  {/* Question */}
                  <p className="text-left text-gray-800 mt-2">{tak.question}</p>

                  {/* Options */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 mb-6 max-w-full">
                    {tak.answer_options.map((option, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${idx}-${i}`}
                          value={option}
                          checked={selectedAnswers.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                          disabled={selectedAnswers.includes("Other")}
                          className="mr-2 h-4 w-4 border-gray-300 rounded checked:bg-gray-500 checked:border-gray-600 focus:ring-gray-500"
                        />
                        <label
                          htmlFor={`option-${idx}-${i}`}
                          className="text-gray-800"
                        >
                          {option}
                        </label>
                      </div>
                    ))}

                    {/* Option "Other" */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`other-${idx}`}
                        value="Other"
                        checked={selectedAnswers.includes("Other")}
                        onChange={() => handleCheckboxChange("Other")}
                        disabled={selectedAnswers.length > 0 && !selectedAnswers.includes("Other")}
                        className="mr-2 h-4 w-4 border-gray-300 rounded checked:bg-gray-500 checked:border-gray-600 focus:ring-gray-500"
                      />
                      <label
                        htmlFor={`other-${idx}`}
                        className="text-gray-800"
                      >
                        Other
                      </label>
                    </div>
                  </div>

                  {/* Input "Other Specification" */}
                  {selectedAnswers.includes("Other") && (
                    <div className="mt-4">
                      <label
                        htmlFor={`other-specification-${idx}`}
                        className="block mb-1 text-gray-800"
                      >
                        If other, please specify
                      </label>
                      <input
                        type="text"
                        id={`other-specification-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {/* Message d'erreur si le champ est vide */}
                      {isOtherSelected && !otherInput && (
                        <p className="mt-2 text-sm text-red-600">
                          Please specify a value for "Other" before sending.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end mt-4 -mb-2 gap-x-4">
                    <button
                      onClick={handleSendClick}
                      disabled={isSendDisabled || (selectedAnswers.includes("Other") && !otherInput)}
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg ${
                        isSendDisabled || (selectedAnswers.includes("Other") && !otherInput)
                          ? "bg-gray-300 cursor-not-allowed"
                          : "text-white bg-gray-800 hover:bg-gray-900"
                      } transition-colors`}
                    >
                      <FiSend className="mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}




          {/* Gestion dynamique des écoles avec au moins un menu déroulant visible */}
          
          {shouldDisplaySchoolBlock && (

            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <label className="block text-sm font-medium text-gray-800 mb-3">Select your school(s)</label>

              {(selectedSchools.length === 0 ? [''] : selectedSchools).map((school, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <select
                    //value={school}
                    value={selectedSchools[index] || ''}
                    onChange={(e) => {
                      const updatedSchools = [...selectedSchools];
                      updatedSchools[index] = e.target.value;
                      setSelectedSchools(updatedSchools);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white bg-no-repeat bg-right pr-10 focus:ring focus:ring-blue-100 focus:border-blue-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCA2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                    }}
                  >
                    <option value="" disabled>Select your school</option>
                    {(Array.isArray(theme.facultyOptions) ? theme.facultyOptions : []).map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>

                  {selectedSchools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSchools(selectedSchools.filter((_, i) => i !== index))}
                      className="text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {selectedSchools.length < 5 && (
                <button
                  type="button"
                  onClick={() => setSelectedSchools([...selectedSchools, ''])}
                  className="text-blue-700 text-sm hover:underline"
                >
                  + Add another school
                </button>
              )}

              <div className="flex justify-end mt-4 gap-x-4">
                <button
                  onClick={handleSendSCHOOLClick}
                  disabled={(selectedSchools.length === 0 || selectedSchools.every(school => school === ''))}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    (selectedSchools.length === 0 || selectedSchools.every(school => school === ''))
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  <FiSend className="mr-2" /> Send
                </button>
              </div>
            </div>
          )}





          {shouldDisplayYearBlock && (
            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                maxWidth: 'max-content',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              tabIndex={0}
            >
              <label className="block text-left text-sm font-medium text-gray-800 mt-2 mb-4">
                Select your current year
              </label>
              <div className="flex flex-col gap-2">
              {yearOptions.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setLearnerType(value);
                      handleSendYEARClick(value); // envoie la valeur correcte
                    }}
                    className={`w-full px-4 py-2 rounded-lg border text-sm text-left ${
                      learnerType === value
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-800 border-gray-300'
                    } hover:bg-gray-100`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}



          {shouldDisplayInstagramBlock && (
            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <label className="block text-left text-sm font-medium text-gray-800 mt-2 mb-3">
                Don't worry, just helps me get your vibe a bit better
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white px-2 py-1 w-full">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                    alt="Instagram"
                    className="w-5 h-5 mr-2"
                  />
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="Instagram username"
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSendINSTAGRAMClick}
                  disabled={!instagramUsername}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    !instagramUsername
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'text-white bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}


          {shouldDisplayLinkedInBlock && (
            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                maxWidth: 'max-content',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <label className="block text-left text-sm font-medium text-gray-800 mt-2 mb-3">
                Paste your LinkedIn profile URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white px-2 py-1 w-full">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt="LinkedIn"
                    className="w-5 h-5 mr-2"
                  />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSendLINKEDINClick}
                  disabled={!linkedinUrl}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    !linkedinUrl
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'text-white bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}


          {shouldDisplayMajorMinorBlock && (
            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <label className="block text-sm font-medium text-gray-800 mb-3">What is your major and minor?</label>

              {/* MAJORS */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Majors</label>
                {majors.map((major:string, index:number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter a major"
                      value={major}
                      onChange={(e) => {
                        const updated = [...majors];
                        updated[index] = e.target.value;
                        setMajors(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {majors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMajors(majors.filter((_: string, i: number) => i !== index))}
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMajors([...majors, ''])}
                  className="text-blue-700 text-sm hover:underline"
                >
                  + Add another major
                </button>
              </div>

              {/* MINORS */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Minors</label>
                {minors.map((minor: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter a minor"
                      value={minor}
                      onChange={(e) => {
                        const updated = [...minors];
                        updated[index] = e.target.value;
                        setMinors(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {minors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMinors(minors.filter((_ : string, i: number) => i !== index))}
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMinors([...minors, ''])}
                  className="text-blue-700 text-sm hover:underline"
                >
                  + Add another minor
                </button>
              </div>

              {/* CONTINUE */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendMajorMinorClick}
                  disabled={majors.filter((m: string) => m.trim()).length === 0}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    majors.filter((m:string) => m.trim()).length === 0
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'text-white bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}



          {shouldDisplayComplianceBlock && (
            <div
              className={`p-4 rounded-lg shadow ${!isSmallScreen ? 'ml-8' : ''} mb-3`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <label className="block text-sm font-medium text-gray-800 mb-4">
                Final step before you're in!
              </label>

              {/* Checkbox 1 */}
              <div className="flex items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={termsChecked}
                  onChange={(e) => {
                    setTermsChecked(e.target.checked);
                    if (e.target.checked && ageChecked) handleSendCompliance();
                  }}
                  className="mt-1"
                />
                <label htmlFor="termsCheckbox" className="text-sm text-gray-700 leading-snug">
                  You agree to our{' '}
                  <a href="#" className="underline text-blue-700 hover:text-blue-900">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://trust-ressources.s3.us-east-1.amazonaws.com/Privacy+Policy+-+My+Lucy+Corp+-+2024+-+11%3A11%3A24.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700 hover:text-blue-900"
                  >
                    Privacy Policy
                  </a>. You also admit that you are beautiful.
                </label>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="ageCheckbox"
                  checked={ageChecked}
                  onChange={(e) => {
                    setAgeChecked(e.target.checked);
                    if (termsChecked && e.target.checked) handleSendCompliance();
                  }}
                  className="mt-1"
                />
                <label htmlFor="ageCheckbox" className="text-sm text-gray-700 leading-snug">
                I confirm that I am at least 18 years old or have parental consent if aged 13-17. Users under 13 are not permitted.{" "}
                <a
                  href="/documents/age-consent.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  Details
                </a>.
                </label>
              </div>
            </div>
          )}





















          {/* Gestion des données Course */}
          {CourseData && CourseData.length > 0 && (
            <div style={{ width: "100%" }}>
              {/* Marge entre le texte et le premier bloc de cours */}
              <div style={{ marginBottom: "24px" }}></div>

              {CourseData.map((course, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FCFCFC",
                    border: "1px solid #BCBCBC",
                    padding: "16px",
                    marginBottom:
                      idx === CourseData.length - 1 ? "16px" : "8px",
                    borderRadius: "8px",
                    width: "95%",
                    marginLeft: "auto",
                    marginRight: "auto",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ maxWidth: "100%" }}>
                    {/* Titre */}
                    <p
                      style={{
                        color: "#011F5B",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        wordWrap: "break-word",
                        marginBottom: "12px",
                      }}
                    >
                      {course.title}
                    </p>

                    {/* Semestre, Crédit, Prérequis */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      {/* Semestre */}
                      <span
                        style={{
                          backgroundColor: "#FFD9BF",
                          color: "#F97315",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {course.Semester}
                      </span>

                      {/* Crédit */}
                      <span
                        style={{
                          backgroundColor: "#D6EAF7",
                          color: "#011F5B",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {course.Credit}
                      </span>

                      {/* Prérequis */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#FEEAEA",
                            color: "#EF4361",
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            wordWrap: "break-word",
                          }}
                        >
                          {course.Prerequisites}
                        </span>

                        {/* Icône de coche verte */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#25C35E",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiCheck style={{ color: "white" }} />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: "#011F5B",
                        fontSize: "1rem",
                        wordWrap: "break-word",
                        marginBottom: "12px",
                      }}
                    >
                      {course.Description}
                    </p>

                    {/* Liens Prospectus et Syllabus */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={course.Prospectus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1A71FF",
                          fontSize: "1rem",
                          textDecoration: "none",
                          flexShrink: 1,
                        }}
                      >
                        Prospectus
                      </a>
                      <a
                        href={course.Syllabus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1A71FF",
                          fontSize: "1rem",
                          textDecoration: "none",
                          flexShrink: 1,
                        }}
                      >
                        Syllabus
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        

        {chartData && chartData.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className={`w-full max-w-5xl ${!isSmallScreen ? "ml-8" : ""}`}>
              {chartData.map((item: AnswerCHART, index: number) => {
                console.log(`Processing chartData at index ${index}:`, item);

                let chartsArray: ChartData[] = [];

                if (item.answer_charts && item.answer_charts.length > 0) {
                  chartsArray = item.answer_charts;
                } else if (item.answer_chart) {
                  chartsArray = [item.answer_chart];
                } else {
                  console.error(`No charts found at index ${index}`);
                  return null;
                }

                console.log(`Charts to process for index ${index}:`, chartsArray);

                const chartCount = chartsArray.length;
                const gridColumnsClass = `grid ${
                  chartCount === 1
                    ? "grid-cols-1"
                    : chartCount === 2
                    ? "grid-cols-2 gap-4"
                    : "grid-cols-2 gap-4"
                }`;

                return (
                  <div
                    key={index}
                    className="chart-group-container mt-4 bg-gray-100 p-4 rounded-md"
                  >
                    <div className={gridColumnsClass}>
                      {chartsArray.map((data: ChartData, chartIndex: number) => {
                        if (!data || !data.series || data.series.length === 0) {
                          console.error(
                            `Missing series data at index ${index}, chartIndex ${chartIndex}`
                          );
                          return null;
                        }

                        const xAxis: Highcharts.XAxisOptions = {
                          title: { text: data.xAxisTitle },
                          categories: data.series[0].data.map((d) => d.label),
                        };

                        const options: Highcharts.Options = {
                          title: { text: data.chartTitle },
                          xAxis,
                          yAxis: {
                            title: { text: data.yAxisTitle },
                          },
                        };

                        switch (data.chartType) {
                          case "bar":
                          case "column":
                            options.series = data.series.map((serie) => ({
                              type: data.chartType as any,
                              name: serie.seriesName,
                              data: serie.data.map((d) => [d.x, d.y]),
                            }));
                            break;

                          case "line":
                            options.series = data.series.map((serie) => ({
                              type: "line",
                              name: serie.seriesName,
                              data: serie.data.map((d) => [d.x, d.y]),
                            }));
                            break;

                          case "pie":
                          case "doughnut":
                            options.series = data.series.map((serie) => ({
                              type: "pie",
                              name: serie.seriesName,
                              data: serie.data.map((d) => ({
                                name: d.label,
                                y: d.y,
                              })),
                            }));
                            delete options.xAxis;
                            break;

                          case "scatter":
                            options.series = data.series.map((serie) => ({
                              type: "scatter",
                              name: serie.seriesName,
                              data: serie.data.map((d) => [d.x, d.y]),
                            }));
                            break;

                          case "pyramid":
                            options.chart = { type: "pyramid" };
                            options.series = data.series.map((serie) => ({
                              type: "pyramid",
                              name: serie.seriesName,
                              data: serie.data.map((d) => [d.label, d.y]),
                            }));
                            delete options.xAxis;
                            break;

                          case "gauge":
                            options.chart = { type: "gauge" };
                            options.series = data.series.map((serie) => ({
                              type: "gauge",
                              name: serie.seriesName,
                              data: [serie.data[0].y],
                            }));
                            delete options.xAxis;
                            break;

                          case "bubble":
                            options.series = data.series.map((serie) => ({
                              type: "bubble",
                              name: serie.seriesName,
                              data: serie.data.map((d) => ({
                                x: d.x,
                                y: d.y,
                                z: d.z || 0,
                              })),
                            }));
                            break;

                          case "treemap":
                            options.series = data.series.map((serie) => ({
                              type: "treemap",
                              name: serie.seriesName,
                              data: serie.data.map((d) => ({
                                name: d.label,
                                value: d.y,
                              })),
                            }));
                            delete options.xAxis;
                            break;

                          case "waterfall":
                            options.series = data.series.map((serie) => ({
                              type: "waterfall",
                              name: serie.seriesName,
                              data: serie.data.map((d) => ({
                                name: d.label,
                                y: d.y,
                              })),
                            }));
                            break;

                          default:
                            console.error(`Unsupported chart type: ${data.chartType}`);
                            return null;
                        }

                        console.log("Configured chart options:", options);

                        return (
                          <div
                            key={chartIndex}
                            className="chart-container w-full p-4 bg-white border border-gray-200 rounded-md shadow"
                          >
                            <HighchartsReact highcharts={Highcharts} options={options} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Buttons to Track Data and Create Report */}
              <div className={`mt-4 flex gap-2 ${!isSmallScreen ? "ml-8" : ""}`}>
                <button
                  onClick={handleTrackDataClick}
                  className="flex items-center max-w-350 text-ellipsis text-sm border border-border py-1 px-2 rounded cursor-pointer hover:bg-hover"
                  style={{ color: theme.palette.text.primary }}
                >
                  Track this data on my dashboard
                </button>
                {/* Affiche la pop-up si isTrackPopupOpen est vrai */}
                {isTrackPopupOpen && (
                  <TrackPopup
                    chartData={chartData}
                    selectedCharts={selectedCharts}
                    onClose={() => setIsTrackPopupOpen(false)}
                    onConfirm={handleConfirmTrack}
                    onChartSelection={handleChartSelection}
                  />
                )}
                <button
                  onClick={handleReportClick}
                  className="flex items-center max-w-350 text-ellipsis text-sm border border-border py-1 px-2 rounded cursor-pointer hover:bg-hover"
                  style={{ color: theme.palette.text.primary }}
                >
                  Create a complete report
                </button>
              </div>
            </div>
          </div>
        )}


          {/* Gestion des feedbacks */}
          {handleFeedback && (
            <div
              className={`flex flex-row gap-x-0.5 ${
                !isSmallScreen ? "ml-8" : ""
              } mt-1`}
            >
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? (
                  <FiCheck style={{ color: theme.palette.text.primary }} />
                ) : (
                  <FiCopy style={{ color: theme.palette.text.primary }} />
                )}
              </Hoverable>
              <Hoverable onClick={handleThumbsUp} isActive={thumbsUpClicked}>
                <FiThumbsUp
                  className={thumbsUpClicked ? "text-green-400 fill-current" : ""}
                  style={{ 
                    color: thumbsUpClicked ? '#4ade80' : theme.palette.text.primary,
                    fill: thumbsUpClicked ? '#4ade80' : 'none'
                  }}
                />
              </Hoverable>
              <Hoverable onClick={handleThumbsDown} isActive={thumbsDownClicked}>
                <FiThumbsDown
                  className={thumbsDownClicked ? "text-red-400 fill-current" : ""}
                  style={{ 
                    color: thumbsDownClicked ? '#f87171' : theme.palette.text.primary,
                    fill: thumbsDownClicked ? '#f87171' : 'none'
                  }}
                />
              </Hoverable>
            </div>
          )}

          {/* Snackbar pour les notifications de feedback */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </div>
      </div>
    </section>
  );
};

export default React.memo(AIMessage);