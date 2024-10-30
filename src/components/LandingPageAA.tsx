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
      label: isSmallScreen ? 'Academic Adv' : 'Academic Advisor',
      value: isSmallScreen ? 'Academic Adv' : 'Academic Advisor',
      icon: <FaGraduationCap style={{ color: '#3DD957' }} size={20} />,
      visible: true,
    },
    {
      label: 'Enrollment',
      value: 'Enrollment',
      icon: <FaRegCalendarAlt style={{ color: '#F97315' }} size={20} />,
      visible: true,
    },
    {
      label: isSmallScreen ? 'Executive' : 'Executive',
      value: isSmallScreen ? 'Executive' : 'Executive',
      icon: <FaBalanceScale style={{ color: '#1565D8' }} size={20} />,
      visible: true,
    },
    {
      label: 'Mental Health',
      value: 'Mental Health',
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
      (button.value === 'Academic Adv' ||
        button.value === 'Academic Advisor' ||
        button.value === 'Events')
  );
  const secondRowButtons = buttons.filter(
    (button) =>
      button.visible &&
      (button.value === 'Enrollment' ||
        button.value === 'Enrollment' ||
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
      {/* Conteneur pour ajuster le positionnement sur petits écrans */}
      <Box
        width="100%"
        maxWidth={isSmallScreen ? '90%' : '800px'}
        mt={isSmallScreen ? 8 : 0}
      >
        {/* Titre principal */}
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
          {isSmallScreen ? 'Ask analytics or find informations' : 'Ask analytics or find informations'}
        </Typography>

        {/* Champ de recherche */}
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

        {/* Boutons d'action */}
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
              {/* Première ligne de boutons */}
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
              {/* Deuxième ligne de boutons */}
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

      {/* Footer */}
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