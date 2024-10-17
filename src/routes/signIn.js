import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import config from '../config';

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
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  drexel: [/^.+@([a-zA-Z0-9._-]+\.)*drexel\.edu$/i, /^.+@my-lucy\.com$/i],
  temple: [/^.+@([a-zA-Z0-9._-]+\.)*temple\.edu$/i, /^.+@my-lucy\.com$/i],
  psu: [/^.+@([a-zA-Z0-9._-]+\.)*psu\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

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
    uci: 'UCI',
    ucdavis: 'UC Davis',
    cornell: 'Cornell',
    berkeleycollege: 'Berkeley College',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    drexel: 'Drexel',
    temple: 'Temple',
    psu: 'PennState',
    admin: 'Admin',
  };

  return `Only ${
    universityNames[subdomain] || 'email addresses from allowed domains'
  } can register`;
};

export default function SignIn({ handleToggleThemeMode }) {
  const { login, isAuth, loading } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirection automatique si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (!loading && isAuth) {
      console.log('SignIn: Utilisateur déjà authentifié, redirection...');
      // Récupérer les informations utilisateur depuis localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = storedUser.role;
      const uid = storedUser.id;
      const userName = storedUser.name;

      if (config.subdomain === 'admin') {
        navigate(`/dashboard/admin`, { state: { userName } });
      } else if (userRole === 'student') {
        navigate(`/dashboard/student/${uid}`, { state: { userName } });
      } else if (userRole === 'academic_advisor') {
        navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
      } else {
        // Redirection par défaut si le rôle n'est pas reconnu
        navigate('/dashboard');
      }
    }
  }, [isAuth, loading, navigate]);

  const checkLocalStorage = (
    user,
    role,
    name,
    firstCourseId,
    lastChatId,
    studentProfile,
    major,
    minor,
    year,
    faculty
  ) => {
    const subdomain = config.subdomain;
    console.log("SignIn: Stockage des données dans localStorage.");
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem(
      'user',
      JSON.stringify({ id: user.uid, name, email: user.email, role })
    );
    localStorage.setItem('course_id', firstCourseId || '');
    localStorage.setItem('chat_id', lastChatId || '');
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
    localStorage.setItem('major', JSON.stringify(major) || 'default_major');
    localStorage.setItem('minor', JSON.stringify(minor) || 'default_minor');
    localStorage.setItem('year', year || 'default_year');
    localStorage.setItem(
      'faculty',
      JSON.stringify(faculty) || 'default_faculty'
    );
  };

  const redirectBasedOnRole = (role, userName, uid) => {
    const subdomain = config.subdomain;
    console.log(`SignIn: Redirection basée sur le rôle ${role}.`);
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    } else {
      // Redirection par défaut si le rôle n'est pas reconnu
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("SignIn: Erreurs de validation détectées:", newErrors);
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("SignIn: Définition de la persistance de la session.");
      // Définir la persistance de la session avec Firebase
      await setPersistence(auth, browserLocalPersistence);

      console.log("SignIn: Tentative de connexion avec Firebase.");
      // Connexion avec email et mot de passe
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("SignIn: Connexion réussie:", user);

      // Récupérer les informations supplémentaires de l'utilisateur depuis Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("SignIn: Données utilisateur trouvées dans Firestore.");
        const userData = docSnap.data();
        const userRole = userData.role;
        const userName = userData.name;
        const firstCourseId = userData.courses ? userData.courses[0] : null;
        const lastChatId = userData.chatsessions ? userData.chatsessions.slice(-1)[0] : null;
        const studentProfile = userData.student_profile;
        const major = userData.major || ['default_major'];
        const minor = userData.minor || ['default_minor'];
        const year = userData.year || 'default_year';
        const faculty = userData.faculty || 'default_faculty';

        // Stocker les données additionnelles dans le localStorage
        checkLocalStorage(
          user,
          userRole,
          userName,
          firstCourseId,
          lastChatId,
          studentProfile,
          major,
          minor,
          year,
          faculty
        );

        // Mettre à jour le contexte d'authentification
        console.log("SignIn: Mise à jour du contexte d'authentification.");
        login({
          id: user.uid,
          name: userName,
          email: email,
          role: userRole,
        });

        // Rediriger l'utilisateur selon son rôle
        redirectBasedOnRole(userRole, userName, user.uid);
      } else {
        console.log("SignIn: Aucune donnée utilisateur trouvée dans Firestore.");
        setErrors({ email: 'No user data found' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("SignIn: Erreur lors de la connexion:", error);
      const newErrors = {};
      if (error.code === 'auth/user-not-found') {
        newErrors.email = 'No user found with this email';
      } else if (error.code === 'auth/wrong-password') {
        newErrors.password = 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        newErrors.email = 'Account access blocked! Try again later';
      } else {
        newErrors.email = 'Login failed';
      }
      setErrors(newErrors);
      setIsLoading(false);
    }
  };

  if (loading) {
    // Afficher un loader pendant que l'état d'authentification est vérifié
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img
          src={theme.logo}
          alt="University Logo"
          style={{ height: 50, width: 'auto' }}
        />

        <IconButton
          onClick={handleToggleThemeMode}
          sx={{ color: theme.palette.sidebar }}
        >
          {theme.palette.mode === 'dark' ? (
            <LightModeIcon />
          ) : (
            <DarkModeIcon />
          )}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: `2px 2px 12px ${
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.2)'
                : 'rgba(255, 255, 255, 0.2)'
            }`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  color: theme.palette.text.primary,
                }}
              >
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: theme.palette.text.primary,
                }}
              >
                For the purpose of industry regulation, your details are required.
              </Typography>
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
                InputProps={{
                  sx: {
                    borderRadius: 6,
                    color: theme.palette.text.primary,
                  },
                }}
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
                InputProps={{
                  sx: {
                    borderRadius: 6,
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
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
                  backgroundColor: theme.palette.hover_button,
                },
              }}
              disabled={isLoading}
            >
              Sign In
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
              <Link
                href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`}
                variant="body2"
                sx={{ color: theme.palette.sign_up_link }}
              >
                Don't have an account yet? Create one now!
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
        <Typography
          variant="body2"
          sx={{ mr: 1, color: theme.palette.text.primary }}
        >
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

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
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid);
            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.sidebar }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: `2px 2px 12px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem', color: theme.palette.text.primary }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: '800', fontSize: '1rem', color: theme.palette.text.primary }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
                InputProps={{ sx: { borderRadius: 6, color: theme.palette.text.primary } }}
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
                InputProps={{ sx: { borderRadius: 6, color: theme.palette.text.primary } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
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
                  backgroundColor: theme.palette.button_sign_in_hover,
                },
              }}
              disabled={isLoading}
            >
              Sign In
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
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Don't have an account yet? Create one now!
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
    </Container>
  );
}
*/




