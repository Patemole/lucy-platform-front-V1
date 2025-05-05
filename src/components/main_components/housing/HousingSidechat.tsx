import React from 'react';
import { Box } from '@mui/material';

const HousingSidechat: React.FC = () => {
  return (
    <Box sx={{
      width: '33.33%', // Prend 1/3 de la largeur
      padding: 2,
      backgroundColor: 'lightcoral', // Couleur de fond pour visualisation
      height: '100%', // Prend toute la hauteur
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeft: '1px solid grey' // Bordure à GAUCHE maintenant
    }}>
      Component 2 (Sidechat - 1/3)
    </Box>
  );
};

export default HousingSidechat; 