import React, { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import Marquee from "react-fast-marquee"; // ✅ Importe la bibliothèque
import {
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
  Button,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  FaGraduationCap,
  FaRegCalendarAlt,
  FaBalanceScale,
  FaBuilding,
  FaHandHoldingUsd,
} from 'react-icons/fa';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import useChatStore from '../../stores/useChatStore';
import config from '../../config';



interface LandingPageProps {
  onSend: (message: string) => void;
  userUniversity: string | null | undefined;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend, userUniversity }) => {
  console.log('<<< RENDERING LandingPage >>>');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isKedge = userUniversity === 'kedge'; // Variable pour la traduction

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  // Traduire le placeholder initial
  const initialPlaceholder = isKedge ? "Demandez à Lucy..." : "Ask Lucy...";
  const [placeholderText, setPlaceholderText] = useState('');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isHoveringQuestions, setIsHoveringQuestions] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const subdomain = config.subdomain;

  const currentChatId = useChatStore((state) => state.currentChatId);
  const isCurrentChatPrivate = useChatStore((state) => state.isCurrentChatPrivate);
  const updateConversationPrivacy = useChatStore((state) => state.updateConversationPrivacy);

  const containerRef = useRef<HTMLDivElement>(null);

  const initialText = initialPlaceholder;

  const tickerQuestions = [
    // Traduire les questions du ticker
    { question: isKedge ? "Quels sont les événements de la semaine ?" : "What are the event of the week?", topic: "Events" },
    { question: isKedge ? "Y a-t-il des opportunités d'étudier à l'étranger ?" : "Are there study abroad opportunities?", topic: "Policies" },
    { question: isKedge ? "Comment puis-je m'impliquer dans la recherche ?" : "How can I get involved in research?", topic: "Courses" },
    { question: isKedge ? "Quels services de soutien sont disponibles ?" : "What support services are available?", topic: "Housing" },
    { question: isKedge ? "Comment postuler à l'aide financière ?" : "How do I apply for financial aid?", topic: "Financial Aids" },
    { question: isKedge ? "Quel est le processus pour changer de majeure ?" : "What is the process to change my major?", topic: "Courses" },
    { question: isKedge ? "Y a-t-il des bourses pour les étudiants actuels ?" : "Are there scholarships for current students?", topic: "Financial Aids" },
  ];
  
  

  const topicColors: { [key: string]: string } = {
    "Financial Aids": "#27AE60", // Vert
    "Events": "#E67E22", // Orange
    "Policies": "#2980B9", // Bleu
    "Housing": "#8E44AD", // Violet
    "Courses": "#EAC117", // Jaune
    "Chitchat": "#7F8C8D", // Jaune
    "Default": "#7F8C8D" // Gris
  };


  const daysLeftUntilMarch31 = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), 2, 31); // Mois indexé à 0 (mars = 2)
    const differenceInTime = targetDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays >= 0 ? differenceInDays : 0;
  };



  const handleSend = () => {
    const message = inputValue.trim();
    console.log('LandingPageImprove: handleSend - Button clicked');
    console.log('LandingPageImprove: handleSend - Message to send:', message);

    if (message !== '') {
      console.log("LandingPageImprove: handleSend - Début d'envoi du message");
      onSend(message);
      console.log('LandingPageImprove: handleSend - Après la fonction onSend');
      setInputValue('');
      setActiveButton(null);
      setPlaceholderText(initialPlaceholder);
    } else {
      console.log('LandingPageImprove: handleSend - Message is empty');
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('LandingPageImprove: handleKeyPress - Enter pressed');
      handleSend();
      event.preventDefault();
    }
  };

  const handlePlaceholderClick = () => {
    console.log('LandingPageImprove: handlePlaceholderClick');
    setShowPlaceholder(false);
  };

  const handleQuestionClick = (question: string) => {
     console.log(`LandingPageImprove: handleQuestionClick - Question: ${question}`);
    setInputValue(question);
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // console.log('LandingPageImprove: handleInputChange - Current input value:', value); // Potentially noisy log
    setInputValue(value);
  };

  useEffect(() => {
    console.log('LandingPageImprove: useEffect for typing animation mount');
    let index = 0;
    let currentText = '';
    const typingSpeed = 100;

    const typingInterval = setInterval(() => {
      if (index < initialText.length) {
        currentText += initialText.charAt(index);
        setInputValue(currentText);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setInputValue('');
        setPlaceholderText(initialPlaceholder);
        console.log('LandingPageImprove: Typing animation complete');
      }
    }, typingSpeed);

    return () => {
      console.log('LandingPageImprove: useEffect for typing animation unmount/cleanup');
      clearInterval(typingInterval);
    };
  }, []); // Utilisation de initialText qui est maintenant basé sur isKedge

  useEffect(() => {
    if (!isTyping && inputValue.trim() === '') {
       console.log('LandingPageImprove: useEffect [inputValue, isTyping] - Input empty after typing, resetting placeholder.');
      setActiveButton(null);
      setPlaceholderText(initialPlaceholder);
    }
  }, [inputValue, isTyping, initialPlaceholder]);

  useEffect(() => {
    console.log('LandingPageImprove: useEffect for click outside listener mount');
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside the main container AND not inside the question buttons area (if hovering)
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isHoveringQuestions
      ) {
        console.log('LandingPageImprove: Click outside detected, resetting state.');
        setActiveButton(null);
        setInputValue('');
        setPlaceholderText(initialPlaceholder);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      console.log('LandingPageImprove: useEffect for click outside listener unmount/cleanup');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHoveringQuestions, initialPlaceholder]); // Depends on hovering state

  const allButtons = [
    {
      label: isKedge ? "Infos Académiques" : 'Academic Info',
      value: 'Academic Info',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
    },
    {
      label: isKedge ? "Événements" : 'Events',
      value: 'Events',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
    },
    {
      label: isKedge ? "Règles & Procédures" : 'Policies',
      value: 'Policies',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
    },
    {
      label: isKedge ? "Installations" : 'Facilities',
      value: 'Facilities',
      icon: <FaBuilding style={{ color: '#7C3BEC' }} size={20} />,
    },
    {
      label: isKedge ? "Aides Financières" : 'Financial Aid',
      value: 'Financial Aid',
      icon: <FaHandHoldingUsd style={{ color: '#EF4361' }} size={20} />,
    },
  ];

  const buttons = isSmallScreen ? allButtons : [...allButtons, { label: isKedge ? "Admission" : 'Admission', value: 'Admission', icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} /> }];

  const questionsMap: { [key: string]: string[] } = isKedge ? {
    'Academic Info': [ 'Quelles sont les majeures/programmes les plus populaires ?', 'Y a-t-il des programmes honorifiques ou des parcours spéciaux ?', 'Des opportunités de recherche sont-elles disponibles pour les licences ?', 'Quelles sont les options pour étudier à l\'étranger en Europe ?' ],
    'Events': [ 'Comment réserver une visite du campus en personne ?', 'Des visites virtuelles sont-elles disponibles ?', 'Quels événements majeurs ont lieu chaque semestre sur le campus ?', 'Quels clubs ou organisations étudiantes sont actifs et comment les rejoindre ?' ],
    'Policies': [ 'Comment puis-je changer de majeure ou de mineure ?', 'Quelle est la politique concernant les crédits de transfert ?', 'Où puis-je trouver le calendrier académique ?', 'Quelles sont les règles de conduite étudiante ?' ],
    'Facilities': [ 'Quels types de logements sont disponibles pour les étudiants de première année ?', 'La salle de sport et les installations de fitness sont-elles ouvertes à tous les étudiants ?', 'Quelles options de restauration sont disponibles pour les étudiants de première année ?', 'Des laveries sont-elles disponibles dans les résidences ?' ],
    'Financial Aid': [ 'Comment postuler à l\'aide financière et quels types d\'aides sont proposés ?', 'Postuler à l\'aide financière impactera-t-il ma candidature ?', 'Qu\'est-ce que le programme travail-études et comment y participer ?', 'Comment le package d\'aide financière se compare-t-il d\'une année à l\'autre ?' ],
    'Admission': [ 'Quels sont les GPA et scores moyens des étudiants admis ?', 'Les étudiants internationaux doivent-ils passer des tests supplémentaires ou soumettre des documents spécifiques ?', 'Puis-je contacter des étudiants actuels ou des anciens élèves pour en savoir plus sur leurs expériences ?', 'Comment puis-je suivre le statut de ma candidature après l\'avoir soumise ?' ]
  } : {
    'Academic Info': [ 'What are the most popular majors or programs?', 'Are there honors programs or special academic tracks?', 'Are there research opportunities available for undergraduate students?', 'What options are there for studying abroad in Europe?' ],
    'Events': [ 'How can I book an in-person campus tour?', 'Are there virtual tours available?', 'What major campus events take place each semester?', 'What student clubs or organizations are active on campus, and how can I join?' ],
    'Policies': [ 'How can I change my major or minor?', 'What is the policy on transfer credits?', 'Where can I find the academic calendar?', 'What are the student conduct policies?' ], // Assuming policies category is needed
    'Facilities': [ 'What types of housing options are available for freshmen students?', 'Are the gym and fitness facilities open to all students?', 'What dining options are available for first year students?', 'Are laundry facilities available in the dorms?' ],
    'Financial Aid': [ 'How do I apply for financial aid, and what types of aid are offered?', 'Will applying to financial aid impact my application?', 'What is the work-study program, and how can I participate?', 'How does the financial aid package compare year-to-year?' ],
    'Admission': [ 'What are the average GPA and test scores for admitted students?', 'Do international students need to take additional tests or submit specific documents?', 'Can I connect with current students or alumni to learn about their experiences?', 'How can I track the status of my application after submitting it?' ] // Admission category if needed
  };
  

  // ---> Mémoïsation du startAdornment <---
  const startAdornment = useMemo(() => {
     // Log when useMemo recalculates
     console.log('[LandingPageImprove useMemo startAdornment] Recalculating with:', { currentChatId, isCurrentChatPrivate });
    if (userUniversity === 'kedge') {
        return null; // Pas d'adornment pour Kedge
    }
    return (
      <InputAdornment position="start" sx={{ marginRight: '8px' }}>
        <Box
          onClick={() => updateConversationPrivacy(currentChatId || '', !isCurrentChatPrivate)}
          sx={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: isCurrentChatPrivate ? '#6F6F6F' : '#4A90E2',
            backgroundColor: isCurrentChatPrivate ? '#F0F0F0' : '#E0F2FF',
            padding: '4px 10px',
            borderRadius: '5px',
            display: 'inline-block',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {isCurrentChatPrivate ? <LockIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', mr: 0.5 }} /> : <LockOpenIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', mr: 0.5 }} />}
          {isCurrentChatPrivate ? 'Private' : 'Public'}
        </Box>
      </InputAdornment>
    );
  }, [currentChatId, isCurrentChatPrivate, updateConversationPrivacy, userUniversity]);
  // ---> Fin Mémoïsation <---

  // Log before returning the component JSX
  console.log('[LandingPageImprove] Rendering component. State:', { currentChatId, isCurrentChatPrivate, inputValue, isTyping });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100vh"
      bgcolor="#FFFFFF"
      p={isSmallScreen ? 3 : 4}
      position="relative"
      overflow="hidden"
      sx={{
        backgroundColor: isSmallScreen ? '#F0F4FA' : 'transparent',
      }}
    >
      {isLargeScreen && (
        <section aria-label="3D background" aria-hidden="true" role="presentation">
        <iframe
          src="https://my.spline.design/aiassistanthoverandclickinteraction-afdf94418f2cc3f7f17a6aad54796013/"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Spline Scene"
          allowFullScreen
        />
        </section>
      )}

      <section aria-label="Sample questions ticker" className="hidden sm:flex justify-center w-full mb-4">

        <div className="max-w-5xl w-full bg-gray-100 py-2 px-4 rounded-lg">
          <Marquee gradient={false} speed={40}>
            {tickerQuestions.map((questionObj, index) => {
              const topic = questionObj.topic || "Default";
              const color = topicColors[topic] || topicColors["Default"];

              return (
                <button
                  key={index}
                  type="button"
                  className="mx-2 flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-200 transition pb-1"
                  style={{ backgroundColor: "##F7F9FC" }} // Note: Double hash might be unintentional
                  onClick={() => handleQuestionClick(questionObj.question)}
                >
                  <span
                    className="mr-2 px-3 py-1 rounded-lg text-xs font-bold"
                    style={{
                      color: color,
                      backgroundColor: `${color}20`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topic}
                  </span>

                  <span className="text-blue-900">{questionObj.question}</span>
                </button>
              );
            })}
          </Marquee>
        </div>
      </section>


      
  
      <Box
        component="main"
        ref={containerRef}
        width="100%"
        maxWidth="800px"
        mt={isSmallScreen ? 2 : 30}
        position="relative"
        zIndex={1}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{
            color: '#011F5B',
            maxWidth: '100%',
            mb: 2,
            wordBreak: 'break-word',
            ...(isSmallScreen && {
              fontSize: '1.5rem',
            }),
          }}
        >
          {isKedge ? "Que cherchez-vous ?" : "What are you looking for?"}
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          onMouseDown={handlePlaceholderClick}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          InputProps={{
            startAdornment,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend} aria-label={isKedge ? "Envoyer message" : "Send message"}>
                  <ArrowForwardIcon style={{ color: '#011F5B', fontSize: '1.5rem' }} />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              backgroundColor: '#F4F4F4',
              fontSize: '1rem',
              padding: '2px 8px',
              borderRadius: '20px',
              color: isTyping ? '#6F6F6F' : '#000000',
              border: 'none',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            },
          }}
          inputProps={{
            style: { color: isTyping ? '#6F6F6F' : '#000000' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#6F6F6F',
              opacity: 1,
            },
          }}
        />

        {subdomain === 'holyfamily' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: isSmallScreen ? 2 : 4,
            mt: isSmallScreen ? 1 : 3,
          }}
        >
          <Typography
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              px: isSmallScreen ? 2 : 4,
              py: isSmallScreen ? 1 : 1.5,
              borderRadius: '16px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              textAlign: 'center',
              fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
              fontWeight: '500'
            }}
          >
            Lucy Game: <Box component="span" sx={{ fontWeight: '700' }}>
              {daysLeftUntilMarch31()} days left
            </Box> to be the top user and win round trip for 2 to Miami 🏖️
          </Typography>
        </Box>
      )}

        {isSmallScreen && (
          <Box mt={2}>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
              {buttons.map((button) => (
                <Typography
                  key={button.value}
                  onClick={() => setSelectedCategory(selectedCategory === button.value ? null : button.value)}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    color: selectedCategory === button.value ? "#FFFFFF" : "#1565D8",
                    backgroundColor: selectedCategory === button.value ? "#1565D8" : "#E3F2FD",
                    '&:hover': { backgroundColor: selectedCategory === button.value ? "#115293" : "#BBDEFB" },
                  }}
                >
                  {button.label}
                </Typography>
              ))}
            </Box>

            {selectedCategory && questionsMap[selectedCategory] && (
              <Box mt={2}>
                {questionsMap[selectedCategory].map((question, index) => (
                  <Typography
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    sx={{
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      color: "#1565D8",
                      backgroundColor: "#E3F2FD",
                      '&:hover': { backgroundColor: "#BBDEFB" },
                      display: "block",
                      textAlign: "center",
                      mt: 1,
                    }}
                  >
                    {question}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}


      </Box>
    </Box>
  );
};

export default LandingPage;