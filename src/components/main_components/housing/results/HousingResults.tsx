import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Chip, Paper, Divider } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle'; // Pour l'icône de drag (visuel)

// Utiliser la même interface que dans le hook
interface CardData {
  id: string; 
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
}

interface HousingResultsProps {
  rankedCards: CardData[]; // Les cartes déjà triées
}

const HousingResults: React.FC<HousingResultsProps> = ({ rankedCards }) => {
  // Couleurs pastel pour les labels (similaire à HousingCard)
  const getLabelColor = (label: string) => {
    // Ajoutez une logique plus complexe si nécessaire pour différentes couleurs
    if (label.toLowerCase() === 'social') return '#FFDAB9'; // PeachPuff
    if (label.toLowerCase() === 'study') return '#ADD8E6'; // LightBlue
    if (label.toLowerCase() === 'mixte') return '#98FB98'; // PaleGreen
    return '#E0E0E0'; // Gris par défaut
  };

  return (
    <Box sx={{ width: '100%', margin: 'auto', padding: 2, overflowY: 'auto' }}>
      {/* <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', marginBottom: 2 }}> */}
        {/* Your Housing Ranking */}
      {/* </Typography> */}
      <List>
        {rankedCards.map((card, index) => (
          <React.Fragment key={card.id}>
            <ListItem sx={{ 
              alignItems: 'flex-start', // Aligner les éléments en haut
              paddingY: 2,
              border: '1px solid lightgrey',
              borderRadius: '8px',
              marginBottom: 2
            }}>
              {/* Indicateur de rang et drag handle */}
              <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2, paddingTop: '8px' }}>
                <DragHandleIcon sx={{ color: 'grey.500', cursor: 'grab', marginRight: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{index + 1}.</Typography>
              </Box>
              
              {/* Avatar (Image) */}
              <ListItemAvatar sx={{ marginRight: 2 }}>
                <Avatar 
                  variant="rounded" // Carré avec coins arrondis
                  src={card.imageUrl} 
                  alt={card.title} 
                  sx={{ width: 80, height: 80 }} 
                />
              </ListItemAvatar>

              {/* Texte (Titre, Label, Sous-titre) */}
              <ListItemText
                primary={<Typography variant="h6" sx={{ fontWeight: 500 }}>{card.title}</Typography>}
                secondary={
                  <React.Fragment>
                    <Chip 
                      label={card.label} 
                      size="small"
                      sx={{ 
                        backgroundColor: getLabelColor(card.label), 
                        color: '#555',
                        marginTop: 0.5,
                        marginBottom: 1,
                        fontWeight: '500' 
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default HousingResults; 