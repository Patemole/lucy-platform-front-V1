import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import Marquee from "react-fast-marquee"; // ✅ Importe la bibliothèque
import {
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
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
import { doc, updateDoc} from 'firebase/firestore';
import { db } from '../../auth/firebase';
import useChatStore from '../../stores/useChatStore';
import config from '../../config';



interface LandingPageProps {
  onSend: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [placeholderText, setPlaceholderText] = useState('');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isHoveringQuestions, setIsHoveringQuestions] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const subdomain = config.subdomain;

  const { conversations, currentChatId, updateConversationPrivacy } = useChatStore();

  const currentConversation = conversations.find(c => c.chat_id === currentChatId);
  const isCurrentlyPrivate = currentConversation?.thread_type === 'Private' || false;

  const containerRef = useRef<HTMLDivElement>(null);

  const initialText = 'Ask Lucy...';

  const tickerQuestions = [
    { question: "What are the event of the week?", topic: "Events" },
    { question: "Are there study abroad opportunities?", topic: "Policies" },
    { question: "How can I get involved in research?", topic: "Courses" },
    { question: "What support services are available?", topic: "Housing" },
    { question: "How do I apply for financial aid?", topic: "Financial Aids" },
    { question: "What is the process to change my major?", topic: "Courses" },
    { question: "Are there scholarships for current students?", topic: "Financial Aids" },
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
    console.log('Button clicked');
    console.log('Message to send:', message);

    if (message !== '') {
      console.log("Début d'envoi du message");
      onSend(message);
      console.log('Après la fonction onSend');
      setInputValue('');
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    } else {
      console.log('Message is empty');
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  const handlePlaceholderClick = () => {
    setShowPlaceholder(false);
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Current input value in handleInputChange:', value);
    setInputValue(value);
  };

  useEffect(() => {
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
        setPlaceholderText('Ask Lucy...');
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  useEffect(() => {
    if (!isTyping && inputValue.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  }, [inputValue, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isHoveringQuestions
      ) {
        setActiveButton(null);
        setInputValue('');
        setPlaceholderText('Ask Lucy...');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHoveringQuestions]);

  const allButtons = [
    {
      label: 'Academic Info',
      value: 'Academic Info',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
    },
    {
      label: 'Events',
      value: 'Events',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
    },
    {
      label: 'Policies',
      value: 'Policies',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
    },
    {
      label: 'Facilities',
      value: 'Facilities',
      icon: <FaBuilding style={{ color: '#7C3BEC' }} size={20} />,
    },
    {
      label: 'Financial Aid',
      value: 'Financial Aid',
      icon: <FaHandHoldingUsd style={{ color: '#EF4361' }} size={20} />,
    },
  ];

  const buttons = isSmallScreen
    ? allButtons.filter((button) => button.label !== 'Admission')
    : allButtons;

  const questionsMap: { [key: string]: string[] } = {
    'Academic Info': [
      'What are the most popular majors or programs?',
      'Are there honors programs or special academic tracks?',
      'Are there research opportunities available for undergraduate students?',
      'What options are there for studying abroad in Europe?',
    ],
    'Event & Tours': [
      'How can I book an in-person campus tour?',
      'Are there virtual tours available?',
      'What major campus events take place each semester?',
      'What student clubs or organizations are active on campus, and how can I join?',
    ],
    Admission: [
      'What are the average GPA and test scores for admitted students?',
      'Do international students need to take additional tests or submit specific documents?',
      'Can I connect with current students or alumni to learn about their experiences?',
      'How can I track the status of my application after submitting it?',
    ],
    Facilities: [
      'What types of housing options are available for freshmen students?',
      'Are the gym and fitness facilities open to all students?',
      'What dining options are available for first year students?',
      'Are laundry facilities available in the dorms?',
    ],
    'Financial Aid': [
      'How do I apply for financial aid, and what types of aid are offered?',
      'Will applying to financial aid impact my application?',
      'What is the work-study program, and how can I participate?',
      'How does the financial aid package compare year-to-year?',
    ],
  };
  

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
                  style={{ backgroundColor: "##F7F9FC" }}
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
          What are you looking for?
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          onMouseDown={handlePlaceholderClick}
          onKeyPress={handleKeyPress}
          placeholder={isTyping ? '' : `${placeholderText}`}
          InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    onClick={async () => {
                      if (!currentChatId) {
                        console.warn("Cannot change privacy: No active chat selected.");
                        return;
                      }
                      const newPrivacyState = !isCurrentlyPrivate;
                      console.log(`LandingPage: Toggling privacy for chat ${currentChatId} to ${newPrivacyState ? 'Private' : 'Public'}`);
                      try {
                        await updateConversationPrivacy(currentChatId, newPrivacyState);
                      } catch (error) {
                        console.error('Error calling updateConversationPrivacy:', error);
                      }
                    }}
                    edge="start"
                    aria-label={isCurrentlyPrivate ? "Set to Public" : "Set to Private"}
                    sx={{
                      backgroundColor: isCurrentlyPrivate ? '#E0E0E0' : '#D6DDF5',
                      color: isCurrentlyPrivate ? '#6F6F6F' : '#3155CC',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      marginLeft: '8px',
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      width: '80px',
                      height: '35px',
                      '&:hover': {
                        backgroundColor: isCurrentlyPrivate ? '#D5D5D5' : '#C4A4D8',
                        color: isCurrentlyPrivate ? '#5A5A5A' : '#4A0B8A',
                      },
                    }}
                    ref={(el) => {
                      if (el) {
                        console.log("Background color applied:", getComputedStyle(el).backgroundColor);
                      }
                    }}
                  >
                    {isCurrentlyPrivate ? (
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
              ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend} aria-label="Send message">
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
              {Object.keys(questionsMap).map((category) => (
                <Typography
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    color: selectedCategory === category ? "#FFFFFF" : "#1565D8",
                    backgroundColor: selectedCategory === category ? "#1565D8" : "#E3F2FD",
                    '&:hover': { backgroundColor: selectedCategory === category ? "#115293" : "#BBDEFB" },
                  }}
                >
                  {category}
                </Typography>
              ))}
            </Box>

            {selectedCategory && (
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