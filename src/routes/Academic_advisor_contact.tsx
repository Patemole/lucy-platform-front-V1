import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { submitAcademicAdvisorEmailAdress } from '../api/academic_advisor_info';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = async () => {
    if (validateEmail(email)) {
      // Récupérer le uid depuis le localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = user.id;

      // Ouvrir le client email de l'utilisateur dans un nouvel onglet
      window.open(`mailto:${email}?subject=Lucy, Need help`, '_blank');

      // Soumettre l'adresse email et le uid à l'endpoint
      try {
        await submitAcademicAdvisorEmailAdress(email, uid);
      } catch (error) {
        console.error('Failed to submit email:', error);
      }

      // Réinitialiser l'entrée de l'email
      setEmail('');
    } else {
      console.error('You need to enter a valid email address');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGoClick();
    }
  };

  const handleBackToChatClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh', position: 'fixed', width: '100%' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            {/* Empty box for future content or just to center */}
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)', height: '100vh' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2, display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              startIcon={<FiArrowLeft />}
              onClick={handleBackToChatClick}
              sx={{ textTransform: 'none', backgroundColor: 'transparent' }}
            >
              Back to chat
            </Button>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto', marginRight: '35px' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                onKeyPress={handleKeyPress}
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;





/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { submitAcademicAdvisorEmailAdress } from '../api/academic_advisor_info';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = async () => {
    if (validateEmail(email)) {
      // Récupérer le uid depuis le localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = user.id;

      // Ouvrir le client email de l'utilisateur dans un nouvel onglet
      window.open(`mailto:${email}?subject=Lucy, Need help`, '_blank');

      // Soumettre l'adresse email et le uid à l'endpoint
      try {
        await submitAcademicAdvisorEmailAdress(email, uid);
      } catch (error) {
        console.error('Failed to submit email:', error);
      }

      // Réinitialiser l'entrée de l'email
      setEmail('');
    } else {
      console.error('You need to enter a valid email address');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGoClick();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            {/* Empty box for future content or just to center 
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                onKeyPress={handleKeyPress}
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/




/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { submitAcademicAdvisorEmailAdress } from '../api/academic_advisor_info';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = async () => {
    if (validateEmail(email)) {
      // Ouvrir le client email de l'utilisateur dans un nouvel onglet
      window.open(`mailto:${email}?subject=Lucy, Need help`, '_blank');

      // Soumettre l'adresse email à l'endpoint
      try {
        await submitAcademicAdvisorEmailAdress(email);
      } catch (error) {
        console.error('Failed to submit email:', error);
      }

      // Réinitialiser l'entrée de l'email
      setEmail('');
    } else {
      console.error('You need to enter a valid email address');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGoClick();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                onKeyPress={handleKeyPress}
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/




/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { submitAcademicAdvisorEmailAdress } from '../api/academic_advisor_info';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = async () => {
    if (validateEmail(email)) {
      try {
        // Soumettre l'adresse email à l'endpoint
        await submitAcademicAdvisorEmailAdress(email);
        setSuccess(true);

        // Ouvrir le client email de l'utilisateur
        window.open(`mailto:${email}?subject=Lucy, Need help`);

        // Réinitialiser l'entrée de l'email
        setEmail('');
      } catch (error) {
        setError(true);
        setErrorMessage('Failed to submit email. Please try again.');
      }
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
            <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                Email successfully submitted!
              </Alert>
            </Snackbar>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/



/*
//Ajout du backend for sending email adress to the endpoint with calling the function on academic_advisor.tsx file
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { submitAcademicAdvisorEmailAdress } from '../api/academic_advisor_info';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = async () => {
    if (validateEmail(email)) {
      try {
        await submitAcademicAdvisorEmailAdress(email);
        setSuccess(true);
        setEmail('');
      } catch (error) {
        setError(true);
        setErrorMessage('Failed to submit email. Please try again.');
      }
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
            <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                Email successfully submitted!
              </Alert>
            </Snackbar>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/



/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = () => {
    if (validateEmail(email)) {
      const mailtoLink = `mailto:${email}?subject=Lucy: Need information`;
      window.location.href = mailtoLink;
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
          
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '-5px 0 15px -10px rgba(0,0,0,0.3)' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'left', marginTop: '5%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/



/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = () => {
    if (validateEmail(email)) {
      const mailtoLink = `mailto:${email}?subject=Lucy: Need information`;
      window.location.href = mailtoLink;
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ alignSelf: 'flex-start', margin: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'center', marginTop: '10%' }}>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
              Your academic advisor's email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    borderRadius: '12px',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go
              </Button>
            </Box>
            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
          </Box>
          <Box
            sx={{
              alignSelf: 'flex-end',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginBottom: 2,
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/


/* DERNIER CODE VALADE EN MODIFIANT PAS MAL DE CHOSE
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = () => {
    if (validateEmail(email)) {
      const mailtoLink = `mailto:${email}?subject=Lucy: Need information`;
      window.location.href = mailtoLink;
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={8} sx={{ backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        <Grid item xs={4} sx={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: '80%', maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
              Enter your Academic Advisor email address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
                sx={{
                  marginRight: '10px',
                  '& fieldset': { borderColor: theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' },
                  '& .MuiInputBase-input': { color: theme.palette.text.primary }
                }}
              />
              <Button variant="contained" color="primary" onClick={handleGoClick} sx={{ borderRadius: '12px', padding: '10px 20px' }}>
                Go2
              </Button>
            </Box>
            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              marginTop: '20px'
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              powered by Lucy
            </Typography>
            <Avatar
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/







/*/
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box, Grid, CssBaseline, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = () => {
    if (validateEmail(email)) {
      const mailtoLink = `mailto:${email}?subject=Lucy: Need information`;
      window.location.href = mailtoLink;
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <Box sx={{ padding: 2 }}>
            <img src={logo_penn} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.5)',
              paddingTop: '10vh',
              paddingBottom: '10vh',
              boxSizing: 'border-box'
            }}
          >
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Enter your Academic Advisor email address</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To contact your academic advisor, please enter their email address below</span>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={8} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    variant="outlined"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    sx={{ flex: 1, marginRight: '10px', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiInputBase-input': { color: theme.palette.text.primary } }}
                  />
                  <Button variant="contained" color="primary" onClick={handleGoClick}>
                    Go
                  </Button>
                </Grid>
                <Grid item xs={2}></Grid>
              </Grid>
            </Box>

            <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: theme.spacing(2),
                boxSizing: 'border-box',
                marginTop: '1px'
              }}
            >
              <Typography variant="body2" sx={{ mr: 1 }}>
                powered by Lucy
              </Typography>
              <Avatar
                src={logo}
                alt="Lucy Logo"
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/

/*
import React, { useState } from 'react';
import { ThemeProvider, TextField, Button, Typography, Snackbar, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const AcademicAdvisorContact: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleGoClick = () => {
    if (validateEmail(email)) {
      const mailtoLink = `mailto:${email}?subject=Lucy: Need information`;
      window.location.href = mailtoLink;
    } else {
      setError(true);
      setErrorMessage('You need to enter a valid email address');
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '0 20px',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Enter your Academic Advisor email address
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            sx={{ marginRight: '10px', flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleGoClick}>
            Go
          </Button>
        </Box>
        <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorContact;
*/