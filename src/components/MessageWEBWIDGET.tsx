import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiCopy,
  FiThumbsDown,
  FiThumbsUp,
  FiSend,
} from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Button, TextField } from "@mui/material";
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

} from "../interfaces/interfaces";
import { IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logotest from "../testlucy3.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from 'highcharts/highcharts-more';
import TrackPopup from '../components/TrackPopup';
import { ThreeDots } from 'react-loader-spinner';
import remarkBreaks from 'remark-breaks';
import './MessageWEBWIDGETCSS.css';
import { FiRefreshCw } from "react-icons/fi";


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
  isLoading?: boolean;
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
  handleSendCOURSEMessage: (COURSE_message: string) => void;
  drawerOpen: boolean;
  chartData?: AnswerCHART[] | null;
  redditData?: AnswerREDDIT[] | null;
  instaData?: AnswerINSTA[] | null;
  youtubeData?: AnswerYOUTUBE[] | null;
  quoraData?: AnswerQUORA[] | null;
  instaclubData?: AnswerINSTA_CLUB[] | null;
  linkedinData?: AnswerLINKEDIN[]| null;
  insta2Data?: AnswerINSTA2[] | null;
  errorData?: AnswerERROR[] | null;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  isLoading = false,
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
  handleSendCOURSEMessage,
  drawerOpen,
  chartData,
  redditData,
  instaData,
  youtubeData,
  quoraData,
  instaclubData,
  linkedinData,
  insta2Data,
  errorData
}) => {
  // États pour la gestion des interactions utilisateur
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTrackPopupOpen, setIsTrackPopupOpen] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  // États pour la gestion des messages
  const [messages, setMessages] = useState<string[]>([]);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  // État pour les étapes de raisonnement
  const [displayedReasoningSteps, setDisplayedReasoningSteps] = useState<ReasoningStep[]>([]);

  const showLoadingIndicator = isLoading && !hasNewContent;
  const isResponseReceived = !isLoading;

  // Thème et responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Ajustement de la taille de la police en fonction de la taille de l'écran
  const messageFontSize = isSmallScreen ? "text-sm" : "text-base";

  const navigate = useNavigate();

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
  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
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

  // Désactiver le bouton "Envoyer" si aucune réponse n'est sélectionnée ou si l'input "Autre" est vide
  const isSendDisabled =
    selectedAnswers.length === 0 && otherInput.trim() === "";

  // Logs pour vérifier le contenu de chartData
  useEffect(() => {
    console.log("ChartData reçu:", chartData);
  }, [chartData]);

  const hasSocialThread =
  (redditData && redditData.length > 0) ||
  (instaData && instaData.length > 0) ||
  (youtubeData && youtubeData.length > 0) ||
  (quoraData && quoraData.length > 0) ||
  (instaclubData && instaclubData.length > 0) ||
  (linkedinData && linkedinData.length > 0) ||
  (insta2Data && insta2Data.length > 0);

  return (
    <div className="py-5 px-5 flex -mr-6 w-full relative">
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
      <div
        className="font-bold mb-3 ml-2 sm:ml-6  animate-fadeIn mt-4"
        style={{ 
            color: theme.palette.text.primary, 
            fontSize: '15px' // Ajustez la taille de texte si nécessaire
        }}
      >
        Social Thread
      </div>
    ) : null}

    {/* Reddit Section */}
    {redditData && redditData.length > 0 && (
      <div className="ml-2 sm:ml-6 mt-2 sm:mt-4">
        {redditData.map((redditItem, index) => (
          <div
            key={index}
            className="flex items-start p-2 sm:p-3 bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
            style={{
              borderRadius: '8px',
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="mr-2 sm:mr-3 flex-shrink-0">
              <img
                src="/logos/reddit_logo.png"
                alt="Reddit Logo"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            <div className="flex-grow text-xs sm:text-sm" style={{ color: theme.palette.text.primary }}>
              {redditItem.comment}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button>
                <FiThumbsUp className="text-gray-500 hover:text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-gray-700 font-bold text-xs sm:text-sm">
                {redditItem.score}
              </span>
              <button>
                <FiThumbsDown className="text-gray-500 hover:text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Quora Section */}
    {quoraData && quoraData.length > 0 && (
      <div className="ml-2 sm:ml-6 mt-2 sm:mt-4">
        {quoraData.map((quoraItem, index) => (
          <div
            key={index}
            className="flex items-start p-2 sm:p-3 bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
            style={{
              borderRadius: '8px',
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="mr-2 sm:mr-3 flex-shrink-0">
              <img
                src="/logos/medium_logo.png"
                alt="Medium Logo"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            <div className="flex-grow text-xs sm:text-sm" style={{ color: theme.palette.text.primary }}>
              {quoraItem.comment}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button>
                <FiThumbsUp className="text-gray-500 hover:text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-gray-700 font-bold text-xs sm:text-sm">
                {quoraItem.score}
              </span>
              <button>
                <FiThumbsDown className="text-gray-500 hover:text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* YouTube, Instagram Reels, Instagram Club, and LinkedIn Combined Section */}
    {(youtubeData || instaData || instaclubData || linkedinData) && (
      <div className="ml-2 sm:ml-6 mt-2 sm:mt-4">
        <div className="flex flex-wrap -mx-1 sm:-mx-2">
          {/* YouTube Items */}
          {youtubeData && youtubeData.length > 0 && youtubeData.map((youtubeItem, index) => {
            const videoId = youtubeItem.link.split("v=")[1] || youtubeItem.link.split("/").pop();
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            return (
              <div key={`youtube-${index}`} className="p-1 sm:p-2 w-1/2 sm:w-1/3 lg:w-1/4" style={{ maxWidth: '200px' }}>
                <div
                  className="bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
                  style={{
                    borderRadius: '8px',
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <a
                    href={youtubeItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                    style={{
                      width: '100%',
                      height: '90px',
                      overflow: 'hidden',
                      borderRadius: '8px 8px 0 0',
                    }}
                  >
                    <img src={thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <img src="/logos/youtube_logo.png" alt="YouTube Play Icon" className="absolute inset-0 w-5 h-5 m-auto" />
                  </a>
                  <div
                    className="flex justify-between items-center p-1 sm:p-2 text-xs sm:text-sm"
                    style={{
                      backgroundColor: '#F7F7F7',
                      borderTop: '1px solid transparent',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                    }}
                  >
                    <div
                      className="truncate"
                      style={{
                        color: theme.palette.text.primary,
                        maxWidth: '70%',
                      }}
                    >
                      {youtubeItem.title}
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm">
                      {youtubeItem.nbr_view} views
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Instagram Reels Items */}
          {instaData && instaData.length > 0 && instaData.map((instaItem, index) => (
            <div key={`insta-${index}`} className="p-1 sm:p-2 w-1/2 sm:w-1/3 lg:w-1/4" style={{ maxWidth: '150px' }}>
              <div
                className="bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
                style={{
                  borderRadius: '8px',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <a
                  href={instaItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                  style={{
                    width: '100%',
                    height: '140px',
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
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </a>
                <div
                  className="flex justify-between items-center p-1 sm:p-2 text-xs sm:text-sm animate-fadeIn"
                  style={{
                    backgroundColor: '#F7F7F7',
                    borderTop: '1px solid transparent',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                  }}
                >
                  {/* Titre avec Image Instagram Personnalisée */}
                  <div
                    className="flex items-center truncate"
                    style={{
                      color: theme.palette.text.primary,
                      maxWidth: '65%',
                    }}
                  >
                    <img
                      src="/logos/insta_logo.png" // Remplacez par le chemin de votre image Instagram
                      alt="Instagram Icon"
                      className="mr-1"
                      style={{
                        width: '10px',
                        height: '10px',
                      }}
                    />
                    {instaItem.title}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {instaItem.nbr_view} views
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Instagram Club Items */}
          {instaclubData && instaclubData.length > 0 && instaclubData.map((clubItem, index) => (
            <div key={`instaclub-${index}`} className="p-1 sm:p-2 w-1/2 sm:w-1/3 lg:w-1/4" style={{ maxWidth: '190px' }}>
              <div
                className="bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
                style={{
                  borderRadius: '8px',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <a
                  href={clubItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                  style={{
                    width: '100%',
                    height: '60px',
                    overflow: 'hidden',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  <img src={clubItem.picture} alt="Club Thumbnail" className="w-full h-full object-cover rounded-t-md" />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </a>
                <div className="p-2 sm:p-3">
                  <div className="flex items-center">
                    <img src={clubItem.picture} alt="Club Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1" />
                    <a
                      href={clubItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 text-xs sm:text-sm truncate"
                      style={{ maxWidth: '65%' }}
                    >
                      {clubItem.username}
                    </a>
                  </div>
                  <div
                    className="mt-1 text-xs sm:text-sm flex items-center truncate"
                    style={{
                      color: theme.palette.text.primary,
                    }}
                  >
                    {/* Instagram Logo in Front of the Title */}
                    <img
                      src="/logos/insta_logo.png" // Remplacez par le chemin de votre logo Instagram
                      alt="Instagram Logo"
                      className="mr-1"
                      style={{
                        width: '8px',
                        height: '8px',
                      }}
                    />
                    {clubItem.title}
                  </div>
                  <div className="flex justify-between mt-1 text-xs sm:text-sm text-gray-500">
                    <span>{clubItem.followers} followers</span>
                    <span>{clubItem.posts} posts</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* LinkedIn Items */}
          {linkedinData && linkedinData.length > 0 && linkedinData.map((linkedinItem, index) => (
            <div key={`linkedin-${index}`} className="p-1 sm:p-2 w-1/2 sm:w-1/3 lg:w-1/4" style={{ maxWidth: '150px' }}>
              <div
                className="flex flex-col items-center bg-[#F7F7F7] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 sm:mb-3 animate-fadeInUp"
                style={{
                  borderRadius: '8px',
                  height: '140px',
                  position: 'relative',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Headline Banner */}
                <div className="w-full h-10 overflow-hidden rounded-t-md animate-fadeIn">
                  <img
                    src={linkedinItem.headline}
                    alt="LinkedIn Headline"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Profile Picture */}
                <div className="absolute top-8 flex justify-center w-full animate-fadeInUp">
                  <img
                    src={linkedinItem.picture}
                    alt={`${linkedinItem.name} Profile`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white"
                    style={{
                      marginTop: '-20px',
                    }}
                  />
                </div>

                {/* Content Section */}
                <div className="mt-8 text-center px-2 sm:px-3 flex flex-col items-center flex-grow">
                  <div
                    className="text-gray-700 mb-0.5 text-xs sm:text-sm animate-fadeIn"
                    style={{
                      color: '#555555',
                    }}
                  >
                    {linkedinItem.sentence}
                  </div>
                  <div className="mt-auto mb-1">
                    <a
                      href={linkedinItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-2 sm:px-3 py-0.5 sm:py-1 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition duration-200 animate-fadeIn text-xs sm:text-sm"
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      <img
                        src="/logos/linkedin_logo.png" // Remplacez par le chemin de votre logo LinkedIn
                        alt="LinkedIn Icon"
                        className="mr-1 sm:mr-2"
                        style={{
                          width: '10px',
                          height: '10px',
                        }}
                      />
                      Connect
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
)}

          {displayedReasoningSteps && displayedReasoningSteps.length > 0 && (
            <div
                className={`mt-2 mb-4 ${!isSmallScreen ? "ml-8" : ""} text-justify ${messageFontSize}`}
                style={{ color: theme.palette.text.primary }}
            >
                {hasSocialThread && (
            <>
                <hr className="my-4 border-gray-400 animate-fadeIn" /> {/* Animation ajoutée */}
            </>
            )}
                <div className="flex items-center justify-between">
                    {showAllSteps ? (
                        // Mode "expand" : affichage vertical de toutes les étapes jusqu'à `currentStepIndex`
                        <ol className="ml-3">
                            {displayedReasoningSteps.slice(0, currentStepIndex + 1).map((step, index) => (
                                <div key={step.step} className="flex items-center mb-2">
                                    <li
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
                                    </li>
                                    {/* Affiche l'icône de réduction uniquement pour la première étape en mode "expand" */}
                                    {index === 0 && (
                                        <IconButton onClick={() => setShowAllSteps(false)} style={{ marginLeft: '10px' }}>
                                            <ExpandLessIcon />
                                        </IconButton>
                                    )}
                                </div>
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
                                    <IconButton onClick={() => setShowAllSteps(true)} style={{ marginLeft: '10px' }}>
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
                                    <IconButton onClick={() => setShowAllSteps(true)} style={{ marginLeft: '10px' }}>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

            

          {/* Affichez l'indicateur de chargement tant que isLoading est vrai */}
          {showLoadingIndicator && (
            <div className="flex justify-start mt-2 pl-3 mb-2">
              <ThreeDots height="30" width="50" color={theme.palette.primary.main} />
            </div>
          )}



            {/* Gestion des documents cités */}
        {citedDocuments && citedDocuments.length > 0 && (
        <div className={`mt-4 ${!isSmallScreen ? "ml-8" : ""}`}>
            {/* Divider above University Sources, visible only if Social Thread has elements */}
            

            {/* Title for Sources Section */}
            <div 
            className="font-bold mb-2" 
            style={{ 
                color: theme.palette.text.primary, 
                fontSize: '15px' // Ajustez la taille de texte si nécessaire
            }}
            >
            University Sources
            </div>
            <div className="flex flex-wrap gap-2">
            {citedDocuments.map((document, ind) => {
                const display = (
                <div
                    className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded mb-2" // Correction : Suppression du double "flex" et maintien de mb-2
                    style={{ color: theme.palette.text.primary }}
                >
                    <div className="mr-1 my-auto">
                    <SourceIcon
                        sourceType={document.source_type as ValidSources}
                        iconSize={16}
                    />
                    </div>
                    {document.document_name}
                </div>
                );

                return document.link ? (
                <a
                    key={document.document_id}
                    href={document.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:bg-hover"
                >
                    {display}
                </a>
                ) : (
                <div key={document.document_id} className="cursor-default">
                    {display}
                </div>
                );
            })}
            </div>
        </div>
        )}

            {/*
            {/* Affichage des messages accumulés *
            {!takData || takData.length === 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words ${
                    !isSmallScreen ? "ml-8" : ""
                  } text-left sm:text-justify ${messageFontSize} leading-snug`} // Hauteur de ligne par défaut ajustée
                  style={{ color: theme.palette.text.primary }}
                >
                  <ReactMarkdown
                    className="prose max-w-full" // Applique les styles par défaut pour une typographie élégante
                    remarkPlugins={[remarkGfm, remarkBreaks]} // Ajout de remarkBreaks pour gérer les sauts de ligne
                    components={{
                      // Gestion des paragraphes
                      p: ({ node, ...props }) => (
                        <p
                          className={`m-0 mb-md-gap leading-loose`}
                          {...props}
                        />
                      ),
                      // Gestion du texte en gras
                      strong: ({ node, ...props }) => <strong className="inline-block mt-4 font-semibold text-gray-800" {...props} />,

                      // Gestion des liens
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700 underline" // Styles élégants pour les liens
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      // Gestion des listes à puces
                      ul: ({ node, ...props }) => (
                        <ul className={`list-disc ${isSmallScreen ? "pl-2" : "pl-4"} mt-0 mb-md-gap leading-snug`} {...props} />
                      ),
                      // Gestion des listes numérotées
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-4 mb-lg-gap leading-loose" {...props} />
                      ),
                      // Gestion des éléments de liste
                      li: ({ node, ...props }) => (
                        <li className="mb-sm-gap leading-snug" {...props} />
                      ),
                      // Gestion des blocs de code
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
                      // Gestion des sauts de ligne
                      br: () => <br className="mb-sm-gap leading-extra-tight" />,
                      // Gestion des titres
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
            */}

          <div className="widget-container">
            {!takData || takData.length === 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words ${
                    !isSmallScreen ? "ml-8" : ""
                  } text-left sm:text-justify leading-snug`} // Hauteur de ligne par défaut ajustée
                  style={{ color: theme.palette.text.primary }}
                >
                  <ReactMarkdown
                    className="max-w-full" // Applique les styles par défaut pour une typographie élégante
                    remarkPlugins={[remarkGfm, remarkBreaks]} // Ajout de remarkBreaks pour gérer les sauts de ligne
                    components={{
                      // Gestion des paragraphes
                      p: ({ node, ...props }) => (
                        <p
                          className={`m-0 mb-md-gap leading-loose`}
                          {...props}
                        />
                      ),
                      // Gestion du texte en gras
                      strong: ({ node, ...props }) => <strong className="inline-block mt-4 font-semibold text-gray-800" {...props} />,

                      // Gestion des liens
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700 underline" // Styles élégants pour les liens
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      // Gestion des listes à puces
                      ul: ({ node, ...props }) => (
                        <ul className={`list-disc pl-4 mt-0 mb-md-gap leading-snug`} {...props} />
                      ),
                      // Gestion des listes numérotées
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-4 mb-lg-gap leading-loose" {...props} />
                      ),
                      // Gestion des éléments de liste
                      li: ({ node, ...props }) => (
                        <li className="mb-sm-gap leading-snug" {...props} />
                      ),
                      // Gestion des blocs de code
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
                      // Gestion des sauts de ligne
                      br: () => <br className="mb-sm-gap leading-extra-tight" />,
                      // Gestion des titres
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

          {/* Gestion des données TAK */}
          {takData && takData.length > 0 && (
            <div
              className={`mt-4 bg-gray-100 p-4 rounded-lg ${
                !isSmallScreen ? "ml-8" : ""
              }`}
            >
              {takData.map((tak, idx) => (
                <div key={idx} className="mb-4">
                  <p
                    className="text-left"
                    style={{ color: theme.palette.text.primary }}
                  >
                    {tak.question}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    {tak.answer_options.map((option, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${idx}-${i}`}
                          value={option}
                          checked={selectedAnswers.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`option-${idx}-${i}`}
                          style={{ color: theme.palette.text.primary }}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label
                        htmlFor={`other-${idx}`}
                        className="block mb-1"
                        style={{ color: theme.palette.text.primary }}
                      >
                        If other, please specify
                      </label>
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{
                          backgroundColor: "white",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                        }}
                        InputProps={{
                          style: {
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color: "gray",
                          },
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log("Ignoré")}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSendClick}
                      style={{
                        color: theme.palette.text.primary,
                        backgroundColor: theme.palette.button.background,
                      }}
                      disabled={isSendDisabled}
                    >
                      <FiSend className="mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              ))}
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
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp
                  className={thumbsUpClicked ? "text-green-400 fill-current" : ""}
                  style={{ color: theme.palette.text.primary }}
                />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <FiThumbsDown
                  className={feedbackClicked ? "text-green-400 fill-current" : ""}
                  style={{ color: theme.palette.text.primary }}
                />
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIMessage);