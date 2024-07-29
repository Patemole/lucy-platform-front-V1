
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string) => void;
}

const PopupFeedback: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);
    setFeedback('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            Coming soon!
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {selectedFilter} will soon be available. Give us some feedback if you have any idea
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter your ideas here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          multiline
          rows={4}
          sx={{ mt: 2, borderRadius: '20px' }}
          InputProps={{
            style: {
              fontWeight: '500',
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
            }
          }}
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            Please enter some feedback before submitting.
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupFeedback;

