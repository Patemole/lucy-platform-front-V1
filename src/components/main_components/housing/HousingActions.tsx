import React from 'react';
import { Box, IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Interface pour les props
interface HousingActionsProps {
  onReload: () => void;
  onDislike: () => void;
  onLike: () => void;
}

const HousingActions: React.FC<HousingActionsProps> = ({ onReload, onDislike, onLike }) => {
  // Placeholder functions for button clicks - REMOVED as props are used now
  // const handleReload = () => console.log('Reload clicked');
  // const handleDislike = () => console.log('Dislike clicked');
  // const handleLike = () => console.log('Like clicked');

  const iconButtonStyle = {
    border: '1px solid lightgrey',
    margin: '0 16px', // Space between buttons
    width: 56, // Standard FAB size
    height: 56
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: 0, paddingBottom: 2, paddingX: 2 }}>
      <IconButton aria-label="reload" onClick={() => { console.log('[HousingActions] Reload button clicked'); onReload(); }} sx={{...iconButtonStyle, color: 'orange'}}>
        <ReplayIcon />
      </IconButton>
      <IconButton aria-label="dislike" onClick={() => { console.log('[HousingActions] Dislike button clicked'); onDislike(); }} sx={{...iconButtonStyle, color: 'red'}}>
        <CloseIcon />
      </IconButton>
      <IconButton aria-label="like" onClick={() => { console.log('[HousingActions] Like button clicked'); onLike(); }} sx={{...iconButtonStyle, color: 'green'}}>
        <FavoriteIcon />
      </IconButton>
    </Box>
  );
};

export default HousingActions; 