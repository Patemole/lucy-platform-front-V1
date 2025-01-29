/*
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Backdrop,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (
    feedback: string,
    aiMessageContent: string | null,
    humanMessageContent: string | null
  ) => void;
  aiMessageContent: string | null;
  humanMessageContent: string | null;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({
  open,
  onClose,
  selectedFilter,
  onSubmit,
  aiMessageContent,
  humanMessageContent,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback, aiMessageContent, humanMessageContent);
    setFeedback('');
    setError(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: isSmallScreen ? '5%' : '50%',
          left: '50%',
          transform: isSmallScreen
            ? 'translate(-50%, 0)'
            : 'translate(-50%, -50%)',
          width: isSmallScreen ? '90vw' : 600,
          maxHeight: isSmallScreen ? '90vh' : 'auto',
          overflowY: isSmallScreen ? 'auto' : 'visible',
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ color: theme.palette.text.primary }}
          >
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography
          sx={{
            fontWeight: '500',
            fontSize: '0.875rem',
            color: theme.palette.text.primary,
          }}
        >
          Give us some feedback if you have any trouble
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          multiline
          rows={4}
          sx={{
            mt: 2,
            borderRadius: '12px',
            backgroundColor: theme.palette.background.default,
            '& fieldset': { borderColor: theme.palette.primary.main },
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
            },
          }}
          InputProps={{
            style: {
              fontWeight: '500',
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
            },
          }}
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            You didn't enter any feedback
          </Typography>
        )}
        <Button
          onClick={handleSubmit}
          sx={{
            mt: 2,
            backgroundColor: theme.palette.button_sign_in,
            color: theme.palette.button_text_sign_in,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          variant="contained"
          fullWidth={isSmallScreen}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/


import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Backdrop,
  useMediaQuery,
  Rating,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    feedback: string,
    aiMessageContent: string | null,
    humanMessageContent: string | null,
    ratings: {
      relevance?: number;
      accuracy?: number;
      format?: number;
      sources?: number;
      overall_satisfaction?: number;
    }
  ) => void;
  aiMessageContent: string | null;
  humanMessageContent: string | null;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({
  open,
  onClose,
  onSubmit,
  aiMessageContent,
  humanMessageContent,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [ratings, setRatings] = useState({
    relevance: undefined,
    accuracy: undefined,
    format: undefined,
    sources: undefined,
    overall_satisfaction: undefined,
  });

  const handleRatingChange = (category: string, value: number | null) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [category]: value || undefined,
    }));
  };

  const handleSubmit = () => {
    if (feedback.trim() === '' && Object.values(ratings).every((value) => value === undefined)) {
      setError(true);
      return;
    }

    onSubmit(feedback, aiMessageContent, humanMessageContent, ratings);
    setFeedback('');
    setRatings({
      relevance: undefined,
      accuracy: undefined,
      format: undefined,
      sources: undefined,
      overall_satisfaction: undefined,
    });
    setError(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: isSmallScreen ? '5%' : '50%',
          left: '50%',
          transform: isSmallScreen ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
          width: isSmallScreen ? '90vw' : 600,
          maxHeight: isSmallScreen ? '90vh' : 'auto',
          overflowY: 'auto',
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ color: theme.palette.text.primary }}>
            Give us some feedback
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: theme.palette.text.primary, mb: 2 }}>
          Please rate the response based on the following criteria:
        </Typography>

        {[
          { label: 'Relevance', key: 'relevance', description: 'Did the response match your question?' },
          { label: 'Accuracy', key: 'accuracy', description: 'Was the information correct and up to date?' },
          { label: 'Format', key: 'format', description: 'Was the answer structured and easy to read?' },
          { label: 'Sources', key: 'sources', description: 'Did the response include reliable sources?' },
          { label: 'Overall Satisfaction', key: 'overall_satisfaction', description: 'How satisfied are you with the response?' },
        ].map(({ label, key, description }) => (
          <Box key={key} sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', color: theme.palette.text.primary }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              {description}
            </Typography>
            <Rating
              name={key}
              value={ratings[key as keyof typeof ratings] || 0}
              onChange={(_, newValue) => handleRatingChange(key, newValue)}
              sx={{mt: 0.5}}
            />
          </Box>
        ))}

        <Typography sx={{ mt: 2, fontSize: '0.875rem', color: theme.palette.text.primary }}>
          Additional Comments (optional)
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          multiline
          minRows={1}
          maxRows={3} // The field expands up to 4 rows before scrolling
          sx={{
            mt: 1,
            borderRadius: '8px',
            backgroundColor: theme.palette.background.default,
            '& fieldset': { borderColor: theme.palette.primary.main },
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
            },
          }}
          InputProps={{
            style: {
              fontWeight: '500',
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
            },
          }}
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            Please provide at least a rating or a comment.
          </Typography>
        )}

        <Button
          onClick={handleSubmit}
          sx={{
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.button_text_sign_in,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          variant="contained"
          fullWidth={isSmallScreen}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;