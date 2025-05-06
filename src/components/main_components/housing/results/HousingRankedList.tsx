import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Chip } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useRankedListDnd } from './hooks/useRankedListDnd';

// Interface pour les données (partagée)
interface CardData {
  id: string; 
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
}

interface HousingRankedListProps {
  rankedCards: CardData[];
}

// Fonction pour obtenir la couleur du label (déplacée ici)
const getLabelColor = (label: string) => {
  if (label.toLowerCase() === 'social') return '#FFDAB9'; // PeachPuff
  if (label.toLowerCase() === 'study') return '#ADD8E6'; // LightBlue
  if (label.toLowerCase() === 'mixte') return '#98FB98'; // PaleGreen
  return '#E0E0E0'; // Gris par défaut
};

const HousingRankedList: React.FC<HousingRankedListProps> = ({ rankedCards: initialRankedCards }) => {
  // Utiliser le hook pour gérer l'état et la logique DND
  const { items, onDragEnd } = useRankedListDnd(initialRankedCards);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="rankedList">
        {(provided) => (
          <List 
            sx={{ width: '100%' }} 
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(providedDraggable) => (
                  <ListItem 
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    sx={{ 
                      alignItems: 'center',
                      paddingY: 2,
                      border: '1px solid lightgrey',
                      borderRadius: '8px',
                      marginBottom: 2,
                      backgroundColor: 'white'
                    }}
                  >
                    {/* Indicateur de rang et drag handle */}
                    <Box 
                      sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }} 
                      {...providedDraggable.dragHandleProps}
                    >
                      <DragHandleIcon sx={{ color: 'grey.500', cursor: 'grab', marginRight: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{index + 1}.</Typography>
                    </Box>
                    
                    {/* Avatar (Image) */}
                    <ListItemAvatar sx={{ marginRight: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        variant="rounded"
                        src={card.imageUrl} 
                        alt={card.title} 
                        sx={{ width: 100, height: 100 }}
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
                          <br /> {card.subtitle}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default HousingRankedList; 