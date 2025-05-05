import React from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

interface HousingHeaderProps {
  title: string;
  subtitle: string;
  progress: number; // Pourcentage de 0 à 100
  onSeeResults?: () => void; // Fonction optionnelle pour le bouton
}

const HousingHeader: React.FC<HousingHeaderProps> = ({ title, subtitle, progress, onSeeResults }) => {
  const showResultsButton = progress >= 80;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', width: '100%' }}>
      {/* Section Titre/Sous-titre (gauche) */}
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', marginBottom: '4px' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* Section Progression/Bouton (droite) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Indicateur de progression circulaire */}
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress 
            variant="determinate" 
            value={progress} 
            size={50} // Taille du cercle
            thickness={4} // Épaisseur du cercle
            sx={{ color: 'primary.main' }} // Couleur du cercle
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {`${progress}%`}
            </Typography>
          </Box>
        </Box>

        {/* Bouton "See results" conditionnel */}
        {showResultsButton && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={onSeeResults}
            size="small"
          >
            See results
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HousingHeader; 