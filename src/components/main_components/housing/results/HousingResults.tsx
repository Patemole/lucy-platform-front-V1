import React from 'react';
import { Box } from '@mui/material'; // Imports simplifiés
import HousingResultsHeader from './HousingResultsHeader';
import HousingRankedList from './HousingRankedList'; // <<< Importer la nouvelle liste

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
}

const HousingResults: React.FC<HousingResultsProps> = ({ rankedCards }) => {
  // La logique getLabelColor a été déplacée dans HousingRankedList

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}> 
      <HousingResultsHeader 
        title="Your Housing Ranking"
        subtitle="Based on your preferences"
      />

      {/* La liste prend l'espace restant */}
      <Box sx={{ flexGrow: 1, width: '100%', margin: 'auto', padding: '0px 16px 16px 16px', overflowY: 'auto' }}> 
         {/* <<< Utiliser le nouveau composant ici >>> */}
        <HousingRankedList rankedCards={rankedCards} /> 
      </Box>
    </Box>
  );
};

export default HousingResults; 