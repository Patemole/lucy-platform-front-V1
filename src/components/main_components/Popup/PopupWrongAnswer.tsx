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
  userUniversity: string | null | undefined;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({
  open,
  onClose,
  onSubmit,
  aiMessageContent,
  humanMessageContent,
  userUniversity,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isKedge = userUniversity === 'kedge';

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
          maxHeight: '90vh',
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mb: 1,
            p: theme.spacing(2, 4, 1, 4)
          }}
        >
          <Typography variant="h5" component="h2" sx={{ color: theme.palette.text.primary }}>
            {isKedge ? "Donnez-nous votre avis" : "Give us some feedback"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            px: 4,
            pb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: theme.palette.text.primary, mb: 2 }}>
            {isKedge ? "Veuillez évaluer la réponse selon les critères suivants :" : "Please rate the response based on the following criteria:"}
          </Typography>

          {[
            { label: isKedge ? "Pertinence" : "Relevance", key: 'relevance', description: isKedge ? "La réponse correspondait-elle à votre question ?" : "Did the response match your question?" },
            { label: isKedge ? "Exactitude" : "Accuracy", key: 'accuracy', description: isKedge ? "L\'information était-elle correcte et à jour ?" : "Was the information correct and up to date?" },
            { label: isKedge ? "Format" : "Format", key: 'format', description: isKedge ? "La réponse était-elle structurée et facile à lire ?" : "Was the answer structured and easy to read?" },
            { label: isKedge ? "Sources" : "Sources", key: 'sources', description: isKedge ? "La réponse incluait-elle des sources fiables ?" : "Did the response include reliable sources?" },
            { label: isKedge ? "Satisfaction générale" : "Overall Satisfaction", key: 'overall_satisfaction', description: isKedge ? "Dans quelle mesure êtes-vous satisfait de la réponse ?" : "How satisfied are you with the response?" },
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
            {isKedge ? "Commentaires supplémentaires (facultatif)" : "Additional Comments (optional)"}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={isKedge ? "Entrez vos commentaires ici..." : "Enter your feedback here..."}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            multiline
            sx={{
              mt: 1,
              borderRadius: '8px',
              backgroundColor: theme.palette.background.default,
              height: '4.5rem',
              overflow: 'hidden',
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start',
                overflow: 'hidden',
                '& fieldset': { 
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': { 
                  borderColor: theme.palette.primary.main 
                },
                padding: 0,
              },
              '& .MuiInputBase-inputMultiline': {
                overflowY: 'auto !important',
                height: '100% !important',
                padding: '10px 14px',
                boxSizing: 'border-box',
                fontWeight: '500',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
              }
            }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {isKedge ? "Veuillez fournir au moins une note ou un commentaire." : "Please provide at least a rating or a comment."}
            </Typography>
          )}
        </Box>

        <Box sx={{ p: theme.spacing(1, 4, 2, 4) }}>
          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.button_text_sign_in,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            variant="contained"
            fullWidth={isSmallScreen}
          >
            {isKedge ? "Envoyer" : "Submit"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;