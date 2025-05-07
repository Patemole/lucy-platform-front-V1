import React, { useState } from 'react';
import { Box } from '@mui/material';
import HousingTinder from './HousingTinder';
import HousingSidechat from './HousingSidechat';
import { CardData } from './results/hooks/useRankedListDnd';

const HousingMain: React.FC = () => {
  const [isResultsViewActive, setIsResultsViewActive] = useState(false);
  const [currentTopRanked, setCurrentTopRanked] = useState<CardData | null>(null);

  const handleTopRankedChange = (item: CardData | null) => {
    setCurrentTopRanked(item);
  };

  return (
    //<Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
    <Box  sx={{
     display: 'flex',
     height: '100vh',     // hauteur fixe pour tout le panneau
     //width: '100vw',
     minHeight: 0,        // autorise le rétrécissement vertical
     minWidth: 0          // évite un débordement horizontal
   }}
 >
      <HousingTinder 
        isResultsViewActive={isResultsViewActive} 
        onShowResults={() => setIsResultsViewActive(true)}
        onTopRankedChange={handleTopRankedChange}
      />
      <HousingSidechat 
        isResultsViewActive={isResultsViewActive} 
        topRankedHousing={currentTopRanked}
      />
    </Box>
  );
};

export default HousingMain; 