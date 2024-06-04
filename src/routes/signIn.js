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
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';

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

  const checkLocalStorage = (user, role, name, university) => {
    if (localStorage.getItem('isAuth') && localStorage.getItem('user')) {
      redirectBasedOnRole(role, name, user.uid, university);
    } else {
      console.warn("User not authenticated in localStorage");
    }
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = getSubdomain();
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id && role === 'teacher') {
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

          navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
            state: { userName }
          });
          return;
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
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

            if (course_id && userRole === 'student') {
              await updateDoc(docRef, {
                courses: arrayUnion(course_id)
              });
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });

            checkLocalStorage(user, userRole, userName, university);
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
        const userRole = docSnap.data().role;
        const userName = user.displayName;
        const university = docSnap.data().university;

        if (course_id && userRole === 'student') {
          await updateDoc(docRef, {
            courses: arrayUnion(course_id)
          });
        }

        login({
          id: user.uid,
          name: userName,
          email: user.email,
          role: userRole
        });

        checkLocalStorage(user, userRole, userName, university);
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
