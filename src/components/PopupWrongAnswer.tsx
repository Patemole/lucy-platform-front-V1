//TEST
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


/* ancien code qui marche mais pas visible sur telephone 
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string, aiMessageContent: string | null, humanMessageContent: string | null) => void;
  aiMessageContent: string | null;
  humanMessageContent: string | null;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit, aiMessageContent, humanMessageContent }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

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
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" sx={{ color: theme.palette.text.primary }}>
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            }
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
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/





/*
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string, aiMessageContent: string | null, humanMessageContent: string | null) => void;
  aiMessageContent: string | null;
  humanMessageContent: string | null;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit, aiMessageContent, humanMessageContent }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

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
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            You didn't enter any feedback
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;

*/


/*
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string) => void;
  aiMessageContent: string | null; // Updated line
  humanMessageContent: string | null; // Updated line
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit, aiMessageContent, humanMessageContent }) => { // Updated line
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);
    const user = JSON.parse(localStorage.getItem('user') || '{prout_user}');
    const chatId = (localStorage.getItem('chat_id') || '{prout_chat_id}');
    
    await submitFeedbackWrongAnswer({
      userId: user.id,
      chatId,
      aiMessageContent: aiMessageContent || 'prout_aiMessage', // Updated line
      humanMessageContent: humanMessageContent || 'prout_humanMessage', // Updated line
      feedback,
    });
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
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            You didn't enter any feedback
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/





/*
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string) => void;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const chatId = (localStorage.getItem('chat_id') || '{}');
    const aiMessage = JSON.parse(localStorage.getItem('aiMessage') || '{}');
    const humanMessage = JSON.parse(localStorage.getItem('humanMessage') || '{}');
    
    await submitFeedbackWrongAnswer({
      userId: user.id,
      chatId,
      aiMessageContent: aiMessage.content,
      humanMessageContent: humanMessage.content,
      feedback,
    });
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
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            You didn't enter any feedback
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/




/*
//Ajout de la fonction pour appeler l'endpoint dupuis le backend dans api/feedback_wrong_answer
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedbackWrongAnswer } from '../api/feedback_wrong_answer';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: (feedback: string) => void;
}

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);
    await submitFeedbackWrongAnswer(feedback);
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
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            You didn't enter any feedback
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/

/*
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

const PopupWrongAnswer: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
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
            Wrong Answer?
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
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
            You didn't enter any feedback
          </Typography>
        )}
        <Button onClick={handleSubmit} sx={{ mt: 2 }} variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWrongAnswer;
*/
