import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AIMessage } from '../../MessagesWEB';

// Interface pour les données de la carte logement à afficher dans le side chat
interface HousingCardDisplayData {
  id: string; // Garder l'id, même s'il n'est pas directement affiché, pour la cohérence
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
  rank?: number; // Le rang pourrait aussi être utile à afficher ou pour la logique
  price?: string; // Le prix aussi
}

// Interface simplifiée pour les messages du side chat
interface SideChatMessage {
  id: string | number;
  type: 'human' | 'ai';
  content: string;
  metadataHousing?: HousingCardDisplayData; // Ajout des métadonnées pour la carte logement
}

interface SideChatDisplayProps {
  messages: SideChatMessage[];
}

const SideChatDisplay: React.FC<SideChatDisplayProps> = ({ messages }) => {
  const theme = useTheme();

  // Fonctions vides pour les props de AIMessage non utilisées ici
  const noOp = () => {}; 

  return (
    <Box sx={{ 
      height: '100%',     // Doit remplir le conteneur parent (celui avec flexGrow et overflowY)
      // overflowY: 'auto', // Le scroll est géré par le parent
      padding: 2, 
      display: 'flex',     // Garder flex pour empiler les messages
      flexDirection: 'column', 
      gap: 1 
    }}>
      {messages.map((message, index) => {
        if (message.type === 'human') {
          return (
            <Box 
              key={message.id}
              sx={{
                alignSelf: 'flex-end',
                maxWidth: '75%',
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.button.background, 
                  color: theme.palette.text_human_message_historic,
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  textAlign: 'left',
                  fontSize: '1.05rem',
                  wordBreak: 'break-word',
                }}
              >
                {message.content} 
              </Box>
            </Box>
          );
        } else {
          // Utiliser AIMessage pour les messages AI
          return (
            <Box key={message.id} sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
              <AIMessage
                messageId={typeof message.id === 'string' ? parseInt(message.id, 10) : message.id}
                content={message.content}
                personaName="Lucy"
                // Props essentielles pour l'affichage de base, la plupart des autres sont optionnelles ou non pertinentes ici
                isComplete={true} // Message affiché est toujours complet
                hasDocs={false}   // Pas de documents cités dans ce contexte simple
                isMessageLoading={false} // Pas de chargement individuel de message ici
                chatContext="SideChat" // Ajout du contexte de chat
                housingCardData={message.metadataHousing} // Passer les données de la carte logement
                // --- Callbacks non utilisés dans ce sidechat simplifié ---
                handleFeedback={noOp}
                handleWrongAnswerClick={noOp}
                handleSourceClick={noOp}
                handleSendTAKMessage={noOp} 
                handleSendCOURSEMessage={noOp}
                // --- Données structurées non utilisées ici ---
                citedDocuments={[]}
                images={[]}
                takData={[]}
                CourseData={[]}
                waitingMessages={[]}
                ReasoningSteps={undefined}
                chartData={undefined}
                redditData={[]}
                instaData={[]}
                youtubeData={[]}
                quoraData={[]}
                errorData={[]}
                confidenceScoreData={[]}
                instaclubData={[]}
                linkedinData={[]}
                insta2Data={[]}
                // --- Props d'état/contexte non pertinentes ici ---
                drawerOpen={false} // Non applicable ou non disponible
                isGloballyStreaming={false} // Pas de streaming global géré ici
                hasNewContent={false} // Non applicable
                // --- Props d'onboarding non utilisées ---
                metadataOnboarding={null}
                handleSendSCHOOLMessage={noOp}
                handleSendYEARMessage={noOp}
                handleSendTESTMessage={noOp}
                handleSendLINKEDINMessage={noOp}
                handleSendINSTAGRAMMessage={noOp}
                handleSendFAVORITE_COLORMessage={noOp}
                handleSendPET_NAMEMessage={noOp}
                handleSendMAJORMINORMessage={noOp}
                handleSendCOMPLIANCEMessage={noOp}
                hasStartedStreaming={false}
                userUniversity={undefined} // Non disponible ici, ou pourrait être passé en prop si nécessaire
              />
            </Box>
          );
        }
      })}
    </Box>
  );
};

export default SideChatDisplay; 