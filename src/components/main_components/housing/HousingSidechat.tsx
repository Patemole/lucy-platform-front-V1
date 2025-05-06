import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SideChatDisplay from './sidechat/SideChatDisplay';
import SideChatInput from './sidechat/SideChatInput';

// Interface simplifiée pour les messages (peut être partagée)
interface SideChatMessage {
  id: string | number;
  type: 'human' | 'ai';
  content: string;
}

// Props pour le composant principal
interface HousingSidechatProps {
  isResultsViewActive: boolean; // Pour contrôler le flou
}

const HousingSidechat: React.FC<HousingSidechatProps> = ({ isResultsViewActive }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<SideChatMessage[]>([
    { id: 1, type: 'ai', content: 'Welcome! Ask me anything about the housing options shown.' },
    // Ajout de messages pour forcer le scroll pour le test
    { id: 2, type: 'human', content: 'Hello there!' },
    { id: 3, type: 'ai', content: 'Hi! How can I help you today?' },
    { id: 4, type: 'human', content: 'I have a question about the layout.' },
    { id: 5, type: 'ai', content: 'Sure, what is your question?' },
    { id: 6, type: 'human', content: 'Is the input field supposed to be fixed at the bottom?' },
    { id: 7, type: 'ai', content: 'Yes, it should be. We are working on it!' },
    { id: 8, type: 'human', content: 'Great, keep up the good work and let me know if I can test further for the scroll behavior because it is very important for the UX that the input field stays fixed.' },
    { id: 9, type: 'ai', content: 'Absolutely, your feedback is valuable. The scrollable message area should be independent.' },
    { id: 10, type: 'human', content: 'Testing scroll 1' },
    { id: 11, type: 'ai', content: 'Scroll response 1' },
    { id: 12, type: 'human', content: 'Testing scroll 2' },
    { id: 13, type: 'ai', content: 'Scroll response 2' },
    { id: 14, type: 'human', content: 'Testing scroll 3' },
    { id: 15, type: 'ai', content: 'Scroll response 3' },
  ]);

  const handleSendMessage = (messageContent: string) => {
    const newMessage: SideChatMessage = { 
      id: Date.now(), 
      type: 'human', 
      content: messageContent 
    };
    
    // Ajouter le message humain
    setMessages(prev => [...prev, newMessage]);

    // Simuler une réponse AI après un délai
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
      width: '33.33%', // Prend 1/3
      height: '100%', 
      display: 'flex',
      flexDirection: 'column', // Garder la direction de la colonne pour le conteneur principal
      borderLeft: '1px solid #d3d3d3', // Gris légèrement plus foncé que #e0e0e0
      position: 'relative', // Important pour l'overlay
      // backgroundColor: 'white' // Fond pour le chat - SUPPRIMÉ POUR TRANSPARENCE
    }}>
      {/* Zone pour l'affichage des messages */}
      <Box sx={{
        flexGrow: 1,         // Cette zone prendra tout l'espace vertical disponible
        overflowY: 'auto',   // Active le scroll vertical SI le contenu dépasse
        minHeight: 0,        // Remis en place, car c'est souvent nécessaire
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SideChatDisplay messages={messages} />
      </Box>
      
      {/* SideChatInput reste un enfant direct du conteneur flex principal */}
      <SideChatInput onSendMessage={handleSendMessage} />

      {/* Overlay de Flou Conditionnel */}
      {!isResultsViewActive && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.6)', // Un fond semi-transparent pour l'overlay est conservé
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)', // Assurez-vous que cette valeur correspond à backdropFilter
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 2,
          borderRadius: 'inherit'
        }}>
          <Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
            Complete the matching first to chat!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HousingSidechat; 