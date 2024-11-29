import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { handleConversationClick } from '../utils/functions_student_chat';
import { Message, Course } from '../interfaces/interfaces_eleve';
import { handleAutoScroll } from '../components/utils';
import { PopupSpec } from '../interfaces/interfaces';
import debounce from 'lodash/debounce';
import {  useState, useCallback } from 'react';


export const useLoadMessagesFromLocalStorageChatId = (
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>,
  //setPopup: React.Dispatch<React.SetStateAction<PopupSpec | null>>
  setPopup: React.Dispatch<React.SetStateAction<{ type: string; message: string }>>
) => {
  useEffect(() => {
    const loadMessagesFromLocalStorageChatId = async () => {
      const storedChatId = localStorage.getItem('chat_id');
      if (storedChatId) {
        await handleConversationClick(storedChatId, setActiveChatId, setMessages, setShowChat, setPopup);
      }
    };
    loadMessagesFromLocalStorageChatId();
  }, []);
};

export const useFetchCourseOptionsAndChatSessions = (
  uid: string | undefined,
  setCourseOptions: React.Dispatch<React.SetStateAction<Course[]>>,
  setConversations: React.Dispatch<React.SetStateAction<{ chat_id: string, name: string }[]>>,
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>,
  setPreviousFilter: React.Dispatch<React.SetStateAction<string>>,
  courseOptions: Course[]
) => {
  useEffect(() => {
    const fetchCourseOptionsAndChatSessions = async () => {
      console.log("Fetching course options and chat sessions for user with UID:", uid);
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);
          const courseIds = userData.courses || [];
          const chatSessionIds = userData.chatsessions || [];

          console.log("Course IDs:", courseIds);
          console.log("Chat Session IDs:", chatSessionIds);

          const coursePromises = courseIds.map(async (courseId: string) => {
            if (typeof courseId === 'string') {
              const courseRef = doc(db, 'courses', courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                console.log("Course data found for ID:", courseId);
                return { id: courseId, name: courseSnap.data().name };
              } else {
                console.log(`Course not found for ID: ${courseId}`);
              }
            }
            return null;
          });

          const courses = await Promise.all(coursePromises);
          const validCourses = courses.filter((course): course is Course => course !== null);
          console.log("Valid courses fetched:", validCourses);

          setCourseOptions(validCourses);
          if (validCourses.length > 0) {
            const initialCourseId = localStorage.getItem('course_id') || validCourses[0].id;
            const initialCourse = validCourses.find(course => course.id === initialCourseId);
            console.log("Initial course ID from localStorage:", initialCourseId);
            console.log("Initial course found:", initialCourse);
            setSelectedFilter(initialCourse ? initialCourse.name : validCourses[0].name);
            localStorage.setItem('course_id', initialCourseId);
          }

          const chatPromises = chatSessionIds.map(async (chatId: string) => {
            if (typeof chatId === 'string') {
              const chatRef = doc(db, 'chatsessions', chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists() && chatSnap.data().name) {
                console.log("Chat session data found for ID:", chatId);
                return { chat_id: chatId, name: chatSnap.data().name };
              } else {
                console.log(`Chat session not found or name is empty for ID: ${chatId}`);
              }
            }
            return null;
          });

          const fetchedConversations = await Promise.all(chatPromises);
          const validConversations = fetchedConversations.filter((conversation): conversation is { chat_id: string, name: string } => conversation !== null);
          console.log("Valid conversations fetched:", validConversations);
          setConversations(validConversations.reverse());
        } else {
          console.log("No user data found for UID:", uid);
        }
      }
    };

    fetchCourseOptionsAndChatSessions();
  }, [uid]);
};

export const useAutoScroll = (
  endDivRef: React.RefObject<HTMLDivElement>,
  scrollableDivRef: React.RefObject<HTMLDivElement>,
  isStreaming: boolean,
  messages: Message[]
  
) => {
  useEffect(() => {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
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
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
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
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
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
};

