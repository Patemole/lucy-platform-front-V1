import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, Backdrop, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';


interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  studentCount: number;
  emailList: string[];
  userId: string | null;
}

const PopupSendingEmailStudentListAA: React.FC<PopupFeedbackProps> = ({ open, onClose, onSubmit, studentCount, emailList, userId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const linkToCopy = `upenn.my-lucy.com/auth/sign-up/${userId}`;
  
  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        setStudentsRegistered(2);
        setLoading(false);
      }, 3000);
    }
  }, [open]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkToCopy);
    alert('Link copied to clipboard!');
  };

  const handleSendLink = () => {
    const subject = encodeURIComponent('Sign-up to Lucy');
    const body = encodeURIComponent(`Hello,\n\nSign-up to Lucy with this link:\n${linkToCopy}\n\nBest,\n`);
    const recipients = emailList.join(';');
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    
    navigate(`/dashboard/academic-advisor/${userId}`);
  };

  const handleNoLater = () => {
    navigate(`/dashboard/academic-advisor/${userId}`);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
      onKeyDown={handleKeyDown}
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
            {loading ? 'Checking registration status...' : `${studentCount - studentsRegistered} students have not signed up yet`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
              Send them by email your personal registration link:
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme.palette.grey[200],
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.grey[300] },
              }}
              onClick={handleCopyLink}
            >
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: '500', fontSize: '0.875rem', flexGrow: 1 }}>
                {linkToCopy}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleNoLater}
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                }}
              >
                No, later thanks
              </Button>
              <Button
                onClick={handleSendLink}
                sx={{
                  backgroundColor: theme.palette.button_sign_in,
                  color: theme.palette.button_text_sign_in,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                variant="contained"
              >
                Send link
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PopupSendingEmailStudentListAA;




/*
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, Backdrop, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  studentCount: number;
  emailList: string[];
  userId: string | null;
}

const PopupSendingEmailStudentListAA: React.FC<PopupFeedbackProps> = ({ open, onClose, onSubmit, studentCount, emailList, userId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const linkToCopy = `upenn.my-lucy.com/auth/sign-up/${userId}`;
  
  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simuler une attente pour le chargement des données
      setTimeout(() => {
        setStudentsRegistered(2); // Simuler le nombre d'étudiants inscrits
        setLoading(false);
      }, 3000);
    }
  }, [open]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkToCopy);
    alert('Link copied to clipboard!');
  };

  const handleSendLink = () => {
    const subject = encodeURIComponent('Sign-up to Lucy');
    const body = encodeURIComponent(`Hello,\n\nSign-up to Lucy with this link:\n${linkToCopy}\n\nBest,\n`);
    const recipients = emailList.join(';');
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    
    navigate(`/dashboard/academic-advisor/${userId}`);
  };

  const handleNoLater = () => {
    navigate(`/dashboard/academic-advisor/${userId}`);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    // Ignore onClose if the click is not on the backdrop
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // Prevent closing the modal with the Escape key
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
      onKeyDown={handleKeyDown}
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
            {loading ? 'Checking registration status...' : `${studentCount - studentsRegistered} students have not signed up yet`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
              Send them by email your personal registration link:
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme.palette.grey[200],
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.grey[300] },
              }}
              onClick={handleCopyLink}
            >
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: '500', fontSize: '0.875rem', flexGrow: 1 }}>
                {linkToCopy}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleNoLater}
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                }}
              >
                No, later thanks
              </Button>
              <Button
                onClick={handleSendLink}
                sx={{
                  backgroundColor: theme.palette.button_sign_in,
                  color: theme.palette.button_text_sign_in,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                variant="contained"
              >
                Send link
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PopupSendingEmailStudentListAA;
*/






/*
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, Backdrop, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  studentCount: number;
  emailList: string[];
  userId: string | null;
}

const PopupSendingEmailStudentListAA: React.FC<PopupFeedbackProps> = ({ open, onClose, onSubmit, studentCount, emailList, userId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const linkToCopy = `upenn.my-lucy.com/auth/sign-up/${userId}`;
  
  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simuler une attente pour le chargement des données
      setTimeout(() => {
        setStudentsRegistered(2); // Simuler le nombre d'étudiants inscrits
        setLoading(false);
      }, 3000);
    }
  }, [open]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkToCopy);
    alert('Link copied to clipboard!');
  };

  const handleSendLink = () => {
    const subject = encodeURIComponent('Sign-up to Lucy');
    const body = encodeURIComponent(`Hello,\n\nSign-up to Lucy with this link:\n${linkToCopy}\n\nBest,\n`);
    const recipients = emailList.join(';');
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    onClose(); // Close the popup after opening the email client
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    // Ignore onClose if the click is not on the backdrop
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    // Prevent closing the modal with the Escape key
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
      onKeyDown={handleKeyDown}
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
            {loading ? 'Checking registration status...' : `${studentCount - studentsRegistered} students have not signed up yet`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
              Send them by email your personal registration link:
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme.palette.grey[200],
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.grey[300] },
              }}
              onClick={handleCopyLink}
            >
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: '500', fontSize: '0.875rem', flexGrow: 1 }}>
                {linkToCopy}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={onClose}
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                }}
              >
                No, later thanks
              </Button>
              <Button
                onClick={handleSendLink}
                sx={{
                  backgroundColor: theme.palette.button_sign_in,
                  color: theme.palette.button_text_sign_in,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                variant="contained"
              >
                Send link
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PopupSendingEmailStudentListAA;
*/






/*
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, IconButton, Backdrop, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface PopupFeedbackProps {
  open: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSubmit: () => void;
}

const PopupSendingEmailStudentListAA: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const totalStudents = 10; // Remplacez ce chiffre par le nombre réel d'étudiants dans la liste
  const uid = 'su§sèdhéèsd'; // Remplacez cela par le UID réel de l'Academic Advisor
  const linkToCopy = `upenn.my-lucy.com/auth/sign-up/${uid}`;

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simuler un appel API avec un délai de 3 secondes
      setTimeout(() => {
        setStudentsRegistered(6); // Remplacez cela par la logique réelle pour déterminer les étudiants inscrits
        setLoading(false);
      }, 3000);
    }
  }, [open]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkToCopy);
    alert('Link copied to clipboard!');
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    // Ignore the onClose call if it's triggered by the backdrop click
    if (event.target !== event.currentTarget) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
            {loading ? 'Checking registration status...' : `${totalStudents - studentsRegistered} students have not signed up yet`}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mt: 2, fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
              Send to them by email your personal registration link
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme.palette.grey[200], // Grey background for the registration link box
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.grey[300] },
              }}
              onClick={handleCopyLink}
            >
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: '500', fontSize: '0.875rem', flexGrow: 1 }}>
                {linkToCopy}
              </Typography>
              <IconButton sx={{ color: theme.palette.primary.main }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={onClose}
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                }}
              >
                No, later thanks
              </Button>
              <Button
                onClick={onSubmit}
                sx={{
                  backgroundColor: theme.palette.button_sign_in,
                  color: theme.palette.button_text_sign_in,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                variant="contained"
              >
                Send link
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PopupSendingEmailStudentListAA;
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

const PopupSendingEmailStudentListAA: React.FC<PopupFeedbackProps> = ({ open, onClose, selectedFilter, onSubmit }) => {
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

export default PopupSendingEmailStudentListAA;
*/