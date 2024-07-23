/*
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
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
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
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs

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

        // Always add "academic_advisor_upenn_course_id" to the user's courses
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        let chatId = uuidv4(); // Generate a unique chat ID

        // Initialize an array to hold the courses to be added
        let coursesToAdd = [academicAdvisorCourseId];

        if (course_id) {  // If course_id is present
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id); // Add the current course_id to the list

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", chatId), {
              chat_id: chatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
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
        } else {  // If course_id is not present
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
          });

          // Add the chat session document to the chatsessions collection
          await setDoc(doc(db, "chatsessions", chatId), {
            chat_id: chatId,
            name: "New chat",
            created_at: serverTimestamp(),
            modified_at: serverTimestamp()
          });

          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        // Store course_id and chat_id in LocalStorage
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Navigate to the student dashboard
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Give us more informations</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your learning journey, we need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?</span>
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
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Science</MenuItem>
                      <MenuItem value={'Warthon'}>Warthon</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?</span>
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
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
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
*/

/*
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
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs
//import pennLogo from '../path_to_penn_logo.png'; // Assurez-vous d'utiliser le bon chemin d'accès à votre logo

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleMinorChange = (event) => {
    setMinor(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Graduation year is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (!major) {
      newErrors.major = 'Major is required';
    }

    if (!minor) {
      newErrors.minor = 'Minor is required';
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

        // Always add "academic_advisor_upenn_course_id" to the user's courses
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        let chatId = uuidv4(); // Generate a unique chat ID

        // Initialize an array to hold the courses to be added
        let coursesToAdd = [academicAdvisorCourseId];

        if (course_id) {  // If course_id is present
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id); // Add the current course_id to the list

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", chatId), {
              chat_id: chatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
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
        } else {  // If course_id is not present
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
          });

          // Add the chat session document to the chatsessions collection
          await setDoc(doc(db, "chatsessions", chatId), {
            chat_id: chatId,
            name: "New chat",
            created_at: serverTimestamp(),
            modified_at: serverTimestamp()
          });

          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        // Store course_id and chat_id in LocalStorage
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Navigate to the student dashboard
        navigate(`/dashboard/student/${location.state.uid}`);
      } catch (error) {
        console.error("Error:", error);
      }      
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.5)',
              minHeight: 'calc(100vh - 64px)', // Adjust based on your header/footer heights
              paddingTop: '10vh',
              paddingBottom: '10vh', // To ensure the button is visible
              boxSizing: 'border-box'
            }}
          >
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Give us more informations</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your learning journey, we need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?</span>
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
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Science</MenuItem>
                      <MenuItem value={'Warthon'}>Warthon</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?</span>
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
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.learnerType}</FormHelperText>
                  </FormControl>                      
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is your major? (if you declared it)</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="major-input"
                    value={major}
                    placeholder="Enter your major"
                    error={!!errors.major}
                    helperText={errors.major}
                    onChange={handleMajorChange}
                    sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is your minor?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="minor-input"
                    value={minor}
                    placeholder="Enter your minor"
                    error={!!errors.minor}
                    helperText={errors.minor}
                    onChange={handleMinorChange}
                    sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is the name of your academic advisor?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' } }}>
                    <InputLabel id="advisor">Academic Advisor</InputLabel>
                    <Select
                      labelId="advisor"
                      id="advisor-select"
                      value={advisor}
                      label="advisor"
                      onChange={handleAdvisorChange}
                    >
                      <MenuItem value={'Mathieu Perez'}>Mathieu Perez</MenuItem>
                      <MenuItem value={'Thomas Perez'}>Thomas Perez</MenuItem>
                      <MenuItem value={'Grégory Hissiger'}>Grégory Hissiger</MenuItem>
                      <MenuItem value={'Olivier Durand'}>Olivier Durand</MenuItem>
                      <MenuItem value={'Max la Menace'}>Max la Menace</MenuItem>
                    </Select>
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
              padding: theme.spacing(2),
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              boxSizing: 'border-box'
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
*/



