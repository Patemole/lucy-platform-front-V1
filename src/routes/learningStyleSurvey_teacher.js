//Récupération de pinecone_index_name et stockage dans le localStorage pour le récupérer plus tard sans aller chercher dans la base de donnée

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
import { doc, updateDoc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';

const getMenuItemsForUniversity = (university) => {
  switch (university) {
    case 'usyd':
      return [
        { value: 'Faculty of Arts and Social Sciences', label: 'Faculty of Arts and Social Sciences' },
        { value: 'Faculty of Engineering', label: 'Faculty of Engineering' },
        { value: 'Faculty of Medicine and Health', label: 'Faculty of Medicine and Health' },
        { value: 'Faculty of Science', label: 'Faculty of Science' },
        { value: 'School of Architecture, Design and Planning', label: 'School of Architecture, Design and Planning' },
        { value: 'University of Sydney Business School', label: 'University of Sydney Business School' },
        { value: 'Sydney Law School', label: 'Sydney Law School' }
      ];
    case 'harvard':
      return [
        { value: 'Faculty of Arts and Sciences', label: 'Faculty of Arts and Sciences' },
        { value: 'School of Engineering and Applied Sciences', label: 'School of Engineering and Applied Sciences' },
        { value: 'Harvard Medical School', label: 'Harvard Medical School' },
        { value: 'Harvard Law School', label: 'Harvard Law School' },
        { value: 'Harvard Business School', label: 'Harvard Business School' }
      ];
    case 'upenn':
      return [
        { value: 'College of Arts and Sciences', label: 'College of Arts and Sciences' },
        { value: 'School of Engineering and Applied Science', label: 'School of Engineering and Applied Science' },
        { value: 'Perelman School of Medicine', label: 'Perelman School of Medicine' },
        { value: 'Wharton School', label: 'Wharton School' },
        { value: 'Penn Law', label: 'Penn Law' }
      ];
    default:
      return [];
  }
};

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const sanitizeIndexName = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 45);
};

export default function LearningStyleSurveyTeacher() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { uid } = useParams();
  const theme = useTheme();
  const [courseName, setCourseName] = useState('');
  const location = useLocation();
  const [courseCode, setCourseCode] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [errors, setErrors] = useState({});

  const handleCourseNameChange = (event) => {
    setCourseName(event.target.value);
  };

  const handleCourseCodeChange = (event) => {
    setCourseCode(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!courseName) {
      newErrors.courseName = 'Course name is required';
    }

    if (!courseCode) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const courseId = uuidv4();
        const pinecone_course_id = generateRandomString(6);
        const pinecone_index_name = sanitizeIndexName(`${courseCode}-${courseName}-${pinecone_course_id}`);
        
        const courseData = {
          course_id: courseId,
          name: courseName,
          code: courseCode,
          faculty: learnerType,
          timestamp: new Date(),
          'pinecone-index': pinecone_index_name
        };

        // Ajouter le cours à la collection "courses"
        await setDoc(doc(db, "courses", courseId), courseData);

        // Mettre à jour l'utilisateur pour ajouter le course_id à la liste de cours
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          courses: arrayUnion(courseId)
        });

        // Créer l'index Pinecone via un endpoint
        const response = await fetch('http://localhost:8005/file/api/create-pinecone-index', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pinecone_index_name })
        });

        if (response.ok) {
          // Enregistrer pinecone_index_name dans localStorage
          localStorage.setItem('pinecone_index_name', pinecone_index_name);

          const userSnap = await getDoc(userRef);
          login({
            id: location.state.uid,
            name: userSnap.data().name,
            email: userSnap.data().email,
            role: userSnap.data().role
          });

          navigate(`/dashboard/teacher/${location.state.uid}/${courseId}`);
        } else {
          const errorData = await response.json();
          console.error("Error creating Pinecone index:", errorData);
        }

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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Create your first course</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To get started, create a first course you teach</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '1vh' }}>
                
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is the course code?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="course-code"
                    label="Course Code"
                    variant="outlined"
                    fullWidth
                    value={courseCode}
                    onChange={handleCourseCodeChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px', 
                        '& fieldset': { borderColor: theme.palette.primary.main } 
                      }, 
                      '& label': { fontWeight: '500', fontSize: '0.875rem' }, 
                      '& input': { fontWeight: '500', fontSize: '0.875rem' } 
                    }}
                    error={!!errors.courseCode}
                    helperText={errors.courseCode}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is the course name?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="course-name"
                    label="Course Name"
                    variant="outlined"
                    fullWidth
                    value={courseName}
                    onChange={handleCourseNameChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px', 
                        '& fieldset': { borderColor: theme.palette.primary.main } 
                      }, 
                      '& label': { fontWeight: '500', fontSize: '0.875rem' }, 
                      '& input': { fontWeight: '500', fontSize: '0.875rem' } 
                    }}
                    error={!!errors.courseName}
                    helperText={errors.courseName}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>To which faculty is it attached?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiMenuItem-root': { fontWeight: '500', fontSize: '0.875rem' }, '& .MuiPopover-paper': { borderRadius: '15px' } }}>
                    <InputLabel id="learnerType" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Learner Type</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Learner Type"
                      error={!!errors.learnerType}
                      onChange={handleLearnerTypeChange}
                      sx={{ fontWeight: '500', fontSize: '0.875rem'}}
                    >
                      {getMenuItemsForUniversity(theme.university).map(item => (
                        <MenuItem style={{ fontWeight: '500', fontSize: '0.875rem', color: '#100F32', borderRadius: '15px',}} key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.learnerType}</FormHelperText>
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


