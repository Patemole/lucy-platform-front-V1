import React, { useState } from 'react';
import { Box, Typography, Snackbar } from '@mui/material';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import useAuthStore from '../../stores/useAuthStore';
import useChatStore from '../../stores/useChatStore';
import { saveFeedback } from '../../api/chat';

export const useForcedFeedback = () => {
  const { messages, currentChatId, isStreamingResponse } = useChatStore();
  const [feedbackStatus, setFeedbackStatus] = useState<{[key: number]: boolean}>({});

  const shouldShowFeedback = () => {
    if (!messages.length || isStreamingResponse) return false;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== 'ai') return false;
    
    const aiMessageCount = messages.filter(msg => msg.type === 'ai').length;
    return aiMessageCount > 0 && aiMessageCount % 4 === 0 && !feedbackStatus[lastMessage.id];
  };

  return {
    shouldShowFeedback,
    feedbackStatus,
    setFeedbackStatus
  };
};

export const ForcedFeedback: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, currentChatId } = useChatStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { feedbackStatus, setFeedbackStatus } = useForcedFeedback();

  const handleFeedback = async (isPositive: boolean) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !currentChatId || !user?.id) return;
    
    try {
      await saveFeedback({
        messageId: lastMessage.id,
        chatSessionId: currentChatId,
        isPositive,
        userId: user.id
      });
      setFeedbackStatus(prev => ({
        ...prev,
        [lastMessage.id]: true
      }));
      setSnackbarMessage(isPositive ? 'Merci pour votre feedback positif !' : 'Merci pour votre feedback négatif !');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving feedback:', error);
      setSnackbarMessage('Une erreur est survenue lors de l\'enregistrement du feedback');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(60px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#333' }}>
          Comment évaluez-vous cette réponse ?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
            onClick={() => handleFeedback(false)}
          >
            <Typography sx={{ mb: 1, color: '#666' }}>Pas satisfait</Typography>
            <FiThumbsDown size={24} style={{ color: '#f87171' }} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
            onClick={() => handleFeedback(true)}
          >
            <Typography sx={{ mb: 1, color: '#666' }}>Satisfait</Typography>
            <FiThumbsUp size={24} style={{ color: '#4ade80' }} />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ForcedFeedback; 