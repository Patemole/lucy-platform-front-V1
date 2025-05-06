import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useTheme } from '@mui/material/styles';

interface SideChatInputProps {
  onSendMessage: (message: string) => void;
}

const SideChatInput: React.FC<SideChatInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '16px 16px',
      borderTop: '1px solid #e0e0e0',
      //backgroundColor: 'red',
    }}>
      <TextField 
        fullWidth
        variant="outlined"
        placeholder="Ask Lucy about housing..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        multiline
        minRows={1}
        maxRows={4}
        InputProps={{
          style: {
            backgroundColor: '#F4F4F4',
            borderRadius: '20px',
            padding: '8px 15px',
            fontSize: '0.95rem',
            color: theme.palette.text.primary,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }
        }}
        sx={{ 
          mr: 1.5,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },
          },
          '& .MuiInputBase-input::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.8,
          },
        }}
      />
      <IconButton 
        onClick={handleSend} 
        disabled={!inputValue.trim()}
        sx={{
          backgroundColor: inputValue.trim() ? theme.palette.primary.main : theme.palette.action.disabledBackground,
          color: inputValue.trim() ? theme.palette.primary.contrastText : theme.palette.action.disabled,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          transition: 'background-color 0.3s',
          '&:hover': {
            backgroundColor: inputValue.trim() ? theme.palette.primary.dark : theme.palette.action.disabledBackground,
          }
        }}
      >
        <ArrowUpwardIcon sx={{ fontSize: '18px' }} />
      </IconButton>
    </Box>
  );
};

export default SideChatInput; 