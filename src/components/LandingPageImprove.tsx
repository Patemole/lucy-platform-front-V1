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
import Tooltip from '@mui/material/Tooltip';

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
  const [showCursor, setShowCursor] = useState(true);
  // État pour la confidentialité (Public/Private)
  const [isPrivate, setIsPrivate] = React.useState(false); // Par défaut, en mode Public


  const containerRef = useRef<HTMLDivElement>(null);

  // Texte initial à taper
  const initialText = 'Ask Lucy...';

  // Fonction pour envoyer le message
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

  React.useEffect(() => {
    console.log("Privacy state changed:", isPrivate ? "Private" : "Public");
  }, [isPrivate]);

  // Gestion de la touche Entrée
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
      event.preventDefault();
    }
  };

  // Gestion du faux curseur clignotant
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prevShowCursor) => !prevShowCursor);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Gestion du survol des boutons
  const handleButtonMouseEnter = (buttonText: string) => {
    setActiveButton(buttonText);
    setPlaceholderText('Ask Lucy...');
  };

  // Gestion du clic sur un bouton
  const handleButtonClick = (buttonText: string) => {
    setActiveButton(buttonText);
    setPlaceholderText('Ask Lucy...');
  };

  // Gestion du survol d'une question
  const handleQuestionHover = (question: string) => {
    setInputValue(question);
  };

  // Gestion du clic sur une question
  const handleQuestionClick = (question: string) => {
    onSend(question);
    setInputValue('');
    setActiveButton(null);
    setPlaceholderText('Ask Lucy...');
  };

  // Gestion du changement dans le champ de saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Current input value in handleInputChange:', value);
    setInputValue(value);
  };

  // Animation de saisie pour le texte initial
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

  // Réinitialiser l'état lorsque le champ est vide
  useEffect(() => {
    if (!isTyping && inputValue.trim() === '') {
      setActiveButton(null);
      setPlaceholderText('Ask Lucy...');
    }
  }, [inputValue, isTyping]);

  // Gestion du clic à l'extérieur pour réinitialiser les états
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

  // Définition des boutons
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

  // Filtrer les boutons en fonction de la taille de l'écran
  const buttons = isSmallScreen
    ? allButtons.filter((button) => button.label !== 'Admission')
    : allButtons;

  // Questions mappées à chaque bouton
  /*
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
  */

  const questionsMap: { [key: string]: string[] } = {
    'Academic Info': [
      'How can I get involved in research opportunities as an undergraduate',
      'What options are available for me to study abroad in Europe?',
      'What tutoring or academic support services do I have if I’m struggling in my courses?',
      'What resources are available for me to pursue independent study projects?',
    ],
    'Events': [
      'How do I book an in-person campus tour for my family visiting me?',
      'What major campus events should I look out for this semester?',
      'Which student clubs or organizations are currently active on campus, and how do I join them?',
      'Are there opportunities for me to host or lead events on campus?',
    ],
    'Policies': [
      'What’s the process for changing my major or adding a minor?',
      'How can I get clarification on degree requirements and academic advising?',
      'Are there procedures in place for taking a leave of absence or withdrawing from the university?',
      'How do I appeal a grade or academic decision if I feel it was unfair?',
    ],
    'Facilities': [
      'What housing options are available for upperclassment?',
      'Are the gym and fitness facilities accessible to all students?',
      'How do I report maintenance issues in my housing?',
      'What should I do if I encounter issues with roommate conflicts or community living challenges?',
    ],
    'Financial Aid': [
      'How do I apply for financial aid for the next academic year?',
      'What is the work-study program like?',
      'Are there additional scholarships available for current students, and how do I apply?',
      'What should I do if my financial situation changes during the academic year?',
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
        backgroundColor: isSmallScreen ? '#F0F4FA' : 'transparent', // Couleur pour les petits écrans
      }}
    >
      {/* Arrière-plan Spline - affiché uniquement sur les grands écrans */}
      {isLargeScreen && (
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
      )}

      {/* Contenu principal de la landing page */}
      <Box
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
            mb: 2, // Ajoute une marge inférieure de 4 unités de spacing (par défaut 4 * 8px = 32px)
            wordBreak: 'break-word',
            ...(isSmallScreen && {
              fontSize: '1.5rem', // Taille ajustée pour les petits écrans
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
          onKeyPress={handleKeyPress}
          placeholder={isTyping ? '' : `${placeholderText}${showCursor ? '|' : ''}`}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip
                    title={
                        isPrivate ? (
                          <>
                            Your content is private and only visible to you.
                            <br />
                            Click to make public.
                          </>
                        ) : (
                          <>
                            Your content is public and visible to everyone.
                            <br />
                            Click to make private.
                          </>
                        )
                      }
                    arrow // Ajoute une petite flèche à la bulle
                    placement="top" // Position de la bulle par rapport à l'élément
                >
                    <IconButton
                    onClick={() => {
                        const newPrivacyState = !isPrivate; // Inverse l'état
                        console.log("Toggling privacy state:", newPrivacyState); // Log la nouvelle valeur
                        setIsPrivate(newPrivacyState); // Met à jour l'état
                    }}
                    edge="start"
                    aria-label={isPrivate ? "Set to Public" : "Set to Private"}
                    sx={{
                        backgroundColor: isPrivate ? '#E0E0E0' : '#D6DDF5', // Fond
                        color: isPrivate ? '#6F6F6F' : '#3155CC', // Texte
                        borderRadius: '12px', // Bords arrondis
                        padding: '6px 12px', // Ajustement de l'espacement interne pour rendre le rectangle plus grand
                        marginLeft: '8px', // Ajout d'espace entre le rectangle et la gauche du placeholder
                        marginRight: '12px', // Espace entre le rectangle et le champ texte
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        width: '80px', // Largeur plus grande
                        height: '35px', // Hauteur plus grande
                        fontSize: '0.9rem', // Taille du texte proportionnée
                        '&:hover': {
                        backgroundColor: isPrivate ? '#D5D5D5' : '#C4A4D8', // Variation légère au hover
                        color: isPrivate ? '#5A5A5A' : '#4A0B8A', // Couleur du texte au hover
                        },
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
                    </Tooltip>
              </InputAdornment>
            ),
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
      </Box>
    </Box>
  );
};

export default LandingPage;