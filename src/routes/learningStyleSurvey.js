import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import logo from '../logo_lucy.png';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleLearningStyleChange = (event) => {
    setLearningStyle(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Graduation year is required';
    }

    if (!learningStyle) {
      newErrors.learningStyle = 'Learning style is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student"
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (course_id) {
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            await updateDoc(userRef, {
              courses: arrayUnion(course_id)
            });

            login({
              id: location.state.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              courseName: courseData.name,
              courseCode: courseData.code,
              faculty: courseData.faculty
            });
          } else {
            console.log('No such course document!');
          }
        } else {
          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        navigate(`/dashboard/student/${location.state.uid}`);
      } catch (error) {
        console.error("Error:", error);
      }      
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
              justifyContent: 'space-between'
            }}
          >
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8692A6', mr: 1 }}>Already have an account?</Typography>
              <Link href="/sign-in/student" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Sign in
              </Link>
            </Box>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.5)',
              height: '100vh',
              paddingTop: '16vh'
            }}
          >
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell us who you are</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your learning journey, tell us what type of student you are</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What year are you in?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' } }}>
                    <InputLabel id="year">Year</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="year"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'freshman'}>Freshman</MenuItem>
                      <MenuItem value={'sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'junior'}>Junior</MenuItem>
                      <MenuItem value={'senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What type of learner are you?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' } }}>
                    <InputLabel id="learnerType">Learner Type</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="learnerType"
                      error={!!errors.learnerType}
                      helperText={errors.learnerType}
                      onChange={handleLearnerTypeChange}
                    >
                      <MenuItem value={'visual'}>Visual Learner</MenuItem>
                      <MenuItem value={'auditory'}>Auditory Learner</MenuItem>
                      <MenuItem value={'kinesthetic'}>Kinesthetic Learner</MenuItem>
                      <MenuItem value={'writing'}>Writing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.learnerType}</FormHelperText>
                  </FormControl>                      
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>Which learning style suits you best?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' } }}>
                    <InputLabel id="learningStyle">Learning Style</InputLabel>
                    <Select
                      labelId="learningStyle"
                      id="learningStyle-select"
                      value={learningStyle}
                      label="learningStyle"
                      error={!!errors.learningStyle}
                      onChange={handleLearningStyleChange}
                    >
                      <MenuItem value={'practical'}>Practical</MenuItem>
                      <MenuItem value={'theoretical'}>Theoretical</MenuItem>
                      <MenuItem value={'reflective'}>Reflective</MenuItem>
                      <MenuItem value={'innovative'}>Innovative</MenuItem>
                      <MenuItem value={'social'}>Social</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.learningStyle}</FormHelperText>
                  </FormControl>                      
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh' }}>
                  <Button onClick={handleSubmit} variant="contained" fullWidth sx=
                  {{ 
                    backgroundColor: theme.palette.primary.main, 
                    color: 'white', 
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                    '&:active': { backgroundColor: theme.palette.primary.dark }, 
                    paddingTop: 2, 
                    paddingBottom: 2, 
                    borderRadius: '12px' 
                  }}>
                    Let's Learn
                  </Button>
                </Grid>
                <Grid item xs={4}></Grid>
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
