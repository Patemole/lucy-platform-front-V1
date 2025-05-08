import React from 'react';
import { Box } from '@mui/material'; // Imports simplifiés
import HousingResultsHeader from './HousingResultsHeader';
import HousingRankedList from './HousingRankedList'; // <<< Importer la nouvelle liste
import { DropResult } from 'react-beautiful-dnd'; // Importer DropResult

// Interface pour les données (peut être dans un fichier partagé)
interface CardData {
  id: string; 
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
}

interface HousingResultsProps {
  rankedCards: CardData[];
  onDragEndList: (result: DropResult) => void; // Nouvelle prop pour le callback
}

const HousingResults: React.FC<HousingResultsProps> = ({ rankedCards, onDragEndList }) => {
  // La logique getLabelColor a été déplacée dans HousingRankedList

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}> 
      <HousingResultsHeader 
        title="Your Housing Ranking"
        subtitle="You can change the ranking with drag and drop"
      />

      {/* La liste prend l'espace restant */}
      <Box sx={{ flexGrow: 1, width: '100%', margin: 'auto', padding: '0px 16px 16px 16px', overflowY: 'auto' }}> 
         {/* <<< Utiliser le nouveau composant ici >>> */}
        <HousingRankedList 
          rankedCards={rankedCards} 
          onDragEndList={onDragEndList} // Passer le callback à HousingRankedList
        /> 
      </Box>
    </Box>
  );
};

export default HousingResults; 