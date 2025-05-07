import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SideChatDisplay from './sidechat/SideChatDisplay';
import SideChatInput from './sidechat/SideChatInput';

// Interface pour les données du logement classé reçues en props
// Doit correspondre à la CardData de useRankedListDnd
interface TopRankedCardData {
  id: string;
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
  // rank et price peuvent être optionnels si AIMessage les gère comme tels
  rank?: number;
  price?: string;
}

// Interface pour les messages internes au SideChat
interface SideChatMessage {
  id: string | number; 
  type: 'human' | 'ai';
  content: string;
  metadataHousing?: { // Cette structure doit correspondre à ce qu'attend AIMessage pour housingCardData
    id: string;      
    imageUrl: string;
    label: string;    
    subtitle: string; 
    title: string;    
    rank?: number;    // Assurez-vous que ces champs sont ceux que AIMessage utilise
    price?: string;
  };
}

// Props pour le composant principal
interface HousingSidechatProps {
  isResultsViewActive: boolean; 
  topRankedHousing: TopRankedCardData | null; // Prop pour le logement le mieux classé
}

const HousingSidechat: React.FC<HousingSidechatProps> = ({ isResultsViewActive, topRankedHousing }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<SideChatMessage[]>([]);

  // Mettre à jour le message initial lorsque topRankedHousing change
  useEffect(() => {
    let initialMessageContent = 'Welcome! Feel free to ask about any of the presented housing options.';
    let initialMetadata: SideChatMessage['metadataHousing'] = undefined;

    if (topRankedHousing) {
      // Mettre à jour le message pour inclure une référence au logement le mieux classé
      initialMessageContent = `Welcome! You can ask me about any housing shown. Want to know more about your top-ranked option, ${topRankedHousing.title}?`;
      initialMetadata = {
        id: topRankedHousing.id,
        title: topRankedHousing.title,
        imageUrl: topRankedHousing.imageUrl,
        label: topRankedHousing.label,
        subtitle: topRankedHousing.subtitle,
        // rank: topRankedHousing.rank, // Assurez-vous que rank et price sont dans TopRankedCardData si AIMessage en a besoin
        // price: topRankedHousing.price,
      };
    } else {
      // Message si aucun logement n'est classé (même si on s'attend à ce qu'il y en ait toujours un)
      initialMessageContent = 'Welcome! Once you have some ranked housing, I can help you with questions about them.';
    }

    setMessages([
      {
        id: 'initial-ai-message',
        type: 'ai',
        content: initialMessageContent,
        metadataHousing: initialMetadata,
      },
    ]);
  }, [topRankedHousing]); // Se redéclenche si topRankedHousing change

  const handleSendMessage = (messageContent: string) => {
    const newMessage: SideChatMessage = { 
      id: Date.now(), 
      type: 'human', 
      content: messageContent 
    };
    
    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      const aiResponse: SideChatMessage = {
        id: Date.now() + 1, 
        type: 'ai', 
        content: `You asked about: "${messageContent.substring(0, 30)}..." (This is a simulated response)`
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <Box sx={{
      width: '33.33%',
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #d3d3d3',
      position: 'relative',
    }}>
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SideChatDisplay messages={messages} />
      </Box>
      
      <SideChatInput onSendMessage={handleSendMessage} />

      {!isResultsViewActive && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 2,
          borderRadius: 'inherit'
        }}>
          <Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
            Complete at least 80% of the matching to chat!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HousingSidechat; 