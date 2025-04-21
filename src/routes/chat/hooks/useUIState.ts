//Fonctions et elements utilitaires a l application sur la vue chat
import { useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { Message } from '../../../interfaces/interfaces_eleve';
import { debounce } from 'lodash';

export const useUIState = ({
  isSmallScreen,
  messages,
  drawerOpen,
  scrollableDivRef,
  setDrawerOpen,
  setOnlineUsers,
  setIsAtBottom,
  setNewMessagesCount,
  setParametersMenuAnchorEl,
}: {
  isSmallScreen: boolean;
  messages: Message[];
  drawerOpen: boolean;
  scrollableDivRef: React.RefObject<HTMLDivElement>;
  setDrawerOpen: (val: boolean) => void;
  setOnlineUsers: (val: number) => void;
  setIsAtBottom: (val: boolean) => void;
  setNewMessagesCount: (val: number) => void;
  setParametersMenuAnchorEl: (el: HTMLElement | null) => void;
}) => {


//Scrolling useffect for autoscrolling I think // Same as in the useMessage.tsx
useEffect(() => {
    const handleScroll = debounce(() => {
    const scrollDiv = scrollableDivRef.current;
    if (scrollDiv) {
        const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 100; // Adjust threshold as needed
        setIsAtBottom(atBottom);
        if (atBottom) setNewMessagesCount(0);
    }
    }, 100); // Delay of 100ms

    const scrollDiv = scrollableDivRef.current;
    scrollDiv?.addEventListener('scroll', handleScroll);

    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
}, []);



//To search the number of users changing in the database firestore from the function for a global variable
useEffect(() => {
    console.log("🔄 Setting up Firestore listener for onlineUsers...");
  
    // Reference to Firestore document
    const docRef = doc(db, "stats", "onlineUsers");
  
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("📡 Firestore update detected:", data);
  
        if (typeof data.count === "number") {
          setOnlineUsers(data.count); // Update state when Firestore changes
          console.log('✅ Online users updated: ${data.count}');
        }
      } else {
        console.warn("⚠️ Firestore document 'onlineUsers' not found. Setting default value.");
        setOnlineUsers(20); // Default value if Firestore document does not exist
      }
    });
  
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      console.log("🚫 Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, []);




  //To close the sidebqr if the user is diminue the size of the screen to close the sidebar
useEffect(() => {
    setDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);



//------------------------------FUNCTIONS------------------------

//permet d ouvir la sidebar (change l etat de ouvir/fermer)
const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

// Compute if the latest AI message has a TAK
const hasTak = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.type === 'ai');
    return lastAiMessage?.TAK && lastAiMessage.TAK.length > 0;
  }, [messages]);


  //For reasonnings steps I think
const lastAiMessageId = useMemo(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.type === 'ai');
    return lastAiMessage ? lastAiMessage.id : null;
  }, [messages]);

  return {
    toggleDrawer,
    hasTak,
    lastAiMessageId,
  };
};