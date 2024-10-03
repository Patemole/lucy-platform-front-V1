

//ANCIEN CODE DU 2 OCTOBRE QUI MARCHE
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import config from '../config';

const isEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i, /^.+@my-lucy\.com$/i],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  usyd: [/^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  drexel: [/^.+@([a-zA-Z0-9._-]+\.)*drexel\.edu$/i, /^.+@my-lucy\.com$/i],
  temple: [/^.+@([a-zA-Z0-9._-]+\.)*temple\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i]
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia',
    drexel: 'Drexel',
    temple:'Temple',
    admin: 'Admin'
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const timestamp = Timestamp.now();

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: subdomain === 'admin' ? "admin" : "student",
          createdAt: timestamp,
        });

        await signInWithEmailAndPassword(auth, email, password);

        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: subdomain === 'admin' ? "admin" : "student"
        });

        localStorage.setItem('university', subdomain);

        if (subdomain === 'admin') {
          navigate('/dashboard/admin');
        } else {
          const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
          navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: `2px 2px 12px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`, backgroundColor: theme.palette.background.paper }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem', color: theme.palette.text.primary }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem', color: theme.palette.text.primary }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                padding: 1.5,
                borderRadius: 5,
                width: '50%',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button, // hover color
                }
              }}
              disabled={isLoading}
            >
              Get Started
            </Button>
            {isLoading && (
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
            )}
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1, color: theme.palette.text.primary }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.main,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.palette.error.dark // hover color for sign-in button
              }
            }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.success.light,
              color: theme.palette.success.main,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.palette.success.dark // hover color for create account button
              }
            }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}









/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import config from '../config';

const isEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i, /^.+@my-lucy\.com$/i],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  usyd: [/^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i] // Only allow @my-lucy.com for admin
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia',
    admin: 'Admin'
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const timestamp = Timestamp.now();

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: subdomain === 'admin' ? "admin" : "student",
          createdAt: timestamp,
        });

        await signInWithEmailAndPassword(auth, email, password);

        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: subdomain === 'admin' ? "admin" : "student"
        });

        localStorage.setItem('university', subdomain);

        if (subdomain === 'admin') {
          navigate('/dashboard/admin');
        } else {
          const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
          navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: `2px 2px 12px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`, backgroundColor: theme.palette.background.paper }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem', color: theme.palette.text.primary }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem', color: theme.palette.text.primary }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%', backgroundColor: theme.palette.button_sign_in, color: theme.palette.button_text_sign_in }}
              disabled={isLoading}
            >
              Get Started
            </Button>
            {isLoading && (
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
            )}
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1, color: theme.palette.text.primary }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: theme.palette.error.light, color: theme.palette.error.main, textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: theme.palette.success.light, color: theme.palette.success.main, textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/

/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i, /^.+@my-lucy\.com$/i],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  usyd: [/^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i] // Only allow @my-lucy.com for admin
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia',
    admin: 'Admin'
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const timestamp = Timestamp.now();

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: subdomain === 'admin' ? "admin" : "student",
          createdAt: timestamp,
        });

        await signInWithEmailAndPassword(auth, email, password);

        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: subdomain === 'admin' ? "admin" : "student"
        });

        localStorage.setItem('university', subdomain);

        if (subdomain === 'admin') {
          navigate('/dashboard/admin');
        } else {
          const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
          navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading}
            >
              Get Started
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.contrastText',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/


/*import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

//const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i, /^.+@my-lucy\.com$/i],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  usyd: [/^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i] // Only allow @my-lucy.com for admin
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia',
    admin: 'Admin'
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    // Validation logic
    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Capture the Firebase Timestamp when the user creates the account
        const timestamp = Timestamp.now();

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: subdomain === 'admin' ? "admin" : "student",
          createdAt: timestamp // Adding the timestamp for user creation
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: subdomain === 'admin' ? "admin" : "student"
        });

        localStorage.setItem('university', subdomain);

        // Navigate based on subdomain
        if (subdomain === 'admin') {
          navigate('/dashboard/admin');
        } else {
          const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
          navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false); // Stop loading on error
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Get Started
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.contrastText',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

*/


