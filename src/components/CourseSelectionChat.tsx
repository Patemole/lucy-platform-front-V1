import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Avatar, Snackbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AIMessage from '../components/CourseSelectionAIMessages';
import Calendar from '../components/NewCalendarCustom'; // Assurez-vous d'importer Calendar
import {
  Message,
  AnswerTAK,
  AnswerCourse,
  AnswerWaiting,
  CourseSlot,
} from '../interfaces/interfaces_eleve';
import {
  AnswerDocument,
  AnswerPiecePacket,
  AnswerDocumentPacket,
  StreamingError,
} from '../interfaces/interfaces';
import {
  sendMessageFakeDemo,
  saveMessageAIToBackend,
} from '../api/chat';
import logo_greg from '../student_face.png'; // Student Avatar
import { useTheme } from '@mui/material/styles';
import { FeedbackType } from '../components/types';

interface ChatProps {
  handleAddCourseToCalendar: (selectedSlot: CourseSlot, answercourse: AnswerCourse) => void;  // Accept three parameters here
}

const Chat: React.FC<ChatProps> = ({ handleAddCourseToCalendar }) => {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  // État pour stocker les cours sélectionnés
  const [newCourseSlot, setNewCourseSlot] = useState<{ slot: CourseSlot; title: string} | null>(null);


  // Get the user's first name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userFirstName = user.name ? user.name.split(' ')[0] : 'there';


  // Scroll the message container to the bottom
  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop =
        scrollableDivRef.current.scrollHeight;
    }
  };

  // Ensure scrolling happens when a new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // If no messages exist, add a default AI message
  useEffect(() => {
    if (messages.length === 0) {
      const defaultMessage: Message = {
        id: Date.now(),
        type: 'ai',
        content: `Hey ${userFirstName}! \n Plan your courses with me in 3 minutes, not 3 hours! Which type of courses are you looking for? 🤓`,
        personaName: 'Lucy',
      };
      setMessages([defaultMessage]);
    }
  }, [userFirstName, messages]);


  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return;
    const newMessage: Message = {
      id: Date.now(),
      type: 'human',
      content: TAK_message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };

  const handleSendCOURSEMessage = (COURSE_message: string) => {
    if (COURSE_message.trim() === '') return;
    const newMessage: Message = {
      id: Date.now(),
      type: 'human',
      content: COURSE_message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
    onSubmit([...messages, newMessage, loadingMessage], COURSE_message);
  };

  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;
    setRelatedQuestions([]);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = {
      id: Date.now(),
      type: 'human',
      content: inputValue,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  const onSubmit = async (
    messageHistory: Message[],
    inputValue: string
  ) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerCourse: AnswerCourse[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId =
        localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId =
        localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university =
        localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
              answerCourse.push((packet as any).answer_COURSE_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
            answerCourse.push((packetBunch as any).answer_COURSE_data);
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
            answerWaiting = (packetBunch as any).answer_waiting;
          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK,
            COURSE: flattenedCourse,
            waitingMessages: flattenedwaitingdata,
          };

          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList);
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: 'Lucy',
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);
    } catch (e: any) {
      const errorMsg = e.message;
      console.error('Error during message processing:', errorMsg);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (
    event: KeyboardEvent
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  // Handle showing the snackbar notification
  const handleShowSnackbar = () => {
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };


  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Message Display Container */}
      <Box
        flex={1}
        overflow="auto"
        p={2}
        ref={scrollableDivRef}
        sx={{
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={message.id}
            display="flex"
            flexDirection={
              message.type === 'human' ? 'row-reverse' : 'row'
            }
            mb={2}
          >
            {message.type === 'human' ? (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-end"
                alignItems="flex-end"
                sx={{ width: '100%' }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <span
                    className="font-bold mr-2"
                    style={{ color: theme.palette.text.primary }}
                  >
                    You
                  </span>
                  <Avatar
                    alt="User Avatar"
                    src={logo_greg}
                    sx={{ width: 27, height: 27 }}
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#e1f5fe',
                    padding: '8px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    color: theme.palette.text.primary,
                    maxWidth: '70%',
                    marginTop: '4px',
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                sx={{
                  width: '100%',
                  marginLeft: '0px',
                  marginRight: '10px',
                }}
              >
                <AIMessage
                  messageId={message.id}
                  content={message.content}
                  personaName={message.personaName}
                  citedDocuments={message.citedDocuments}
                  isComplete={isComplete}
                  hasDocs={!!message.citedDocuments?.length}
                  handleFeedback={(feedbackType: FeedbackType) =>
                    console.log(`Feedback: ${feedbackType}`)
                  }
                  handleWrongAnswerClick={() =>
                    console.log('Wrong answer clicked')
                  }
                  handleSourceClick={(link) =>
                    console.log(`Source clicked: ${link}`)
                  }
                  images={message.images}
                  takData={message.TAK}
                  CourseData={message.COURSE}
                  waitingMessages={message.waitingMessages}
                  drawerOpen={false}
                  handleSendTAKMessage={handleSendTAKMessage}
                  handleSendCOURSEMessage={handleSendCOURSEMessage}
                  handleAddCourseToCalendar={handleAddCourseToCalendar}
                  handleShowSnackbar={handleShowSnackbar}
                  
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box
        p={2}
        borderTop={`1px solid ${theme.palette.divider}`}
        sx={{
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
          marginTop: '40px',
        }}
      >
        <Box
          sx={{ maxWidth: '800px', width: '100%', position: 'relative' }}
        >
          <TextField
            fullWidth
            variant="outlined"
            multiline
            maxRows={6}
            placeholder="Plan your degree with Lucy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPressSocraticLangGraph}
            InputProps={{
              endAdornment: (
                <IconButton
                  color="primary"
                  onClick={handleSendMessageSocraticLangGraph}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '25px',
                    transform: 'translateY(50%)',
                  }}
                >
                  <SendIcon
                    style={{ color: theme.palette.button_sign_in }}
                  />
                </IconButton>
              ),
              style: {
                fontWeight: '500',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                borderRadius: '12px',
                paddingRight: '48px',
                backgroundColor: '#FBFBFB',
              },
            }}
          />
        </Box>
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Course added to your calendar"
      />
    </Box>
  );
};

export default Chat;






/*
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Avatar, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AIMessage } from '../components/CourseSelectionAIMessages';
import { Message, AnswerTAK,AnswerCourse, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { sendMessageFakeDemo, saveMessageAIToBackend } from '../api/chat';
import logo_greg from '../student_face.png'; // Avatar étudiant
import logo_lucy_face from '../lucy_new_face_contour2.png'; // Avatar de l'IA (Lucy)
import { useTheme } from '@mui/material/styles';
import { FeedbackType } from '../components/types';

const Chat: React.FC = () => {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);



  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the TAK_message
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };


  const handleSendCOURSEMessage = (COURSE_message: string) => {
    if (COURSE_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: COURSE_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the COURSE_message
    onSubmit([...messages, newMessage, loadingMessage], COURSE_message);
  };


  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerCourse: AnswerCourse[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
      //for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
              answerCourse.push((packet as any).answer_COURSE_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        } else if (typeof packetBunch === 'object' && packetBunch !== null) {
          if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
            answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
            answerImages.push((packetBunch as any).image_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
            answerTAK.push((packetBunch as any).answer_TAK_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
            answerCourse.push((packetBunch as any).answer_COURSE_data);

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
            relatedQuestionsList = (packetBunch as any).related_questions;

            console.log("relatedQuestionList")
            console.log(relatedQuestionsList)

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
            answerWaiting = (packetBunch as any).answer_waiting;

          } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
            error = (packetBunch as StreamingError).error;
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedCourse = answerCourse.flat();
        const flattenedwaitingdata = answerWaiting.flat();
        
        console.log("ANSWER WAITING QUESTIONS")
        console.log(answerWaiting)
        console.log("\n")
        console.log("ANSWER WAITING QUESTIONS WITH FLATT")
        console.log(flattenedwaitingdata)
        console.log("\n")
        console.log("ANSWER COURSE WITH FLATT")
        console.log(flattenedCourse)

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK,
            COURSE: flattenedCourse,
            waitingMessages: flattenedwaitingdata, // Ajouter les messages d'attente ici
          };

          console.log("Updated message before setting state:", updatedMessages[lastMessageIndex]);

          return updatedMessages;
        });

        if (isCancelled) {
          setIsCancelled(false);
          break;
        }
      }

      setRelatedQuestions(relatedQuestionsList);
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: 'Lucy',
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);
    } catch (e: any) {
      const errorMsg = e.message;
      console.error('Error during message processing:', errorMsg);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (isStreaming) {
      endDivRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming, messages]);

  return (
    <Box display="flex" flexDirection="column" height="100vh" sx={{ backgroundColor: '#FFFFFF' }}>
      {/* Zone d'affichage des messages, cette zone est scrollable *
      <Box
        flex={1}
        overflow="auto"
        p={2}
        ref={scrollableDivRef}
        sx={{ 
            maxHeight: 'calc(100vh - 100px)',
            

         }} // Ajustement pour tenir compte de la hauteur du footer
        
      >
        {messages.map((message, index) => (
          <Box key={message.id} display="flex" flexDirection={message.type === 'human' ? 'row-reverse' : 'row'} mb={2}>
            {message.type === 'human' ? (
              <Box display="flex" flexDirection="column" justifyContent="flex-end" alignItems="flex-end" sx={{ width: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <span className="font-bold mr-2" style={{ color: theme.palette.text.primary }}>
                    You
                  </span>
                  <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 27, height: 27 }} />
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#e1f5fe', // Light blue background
                    padding: '8px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    color: theme.palette.text.primary,
                    maxWidth: '70%',
                    marginTop: '4px',
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexDirection="row" justifyContent="flex-start" sx={{ width: '100%', marginLeft: '0px', marginRight: '10px' }}>
                <AIMessage
                  messageId={message.id}
                  content={message.content}
                  personaName={message.personaName}
                  citedDocuments={message.citedDocuments}
                  isComplete={isComplete}
                  hasDocs={!!message.citedDocuments?.length}
                  handleFeedback={(feedbackType: FeedbackType) => console.log(`Feedback: ${feedbackType}`)}
                  handleWrongAnswerClick={() => console.log('Wrong answer clicked')}
                  handleSourceClick={(link) => console.log(`Source clicked: ${link}`)}
                  images={message.images}
                  takData={message.TAK}
                  CourseData={message.COURSE}
                  waitingMessages={message.waitingMessages}
                  drawerOpen={false}
                  handleSendTAKMessage={handleSendTAKMessage}
                  handleSendCOURSEMessage={handleSendCOURSEMessage}
                />
              </Box>
            )}
          </Box>
        ))}
        <div ref={endDivRef} />
      </Box>
  
      {/* Footer pour saisir le message *
      <Box
        p={2}
        borderTop={`1px solid ${theme.palette.divider}`}
        sx={{
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          zIndex: 1000, // Assure que le footer reste au-dessus
        }}
      >
        <Box sx={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            maxRows={6}
            placeholder="Plan your degree with Lucy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPressSocraticLangGraph}
            InputProps={{
              endAdornment: (
                <IconButton
                  color="primary"
                  onClick={handleSendMessageSocraticLangGraph}
                  style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}
                >
                  <SendIcon style={{ color: theme.palette.button_sign_in }} />
                </IconButton>
              ),
              style: {
                fontWeight: '500',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                borderRadius: '12px',
                paddingRight: '48px',
                backgroundColor: '#FBFBFB',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
*/









/*
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Avatar, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AIMessage } from '../components/Messages'; // Composant pour les messages IA
import { Message, AnswerTAK, AnswerWaiting } from '../interfaces/interfaces_eleve';
import { AnswerDocument, StreamingError } from '../interfaces/interfaces';
import { sendMessageFakeDemo, sendMessageSocraticLangGraph, saveMessageAIToBackend } from '../api/chat';
import logo_greg from '../student_face.png'; // Avatar étudiant
import logo_lucy_face from '../lucy_new_face_contour2.png'; // Avatar de l'IA (Lucy)
import { useTheme } from '@mui/material/styles';
import { FeedbackType } from '../components/types';

const Chat: React.FC = () => {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // Assuming this is part of your UI
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);



  const handleSendTAKMessage = (TAK_message: string) => {
    if (TAK_message.trim() === '') return; // Ensure there's some message to send
  
    // Create a new message object using the TAK_message
    const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
  
    // Add the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Create a loading message (AI is typing...)
    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
  
    // Call the onSubmit function with the TAK_message
    onSubmit([...messages, newMessage, loadingMessage], TAK_message);
  };



  const handleSendMessageSocraticLangGraph = () => {
    if (inputValue.trim() === '') return;

    setRelatedQuestions([]);
    setIsComplete(false);
    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    setInputValue('');
    onSubmit([...messages, newMessage, loadingMessage], inputValue);
  };

  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
    let relatedQuestionsList: string[] = [];
    let answerTAK: AnswerTAK[] = [];
    let answerWaiting: AnswerWaiting[] = [];
    let error: string | null = null;

    try {
      const chatSessionId = localStorage.getItem('chat_id') || 'default_chat_id';
      const courseId = localStorage.getItem('course_id') || 'default_course_id';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user.name || 'default_user';
      const uid = user.id || 'default_uid';
      const university = localStorage.getItem('university') || 'default_university';
      const student_profile = localStorage.getItem('student_profile') || '';

      const lastMessageIndex = messageHistory.length - 1;

      for await (const packetBunch of sendMessageFakeDemo({
      /*for await (const packetBunch of sendMessageSocraticLangGraph({*
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_document')) {
              answerDocuments.push((packet as any).answer_document);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
              answerImages.push((packet as any).image_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
              answerTAK.push((packet as any).answer_TAK_data);
            } else if (Object.prototype.hasOwnProperty.call(packet, 'related_questions')) {
              relatedQuestionsList = (packet as any).related_questions;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
              answerWaiting = (packet as any).answer_waiting;
            } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
              error = (packet as StreamingError).error;
            }
          }
        }

        const flattenedImages = answerImages.flat();
        const flattenedTAK = answerTAK.flat();
        const flattenedWaitingData = answerWaiting.flat();

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
            type: 'ai',
            content: answer,
            personaName: 'Lucy',
            citedDocuments: answerDocuments,
            images: flattenedImages,
            TAK: flattenedTAK,
            waitingMessages: flattenedWaitingData,
          };

          return updatedMessages;
        });
      }

      setRelatedQuestions(relatedQuestionsList);
      setIsStreaming(false);

      const Message_AI_to_save = {
        message: answer,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: 'Lucy',
        type: 'ai',
        uid: uid,
        input_message: inputValue,
        university: university,
      };

      await saveMessageAIToBackend(Message_AI_to_save);
    } catch (e: any) {
      console.error('Error during message processing:', e.message);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. The API endpoint might be down.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessageSocraticLangGraph();
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (isStreaming) {
      endDivRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming, messages]);



  return (
    <Box display="flex" flexDirection="column" height="100%" sx={{ backgroundColor: '#FFFFFF' }}>
      {/* Zone d'affichage des messages, cette zone est scrollable *
      <Box flex={1} overflow="auto" p={2} ref={scrollableDivRef}>
        {messages.map((message, index) => (
          <Box key={message.id} display="flex" flexDirection={message.type === 'human' ? 'row-reverse' : 'row'} mb={2}>
            <Avatar src={message.type === 'human' ? logo_greg : logo_lucy_face} />
            <Box
              ml={2}
              mr={2}
              p={2}
              borderRadius="12px"
              bgcolor={message.type === 'human' ? theme.palette.primary.light : theme.palette.background.paper}
              color={message.type === 'human' ? theme.palette.primary.contrastText : theme.palette.text.primary}
              maxWidth="75%"
              sx={{ wordBreak: 'break-word' }}
            >
              {message.type === 'ai' ? (
                <AIMessage
                  messageId={message.id}
                  content={message.content}
                  personaName={message.personaName}
                  citedDocuments={message.citedDocuments}
                  isComplete={isComplete}
                  hasDocs={!!message.citedDocuments?.length}
                  handleFeedback={(feedbackType: FeedbackType) => console.log(`Feedback: ${feedbackType}`)}
                  handleWrongAnswerClick={() => console.log('Wrong answer clicked')}
                  handleSourceClick={(link) => console.log(`Source clicked: ${link}`)}
                  images={message.images}
                  takData={message.TAK}
                  waitingMessages={message.waitingMessages}
                  drawerOpen={drawerOpen}
                  handleSendTAKMessage={handleSendTAKMessage}
                />
              ) : (
                <Typography>{message.content}</Typography>
              )}
            </Box>
          </Box>
        ))}
        <div ref={endDivRef} />
      </Box>





      {/* Footer fixe mais dans le composant, pas en bas de la page *
      <Box
        p={2}
        borderTop={`1px solid ${theme.palette.divider}`}
        sx={{
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            maxRows={6}
            placeholder="Ask a question about anything to Lucy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPressSocraticLangGraph}
            InputProps={{
              endAdornment: (
                <IconButton
                  color="primary"
                  onClick={handleSendMessageSocraticLangGraph}
                  style={{ position: 'absolute', right: '10px', bottom: '25px', transform: 'translateY(50%)' }}
                >
                  <SendIcon style={{ color: theme.palette.button_sign_in }} />
                </IconButton>
              ),
              style: {
                fontWeight: '500', // Apply fontWeight for the input text
                fontSize: '0.875rem', // Apply fontSize for the input text
                color: theme.palette.text.primary,
                borderRadius: '12px',
                paddingRight: '48px',
                backgroundColor: '#FBFBFB',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
*/






