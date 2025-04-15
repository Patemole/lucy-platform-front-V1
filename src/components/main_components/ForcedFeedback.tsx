import React, { useState } from 'react';
import { Box, Typography, Snackbar } from '@mui/material';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import useAuthStore from '../../stores/useAuthStore';
import useChatStore from '../../stores/useChatStore';
import useFeedbackStore from '../../stores/useFeedbackStore';
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

  const getLastAiMessageAndContext = () => {
    if (!messages.length) return { aiMessage: null, humanMessage: null };
    
    // Trouver le dernier message de l'IA
    const aiMessageIndex = [...messages].reverse().findIndex(msg => msg.type === 'ai');
    if (aiMessageIndex === -1) return { aiMessage: null, humanMessage: null };
    
    const aiMessage = messages[messages.length - 1 - aiMessageIndex];
    
    // Trouver le message humain précédent
    const humanMessageIndex = messages.length - 1 - aiMessageIndex - 1;
    const humanMessage = humanMessageIndex >= 0 ? messages[humanMessageIndex] : null;
    
    return { aiMessage, humanMessage };
  };

  return {
    shouldShowFeedback,
    feedbackStatus,
    setFeedbackStatus,
    getLastAiMessageAndContext
  };
};

export const ForcedFeedback: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, currentChatId } = useChatStore();
  const { getLastAiMessageAndContext, setFeedbackStatus } = useFeedbackStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { aiMessage, humanMessage } = getLastAiMessageAndContext(messages);

  const handleFeedback = async (isPositive: boolean) => {
    if (!aiMessage || !currentChatId || !user?.id) return;
    
    setFeedbackStatus(aiMessage.id, true);
    
    try {
      await saveFeedback({
        messageId: aiMessage.id,
        chatSessionId: currentChatId,
        isPositive,
        userId: user.id,
        aiMessageContent: aiMessage.content,
        humanMessageContent: humanMessage?.content || ''
      });

      setSnackbarMessage(isPositive ? 'Merci pour votre feedback positif !' : 'Merci pour votre feedback négatif !');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving feedback:', error);
      setSnackbarMessage('Une erreur est survenue lors de l\'enregistrement du feedback, mais votre choix a été pris en compte localement');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto mt-4 bg-white/50 backdrop-blur-lg border border-white/20 rounded-lg p-4">
        <h3 className="text-center text-gray-800 text-lg font-medium mb-3">
          Comment évaluez-vous cette réponse ?
        </h3>
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => handleFeedback(false)}
            className="flex flex-col items-center group transition-transform hover:scale-105"
          >
            <span className="text-sm text-gray-600 mb-1">Pas satisfait</span>
            <FiThumbsDown className="text-red-400 text-xl group-hover:text-red-500" />
          </button>
          <button
            onClick={() => handleFeedback(true)}
            className="flex flex-col items-center group transition-transform hover:scale-105"
          >
            <span className="text-sm text-gray-600 mb-1">Satisfait</span>
            <FiThumbsUp className="text-green-400 text-xl group-hover:text-green-500" />
          </button>
        </div>
      </div>

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