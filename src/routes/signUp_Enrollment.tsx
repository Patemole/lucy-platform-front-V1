import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Button, CssBaseline, TextField, Link, Grid, Box,
  Typography, Container, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import lucyLogo from '../logo_lucy.png';
import './signUp.css';
import config from '../config';
import { v4 as uuidv4 } from 'uuid';

const isEmail = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains: { [key: string]: RegExp[] } = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
};

const getAllowedDomains = (subdomain: string): RegExp[] => allowedDomains[subdomain] || [];

const isAllowedEmail = (email: string, subdomain: string): boolean => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain: string): string => {
  const universityNames: { [key: string]: string } = {
    upenn: 'Upenn',
    harvard: 'Harvard',
  };
  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} email address can register`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [open, setOpen] = useState(false);

  const subdomain = config.subdomain || '';

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = () => {
    navigate(`/auth/sign-in`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName') as string;
    const lastName = data.get('lastName') as string;
    const email = data.get('email') as string | null;
    const password = data.get('password') as string | null;
    const newErrors: { [key: string]: string } = {};

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
        if (!email || !password) return;

        console.log("Creating user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const chatId = uuidv4();
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          university: theme.university,
          role: "academic_advisor",
          courses: [academicAdvisorCourseId],
          chatsessions: [chatId]
        });

        await setDoc(doc(db, "chatsessions", chatId), {
          chat_id: chatId,
          name: "New chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp()
        });

        await signInWithEmailAndPassword(auth, email, password);

        login({
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: "academic_advisor"
        });

        localStorage.setItem('university', subdomain);
        localStorage.setItem('chat_id', chatId);
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('userID', user.uid);

        navigate(`/dashboard/enrollment/${user.uid}`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          const authError = error as any;
          if (authError.code === 'auth/email-already-in-use') {
            newErrors.email = 'Email address already in use!';
          }
          setErrors(newErrors);
          console.error("Error creating user or signing in:", authError.code, authError.message);
        }
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
            {/*
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or sign up with
            </Typography>
            */}
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
            */}
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-in`} variant="body2">
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
