// code qui fonctionne - avec popup
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