/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

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
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
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
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.sidebar }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
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
                  backgroundColor: theme.palette.button_sign_in_hover,
                },
              }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Don't have an account yet? Create one now!
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
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

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
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {  // Added prop
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
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
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.primary.main }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

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
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
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
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleDarkModeToggle} sx={{ color: theme.palette.primary.main }}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/


/*
// signIn.tsx
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import { v4 as uuidv4 } from 'uuid';
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
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
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
    admin: 'Admin',
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile'),
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });

    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, 'courses', firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName },
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName },
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName },
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName },
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName },
      });
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions
              ? docSnap.data().chatsessions.slice(-1)[0]
              : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId),
              });

              await setDoc(doc(db, 'chatsessions', newChatId), {
                chat_id: newChatId,
                name: 'New chat',
                created_at: serverTimestamp(),
                modified_at: serverTimestamp(),
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile'),
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole,
            });
          } else {
            console.log('No such document!');
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
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
          justifyContent: 'space-between',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton
          onClick={handleDarkModeToggle}
          sx={{ color: theme.palette.primary.main }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: darkMode
              ? theme.palette.background.paper
              : theme.palette.background.default,
            color: darkMode
              ? theme.palette.text.primary
              : theme.palette.text.primary,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are
                required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed *
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
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
  admin: [
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
    admin: 'Admin',
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });

    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed *
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
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
  admin: [
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

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed 
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
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

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
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

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  /*
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/*
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
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

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  /*
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
             
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/*
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/





/*
//DERNIERE MISE À JOUR AVEC LE DERNIER CHAT_ID ET LE PREMIER COURSE_ID (ACADEMIC ADVISOR) - À MODIFIER LORSQU'ON PRENDRA EN COMPTE LA MODIFICATION DES MESSAGES ET LE LIEN ENTRE LE CHAT_ID ET LE COURSE_ID
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, lastCourseId, lastChatId) => {
    const subdomain = config.subdomain
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/







/* Problème avec le chat_id et le course_id
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  /*
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };
  
  
  

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, lastCourseId, lastChatId) => {
    //const subdomain = getSubdomain();
    const subdomain = config.subdomain
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    //const subdomain = getSubdomain();
    const subdomain = config.subdomain
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }







  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/











//Ancien code qui marche - dans le code du dessus, on va ajouter l'enregistrement de l'université dans le localStorage lorsqu'on est connecté
/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, university, lastCourseId, lastChatId) => {
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = getSubdomain();
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
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
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
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
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
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
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
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
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
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
          mt: 5,
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
    </Container>
  );
}
*/
