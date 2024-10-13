// nouveau code adapte aux telephones
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
  onSubmit: (feedback: string) => void;
}

const PopupFeedback: React.FC<PopupFeedbackProps> = ({
  open,
  onClose,
  selectedFilter,
  onSubmit,
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
          overflowY: 'auto',
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
            Coming soon!
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
          {selectedFilter} will soon be available. Give us some feedback if you have any idea
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
            Please enter some feedback before submitting.
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

export default PopupFeedback;





/* // ancien code pas adapte sur telephone 
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
            Coming soon!
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {selectedFilter} will soon be available. Give us some feedback if you have any idea
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
            Please enter some feedback before submitting.
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

export default PopupFeedback;
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
*/





/*
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

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

  const handleSubmit = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || 'default_uid';
    const courseId = localStorage.getItem('course_id') || 'default_course_id';

    await submitFeedbackAnswer({ userId: uid, feedback, courseId });

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
*/


/*
//Ajout de la logique appelle de l'endpoint quand on clique sur submit et qu'il y a du texte dans le placholder 
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

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

  const handleSubmit = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    onSubmit(feedback);
    await submitFeedbackAnswer(feedback);
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
*/
