import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  FaGraduationCap,
  FaRegCalendarAlt,
  FaBalanceScale,
  FaBuilding,
  FaHandHoldingUsd,
} from 'react-icons/fa';

interface LandingPageProps {
  onSend: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [placeholderText, setPlaceholderText] = useState('');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isHoveringQuestions, setIsHoveringQuestions] = useState(false); // Suivi du survol des questions
  const [isHoveredInput, setIsHoveredInput] = useState(false);
  const [isHoveredButtons, setIsHoveredButtons] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Texte initial à taper
  const initialText = 'Ask Lucy...';

  // Questions mappées à chaque bouton
  const questionsMap: { [key: string]: string[] } = {
    'Academic Info': [
      'What are the most popular majors or programs?',
      'Are there honors programs or special academic tracks?',
      'Are there research opportunities available for undergraduate students?',
      'What options are there for studying abroad in Europe?',
    ],
    'Event & Tours': [
      'How can i book an in-person campus tour?',
      'Are there virtual tours available?',
      'What major campus events take place each semester?',
      'What student clubs or organizations are active on campus, and how can I join?',
    ],
    'Admission': [
      "What are the average GPA and test scores for admitted students?",
      'Do international students need to take additional tests or submit specific documents?',
      'Can I connect with current students or alumni to learn about their experiences?',
      'How can I track the status of my application after submitting it?',
    ],
    'Facilities': [
      'What types of housing options are available for  freshmen students?',
      'Are the gym and fitness facilities open to all students?',
      'What dining options are available for first year students?',
      'Are laundry facilities available in the dorms?',
    ],
    'Financial Aid': [
      'How do I apply for financial aid, and what types of aid are offered?',
      'Will, applying to financial aid impact my application?',
      'What is the work-study program, and how can I participate?',
      'How does the financial aid package compare year-to-year?',
    ],
  };

  // Fonction pour envoyer le message
  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSend(inputValue.trim());
      setInputValue('');
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  };

  // Gestion de la touche Entrée
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  //gestion du faux curseur
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prevShowCursor) => !prevShowCursor);
    }, 500); // Ajustez la vitesse de clignotement ici (500ms)
  
    return () => clearInterval(cursorInterval);
  }, []);

  // Lors du survol d'un bouton
  const handleButtonMouseEnter = (buttonText: string) => {
    setActiveButton(buttonText);
    setPlaceholderText('Ask Lucy...');
  };

  // Lors du clic sur un bouton (pour maintenir l'état actif)
  const handleButtonClick = (buttonText: string) => {
    setActiveButton(buttonText);
    setPlaceholderText('Ask Lucy...');
  };

  // Lors du survol d'une question
  const handleQuestionHover = (question: string) => {
    setInputValue(question);
  };

  // Lors du clic sur une question
  const handleQuestionClick = (question: string) => {
    onSend(question);
    setInputValue('');
    setActiveButton(null);
    setPlaceholderText('Ask Lucy...');
  };

  // Gestion du changement dans le champ de saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Si le champ est vide, réinitialiser les états
    if (value.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  };

  // Animation de saisie pour le texte initial
  useEffect(() => {
    let index = 0;
    let currentText = '';
    const typingSpeed = 100; // Vitesse de saisie en millisecondes

    const typingInterval = setInterval(() => {
      if (index < initialText.length) {
        currentText += initialText.charAt(index);
        setInputValue(currentText);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setInputValue(''); // Effacer l'input après la saisie
        setPlaceholderText('Ask Lucy...'); // Définir le placeholder après la saisie
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  // Réinitialiser l'état lorsque le champ est vide
  useEffect(() => {
    if (!isTyping && inputValue.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  }, [inputValue, isTyping]);

  // Ajouter un écouteur d'événements pour détecter les clics en dehors des boutons et des questions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isHoveringQuestions // Ne masquer que si on ne survole pas les questions
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
  }, [isHoveringQuestions]); // Relancer l'effet si `isHoveringQuestions` change

  // Définition des boutons
  const buttons = [
    {
      label: 'Academic Info',
      value: 'Academic Info',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
    },
    {
      label: 'Event & Tours',
      value: 'Event & Tours',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
    },
    {
      label: 'Admission',
      value: 'Admission',
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100vh"
      bgcolor="#FFFFFF"
      p={isSmallScreen ? 2 : 4}
      position="relative"
      overflow="hidden"
    >
      {/* Arrière-plan Spline */}
      <iframe
        src="https://my.spline.design/aiassistanthoverandclickinteraction-afdf94418f2cc3f7f17a6aad54796013/"
        style={{
          position: 'absolute', // En arrière-plan
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          //zIndex: -1, // Derrière tout
          border: 'none',
        }}
        title="Spline Scene"
        allowFullScreen
      />

      {/* Contenu principal de la landing page */}
      <Box
        width="100%"
        maxWidth="800px"
        mt={isSmallScreen ? 6 : 30}
        position="relative"
        zIndex={1}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{ color: '#011F5B', maxWidth: '100%', wordBreak: 'break-word' }}
        >
          What are you looking for?
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          //placeholder={isTyping ? '' : placeholderText}
          placeholder={isTyping ? '' : `${placeholderText}${showCursor ? '|' : ''}`} // Curseur clignotant
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend}>
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
              border: 'none', // Retire le contour
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Ombre constante autour du champ
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
              color: '#6F6F6F', // Placeholder plus sombre
              opacity: 1,
            },
          }}
        />

        {/* Conteneur pour les boutons et les questions */}
        <Box ref={containerRef}>
          {/* Boutons */}
          <Box
            mt={3}
            display="flex"
            flexDirection={isSmallScreen ? 'column' : 'row'}
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth="800px"
            gap="16px"
          >
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="contained"
                size="large"
                onMouseEnter={() => handleButtonMouseEnter(button.label)}
                onClick={() => handleButtonClick(button.label)}
                sx={{
                  //borderColor: '#011F5B',
                  color: '#011F5B',
                  borderRadius: '15px',
                  padding: '6px 16px',
                  textTransform: 'none',
                  backgroundColor: '#F4F4F4',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.3s, color 0.3s',
                  '&:hover': {
                    backgroundColor: '#011F5B',
                    color: '#FFFFFF',
                  },
                }}
                startIcon={button.icon}
              >
                {button.label}
              </Button>
            ))}
          </Box>

          {/* Suggestions de questions */}
          {activeButton && questionsMap[activeButton] && (
            <Box
              mt={2}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              maxWidth="800px"
              bgcolor="#FFFFFF"
              border="1px solid #BCBCBC"
              borderRadius="8px"
              p={2}
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              onMouseEnter={() => setIsHoveringQuestions(true)}
              onMouseLeave={() => setIsHoveringQuestions(false)}
            >
              {questionsMap[activeButton].map((question, index) => (
                <React.Fragment key={index}>
                  <Typography
                    onMouseEnter={() => handleQuestionHover(question)}
                    onClick={() => handleQuestionClick(question)}
                    sx={{
                      padding: '8px 0',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: '#333',
                      transition: 'background-color 0.3s',
                      borderRadius: '4px',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#F0F0F0',
                      },
                    }}
                  >
                    {question}
                  </Typography>
                  {index < questionsMap[activeButton].length - 1 && (
                    <Divider sx={{ width: '100%' }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;