//AJOUTS DES COURS PAR UTILISATEURS 
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, TextField, IconButton, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@mui/material/styles';
import { FallingLines } from 'react-loader-spinner';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import logo_lucy_face from '../lucy_face.png';
import '../index.css';
import { AIMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { sendMessageSocraticLangGraph } from '../api/chat';
import { handleAutoScroll } from '../components/utils';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Message = {
  id: number;
  type: 'human' | 'ai' | 'error';
  content: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[];
  fileType?: 'pdf' | 'mp4';
};

const drawerWidth = 240;

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<[FeedbackType, number] | null>(null);
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] = useState<number | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();

  const { logout } = useAuth();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('Academic Advisor');

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseOptions, setCourseOptions] = useState<string[]>(['Academic Advisor']);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    setAnchorEl(null);
    setSelectedFilter(option);
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
      const chatSessionId = 'chat_id_business';
      const courseId = 'business';
      const username = 'greg_test';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageSocraticLangGraph({
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

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setShowChat(true);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, newMessage, loadingMessage]);

    setInputValue('');

    const messageHistory = [...messages, newMessage, loadingMessage];

    onSubmitSocraticLangGraph(messageHistory, inputValue);
  };

  const onSubmitSocraticLangGraph = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = 'chat_id_healthcare';
      const courseId = 'healthcare';
      const username = 'greg_test';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageSocraticLangGraph({
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

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessageSocraticLangGraph();
    }
  };

  const handleMeetingClick = () => {
    navigate('/schedule-meeting');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (isStreaming) {
      handleAutoScroll(endDivRef, scrollableDivRef);
    }
  }, [isStreaming, messages]);

  useEffect(() => {
    handleAutoScroll(endDivRef, scrollableDivRef);
  }, [messages]);

  useEffect(() => {
    const fetchCourseOptions = async () => {
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const courseIds = userData.courses || [];

          const coursePromises = courseIds.map(async (courseId: string) => {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              return courseSnap.data().name;
            }
            return null;
          });

          const courseNames = await Promise.all(coursePromises);
          const validCourseNames = courseNames.filter((name): name is string => name !== null);

          setCourseOptions(['Academic Advisor', ...validCourseNames]);
        }
      }
    };

    fetchCourseOptions();
  }, [uid]);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={() => navigate(`/dashboard/student/${uid}`)}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 15px' }} />
            <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
              You have no conversations yet
            </Typography>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>
                <IconButton sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div onClick={handleDropDownClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: selectedFilter === 'Academic Advisor' ? '#EBE2FC' : '#DDFCE5', padding: '4px 8px', borderRadius: '8px' }}>
              <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: selectedFilter === 'Academic Advisor' ? '#7C3BEC' : '#43AE58', marginRight: '8px' }}>{selectedFilter}</Typography>
              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: selectedFilter === 'Academic Advisor' ? '#7C3BEC' : '#43AE58' }} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {courseOptions.map((option) => (
                <MenuItem key={option} onClick={() => handleMenuClose(option)}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                    {option}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <div style={{ flexGrow: 1 }}></div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            <Button variant="outlined" color="primary" onClick={handleMeetingClick}>TA's help</Button>
          </div>

          {!showChat ? (
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-center mb-6 text-custom-blue">Your Assistant Lucy</h1>
                <p className="text-center mb-5">Try a sample thread</p>
                <div className="flex flex-col items-center space-y-4">
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How can AI improve medical diagnosis? </Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">Which class can I take for next semester?</Button>
                  <Button variant="contained" style={{ borderRadius: '5px' }} color="primary">How many business model do you know?</Button>
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
                              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
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

          <div className="flex justify-center p-4 bg-white relative">
            <div style={{ maxWidth: '800px', width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question about anything to Lucy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPressSocraticLangGraph}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSendMessageSocraticLangGraph}>
                      <SendIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  ),
                  style: {
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    borderRadius: '12px',
                  },
                  classes: {
                    input: 'custom-placeholder',
                  },
                }}
                className="custom-placeholder"
                style={{ borderRadius: '16px' }}
              />
            </div>
            <Box
              sx={{
                position: 'absolute',
                bottom: theme.spacing(2),
                right: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;






