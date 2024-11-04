
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


// components/LandingPage.tsx

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
    'Academic Advisor': [
      'How can I improve my study habits?',
      'What courses should I take next semester?',
      'How do I prepare for graduate school applications?',
      'Can you help me plan my academic schedule?',
    ],
    Enrollment: [
      'How do I enroll in a course?',
      'What are the enrollment deadlines?',
      'How does faculty feedback vary by department?',
      'Most common types of questions asked to Lucy across different categories?',
    ],
    Executive: [
      "What is the company's strategic plan?",
      'How can we improve team performance?',
      'What are our main objectives this quarter?',
      'How do we address the recent market changes?',
    ],
    'Mental Health': [
      'What resources are available for stress management?',
      'How can I improve my work-life balance?',
      'Who can I talk to about anxiety?',
      'Are there counseling services available?',
    ],
    'Financial Aid': [
      'How do I apply for scholarships?',
      'What loans are available to students?',
      'Can you explain the financial aid process?',
      'What is the deadline to apply for financial aid?',
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
      label: 'Academic Advisor',
      value: 'Academic Advisor',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
    },
    {
      label: 'Enrollment',
      value: 'Enrollment',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
    },
    {
      label: 'Executive',
      value: 'Executive',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
    },
    {
      label: 'Mental Health',
      value: 'Mental Health',
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