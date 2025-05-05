import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Snackbar } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StopIcon from '@mui/icons-material/Stop';
import { useTheme } from '@mui/material/styles';
import useChatStore from '../../stores/useChatStore';
import useAuthStore from '../../stores/useAuthStore';
import { AIMessage } from '../main_components/MessagesWEB';
import { Message, AnswerDocument, AnswerImage, AnswerTAK, AnswerCourse, AnswerCHART, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR, AnswerACCURACYSCORE, AnswerWaiting, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../../interfaces/interfaces_eleve';
import { FeedbackType } from '../types';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend } from '../../api/chat';
import { submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../../api/feedback_wrong_answer';

// ID dédié pour la conversation de la sidebar
const SIDEBAR_CHAT_CONCEPT_ID = 'lucy-sidebar-quick-chat';

interface SidebarChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarChat: React.FC<SidebarChatProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [sidebarMessages, setSidebarMessages] = useState<Message[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const { setAbortController, abortController } = useChatStore();
  const { user } = useAuthStore();
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  }, [sidebarMessages]);

  const handleSourceClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleSendMessageInternal = async (textToSend: string, isActionMessage: boolean = false) => {
    if (!textToSend.trim() || !user || isLoadingLocal) return;

    if (!isActionMessage) {
      setInputValue('');
    }

    setIsLoadingLocal(true);
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);

    const uniqueHumanId = Date.now();
    const uniqueAiId = uniqueHumanId + 1;

    const optimisticHumanMessage: Message = {
        id: uniqueHumanId,
        type: 'human',
        content: textToSend,
    };
    const optimisticAIMessage: Message = {
        id: uniqueAiId,
        type: 'ai',
        content: '',
        isLoading: true,
        personaName: 'Lucy',
        citedDocuments: [],
        images: [],
        TAK: [],
        COURSE: [],
        waitingMessages: [],
        CHART: [],
        ReasoningSteps: [],
        REDDIT: [],
        INSTA: [],
        YOUTUBE: [],
        QUORA: [],
        ERROR: [],
        CONFIDENCESCORE: [],
        INSTA_CLUB: [],
        LINKEDIN: [],
        INSTA2: [],
    };

    setSidebarMessages(prev => [...prev, optimisticHumanMessage, optimisticAIMessage]);

    console.log(`SidebarChat: Sending message "${textToSend}" to chat ID: ${SIDEBAR_CHAT_CONCEPT_ID}`);

    let firstPacketProcessed = false;
    let finalAiContentForSave = '';
    let finalCitedDocsForSave: AnswerDocument[] = [];
    let finalConfidenceScoreForSave: number | null = null;

    try {
      const messageData = {
          message: textToSend,
          chatSessionId: SIDEBAR_CHAT_CONCEPT_ID,
          courseId: 'default_course_id',
          username: user?.name || 'default_sidebar_user',
          university: user?.university || 'default_university',
          interests: Array.isArray(user?.interests) ? user.interests : [],
          student_profile: localStorage.getItem('student_profile') || '',
          major: Array.isArray(user?.major) ? user.major : [],
          minor: Array.isArray(user?.minor) ? user.minor : [],
          year: user?.year || 'Unknown',
          faculty: Array.isArray(user?.faculty) ? user.faculty : [],
          isFirstMessage: !sidebarMessages.some(m => m.type === 'human'),
          user: user,
          isOnboardingMessage: false,
      };

      for await (const packetBunch of sendMessageSocraticLangGraph(messageData, currentAbortController.signal)) {
         setSidebarMessages(currentMessages => {
            const lastMessageIndex = currentMessages.length - 1;
            if (lastMessageIndex < 0 || currentMessages[lastMessageIndex].type !== 'ai') {
                return currentMessages;
            }

            const updatedMessages = [...currentMessages];
            let currentAiMessage = { ...updatedMessages[lastMessageIndex] };

            const packets = Array.isArray(packetBunch) ? packetBunch : [packetBunch];
            for (const packet of packets) {
                if (packet === null || packet === undefined) continue;

                if (typeof packet === 'string') {
                    currentAiMessage.content += packet.replace(/\|/g, '');
                     if (!firstPacketProcessed) currentAiMessage.isLoading = false; 
                } else if ('answer_piece' in packet) {
                    currentAiMessage.content += (packet as AnswerPiecePacket).answer_piece;
                    if (!firstPacketProcessed) currentAiMessage.isLoading = false; 
                } else if ('answer_document' in packet) {
                    currentAiMessage.citedDocuments = [...(currentAiMessage.citedDocuments || []), (packet as AnswerDocumentPacket).answer_document];
                    finalCitedDocsForSave.push((packet as AnswerDocumentPacket).answer_document);
                } else if ('image_data' in packet) {
                     currentAiMessage.images = [...(currentAiMessage.images || []), (packet as { image_data: AnswerImage }).image_data];
                } else if ('answer_TAK_data' in packet) {
                     currentAiMessage.TAK = [...(currentAiMessage.TAK || []), (packet as { answer_TAK_data: AnswerTAK }).answer_TAK_data];
                } else if ('answer_CHART_data' in packet) {
                     currentAiMessage.CHART = [...(currentAiMessage.CHART || []), (packet as { answer_CHART_data: AnswerCHART }).answer_CHART_data];
                } else if ('answer_COURSE_data' in packet) {
                     currentAiMessage.COURSE = [...(currentAiMessage.COURSE || []), (packet as { answer_COURSE_data: AnswerCourse }).answer_COURSE_data];
                } else if ('reasoning_steps' in packet) {
                     currentAiMessage.ReasoningSteps = [...(currentAiMessage.ReasoningSteps || []), (packet as { reasoning_steps: ReasoningStep }).reasoning_steps];
                } else if ('waitingMessages' in packet) {
                } else if ('reddit' in packet) {
                     currentAiMessage.REDDIT = [...(currentAiMessage.REDDIT || []), (packet as { reddit: AnswerREDDIT }).reddit];
                } else if ('insta' in packet) {
                     currentAiMessage.INSTA = [...(currentAiMessage.INSTA || []), (packet as { insta: AnswerINSTA }).insta];
                } else if ('insta2' in packet) {
                     currentAiMessage.INSTA2 = [...(currentAiMessage.INSTA2 || []), (packet as { insta2: AnswerINSTA2 }).insta2];
                } else if ('insta_club' in packet) {
                     currentAiMessage.INSTA_CLUB = [...(currentAiMessage.INSTA_CLUB || []), (packet as { insta_club: AnswerINSTA_CLUB }).insta_club];
                } else if ('linkedin' in packet) {
                     currentAiMessage.LINKEDIN = [...(currentAiMessage.LINKEDIN || []), (packet as { linkedin: AnswerLINKEDIN }).linkedin];
                } else if ('youtube' in packet) {
                     currentAiMessage.YOUTUBE = [...(currentAiMessage.YOUTUBE || []), (packet as { youtube: AnswerYOUTUBE }).youtube];
                } else if ('quora' in packet) {
                     currentAiMessage.QUORA = [...(currentAiMessage.QUORA || []), (packet as { quora: AnswerQUORA }).quora];
                } else if ('error_back' in packet) {
                     currentAiMessage.ERROR = [...(currentAiMessage.ERROR || []), (packet as { error_back: AnswerERROR }).error_back];
                } else if ('accuracy_score' in packet) {
                    const scoreData = (packet as { accuracy_score: AnswerACCURACYSCORE }).accuracy_score;
                    currentAiMessage.CONFIDENCESCORE = [...(currentAiMessage.CONFIDENCESCORE || []), scoreData];
                    if (scoreData?.confidenceScore) {
                         finalConfidenceScoreForSave = parseFloat(scoreData.confidenceScore);
                    }
                } else if ('error' in packet) {
                     console.error("Streaming Error Packet:", (packet as StreamingError).error);
                     currentAiMessage.content = `Error: ${(packet as StreamingError).error}`;
                     currentAiMessage.isLoading = false;
                }
            } 
            
            updatedMessages[lastMessageIndex] = currentAiMessage;
            finalAiContentForSave = currentAiMessage.content;

            if (!firstPacketProcessed && !currentAiMessage.isLoading) {
                firstPacketProcessed = true;
                setIsLoadingLocal(false);
            }

            return updatedMessages;
         });
      }

       if (!currentAbortController.signal.aborted) {
             await saveMessageAIToBackend({
                message: finalAiContentForSave,
                chatSessionId: SIDEBAR_CHAT_CONCEPT_ID,
                courseId: 'default_course_id',
                username: 'Lucy',
                type: 'ai',
                uid: user?.id || 'unknown_user',
                input_message: textToSend,
                university: user?.university || 'default_university',
                sources: finalCitedDocsForSave.map(doc => ({ 
                        document_id: doc.document_id,
                        document_name: doc.document_name,
                        link: doc.link,
                        source_type: doc.source_type
                    })),
                confident_score: finalConfidenceScoreForSave,
            });
            console.log("SidebarChat: AI message saved to backend.");
        }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('SidebarChat: Message sending aborted by user.');
         setSidebarMessages(prev => {
             const lastMsgIndex = prev.length -1;
             if(lastMsgIndex >= 0 && prev[lastMsgIndex].type === 'ai') {
                 const updated = [...prev];
                 updated[lastMsgIndex] = {...updated[lastMsgIndex], isLoading: false, content: updated[lastMsgIndex].content || "(Stopped)"};
                 return updated;
             }
             return prev;
         })
      } else {
        console.error('SidebarChat: Error sending message:', error);
        const errorMsg: Message = {
            id: Date.now(),
            type: 'error',
            content: 'An error occurred sending the message.',
        };
         setSidebarMessages(prev => {
             const optimisticHumanIndex = prev.findIndex(m => m.id === uniqueHumanId);
             if (optimisticHumanIndex !== -1) {
                 return [...prev.slice(0, optimisticHumanIndex+1), errorMsg];
             } else {
                 return [...prev, errorMsg];
             }
         });
      }
    } finally {
      setIsLoadingLocal(false);
      setAbortController(null);
       setSidebarMessages(prev => {
            const lastMsgIndex = prev.length -1;
            if(lastMsgIndex >= 0 && prev[lastMsgIndex].type === 'ai' && prev[lastMsgIndex].isLoading) {
                const updated = [...prev];
                updated[lastMsgIndex] = {...updated[lastMsgIndex], isLoading: false };
                return updated;
            }
            return prev;
        })
    }
  };

  const handleSendMessage = () => {
    handleSendMessageInternal(inputValue);
  };

  const handleSendTAKMessage = (TAK_message: string) => {
      if (TAK_message.trim() === '') return;
      console.log("SidebarChat: Sending TAK message:", TAK_message);
      handleSendMessageInternal(TAK_message, true);
  };

  const handleSendCOURSEMessage = (COURSE_message: string) => {
      if (COURSE_message.trim() === '') return;
      console.log("SidebarChat: Sending COURSE message:", COURSE_message);
      handleSendMessageInternal(COURSE_message, true);
  };

  const handleFeedbackClick = async (index: number, feedbackType: FeedbackType) => {
    const aiMessage = sidebarMessages[index];
    const humanMessage = index > 0 ? sidebarMessages[index - 1] : null;
    if (!aiMessage || aiMessage.type !== 'ai') {
      console.error("SidebarChat: Could not find AI message for feedback at index", index);
      return;
    }
    const uid = user?.id || 'default_uid';
    const feedbackValue = feedbackType === 'like' ? 'positive' : 'negative';
    try {
      if (feedbackValue === 'positive') {
        await submitFeedbackGoodAnswer({ userId: uid, chatId: SIDEBAR_CHAT_CONCEPT_ID, aiMessageContent: aiMessage.content || 'N/A', humanMessageContent: humanMessage?.content || 'N/A', feedback: 'positive' });
        setSnackbarMessage("Thanks for your feedback!");
      } else {
        console.warn("SidebarChat: Negative feedback clicked. Consider implementing a feedback modal.");
        await submitFeedbackWrongAnswer({ userId: uid, chatId: SIDEBAR_CHAT_CONCEPT_ID, aiMessageContent: aiMessage.content || 'N/A', humanMessageContent: humanMessage?.content || 'N/A', feedback: 'negative - generic from sidebar', relevance: 0, accuracy: 0, format: 0, sources: 0, overall_satisfaction: 0 });
        setSnackbarMessage("Feedback submitted. Thank you!");
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error("SidebarChat: Error submitting feedback:", error);
      setSnackbarMessage("Error submitting feedback.");
      setSnackbarOpen(true);
    }
  };

  const handleWrongAnswerClick = (index: number) => {
    handleFeedbackClick(index, 'dislike');
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleStopStreaming = () => {
    if (abortController) {
        console.log("SidebarChat: Stopping stream via button click...");
        abortController.abort();
        setAbortController(null);
        setIsLoadingLocal(false);
        setSidebarMessages(prev => {
            const lastMsgIndex = prev.length -1;
            if(lastMsgIndex >= 0 && prev[lastMsgIndex].type === 'ai' && prev[lastMsgIndex].isLoading) {
                const updated = [...prev];
                updated[lastMsgIndex] = {...updated[lastMsgIndex], isLoading: false, content: updated[lastMsgIndex].content || "(Stopped)"};
                return updated;
            }
            return prev;
        })
      }
  };

  const handleCloseSnackbar = () => {
      setSnackbarOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Paper 
      elevation={4} 
      sx={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '400px',
        backgroundColor: theme.palette.background.paper,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Quick Chat</Typography>
        <IconButton onClick={onClose} size="small">X</IconButton>
      </Box>

      <Box 
        ref={scrollableDivRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {sidebarMessages.map((message, index) => 
          message.type === 'human' ? (
            <Box
                key={message.id || index}
                sx={{ display: 'flex', justifyContent: 'flex-end', mt: index === 0 ? 4 : 0, mx: 1 }}
            >
                <div style={{ maxWidth: '75%', width: '100%', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div
                            style={{
                                backgroundColor: theme.palette.button.background,
                                padding: '8px 12px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                textAlign: 'left',
                                maxWidth: '100%',
                                fontSize: '1rem',
                                color: theme.palette.text_human_message_historic,
                                wordBreak: 'break-word',
                            }}
                        >
                            {message.fileType ? (
                                <embed
                                src={message.content}
                                type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'}
                                width="100%"
                                height="200px"
                                />
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                </div>
            </Box>
          ) : (
            <Box key={message.id || index} sx={{ display: 'flex', justifyContent: 'flex-start', mx: 1 }}>
              <AIMessage 
                messageId={message.id}
                content={message.content}
                personaName={message.personaName}
                citedDocuments={message.citedDocuments}
                isComplete={!message.isLoading}
                hasDocs={!!message.citedDocuments?.length}
                handleFeedback={(feedbackType: FeedbackType) => handleFeedbackClick(index, feedbackType)}
                handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                handleSourceClick={handleSourceClick}
                images={message.images}
                takData={message.TAK}
                CourseData={message.COURSE}
                waitingMessages={message.waitingMessages}
                chartData={message.CHART}
                redditData={message.REDDIT}
                instaData={message.INSTA}
                youtubeData={message.YOUTUBE}
                quoraData={message.QUORA}
                errorData={message.ERROR}
                confidenceScoreData={message.CONFIDENCESCORE}
                instaclubData={message.INSTA_CLUB}
                linkedinData={message.LINKEDIN}
                insta2Data={message.INSTA2}
                handleSendTAKMessage={handleSendTAKMessage}
                handleSendCOURSEMessage={handleSendCOURSEMessage}
                isGloballyStreaming={isLoadingLocal}
                isMessageLoading={message.isLoading ?? false}
                drawerOpen={false}
                userUniversity={user?.university}
                ReasoningSteps={message.ReasoningSteps}
              />
            </Box>
          )
        )}
         <div ref={endDivRef}></div>
      </Box>

      <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Ask Lucy..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isLoadingLocal}
          InputProps={{
            endAdornment: (
              <IconButton 
                size="small" 
                onClick={isLoadingLocal ? handleStopStreaming : handleSendMessage} 
                disabled={!inputValue.trim() && !isLoadingLocal}
                color={isLoadingLocal ? "error" : "primary"}
              >
                {isLoadingLocal ? <StopIcon /> : <ArrowUpwardIcon />}
              </IconButton>
            ),
            sx: { borderRadius: '20px', backgroundColor: theme.palette.action.hover }
          }}
        />
      </Box>
      <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
    </Paper>
  );
};

export default SidebarChat; 