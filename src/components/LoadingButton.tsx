// LoadingButton.tsx
import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ isLoading, onClick, children, disabled = false }) => {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      variant="contained"
      fullWidth
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': { backgroundColor: theme.palette.primary.dark },
        '&:active': { backgroundColor: theme.palette.primary.dark },
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
        minHeight: '36px', // Adjust according to your button size
      }}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <CircularProgress
          size={24}
          sx={{
            color: theme.palette.primary.contrastText,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;




// LoadingButton.tsx
/*
import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ isLoading, onClick, children, disabled = false }) => {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      variant="contained"
      fullWidth
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        '&:hover': { backgroundColor: theme.palette.primary.dark },
        '&:active': { backgroundColor: theme.palette.primary.dark },
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: '12px',
        position: 'relative',
      }}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <CircularProgress
          size={24}
          sx={{
            color: 'white',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
*/