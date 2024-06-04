//AJOUT LORSQUE ON TRAITE UN FICHIER - FONCTIONNE 
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider, TextField, IconButton, Button, InputAdornment, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import logo_lucy_face from '../lucy_face.png';
import logo_ecole_penn from '../logos/upenn_logo.png';
import logo_ecole_sydney from '../logos/usyd_logo.png';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import '../index.css';

import { ThreeDots } from 'react-loader-spinner';
import { FallingLines } from 'react-loader-spinner';

import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { ValidSources } from '../components/sources';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { getChatHistory, sendMessage } from '../api/chat';
import { getHumanAndAIMessageFromMessageNumber, getLastSuccessfulMessageId, handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { createChatSession, nameChatSession } from '../api/sessions';

const theme = createTheme({
  palette: {
    primary: {
      main: '#EBE2FC',
    },
    secondary: {
      main: '#19857b',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: '#7C3BEC',
        },
      },
    },
  },
});

type Message = {
  id: number;
  type: 'human' | 'ai' | 'error';
  content: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[];
  fileType?: 'pdf' | 'mp4';
};

const Chat_eleve: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);

  const { popup, setPopup } = usePopup();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [socraticityLevel, setSocraticityLevel] = useState<string>('Very Socratic');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    setAnchorEl(null);
    setSocraticityLevel(option);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Ajoutez un message temporaire pour le loader
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
    
    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];

    onSubmit(messageHistory, inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = 'chat_sessions_test';
      const courseId = 'course_id_placeholder';
      const username = 'username_placeholder';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessage({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
      })) {
        console.log("Packet bunch:", packetBunch);
        for (const packet of packetBunch) {
          if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
            answer += (packet as AnswerPiecePacket).answer_piece;
          } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
            answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
          } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
            error = (packet as StreamingError).error;
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            id: Date.now(),
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
          };
          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setIsStreaming(false);
    } catch (e: any) {
      const errorMsg = e.message;
      console.log("Error message:", errorMsg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: "An error occurred. The API endpoint might be down.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const handleInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleMeetingClick = () => {
    navigate('/schedule-meeting');
  };

  //AJOUT DE LOG POUR CONNAITRE SI IL YA UNE ERREUR 
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const file = files[0];
        console.log("File uploaded:", file);

        const fileType = file.type === 'application/pdf' ? 'pdf' : 'mp4';

        const newMessage: Message = {
            id: Date.now(),
            type: 'human',
            content: URL.createObjectURL(file),
            fileType: fileType
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log("New message added:", newMessage);

        const processingMessage: Message = {
            id: Date.now() + 1,
            type: 'ai',
            content: 'Fichier en cours de traitement...',
            personaName: 'Lucy'
        };
        setMessages((prevMessages) => [...prevMessages, processingMessage]);
        console.log("Processing message added:", processingMessage);

        // Afficher 'Fichier en cours de traitement...' pendant 1 seconde
        setTimeout(async () => {
            const fallingLinesMessage: Message = {
                id: Date.now() + 2,
                type: 'ai',
                content: '',
                personaName: 'Lucy'
            };
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map(msg =>
                    msg.content === 'Fichier en cours de traitement...' ? fallingLinesMessage : msg
                );
                return updatedMessages;
            });
            console.log("FallingLines message added:", fallingLinesMessage);

            try {
                const apiResponse = await sendFileToBackend(file);
                console.log("API response received:", apiResponse);

                const processedMessage: Message = {
                    id: Date.now() + 3,
                    type: 'ai',
                    content: `Le fichier ${file.name} a bien été traité.`,
                    personaName: 'Lucy'
                };
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map(msg =>
                        msg.content === '' ? processedMessage : msg
                    );
                    return updatedMessages;
                });
                console.log("Processed message added:", processedMessage);
            } catch (error) {
                console.error("Error processing file:", error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now() + 3,
                        type: 'error',
                        content: "An error occurred while processing the file."
                    },
                ]);
            }
        }, 1000); // 1 second delay before showing FallingLines

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
};

const sendFileToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/chat/upload_file', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    return response.json();
};

  // Fonction pour supprimer l'historique de chat
  const deleteChatHistory = async (chat_id: string) => {
    try {
        const response = await fetch(`http://localhost:8000/chat/delete_chat_history/${chat_id}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to delete chat history');
        }

        console.log('Chat history deleted successfully');
    } catch (error) {
        console.error('Error deleting chat history:', error);
    }
  };

  // Utilisation de useEffect pour supprimer l'historique de chat à chaque chargement de la page
  useEffect(() => {
    const chat_id = 'chat_socratic_id';  // Remplacez par l'ID de chat réel
    deleteChatHistory(chat_id);
  }, []);



  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
          <img src={logo} alt="Lucy Logo" className="h-12 w-auto" />
          {showChat && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-custom-blue">
                Lucy Socratic Assistant
              </h1>
            </div>
          )}
          <div style={{ flexGrow: 1 }}></div>
          <img src={logo} alt="Another Logo" className="h-10 w-auto" style={{ marginRight: '10px' }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleMenuClick}
            style={{ marginRight: '10px' }}
          >
            {socraticityLevel}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuCloseWithoutSelection}
          >
            <MenuItem 
              onClick={() => handleMenuClose('No socratic answer')} 
              style={{ fontWeight: 'bold', color: '#100F32' }}
            >
              No socratic answer
            </MenuItem>
            <MenuItem 
              onClick={() => handleMenuClose('Socratic flexible answer')} 
              style={{ fontWeight: 'bold', color: '#100F32' }}
            >
              Socratic flexible answer
            </MenuItem>
            <MenuItem 
              onClick={() => handleMenuClose('Very socratic')} 
              style={{ fontWeight: 'bold', color: '#100F32' }}
            >
              Very socratic
            </MenuItem>
          </Menu>
          <Button variant="outlined" color="primary" onClick={handleMeetingClick}>TA's help</Button>
        </div>
        {!showChat ? (
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Lucy Socratic Assistant</h1>
              <p className="text-center mb-6">Try a sample thread on economic course</p>
              <div className="flex flex-col items-center space-y-4">
                <Button variant="contained" color="primary">What's the price equilibrum? </Button>
                <Button variant="contained" color="primary">What's the topic of week 3 quiz? </Button>
                <Button variant="contained" color="primary">When is the final exam?</Button>
              </div>
              <div className="flex justify-center mt-6 space-x-4">
                <Button variant="outlined" color="primary">Talk with us</Button>
                <Button variant="outlined" color="primary">Feedback</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow p-4 bg-white overflow-auto">
            <div className="flex flex-col space-y-2" ref={scrollableDivRef}>
              {messages.map((message, index) =>
                message.type === 'human' ? (
                  <div key={message.id} className={`flex justify-end mx-20 ${index === 0 ? 'mt-8' : ''}`}> 
                    <div className="max-w-3/4 w-full text-right">
                      <div className="flex items-center justify-end mb-1">
                        <span className="font-bold ml-4">You</span>
                        <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                      </div>
                      <div className="bg-custom p-2 rounded-xl inline-block text-left">
                        {message.fileType ? (
                          <embed src={message.content} type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start mx-20">
                    <div className="max-w-3/4 w-full flex items-center">
                      {message.content === '' ? (
                        <div className="flex items-center">
                          <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                          <div className="ml-2">
                            <FallingLines height="30" width="50" color="#955bf7" />
                          </div>
                        </div>
                      ) : (
                        <AIMessage
                          messageId={message.id}
                          content={message.content}
                          personaName={message.personaName}
                          citedDocuments={message.citedDocuments}
                          isComplete={isComplete}
                          hasDocs={!!message.citedDocuments?.length}
                          handleFeedback={(feedbackType: FeedbackType) => {
                            console.log(`Feedback received: ${feedbackType}`);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              )}
              <div ref={endDivRef}></div>
            </div>
          </div>
        )}
        <div className="flex justify-center p-4 bg-white">
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask a question about any courses in USYD..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleInputKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton color="primary" component="label">
                      <AttachFileIcon style={{ color: '#7C3BEC' }} />
                      <input
                        type="file"
                        hidden
                        accept=".pdf, .mp4"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton color="primary" onClick={handleSendMessage}>
                    <SendIcon style={{ color: '#7C3BEC' }} />
                  </IconButton>
                ),
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: '#100F32',
                  borderRadius: '16px',
                },
                classes: {
                  input: 'custom-placeholder',
                },
              }}
              className="custom-placeholder"
              style={{ borderRadius: '16px' }}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Chat_eleve;

















