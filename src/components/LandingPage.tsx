
/* DERNIER QUI EST PARFAIT MAIS SANS LES QUESTIONS
import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FiSend } from 'react-icons/fi'; // Modern send icon
import SendIcon from '@mui/icons-material/Send';
import { FaGraduationCap, FaRegCalendarAlt, FaBalanceScale, FaBuilding, FaHandHoldingUsd } from 'react-icons/fa';

// Import de l'icône du certificat
import certifiate_icon from '../certifiate.png';

interface LandingPageProps {
  onSend: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  // Fonction pour envoyer le message
  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  // Gestion de la touche "Entrée"
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  useEffect(() => {
    const text = 'Ask Lucy...';
    let index = 0;
    let currentText = '';
    let isCursorVisible = true;

    const typingSpeed = 100; // Vitesse d'écriture du texte
    const cursorBlinkSpeed = 500; // Vitesse du clignotement du curseur

    let typingInterval: NodeJS.Timeout | null = null;
    let cursorBlinkInterval: NodeJS.Timeout | null = null;

    // Fonction pour le clignotement du curseur
    const startCursorBlink = () => {
      cursorBlinkInterval = setInterval(() => {
        isCursorVisible = !isCursorVisible;
        setPlaceholder(currentText + (isCursorVisible ? '|' : ''));
      }, cursorBlinkSpeed);
    };

    // Démarrer la frappe du texte
    typingInterval = setInterval(() => {
      if (index < text.length) {
        currentText += text.charAt(index);
        index++;
        setPlaceholder(currentText);
      } else {
        // Arrêter la frappe et démarrer le clignotement du curseur
        if (typingInterval) clearInterval(typingInterval);
        startCursorBlink();
      }
    }, typingSpeed);

    return () => {
      // Nettoyer les intervalles
      if (typingInterval) clearInterval(typingInterval);
      if (cursorBlinkInterval) clearInterval(cursorBlinkInterval);
    };
  }, []);

  // Définition des boutons avec des icônes plus modernes
  const buttons = [
    {
      label: isSmallScreen ? 'Academic Info' : 'Academic Information',
      value: isSmallScreen ? 'Academic Info' : 'Academic Information',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
      visible: true,
    },
    {
      label: 'Events',
      value: 'Events',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
      visible: true,
    },
    {
      label: isSmallScreen ? 'Policies' : 'Processes & Policies',
      value: isSmallScreen ? 'Policies' : 'Processes & Policies',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
      visible: true,
    },
    {
      label: 'Facilities',
      value: 'Facilities',
      icon: <FaBuilding style={{ color: '#7C3BEC' }} size={20} />,
      visible: !isSmallScreen, // Masqué sur les petits écrans
    },
    {
      label: 'Financial Aid',
      value: 'Financial Aid',
      icon: <FaHandHoldingUsd style={{ color: '#EF4361' }} size={20} />,
      visible: true,
    },
  ];

  // Séparer les boutons en deux lignes pour les petits écrans
  const firstRowButtons = buttons.filter(
    (button) =>
      button.visible &&
      (button.value === 'Academic Info' ||
        button.value === 'Academic Information' ||
        button.value === 'Events')
  );
  const secondRowButtons = buttons.filter(
    (button) =>
      button.visible &&
      (button.value === 'Policies' ||
        button.value === 'Processes & Policies' ||
        button.value === 'Financial Aid')
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent={isSmallScreen ? 'flex-start' : 'center'}
      height="100vh"
      bgcolor={theme.palette.background.default}
      p={isSmallScreen ? 2 : 4}
      position="relative"
      overflow="hidden"
    >
      {/* Conteneur pour ajuster le positionnement sur petits écrans *
      <Box
        width="100%"
        maxWidth={isSmallScreen ? '90%' : '800px'}
        mt={isSmallScreen ? 8 : 0}
      >
        {/* Titre principal *
        <Typography
          variant={isSmallScreen ? 'h4' : 'h4'}
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          {isSmallScreen ? 'How can I help today?' : 'How can I help you today?'}
        </Typography>

        {/* Champ de recherche *
        <Box
          width="100%"
          maxWidth={isSmallScreen ? '100%' : '800px'}
          mt={2}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend}>
                    <SendIcon
                      style={{
                        color: '#011F5B',
                        fontSize: '1.5rem',
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                backgroundColor: '#F4F4F4',
                border: '1px solid #BCBCBC',
                fontSize: isSmallScreen ? '0.9rem' : '1rem',
                padding: isSmallScreen ? '2px 8px' : '4px 8px',
                borderRadius: '35px',
              },
            }}
          />
        </Box>

        {/* Boutons d'action *
        <Box
          mt={3}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          maxWidth={isSmallScreen ? '100%' : '800px'}
          gap={isSmallScreen ? 1 : 2}
        >
          {isSmallScreen ? (
            <>
              {/* Première ligne de boutons *
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                mb={1}
              >
                {firstRowButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="large"
                    onClick={() => onSend(button.value)}
                    sx={{
                      borderColor: '#011F5B',
                      color: '#011F5B',
                      borderRadius: '15px',
                      padding: '6px 8px',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      width: '48%',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                    startIcon={button.icon}
                  >
                    {button.label}
                  </Button>
                ))}
              </Box>
              {/* Deuxième ligne de boutons *
              <Box display="flex" justifyContent="space-between" width="100%">
                {secondRowButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="large"
                    onClick={() => onSend(button.value)}
                    sx={{
                      borderColor: '#011F5B',
                      color: '#011F5B',
                      borderRadius: '15px',
                      padding: '6px 8px',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      width: '48%',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                    startIcon={button.icon}
                  >
                    {button.label}
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <Box display="flex" justifyContent="center" width="100%" gap="16px">
              {buttons
                .filter((button) => button.visible)
                .map((button, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="large"
                    onClick={() => onSend(button.value)}
                    sx={{
                      borderColor: '#011F5B',
                      color: '#011F5B',
                      borderRadius: '15px',
                      padding: '6px 16px',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      minWidth: 'auto',
                    }}
                    startIcon={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '8px',
                        }}
                      >
                        {button.icon}
                      </Box>
                    }
                  >
                    {button.label}
                  </Button>
                ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer *
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="absolute"
        bottom={0}
        width="100%"
        pb={{ xs: 10, sm: 4 }}
      >
        <Typography
          variant="body2"
          align="center"
          sx={{ color: '#011F5B', mr: 1 }}
        >
          BASED ON VERIFIED DATA FROM {theme.university?.toUpperCase() || 'UNIVERSITY'}.EDU
        </Typography>
        <img
          src={certifiate_icon}
          alt="Verified"
          style={{ width: '24px', height: '24px' }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;

*/



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
  const [isHoveringQuestions, setIsHoveringQuestions] = useState(false); // New state to track hovering over the questions container

  const containerRef = useRef<HTMLDivElement>(null);

  // Initial text to type
  const initialText = 'Ask Lucy...';

  // Questions mapped to each button
  // Questions mapped to each button
  const questionsMap: { [key: string]: string[] } = {
    'Academic Info': [
      'How can I improve my study habits?',
      'What courses should I take next semester?',
      'How do I prepare for graduate school applications?',
      'Can you help me plan my academic schedule?',
    ],
    'Events & Tours': [
      'What events are happening this semester?',
      'How can I sign up for campus tours?',
      'Are there virtual tours available?',
      'How do I get involved in campus activities?',
    ],
    'Admission Processes': [
      'How do I apply for admission?',
      'What are the admission requirements?',
      'What is the deadline for applications?',
      'How do I check my application status?',
    ],
    'Facilities': [
      'What are the library hours?',
      'How do I reserve study rooms?',
      'Where can I find sports facilities?',
      'What dining options are available on campus?',
    ],
    'Financial Aid': [
      'How do I apply for scholarships?',
      'What loans are available to students?',
      'Can you explain the financial aid process?',
      'What is the deadline to apply for financial aid?',
    ],
  };

  // Function to send the message
  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSend(inputValue.trim());
      setInputValue('');
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  // When hovering over a button
  const handleButtonMouseEnter = (buttonText: string) => {
    setActiveButton(buttonText);
    setPlaceholderText('Ask Lucy...');
  };

  // When hovering over a question
  const handleQuestionHover = (question: string) => {
    setInputValue(question);
  };

  // When clicking a question
  const handleQuestionClick = (question: string) => {
    onSend(question);
    setInputValue('');
    setActiveButton(null);
    setPlaceholderText('Ask Lucy...');
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // If the input is cleared, reset states
    if (value.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  };

  // Typing animation for initial text
  useEffect(() => {
    let index = 0;
    let currentText = '';
    const typingSpeed = 100; // Typing speed in milliseconds

    const typingInterval = setInterval(() => {
      if (index < initialText.length) {
        currentText += initialText.charAt(index);
        setInputValue(currentText);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setInputValue(''); // Clear input after typing
        setPlaceholderText('Ask Lucy...'); // Set placeholder after typing
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  // Reset state when input is empty
  useEffect(() => {
    if (!isTyping && inputValue.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  }, [inputValue, isTyping]);

  // Add event listener to detect clicks outside of buttons and questions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isHoveringQuestions // Only hide if not hovering over the questions container
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
  }, [isHoveringQuestions]); // Rerun effect if `isHoveringQuestions` changes

  // Original buttons
  const buttons = [
    {
      label: 'Academic Info',
      value: 'Academic Information',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
      visible: true,
    },
    {
      label: 'Events & Tours',
      value: 'Events & Tours',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
      visible: true,
    },
    {
      label: 'Admission',
      value: 'Admission Processes',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
      visible: true,
    },
    {
      label: 'Facilities',
      value: 'Facilities',
      icon: <FaBuilding style={{ color: '#7C3BEC' }} size={20} />,
      visible: true,
    },
    {
      label: 'Financial Aid',
      value: 'Financial Aid',
      icon: <FaHandHoldingUsd style={{ color: '#EF4361' }} size={20} />,
      visible: true,
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100vh"
      bgcolor={theme.palette.background.default}
      p={isSmallScreen ? 2 : 4}
      position="relative"
      overflow="hidden"
    >
      <Box width="100%" maxWidth="800px" mt={isSmallScreen ? 6 : 30}>
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{ color: '#011F5B', maxWidth: '100%', wordBreak: 'break-word' }}
        >
          How can I help you today?
        </Typography>

        {/* Search field */}
        <Box width="100%" maxWidth="800px" mt={2}>
          <TextField
            fullWidth
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isTyping ? '' : placeholderText}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend}>
                    <SendIcon style={{ color: '#011F5B', fontSize: '1.5rem' }} />
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                backgroundColor: '#F4F4F4',
                border: '1px solid #BCBCBC',
                fontSize: '1rem',
                padding: '4px 8px',
                borderRadius: '35px',
                color: isTyping ? '#A9A9A9' : '#000000',
              },
            }}
            inputProps={{
              style: { color: isTyping ? '#A9A9A9' : '#000000' },
            }}
          />
        </Box>

        {/* Container for buttons and questions */}
        <Box ref={containerRef}>
          {/* Buttons */}
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
                variant="outlined"
                size="large"
                onMouseEnter={() => handleButtonMouseEnter(button.label)}
                sx={{
                  borderColor: '#011F5B',
                  color: '#011F5B',
                  borderRadius: '15px',
                  padding: '6px 16px',
                  textTransform: 'none',
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

          {/* Questions suggestions */}
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























/*

import React, { useState, KeyboardEvent } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { useTheme } from '@mui/material/styles';

// Import the certificate icon
import certifiate_icon from '../certifiate.png'; 

interface LandingPageProps {
  onSend: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend }) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  // Function to send the message
  const handleSend = () => {
    if (inputValue.trim() !== '') {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  // Handle "Enter" key
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor={theme.palette.background.default}
      p={4}
    >
      {/* Main title *
      <Typography
        variant="h3"
        fontWeight="bold"
        align="center"
        gutterBottom
        style={{ color: theme.palette.text.primary }}
      >
        How can I help you today?
      </Typography>

      {/* Search input *
      <Box width="100%" maxWidth="600px" mt={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask to Lucy..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend}>
                  <ArrowCircleUpIcon style={{ color: '#011F5B' }} />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              backgroundColor: '#F4F4F4',
              border: '1px solid #BCBCBC',
              fontSize: '1rem',
              padding: '8px 12px', // Reduce padding for a smaller height
              borderRadius: '35px',
            },
          }}
        />
      </Box>

      {/* Action buttons *
      <Box mt={3} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Academic Information')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          startIcon={<i style={{ color: 'green' }}>📚</i>} // Example icon
        >
          Academic Information
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Events')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          startIcon={<i style={{ color: 'orange' }}>🎉</i>} // Example icon
        >
          Events
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Processes and Policies')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          startIcon={<i style={{ color: 'blue' }}>⚖️</i>} // Example icon
        >
          Processes and Policies
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Facilities')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          startIcon={<i style={{ color: 'purple' }}>🏢</i>} // Example icon
        >
          Facilities
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Financial Aid')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          startIcon={<i style={{ color: 'red' }}>❤️</i>} // Example icon
        >
          Financial Aid
        </Button>
      </Box>

      {/* Footer *
      <Box display="flex" alignItems="center" mt={4} justifyContent="center">
        <Typography
          variant="body2"
          align="center"
          sx={{ color: '#011F5B', mr: 1 }}
        >
          BASED ON VERIFIED DATA FROM UPENN.EDU
        </Typography>
        <img src={certifiate_icon} alt="Verified" style={{ width: '24px', height: '24px' }} />
      </Box>
    </Box>
  );
};

export default LandingPage;

*/