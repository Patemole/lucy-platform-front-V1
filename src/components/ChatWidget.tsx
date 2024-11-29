// src/components/ChatWidget.tsx

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import ReactDOM from 'react-dom';
import {
  TextField,
  IconButton,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ThreeDots } from 'react-loader-spinner';
import { Message } from '../interfaces/interfaces_eleve';
import AIMessage from './AIMessage';
import logo_greg from '../student_face.png';
import logo_lucy_face from '../lucy_new_face_contour2.png';
import { sendMessageSocraticLangGraph } from '../api/chat';
import { AnswerDocument, AnswerPiecePacket, AnswerDocumentPacket, StreamingError } from '../interfaces/interfaces';
import { handleAutoScroll } from './utils';
import debounce from 'lodash/debounce';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollDiv = scrollableDivRef.current;
      if (scrollDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 100; // Ajusté
        setIsAtBottom(atBottom);
        if (atBottom) setNewMessagesCount(0);
      }
    }, 1000); // Délai de 100ms
  
    const scrollDiv = scrollableDivRef.current;
    scrollDiv?.addEventListener('scroll', handleScroll);
  
    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setNewMessagesCount((prevCount) => prevCount + 1);
    }
  }, [messages]);


  useEffect(() => {
    scrollToBottomNewMessage();
  }, [messages]); // Chaque changement dans messages déclenche le défilement


  const scrollToBottom = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessagesCount(0); // Reset new messages count
    }
  };

  const scrollToBottomNewMessage = () => {
    if (endDivRef.current) {
      endDivRef.current.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
    }
  };




  const handleSendMessage = (message: string) => {
    if (message.trim() === '') return;

    setIsStreaming(true);

    const newMessage: Message = { id: Date.now(), type: 'human', content: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    onSubmit([...messages, newMessage, loadingMessage], message);
    setInputValue(''); // Clear the input field after sending
  };

  // Function to send the message to the AI or API
  const onSubmit = async (messageHistory: Message[], inputValue: string) => {
    setIsStreaming(true);
    let answer = '';
    let answerDocuments: AnswerDocument[] = [];
    let error: string | null = null;

    try {
      const lastMessageIndex = messageHistory.length - 1;

      // Dummy variables to be replaced with actual values
      const chatSessionId = "dummyChatSessionId";
      const courseId = "dummyCourseId";
      const username = "dummyUsername";
      const university = "dummyUniversity";
      const student_profile = "dummyProfile";
      const major = "dummyMajor";
      const minor = "dummyMinor";
      const year = "dummyYear";
      const faculty = "dummyFaculty";

      for await (const packetBunch of sendMessageSocraticLangGraph({
        message: inputValue,
        chatSessionId: chatSessionId,
        courseId: courseId,
        username: username,
        university: university,
        student_profile: student_profile,
        major: [major],
        minor: [minor],
        year: year,
        faculty: [faculty],
      })) {
        if (Array.isArray(packetBunch)) {
          for (const packet of packetBunch) {
            if (typeof packet === 'string') {
              answer = packet.replace(/\|/g, '');
            } else if ('answer_piece' in packet) {
              answer = (packet as AnswerPiecePacket).answer_piece;
            } else if ('answer_document' in packet) {
              answerDocuments.push((packet as AnswerDocumentPacket).answer_document);
            } else if ('error' in packet) {
              error = (packet as StreamingError).error;
            }
          }
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...prevMessages[lastMessageIndex],
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
      console.error('Error during message processing:', errorMsg);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'error',
          content: 'An error occurred. Please try again.',
        },
      ]);

      setIsStreaming(false);
    }
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessage(inputValue);
      event.preventDefault();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
      {/* Messages */}
      <div className="flex-grow overflow-y-auto" ref={scrollableDivRef} style={{ padding: '10px' }}>
        {messages.map((message) =>
          message.type === 'human' ? (
            <div key={message.id} className="flex justify-end mb-2">
              <div className="max-w-3/4 w-full text-right">
                <div className="flex items-center justify-end mb-1">
                  <span className="font-bold mr-2" style={{ color: '#000000' }}>
                    You
                  </span>
                  <Avatar alt="User Avatar" src={logo_greg} sx={{ width: 25, height: 25 }} />
                </div>
                <div
                  style={{
                    backgroundColor: '#007BFF',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    color: '#ffffff',
                  }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start mb-2">
              <div className="max-w-3/4 w-full">
                {message.content === '' ? (
                  <div className="flex items-center">
                    <Avatar alt="Lucy Avatar" src={logo_lucy_face} sx={{ width: 25, height: 25 }} />
                    <div className="ml-2">
                      <ThreeDots height="30" width="50" color="#007BFF" />
                    </div>
                  </div>
                ) : (
                  <AIMessage
                    messageId={message.id}
                    content={message.content}
                    personaName={message.personaName}
                    citedDocuments={message.citedDocuments}
                    isComplete={!isStreaming}
                    hasDocs={!!message.citedDocuments?.length}
                    handleSourceClick={(link: string) => {
                      window.open(link, '_blank');
                    }}
                  />
                )}
              </div>
            </div>
          )
        )}
        <div ref={endDivRef}></div>
      </div>

      {/* Input field */}
      <div className="p-2" style={{ backgroundColor: '#ffffff' }}>
        <TextField
          fullWidth
          variant="outlined"
          multiline
          maxRows={6}
          placeholder="Message"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleInputKeyPress}
          InputProps={{
            endAdornment: (
              <IconButton
                color="primary"
                onClick={() => handleSendMessage(inputValue)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '25px',
                  transform: 'translateY(50%)',
                }}
              >
                <SendIcon style={{ color: '#007BFF' }} />
              </IconButton>
            ),
            style: {
              fontWeight: '500',
              fontSize: '1rem',
              color: '#000000',
              borderRadius: '12px',
              paddingRight: '48px',
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </div>
    </div>
  );
};

// Export a render function to attach the component to the DOM
export function render(container: HTMLElement) {
  ReactDOM.render(<ChatWidget />, container);
}

export default ChatWidget;