/*
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
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import logo from '../logo_lucy.png';
//import pennLogo from '../assets/penn_logo.png'; // Assurez-vous d'utiliser le bon chemin d'accès à votre logo
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleMinorChange = (event) => {
    setMinor(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Graduation year is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (!major) {
      newErrors.major = 'Major is required';
    }

    if (!minor) {
      newErrors.minor = 'Minor is required';
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

        // Always add "academic_advisor_upenn_course_id" to the user's courses
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        let chatId = uuidv4(); // Generate a unique chat ID

        // Initialize an array to hold the courses to be added
        let coursesToAdd = [academicAdvisorCourseId];

        if (course_id) {  // If course_id is present
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id); // Add the current course_id to the list

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", chatId), {
              chat_id: chatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
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
        } else {  // If course_id is not present
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
          });

          // Add the chat session document to the chatsessions collection
          await setDoc(doc(db, "chatsessions", chatId), {
            chat_id: chatId,
            name: "New chat",
            created_at: serverTimestamp(),
            modified_at: serverTimestamp()
          });

          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        // Store course_id and chat_id in LocalStorage
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Navigate to the student dashboard
        navigate(`/dashboard/student/${location.state.uid}`);
      } catch (error) {
        console.error("Error:", error);
      }      
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
          <Box sx={{ padding: 2 }}>
            <img src={logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.1)',
              paddingTop: '10vh',
              paddingBottom: '10vh',
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>Give us more informations</Typography>
            <Typography variant="body1" sx={{ color: '#8692A6', marginBottom: '32px' }}>To begin your learning journey, we need a couple of informations</Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.year}>
                    <InputLabel id="year">Year</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="Year"
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Warthon</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.learnerType}>
                    <InputLabel id="learnerType">Learner Type</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Learner Type"
                      onChange={handleLearnerTypeChange}
                    >
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText>{errors.learnerType}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    id="major-input"
                    label="What is your major? (if you declared it)"
                    value={major}
                    placeholder="Enter your major"
                    error={!!errors.major}
                    helperText={errors.major}
                    onChange={handleMajorChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    id="minor-input"
                    label="What is your minor?"
                    value={minor}
                    placeholder="Enter your minor"
                    error={!!errors.minor}
                    helperText={errors.minor}
                    onChange={handleMinorChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="advisor">Academic Advisor</InputLabel>
                    <Select
                      labelId="advisor"
                      id="advisor-select"
                      value={advisor}
                      label="Academic Advisor"
                      onChange={handleAdvisorChange}
                    >
                      <MenuItem value={'Mathieu Perez'}>Mathieu Perez</MenuItem>
                      <MenuItem value={'Thomas Perez'}>Thomas Perez</MenuItem>
                      <MenuItem value={'Grégory Hissiger'}>Grégory Hissiger</MenuItem>
                      <MenuItem value={'Olivier Durand'}>Olivier Durand</MenuItem>
                      <MenuItem value={'Max la Menace'}>Max la Menace</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: '24px' }}>
                  <Button type="submit" variant="contained" fullWidth sx={{
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
              </Grid>
            </Box>
          </Box>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box'
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
*/




