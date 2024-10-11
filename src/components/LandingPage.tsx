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
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GavelIcon from '@mui/icons-material/Gavel';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
      height="100vh" // Full page height
      bgcolor={theme.palette.background.default}
      p={4}
      position="relative" // For footer positioning
      overflow="hidden" // Prevent scrolling
    >
      {/* Main title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        gutterBottom
        style={{ color: theme.palette.text.primary }}
      >
        How can I help you today?
      </Typography>

      {/* Search input */}
      <Box width="100%" maxWidth="800px" mt={2}>
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
                  <ArrowCircleUpIcon style={{ 
                    color: '#011F5B',
                    fontSize: '2rem',
                     }} />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              backgroundColor: '#F4F4F4',
              border: '1px solid #BCBCBC',
              fontSize: '1rem',
              padding: '4px 8px', // Reduced padding for smaller height
              borderRadius: '35px',
            },
          }}
        />
      </Box>

      {/* Action buttons */}
      <Box mt={3} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => onSend('Academic Information')}
          sx={{
            borderColor: '#011F5B',
            color: '#011F5B',
            borderRadius: '15px',
            padding: '6px 16px', // Reduced padding for smaller button height
            textTransform: 'none',
          }}
          startIcon={<SchoolIcon style={{ color: '#3DD957' }} />} // School icon for academic info
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
            padding: '6px 16px',
            textTransform: 'none',
          }}
          startIcon={<EventIcon style={{ color: '#F97315' }} />} // Event icon for events
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
            padding: '6px 16px',
            textTransform: 'none',
          }}
          startIcon={<GavelIcon style={{ color: '#1565D8' }} />} // Gavel icon for processes and policies
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
            padding: '6px 16px',
            textTransform: 'none',
          }}
          startIcon={<ApartmentIcon style={{ color: '#7C3BEC' }} />} // Apartment icon for facilities
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
            padding: '6px 16px',
            textTransform: 'none',
          }}
          startIcon={<FavoriteIcon style={{ color: '#EF4361' }} />} // Favorite icon for financial aid
        >
          Financial Aid
        </Button>
      </Box>

      {/* Footer */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        position="absolute" // Position footer at the bottom
        bottom={0} // Stick it to the bottom
        width="100%" // Full width
        pb={4} // More padding at the bottom for extra space
      >
        <Typography
          variant="body2"
          align="center"
          sx={{ color: '#011F5B', mr: 1 }}
        >
          BASED ON VERIFIED DATA FROM {theme.university.toUpperCase()}.EDU
        </Typography>
        <img src={certifiate_icon} alt="Verified" style={{ width: '24px', height: '24px' }} />
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