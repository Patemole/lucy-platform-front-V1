import React from 'react';
import { Box } from '@mui/material';
import HousingTinder from './HousingTinder';
import HousingSidechat from './HousingSidechat';

const HousingMain: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      <HousingTinder />
      <HousingSidechat />
    </Box>
  );
};

export default HousingMain; 