/*
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
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import logo from '../logo_lucy.png';
//import pennLogo from '../assets/penn_logo.png'; // Assurez-vous d'utiliser le bon chemin d'accès à votre logo
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleMinorChange = (event) => {
    setMinor(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Graduation year is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (!major) {
      newErrors.major = 'Major is required';
    }

    if (!minor) {
      newErrors.minor = 'Minor is required';
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

        // Always add "academic_advisor_upenn_course_id" to the user's courses
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        let chatId = uuidv4(); // Generate a unique chat ID

        // Initialize an array to hold the courses to be added
        let coursesToAdd = [academicAdvisorCourseId];

        if (course_id) {  // If course_id is present
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id); // Add the current course_id to the list

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", chatId), {
              chat_id: chatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
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
        } else {  // If course_id is not present
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
          });

          // Add the chat session document to the chatsessions collection
          await setDoc(doc(db, "chatsessions", chatId), {
            chat_id: chatId,
            name: "New chat",
            created_at: serverTimestamp(),
            modified_at: serverTimestamp()
          });

          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        // Store course_id and chat_id in LocalStorage
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Navigate to the student dashboard
        navigate(`/dashboard/student/${location.state.uid}`);
      } catch (error) {
        console.error("Error:", error);
      }      
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
          <Box sx={{ padding: 2 }}>
            <img src={logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '2px 2px 20px rgba(0, 0, 0, 0.1)',
              paddingTop: '10vh',
              paddingBottom: '10vh',
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>Give us more informations</Typography>
            <Typography variant="body1" sx={{ color: '#8692A6', marginBottom: '32px' }}>To begin your learning journey, we need a couple of informations</Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.year}>
                    <InputLabel id="year">Year</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="Year"
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Warthon</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.learnerType}>
                    <InputLabel id="learnerType">Learner Type</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Learner Type"
                      onChange={handleLearnerTypeChange}
                    >
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText>{errors.learnerType}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    id="major-input"
                    label="What is your major? (if you declared it)"
                    value={major}
                    placeholder="Enter your major"
                    error={!!errors.major}
                    helperText={errors.major}
                    onChange={handleMajorChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    id="minor-input"
                    label="What is your minor?"
                    value={minor}
                    placeholder="Enter your minor"
                    error={!!errors.minor}
                    helperText={errors.minor}
                    onChange={handleMinorChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="advisor">Academic Advisor</InputLabel>
                    <Select
                      labelId="advisor"
                      id="advisor-select"
                      value={advisor}
                      label="Academic Advisor"
                      onChange={handleAdvisorChange}
                    >
                      <MenuItem value={'Mathieu Perez'}>Mathieu Perez</MenuItem>
                      <MenuItem value={'Thomas Perez'}>Thomas Perez</MenuItem>
                      <MenuItem value={'Grégory Hissiger'}>Grégory Hissiger</MenuItem>
                      <MenuItem value={'Olivier Durand'}>Olivier Durand</MenuItem>
                      <MenuItem value={'Max la Menace'}>Max la Menace</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: '24px' }}>
                  <Button type="submit" variant="contained" fullWidth sx={{
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
              </Grid>
            </Box>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: theme.spacing(2),
                boxSizing: 'border-box',
                marginTop: '16px'
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
}
*/




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
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png'
// import pennLogo from '../assets/penn_logo.png'; // Assurez-vous d'utiliser le bon chemin d'accès à votre logo
import { v4 as uuidv4 } from 'uuid'; // Import for generating unique IDs

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleMinorChange = (event) => {
    setMinor(event.target.value);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setErrors({})

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Graduation year is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Learner type is required';
    }

    if (!major) {
      newErrors.major = 'Major is required';
    }

    if (!minor) {
      newErrors.minor = 'Minor is required';
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

        // Always add "academic_advisor_upenn_course_id" to the user's courses
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        let chatId = uuidv4(); // Generate a unique chat ID

        // Initialize an array to hold the courses to be added
        let coursesToAdd = [academicAdvisorCourseId];

        if (course_id) {  // If course_id is present
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id); // Add the current course_id to the list

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", chatId), {
              chat_id: chatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
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
        } else {  // If course_id is not present
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId) // Add the chat ID to the chatsessions array
          });

          // Add the chat session document to the chatsessions collection
          await setDoc(doc(db, "chatsessions", chatId), {
            chat_id: chatId,
            name: "New chat",
            created_at: serverTimestamp(),
            modified_at: serverTimestamp()
          });

          login({
            id: location.state.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }

        // Store course_id and chat_id in LocalStorage
        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Navigate to the student dashboard
        navigate(`/dashboard/student/${location.state.uid}`);
      } catch (error) {
        console.error("Error:", error);
      }      
    }
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Give us more informations</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your learning journey, we need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?</span>
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
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Warthon</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?</span>
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
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.learnerType}</FormHelperText>
                  </FormControl>                      
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is your major? (if you declared it)</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="major-input"
                    placeholder="Enter your major"
                    value={major}
                    error={!!errors.major}
                    helperText={errors.major}
                    onChange={handleMajorChange}
                    sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is your minor?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    id="minor-input"
                    placeholder="Enter your minor"
                    value={minor}
                    error={!!errors.minor}
                    helperText={errors.minor}
                    onChange={handleMinorChange}
                    sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What is the name of your academic advisor?</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' } }}>
                    <InputLabel id="advisor">Academic Advisor</InputLabel>
                    <Select
                      labelId="advisor"
                      id="advisor-select"
                      value={advisor}
                      label="advisor"
                      onChange={handleAdvisorChange}
                    >
                      <MenuItem value={'Mathieu Perez'}>Mathieu Perez</MenuItem>
                      <MenuItem value={'Thomas Perez'}>Thomas Perez</MenuItem>
                      <MenuItem value={'Grégory Hissiger'}>Grégory Hissiger</MenuItem>
                      <MenuItem value={'Olivier Durand'}>Olivier Durand</MenuItem>
                      <MenuItem value={'Max la Menace'}>Max la Menace</MenuItem>
                    </Select>
                  </FormControl>                      
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh' }}>
                  <Button type="submit" variant="contained" fullWidth sx={{
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
}



