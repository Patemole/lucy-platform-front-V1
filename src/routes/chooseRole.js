//Amélioration avec ajouts sur le hoover des containers : 

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';
import logo from '../logo_lucy.png';
import './chooseRole.css';

const OriginalSVG = (color) => (
  <svg width="50" height="45" viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.46476 17.6851L25 1.4912L48.5352 17.6851L39.5683 43.8212H10.4317L1.46476 17.6851Z" stroke={color} strokeWidth="2"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M18.7204 27.6343C19.5018 26.8943 20.5616 26.4785 21.6667 26.4785H28.3333C29.4384 26.4785 30.4982 26.8943 31.2796 27.6343C32.061 28.3743 32.5 29.378 32.5 30.4245V32.003C32.5 32.4388 32.1269 32.7922 31.6667 32.7922C31.2064 32.7922 30.8333 32.4388 30.8333 32.003V30.4245C30.8333 29.7966 30.5699 29.1944 30.1011 28.7504C29.6323 28.3064 28.9964 28.0569 28.3333 28.0569H21.6667C21.0036 28.0569 20.3677 28.3064 19.8989 28.7504C19.4301 29.1944 19.1667 29.7966 19.1667 30.4245V32.003C19.1667 32.4388 18.7936 32.7922 18.3333 32.7922C17.8731 32.7922 17.5 32.4388 17.5 32.003V30.4245C17.5 29.378 17.939 28.3743 18.7204 27.6343Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.9997 18.5862C23.619 18.5862 22.4997 19.6462 22.4997 20.9538C22.4997 22.2614 23.619 23.3215 24.9997 23.3215C26.3804 23.3215 27.4997 22.2614 27.4997 20.9538C27.4997 19.6462 26.3804 18.5862 24.9997 18.5862ZM20.833 20.9538C20.833 18.7745 22.6985 17.0078 24.9997 17.0078C27.3009 17.0078 29.1663 18.7745 29.1663 20.9538C29.1663 23.1332 27.3009 24.8999 24.9997 24.8999C22.6985 24.8999 20.833 23.1332 20.833 20.9538Z" fill={color}/>
  </svg>
);

const ChangedSVG = (color) => (
  <svg width="50" height="45" viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 0.0761719L49.7275 17.0904L40.2824 44.62H9.71758L0.272532 17.0904L25 0.0761719Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M18.7204 27.4331C19.5018 26.6931 20.5616 26.2773 21.6667 26.2773H28.3333C29.4384 26.2773 30.4982 26.6931 31.2796 27.4331C32.061 28.1731 32.5 29.1768 32.5 30.2234V31.8018C32.5 32.2377 32.1269 32.591 31.6667 32.591C31.2064 32.591 30.8333 32.2377 30.8333 31.8018V30.2234C30.8333 29.5954 30.5699 28.9932 30.1011 28.5492C29.6323 28.1052 28.9964 27.8558 28.3333 27.8558H21.6667C21.0036 27.8558 20.3677 28.1052 19.8989 28.5492C19.4301 28.9932 19.1667 29.5954 19.1667 30.2234V31.8018C19.1667 32.2377 18.7936 32.591 18.3333 32.591C17.8731 32.591 17.5 32.2377 17.5 31.8018V30.2234C17.5 29.1768 17.939 28.1731 18.7204 27.4331Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.9997 18.3851C23.619 18.3851 22.4997 19.4451 22.4997 20.7527C22.4997 22.0603 23.619 23.1203 24.9997 23.1203C26.3804 23.1203 27.4997 22.0603 27.4997 20.7527C27.4997 19.4451 26.3804 18.3851 24.9997 18.3851ZM20.833 20.7527C20.833 18.5733 22.6985 16.8066 24.9997 16.8066C27.3009 16.8066 29.1663 18.5733 29.1663 20.7527C29.1663 22.932 27.3009 24.6987 24.9997 24.6987C22.6985 24.6987 20.833 22.932 20.833 20.7527Z" fill="white"/>
  </svg>
);

export default function ChooseRole() {
  const [studentClicked, setStudentClicked] = useState(false);
  const [teacherClicked, setTeacherClicked] = useState(false);
  const location = useLocation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleTeacherClick = async () => {
    setTeacherClicked(!teacherClicked);
    setStudentClicked(false);
  };

  const handleStudentClick = async () => {
    setStudentClicked(!studentClicked);
    setTeacherClicked(false);
  };

  const handleSubmit = async () => {
    if (teacherClicked) {
      const docRef = doc(db, "users", location.state.uid);
      await updateDoc(docRef, {
        role: "teacher"
      });
      const docSnap = await getDoc(docRef);
      login({
        id: location.state.uid,
        name: docSnap.data().name,
        email: docSnap.data().email,
        role: docSnap.data().role
      });
      navigate('/onboarding/course-creation', {
        state: { userName: docSnap.data().name, uid: location.state.uid}

      });
    } else {
      navigate('/onboarding/learningStyleSurvey', { state: { uid: location.state.uid } });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container>
        <Grid item xs={4}></Grid>
        <Grid item xs={8}>
          
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.5)',
              height: '100vh',
            }}
          >
            <Grid container justifyContent="right" sx={{ p: 10 }}>
              <Grid item>
                <span style={{ color: '#8692A6' }}>Already have an account? </span>
                <Link href="/sign-in/student" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Grid>
            </Grid>
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Welcome {location.state.firstName}</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin this journey, tell us what kind of account you'd be opening</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <Box
                  onClick={handleStudentClick}
                  sx={{
                    outline: studentClicked ? `2px solid ${theme.palette.primary.main}` : 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
                    width: '25vw',
                    padding: 3,
                    borderRadius: 3,
                    marginTop: 3,
                    '&:hover': {
                      outline: `2px solid ${theme.palette.primary.main}`
                      //backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    }
                  }}
                  className="rolebox"
                >
                  {studentClicked ? ChangedSVG(theme.palette.primary.main) : OriginalSVG(theme.palette.primary.main)}
                  <span style={{ fontSize: '20px', marginLeft: '1vw' }}>Student</span>
                </Box>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <Box
                  onClick={handleTeacherClick}
                  sx={{
                    outline: teacherClicked ? `2px solid ${theme.palette.primary.main}` : 'none',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
                    width: '25vw',
                    padding: 3,
                    borderRadius: 3,
                    marginTop: 3,
                    '&:hover': {
                      outline: `2px solid ${theme.palette.primary.main}`
                      //backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    }
                  }}
                  className="rolebox"
                >
                  {teacherClicked ? ChangedSVG(theme.palette.primary.main) : OriginalSVG(theme.palette.primary.main)}
                  <span style={{ fontSize: '20px', marginLeft: '1vw' }}>Teacher</span>
                </Box>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ marginTop: '1.5vh' }}>
                {(teacherClicked || studentClicked) && (
                  <Link onClick={handleSubmit} sx={{ color: theme.palette.primary.main, textDecoration: 'none', fontSize: '18px', cursor: 'pointer' }}>
                    Continue
                  </Link>
                )}
              </Grid>
            </Grid>
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
              src={logo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}