/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  mit: [
    /^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  lasell: [
    /^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  oakland: [
    /^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  arizona: [
    /^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  uci: [
    /^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  ucidavis: [
    /^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  cornell: [
    /^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [
    /^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  stanford: [
    /^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeley: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  miami: [
    /^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  usyd: [
    /^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  columbia: [
    /^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    // Map subdomains to university names here
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User created:", user);

        // Capture the timestamp at which the user creates the account
        const timestamp = new Date().toISOString();

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "student",
          createdAt: timestamp // Adding the timestamp for user creation
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false); // Stop loading on error
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Get Started
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.contrastText',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/




/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';
import { brown } from '@mui/material/colors';
import { Timestamp } from 'firebase/firestore';

//const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  mit: [
    /^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  lasell: [
    /^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  oakland: [
    /^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  arizona: [
    /^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  uci: [
    /^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  ucidavis: [
    /^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  cornell: [
    /^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [
    /^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  stanford: [
    /^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeley: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  miami: [
    /^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  usyd: [
    /^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  columbia: [
    /^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia'



    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        console.log("User created:", user);

        // Capture the timestamp at which the user creates the account
        //const timestamp = new Date().toISOString();
        // Capture the Firebase Timestamp when the user creates the account
        const timestamp = Timestamp.now();

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "student",
          timestamp: timestamp // Adding the timestamp for user creation
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);
      

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        setIsLoading(false); // Stop loading on error
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Get Started
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.contrastText',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/




/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        console.log("User created:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "student"
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  /*
  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        console.log("Google sign up successful:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          university: theme.university,
          role: "student"
        });

        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid } });
        window.location.reload();
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Google sign up error:", errorCode, errorMessage, email, credential);
      });
  };
  

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Get Started
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/*
            <Button
              onClick={handleGoogleSignUp}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/











/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const subdomain = config.subdomain;

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, subdomain)) {
      newErrors.email = getErrorMessage(subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        console.log("User created:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "student"
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        console.log("Google sign up successful:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          university: theme.university,
          role: "student"
        });

        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: "student"
        });

        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid } });
        window.location.reload();
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Google sign up error:", errorCode, errorMessage, email, credential);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Get Started
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or sign up with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignUp}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/









/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [open, setOpen] = React.useState(false);

  const courseId = location.pathname.split('/sign-up/')[1] || '';

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        console.log("User created:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "student" // Ajout du champ role avec la valeur "student"
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "student" // Ajout du champ role avec la valeur "student"
        });

        const subdomain = config.subdomain;
        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        console.log("Google sign up successful:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          university: theme.university,
          role: "student" // Ajout du champ role avec la valeur "student"
        });

        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: "student"
        });

        const subdomain = config.subdomain;
        localStorage.setItem('university', subdomain);

        const onboardingUrl = `/onboarding/learningStyleSurvey/${courseId ? courseId : ''}`;
        navigate(onboardingUrl, { state: { uid: user.uid } });
        window.location.reload();
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Google sign up error:", errorCode, errorMessage, email, credential);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary" // Couleur provenant du thème
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Get Started
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or sign up with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignUp}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/






/*
import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [open, setOpen] = React.useState(false);

  
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };
  

  const courseId = location.pathname.split('/sign-up/')[1] || '';

  React.useEffect(() => {
    if (courseId) {
      setOpen(true);
    }
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in/${courseId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } 
    else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } 
    else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        console.log("User created:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university // Ajout du champ university
        });

        console.log("Authenticating user with email:", email);
        await signInWithEmailAndPassword(auth, email, password);

        console.log("User authenticated:", user);
        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email
        });

        // Store the subdomain in localStorage
        //const subdomain = getSubdomain();
        const subdomain = config.subdomain
        localStorage.setItem('university', subdomain);

        const onboardingUrl = courseId ? `/onboarding/learningStyleSurvey/${courseId}` : '/onboarding/choose-role';
        navigate(onboardingUrl, { state: { uid: user.uid, firstName: firstName } });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          newErrors.email = 'Email address already in use!';
        }
        setErrors(newErrors);
        console.error("Error creating user or signing in:", error.code, error.message);
      }
    }
  }

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        console.log("Google sign up successful:", user);

        console.log("Saving user to Firestore:", user.uid);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          university: theme.university // Ajout du champ university
        });

        console.log("Logging in user:", user.uid);
        login({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: "student" // student par défaut
        });

        // Store the subdomain in localStorage
        //const subdomain = getSubdomain();
        const subdomain = config.subdomain
        localStorage.setItem('university', subdomain);

        const onboardingUrl = courseId ? `/onboarding/learningStyleSurvey/${courseId}` : '/onboarding/choose-role';
        navigate(onboardingUrl, { state: { uid: user.uid } });
        window.location.reload();
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Google sign up error:", errorCode, errorMessage, email, credential);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Create an Account
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                Let's get started by filling out the form below.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName}
                autoFocus
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName}
                autoComplete="family-name"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary" // Couleur provenant du thème
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Get Started
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or sign up with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignUp}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        PaperProps={{ style: { borderRadius: 12, padding: '20px', top: '-5vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Already have an account?</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            If you already have an account, sign in to add your new course, otherwise create an account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingBottom: 2, paddingRight: 2, paddingLeft: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleSignIn}
            variant="contained"
            sx={{ backgroundColor: '#FCE2E1', color: '#F04261', textTransform: 'none', borderRadius: '8px' }}
          >
            Sign-in
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ backgroundColor: '#DDFCE5', color: '#43AE58', textTransform: 'none', borderRadius: '8px' }}
          >
            Create an account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
*/

