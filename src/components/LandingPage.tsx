import React, { useState, KeyboardEvent } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GavelIcon from '@mui/icons-material/Gavel';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTheme } from '@mui/material/styles';

// Import de l'icône du certificat
import certifiate_icon from '../certifiate.png';

interface LandingPageProps {
  onSend: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSend }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState('');

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

  // Définition des boutons en fonction de la taille de l'écran
  const buttons = [
    {
      label: isSmallScreen ? 'Academic Info' : 'Academic Information',
      value: isSmallScreen ? 'Academic Info' : 'Academic Information',
      icon: <SchoolIcon style={{ color: '#3DD957' }} />,
      visible: true,
    },
    {
      label: 'Events',
      value: 'Events',
      icon: <EventIcon style={{ color: '#F97315' }} />,
      visible: true,
    },
    {
      label: isSmallScreen ? 'Policies' : 'Processes and Policies',
      value: isSmallScreen ? 'Policies' : 'Processes and Policies',
      icon: <GavelIcon style={{ color: '#1565D8' }} />,
      visible: true,
    },
    {
      label: 'Facilities',
      value: 'Facilities',
      icon: <ApartmentIcon style={{ color: '#7C3BEC' }} />,
      visible: !isSmallScreen, // Masqué sur les petits écrans
    },
    {
      label: 'Financial Aid',
      value: 'Financial Aid',
      icon: <FavoriteIcon style={{ color: '#EF4361' }} />,
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
        button.value === 'Processes and Policies' ||
        button.value === 'Financial Aid')
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent={isSmallScreen ? 'flex-start' : 'center'} // Remonter le contenu sur petits écrans
      height="100vh" // Hauteur complète de la page
      bgcolor={theme.palette.background.default}
      p={isSmallScreen ? 2 : 4} // Réduire le padding sur petits écrans
      position="relative" // Pour le positionnement du footer
      overflow="hidden" // Empêcher le défilement
    >
      {/* Conteneur pour ajuster le positionnement sur petits écrans */}
      <Box
        width="100%"
        maxWidth={isSmallScreen ? '90%' : '800px'}
        mt={isSmallScreen ? 8 : 0} // Ajouter une marge supérieure sur petits écrans
      >
        {/* Titre principal */}
        <Typography
          variant={isSmallScreen ? 'h5' : 'h4'} // Ajustement de la taille de la police sur petits écrans
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            maxWidth: '100%',
            wordBreak: 'break-word', // Permet de casser le mot si nécessaire
          }}
        >
          How can I help you today?
        </Typography>

        {/* Champ de recherche */}
        <Box
          width="100%"
          maxWidth={isSmallScreen ? '100%' : '800px'} // Augmenter la largeur sur petits écrans
          mt={2}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask Lucy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend}>
                    <ArrowCircleUpIcon
                      style={{
                        color: '#011F5B',
                        fontSize: '2rem',
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                backgroundColor: '#F4F4F4',
                border: '1px solid #BCBCBC',
                fontSize: isSmallScreen ? '0.9rem' : '1rem', // Ajuster la taille du texte
                padding: isSmallScreen ? '2px 8px' : '4px 8px', // Réduire la hauteur sur petits écrans
                borderRadius: '35px',
                // whiteSpace: 'nowrap', // Retiré pour permettre le wrapping si nécessaire
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
          gap={isSmallScreen ? 1 : 2} // Ajuster l'espacement sur petits écrans
        >
          {isSmallScreen ? (
            <>
              {/* Première ligne de boutons */}
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                mb={1} // Réduire la marge entre les lignes
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
                      padding: '6px 8px', // Réduire le padding pour une hauteur plus petite
                      textTransform: 'none',
                      whiteSpace: 'nowrap', // Empêcher le texte de passer à la ligne
                      width: '48%', // Deux boutons par ligne
                      fontSize: '0.9rem', // Ajuster la taille du texte
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
                      padding: '6px 8px', // Réduire le padding pour une hauteur plus petite
                      textTransform: 'none',
                      whiteSpace: 'nowrap', // Empêcher le texte de passer à la ligne
                      width: '48%', // Deux boutons par ligne
                      fontSize: '0.9rem', // Ajuster la taille du texte
                    }}
                    startIcon={button.icon}
                  >
                    {button.label}
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <Box display="flex" justifyContent="space-between" width="100%">
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
                      whiteSpace: 'nowrap', // Empêcher le texte de passer à la ligne
                      flexGrow: 1,
                      marginRight:
                        index !== buttons.length - 1 && !isSmallScreen
                          ? '16px'
                          : '0px', // Ajouter un espace entre les boutons sauf pour le dernier
                      fontSize: '1rem', // Taille du texte normale
                    }}
                    startIcon={button.icon}
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
        position="absolute" // Positionner le footer en bas
        bottom={0} // Coller au bas
        width="100%" // Largeur complète
        pb={{ xs: 10, sm: 4 }} // Augmenter le padding-bottom sur les petits écrans
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