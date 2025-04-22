import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend } from '../../../api/chat';
import useChatStore from '../../../stores/useChatStore';
import useAuthStore from '../../../stores/useAuthStore';
import { Message, AnswerDocument, AnswerImage, AnswerTAK, AnswerCourse, AnswerWaiting, AnswerCHART, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerERROR, AnswerACCURACYSCORE, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2 } from '../../../interfaces/interfaces_eleve';

interface LucyChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LucyChatSidebar: React.FC<LucyChatSidebarProps> = ({ isOpen, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatStore = useChatStore();
  const authStore = useAuthStore();
  const { user } = authStore;
  const { messages, addOptimisticMessage, updateLastAiMessage, finalizeAiMessage } = chatStore;

  useEffect(() => {
    // Initialize chat session if needed
    if (!chatStore.currentChatId && user) {
      chatStore.addNewConversation();
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      const updatedMessages = addOptimisticMessage(newMessage);
      setNewMessage('');
      setIsStreaming(true);

      try {
        // Create AbortController for cancellation
        const abortController = new AbortController();
        chatStore.setAbortController(abortController);

        const messageGenerator = sendMessageSocraticLangGraph({
          message: newMessage,
          chatSessionId: chatStore.currentChatId || 'penn-tinder-chat',
          courseId: 'penn-tinder',
          username: user.id,
          university: user.university || '',
          interests: user.interests || [],
          student_profile: '',
          major: user.major || [],
          minor: user.minor || [],
          year: user.year || '',
          faculty: user.faculty || [],
          isFirstMessage: updatedMessages.length <= 2, // Only human and AI message
          user: user,
          isOnboardingMessage: false,
        }, abortController.signal);

        let aiResponse = '';
        let currentMessage: Partial<Message> = {
          id: Date.now(),
          type: 'ai',
          content: '',
          isLoading: true
        };

        for await (const packet of messageGenerator) {
          if ('answer_piece' in packet) {
            aiResponse += packet.answer_piece;
            currentMessage.content = aiResponse;
            updateLastAiMessage(currentMessage);
          } else if ('answer_document' in packet) {
            currentMessage.citedDocuments = [...(currentMessage.citedDocuments || []), packet.answer_document as AnswerDocument];
            updateLastAiMessage(currentMessage);
          } else if ('answer_image' in packet) {
            currentMessage.images = [...(currentMessage.images || []), packet.answer_image as AnswerImage];
            updateLastAiMessage(currentMessage);
          } else if ('answer_TAK' in packet) {
            currentMessage.TAK = [...(currentMessage.TAK || []), packet.answer_TAK as AnswerTAK];
            updateLastAiMessage(currentMessage);
          } else if ('answer_COURSE' in packet) {
            currentMessage.COURSE = [...(currentMessage.COURSE || []), packet.answer_COURSE as AnswerCourse];
            updateLastAiMessage(currentMessage);
          } else if ('answer_waiting' in packet) {
            currentMessage.waitingMessages = [...(currentMessage.waitingMessages || []), packet.answer_waiting as AnswerWaiting];
            updateLastAiMessage(currentMessage);
          } else if ('answer_CHART' in packet) {
            currentMessage.CHART = [...(currentMessage.CHART || []), packet.answer_CHART as AnswerCHART];
            updateLastAiMessage(currentMessage);
          } else if ('answer_ReasoningSteps' in packet) {
            currentMessage.ReasoningSteps = [...(currentMessage.ReasoningSteps || []), packet.answer_ReasoningSteps as ReasoningStep];
            updateLastAiMessage(currentMessage);
          } else if ('answer_REDDIT' in packet) {
            currentMessage.REDDIT = [...(currentMessage.REDDIT || []), packet.answer_REDDIT as AnswerREDDIT];
            updateLastAiMessage(currentMessage);
          } else if ('answer_INSTA' in packet) {
            currentMessage.INSTA = [...(currentMessage.INSTA || []), packet.answer_INSTA as AnswerINSTA];
            updateLastAiMessage(currentMessage);
          } else if ('youtube' in packet) {
            currentMessage.YOUTUBE = [...(currentMessage.YOUTUBE || []), packet.youtube as AnswerYOUTUBE];
            updateLastAiMessage(currentMessage);
          } else if ('quora' in packet) {
            currentMessage.QUORA = [...(currentMessage.QUORA || []), packet.quora as AnswerQUORA];
            updateLastAiMessage(currentMessage);
          } else if ('error_back' in packet) {
            currentMessage.ERROR = [...(currentMessage.ERROR || []), packet.error_back as AnswerERROR];
            updateLastAiMessage(currentMessage);
          } else if ('accuracy_score' in packet) {
            currentMessage.CONFIDENCESCORE = [...(currentMessage.CONFIDENCESCORE || []), packet.accuracy_score as AnswerACCURACYSCORE];
            updateLastAiMessage(currentMessage);
          } else if ('answer_INSTA_CLUB' in packet) {
            currentMessage.INSTA_CLUB = [...(currentMessage.INSTA_CLUB || []), packet.answer_INSTA_CLUB as AnswerINSTA_CLUB];
            updateLastAiMessage(currentMessage);
          } else if ('answer_LINKEDIN' in packet) {
            currentMessage.LINKEDIN = [...(currentMessage.LINKEDIN || []), packet.answer_LINKEDIN as AnswerLINKEDIN];
            updateLastAiMessage(currentMessage);
          } else if ('answer_INSTA2' in packet) {
            currentMessage.INSTA2 = [...(currentMessage.INSTA2 || []), packet.answer_INSTA2 as AnswerINSTA2];
            updateLastAiMessage(currentMessage);
          }
        }

        // Finalize the AI message
        await finalizeAiMessage(aiResponse, currentMessage);

      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sending message:', error);
          // Add error message
          const errorMessage: Message = {
            id: Date.now(),
            type: 'error',
            content: "I'm sorry, I encountered an error. Please try again.",
            ERROR: [{
              errorSentence: error.message
            }]
          };
          chatStore.setMessages([...chatStore.messages.filter(m => !m.isLoading), errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        chatStore.setAbortController(null);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 0,
        top: '64px', // Adjust this value based on your header height
        height: 'calc(100vh - 64px)', // Subtract header height
        width: '350px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        borderLeft: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#011F5B',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: '#990000' }}>L</Avatar>
          <Typography variant="h6">Lucy Chat</Typography>
        </Box>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'human' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: message.type === 'human' ? '#011F5B' : '#f0f0f0',
                color: message.type === 'human' ? 'white' : 'black',
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              {message.isLoading && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Typing...
                </Typography>
              )}
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          disabled={isStreaming}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={isStreaming}
          sx={{
            bgcolor: '#011F5B',
            color: 'white',
            '&:hover': {
              bgcolor: '#01133a',
            },
            '&.Mui-disabled': {
              bgcolor: '#cccccc',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default LucyChatSidebar; 