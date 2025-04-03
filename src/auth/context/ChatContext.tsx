import React, { createContext, useState, ReactNode } from 'react';
import { Message, Conversation, SocialThread, ChatContextType } from '../../interfaces/interfaces_eleve';


// Création du contexte
export const ChatContext = createContext<ChatContextType>({} as ChatContextType);

// Fournisseur de contexte
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(true);
  const [socialThreads, setSocialThreads] = useState<SocialThread[]>([]);
  const [isSocialThread, setIsSocialThread] = useState(false); // 🔹 statut booléen lié à la conversation active

  return (
    <ChatContext.Provider value={{ 
        messages, setMessages, 
        conversations, setConversations, 
        isLandingPageVisible,setIsLandingPageVisible,
        socialThreads, setSocialThreads,
        isSocialThread, setIsSocialThread }}>
      {children}
    </ChatContext.Provider>
  );
};
