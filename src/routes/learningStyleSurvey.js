import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState(['']);
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleYearChange = (index, event) => {
    const newYears = year.slice();
    newYears[index] = event.target.value;
    setYear(newYears);
  };

  const addYearField = () => {
    setYear([...year, '']);
  };

  const removeYearField = (index) => {
    const newYears = year.slice();
    newYears.splice(index, 1);
    setYear(newYears);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    if (year.some(y => !y)) {
      newErrors.year = 'School is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG";
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF";
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5";
        const courseSectionCourseId = "moRgToBTOAJZdMQPs7Ci";

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId, courseSectionCourseId];

        if (course_id) {
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
          }
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left section */}
        <Grid item xs={0} sm={4} sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>

        {/* Right section */}
        <Grid item xs={12} sm={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: theme.palette.background.default }}>
          <Box
            sx={{
              width: '100%',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: { xs: '5vh', sm: '10vh' },
              paddingBottom: '10vh',
              boxSizing: 'border-box',
              paddingLeft: { xs: '16px', sm: '16px' },
              paddingRight: { xs: '16px', sm: '16px' }
            }}
          >
            {/* Logo and Heading on mobile */}
            <Box sx={{ width: '100%', display: { xs: 'flex', sm: 'none' }, alignItems: 'center', marginBottom: '2vh' }}>
              <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
            </Box>

            {/* Headings */}
            <Box sx={{ width: '100%', marginBottom: '2vh', maxWidth: 600, marginLeft: { xs: 0, sm: 'auto' }, marginRight: { xs: 0, sm: 'auto' } }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Tell me more about you
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                To begin your journey, I need a couple of informations
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', boxSizing: 'border-box' }}>
              <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
                {/* What is your school? */}
                <Box sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your school? (you can add more)*</Typography>
                  <IconButton onClick={addYearField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {year.length > 1 && (
                    <IconButton onClick={() => removeYearField(year.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                {year.map((y, index) => (
                  <FormControl key={index} required sx={{ width: '100%', marginTop: '1vh', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id={`year-${index}`}>School</InputLabel>
                    <Select
                      labelId={`year-${index}`}
                      id={`year-select-${index}`}
                      value={y}
                      label="School"
                      error={!!errors.year}
                      onChange={(e) => handleYearChange(index, e)}
                    >
                      {theme.facultyOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    {index === 0 && <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.year}</FormHelperText>}
                  </FormControl>
                ))}

                {/* What year are you? */}
                <Box sx={{ marginTop: '4vh' }}>
                  <Typography>What year are you?*</Typography>
                </Box>
                <FormControl required sx={{ width: '100%', marginTop: '1vh', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                  <InputLabel id="learnerType">Year</InputLabel>
                  <Select
                    labelId="learnerType"
                    id="learnerType-select"
                    value={learnerType}
                    label="Year"
                    error={!!errors.learnerType}
                    helperText={errors.learnerType}
                    onChange={handleLearnerTypeChange}
                  >
                    <MenuItem value={'Freshman'}>Freshman</MenuItem>
                    <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                    <MenuItem value={'Junior'}>Junior</MenuItem>
                    <MenuItem value={'Senior'}>Senior</MenuItem>
                    <MenuItem value={'Senior'}>Grad 1</MenuItem>
                    <MenuItem value={'Senior'}>Grad 2</MenuItem>
                  </Select>
                  <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.learnerType}</FormHelperText>
                </FormControl>

                {/* Academic Advisor */}
                <Box sx={{ marginTop: '4vh' }}>
                  <Typography>Give us the name of your Academic Advisor if you know</Typography>
                </Box>
                <TextField
                  required
                  id="advisor-input"
                  placeholder="Enter your academic advisor"
                  value={advisor}
                  error={!!errors.advisor}
                  helperText={errors.advisor}
                  onChange={handleAdvisorChange}
                  sx={{
                    width: '100%',
                    marginTop: '1vh',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: theme.palette.sign_up_link
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.sign_up_link
                      },
                      '&::placeholder': {
                        color: theme.palette.text.primary,
                      },
                      color: theme.palette.text.primary
                    }
                  }}
                />

                {/* Major */}
                <Box sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your major? (if you declared it)</Typography>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                {major.map((m, index) => (
                  <TextField
                    key={index}
                    id={`major-input-${index}`}
                    placeholder="Enter your major"
                    value={m}
                    error={!!errors.major}
                    helperText={errors.major}
                    onChange={(e) => handleMajorChange(index, e)}
                    sx={{
                      width: '100%',
                      marginTop: '1vh',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                ))}

                {/* Minor */}
                <Box sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your minor? (you can add more)</Typography>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                {minor.map((m, index) => (
                  <TextField
                    key={index}
                    id={`minor-input-${index}`}
                    placeholder="Enter your minor"
                    value={m}
                    error={!!errors.minor}
                    helperText={errors.minor}
                    onChange={(e) => handleMinorChange(index, e)}
                    sx={{
                      width: '100%',
                      marginTop: '1vh',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                ))}

                {/* Submit button */}
                <Box sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      padding: 1.5,
                      borderRadius: 5,
                      width: '100%',
                      backgroundColor: theme.palette.button_sign_in,
                      color: theme.palette.button_text_sign_in,
                      '&:hover': {
                        backgroundColor: theme.palette.hover_button // Hover effect
                      }
                    }}
                    disabled={isLoading}
                  >
                    Create your profile
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
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: theme.spacing(2),
              boxSizing: 'border-box',
              position: { xs: 'fixed', sm: 'static' },
              bottom: { xs: 0, sm: 'auto' },
              right: { xs: 0, sm: 'auto' },
              backgroundColor: { xs: theme.palette.background.default, sm: 'transparent' }
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



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState(['']);
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleYearChange = (index, event) => {
    const newYears = year.slice();
    newYears[index] = event.target.value;
    setYear(newYears);
  };

  const addYearField = () => {
    setYear([...year, '']);
  };

  const removeYearField = (index) => {
    const newYears = year.slice();
    newYears.splice(index, 1);
    setYear(newYears);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    if (year.some(y => !y)) {
      newErrors.year = 'School is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    /*if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }
    *

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2";
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG";
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF";
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5";
        const courseSectionCourseId = "moRgToBTOAJZdMQPs7Ci";

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId, courseSectionCourseId];

        if (course_id) {
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
          }
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left section with the light background *
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: theme.palette.background.default }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '10vh',
              paddingBottom: '10vh',
              boxSizing: 'border-box'
            }}
          >
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  Tell me more about you
                </Typography>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  To begin your journey, I need a couple of informations
                </Typography>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} >
                
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your school? (you can add more)*</Typography>
                  <IconButton onClick={addYearField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {year.length > 1 && (
                    <IconButton onClick={() => removeYearField(year.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>

                {year.map((y, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                        <InputLabel id={`year-${index}`}>School</InputLabel>
                        <Select
                          labelId={`year-${index}`}
                          id={`year-select-${index}`}
                          value={y}
                          label="School"
                          error={!!errors.year}
                          onChange={(e) => handleYearChange(index, e)}
                        >
                          {theme.facultyOptions.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                        {index === 0 && <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.year}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

               
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <Typography>What year are you?*</Typography>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
                      error={!!errors.learnerType}
                      helperText={errors.learnerType}
                      onChange={handleLearnerTypeChange}
                    >
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.learnerType}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <Typography>Give us the name of your Academic Advisor if you know</Typography>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your major? (if you declared it)</Typography>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your minor? (you can add more)</Typography>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

               
                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      padding: 1.5,
                      borderRadius: 5,
                      width: '100%',
                      backgroundColor: theme.palette.button_sign_in,
                      color: theme.palette.button_text_sign_in,
                      '&:hover': {
                        backgroundColor: theme.palette.hover_button // Hover effect
                      }
                    }}
                    disabled={isLoading}
                  >
                    Create your profile
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
*/





/* ANCIEN CODE QUI FONCTIONNE MAIS SANS LA POSSIBILITÉ D'AJOUTER PLUSIEURS ECOLES
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    if (!year) {
      newErrors.year = 'School is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; 
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; 
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5";
        const courseSectionCourseId = "moRgToBTOAJZdMQPs7Ci"; 

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId, courseSectionCourseId];

        if (course_id) {
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
          }
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left section with the light background *
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>
        {/* Right section with the dark background *
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: theme.palette.background.default }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '10vh',
              paddingBottom: '10vh',
              boxSizing: 'border-box'
            }}
          >
            <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }}>
              <Grid item xs={2}></Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  Tell me more about you
                </Typography>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  To begin your journey, I need a couple of informations
                </Typography>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <Typography>What is your school? (you can add more than one)*</Typography>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">School</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="School"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      {theme.facultyOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <Typography>What year are you?*</Typography>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.sign_up_link }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.sign_up_link }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
                      error={!!errors.learnerType}
                      helperText={errors.learnerType}
                      onChange={handleLearnerTypeChange}
                    >
                      <MenuItem value={'Freshman'}>Freshman</MenuItem>
                      <MenuItem value={'Sophomore'}>Sophomore</MenuItem>
                      <MenuItem value={'Junior'}>Junior</MenuItem>
                      <MenuItem value={'Senior'}>Senior</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.learnerType}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <Typography>Give us the name of your Academic Advisor if you know</Typography>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.sign_up_link
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your major? (if you declared it)</Typography>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <Typography>What is your minor? (you can add more)</Typography>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.sign_up_link }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.sign_up_link }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.sign_up_link
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      padding: 1.5,
                      borderRadius: 5,
                      width: '100%',
                      backgroundColor: theme.palette.button_sign_in,
                      color: theme.palette.button_text_sign_in,
                      '&:hover': {
                        backgroundColor: theme.palette.hover_button // Hover effect
                      }
                    }}
                    disabled={isLoading}
                  >
                    Create your profile
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
*/







/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    if (!year) {
      newErrors.year = 'School is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; 
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; 
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5"; 

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId];

        if (course_id) {
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
          }
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell me more about you</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your journey, I need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your school?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">School</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="School"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      {theme.facultyOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
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
                  <span>What is the name of your Academic Advisor?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your major? (if you declared it)</span>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your minor? (you can add more)</span>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 3,
                      mb: 2,
                      padding: 1.5,
                      borderRadius: 5,
                      width: '100%',
                      backgroundColor: theme.palette.button_sign_in,
                      color: theme.palette.button_text_sign_in,
                      '&:hover': {
                        backgroundColor: theme.palette.hover_button // Adding hover color for button
                      }
                    }}
                    disabled={isLoading}
                  >
                    Create your profile
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
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const newErrors = {};

    if (!year) {
      newErrors.year = 'School is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // List of course_id that the student must have after the inscription
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; // Academic Advisor
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; // Campus Life
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; // Career Advisor 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5"; // Study Abroad

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId];

        if (course_id) {
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Call the backend endpoint asynchronously and wait for the response
        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        // Fetch the updated user profile to get student_profile
        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        // Navigate after the profile has been set up
        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false); // Stop loading after the process
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell me more about you</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your journey, I need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your school?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">School</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="School"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      {theme.facultyOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
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
                  <span>What is the name of your Academic Advisor?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your major? (if you declared it)</span>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your minor? (you can add more)</span>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '100%' }}
                    disabled={isLoading} // Disable button while loading
                  >
                    Create your profile
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
*/




// AJOUT DU BOUTON QUI CHARGE
/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { db } from '../auth/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import Typography from '@mui/material/Typography';
import { useLocation, useParams } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
//import logo_penn from '../upenn_logo.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Faculty is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); // Stop loading if errors exist
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // List of course_id that the student must have after the inscription
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; // Academic Advisor
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; // Campus Life
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; // Career Advisor 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5"; // Study Abroad

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId];

        if (course_id) {
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Call the backend endpoint asynchronously and wait for the response
        await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        // Fetch the updated user profile to get student_profile
        const updatedUserSnap = await getDoc(userRef);
        const updatedUserData = updatedUserSnap.data();

        if (updatedUserData.student_profile) {
          localStorage.setItem('student_profile', JSON.stringify(updatedUserData.student_profile));
        }

        // Navigate after the profile has been set up
        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false); // Stop loading after the process
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell me more about you</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your journey, I need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">Faculty</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="Faculty"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Wharton</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
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
                  <span>What is the name of your Academic Advisor?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your major? (if you declared it)</span>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your minor? (you can add more)</span>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '3vh', position: 'relative' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '100%' }}
                    disabled={isLoading} // Disable button while loading
                  >
                    Create your profile
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
*/





/*
//AJOUT DE STUDENT_PROFILE DANS LE LOCAL_STORAGE
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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config'; // Import the config file

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Faculty is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        //List of course_id that the student must have after the inscription
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; //Academic Advisor
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; //Campus Life
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; //Career Advisor 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5"; //Study Abroad

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId];

        if (course_id) {
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        // Call the backend endpoint asynchronously and wait for the response
        const result = await sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

        // Set the student_profile in localStorage and navigate
        localStorage.setItem('student_profile', JSON.stringify(result.student_profile));

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
      return result;
    } catch (error) {
      console.error("Error sending student profile:", error);
      throw error;
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell me more about you</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your journey, I need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">Faculty</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="Faculty"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Wharton</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
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
                  <span>What is the name of your Academic Advisor?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your major? (if you declared it)</span>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your minor? (you can add more)</span>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

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
*/



/*
//AJOUT DU CARREER ADVISOR ET DU LIFE ON CAMPUS EN PLUS DE L'ACADEMIC ADVISOR 
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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import logo from '../logo_lucy.png';
import logo_penn from '../upenn_logo.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config'; // Import the config file

export default function LearningStyleSurvey() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const theme = useTheme();
  const [year, setYear] = useState('');
  const [major, setMajor] = useState(['']);
  const [minor, setMinor] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (index, event) => {
    const newMajors = major.slice();
    newMajors[index] = event.target.value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index, event) => {
    const newMinors = minor.slice();
    newMinors[index] = event.target.value;
    setMinor(newMinors);
  };

  const handleLearnerTypeChange = (event) => {
    setLearnerType(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setAdvisor(event.target.value);
  };

  const addMajorField = () => {
    if (major.length < 2) {
      setMajor([...major, '']);
    }
  };

  const removeMajorField = (index) => {
    const newMajors = major.slice();
    newMajors.splice(index, 1);
    setMajor(newMajors);
  };

  const addMinorField = () => {
    if (minor.length < 3) {
      setMinor([...minor, '']);
    }
  };

  const removeMinorField = (index) => {
    const newMinors = minor.slice();
    newMinors.splice(index, 1);
    setMinor(newMinors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!year) {
      newErrors.year = 'Faculty is required';
    }

    if (!learnerType) {
      newErrors.learnerType = 'Year type is required';
    }

    if (!advisor) {
      newErrors.advisor = 'Advisor name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const userRef = doc(db, "users", location.state.uid);
        await updateDoc(userRef, {
          role: "student",
          faculty: year,
          year: learnerType,
          academic_advisor: advisor,
          major: major,
          minor: minor
        });

        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        //List of course_id that the student must have after the inscription
        const academicAdvisorCourseId = "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2"; //Academic Advisor
        const campuslifeCourseId = "Q1SjXBe30FyX6GxvJVIG"; //Campus Life
        const careerAdvisorCourseId = "tyPR1RAulPfqLLfNgIqF"; //Career Advisor 
        const studyAbroadCourseId = "Connf4P2TpKXXGooaQD5"; //Study Abroad

        let chatId = uuidv4();

        let coursesToAdd = [academicAdvisorCourseId, campuslifeCourseId, careerAdvisorCourseId, studyAbroadCourseId];

        if (course_id) {
          console.log(`Fetching course with course_id: ${course_id}`);
          const courseRef = doc(db, 'courses', course_id);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            console.log('Course data:', courseData);

            coursesToAdd.push(course_id);

            await updateDoc(userRef, {
              courses: arrayUnion(...coursesToAdd),
              chatsessions: arrayUnion(chatId)
            });

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
        } else {
          await updateDoc(userRef, {
            courses: arrayUnion(...coursesToAdd),
            chatsessions: arrayUnion(chatId)
          });

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

        localStorage.setItem('course_id', academicAdvisorCourseId);
        localStorage.setItem('chat_id', chatId);

        navigate(`/dashboard/student/${location.state.uid}`);

        // Call the backend endpoint asynchronously
        sendStudentProfile({
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType
        }, location.state.uid);

      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const sendStudentProfile = async (profileData, uid) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
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
                <span style={{ fontWeight: 'bolder', fontSize: 35 }}>Tell me more about you</span>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={10}>
                <span style={{ color: '#8692A6' }}>To begin your journey, I need a couple of informations</span>
              </Grid>
            </Grid>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
              <Grid container columnSpacing={4} rowSpacing={{ xs: 1 }} sx={{ paddingTop: '4vh' }}>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <span>What is your faculty?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="year">Faculty</InputLabel>
                    <Select
                      labelId="year"
                      id="year-select"
                      value={year}
                      label="Faculty"
                      error={!!errors.year}
                      helperText={errors.year}
                      onChange={handleYearChange}
                    >
                      <MenuItem value={'College of Arts and Sciences'}>College of Arts and Sciences</MenuItem>
                      <MenuItem value={'Warthon'}>Wharton</MenuItem>
                      <MenuItem value={'Engineering'}>Engineering</MenuItem>
                      <MenuItem value={'Nursing'}>Nursing</MenuItem>
                    </Select>
                    <FormHelperText sx={{ marginLeft: 0, color: '#d32f2f' }}>{errors.year}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh' }}>
                  <span>What year are you?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <FormControl required sx={{ width: '100%', borderRadius: '12px', '& fieldset': { borderColor: theme.palette.primary.main }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }, borderRadius: '12px' }, '& .MuiSelect-select': { color: theme.palette.text.primary } }}>
                    <InputLabel id="learnerType">Year</InputLabel>
                    <Select
                      labelId="learnerType"
                      id="learnerType-select"
                      value={learnerType}
                      label="Year"
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
                  <span>What is the name of your Academic Advisor?*</span>
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    id="advisor-input"
                    placeholder="Enter your academic advisor"
                    value={advisor}
                    error={!!errors.advisor}
                    helperText={errors.advisor}
                    onChange={handleAdvisorChange}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&::placeholder': {
                          color: theme.palette.text.primary,
                        },
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}></Grid>

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your major? (if you declared it)</span>
                  <IconButton onClick={addMajorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {major.length > 1 && (
                    <IconButton onClick={() => removeMajorField(major.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {major.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`major-input-${index}`}
                        placeholder="Enter your major"
                        value={m}
                        error={!!errors.major}
                        helperText={errors.major}
                        onChange={(e) => handleMajorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={2}></Grid>
                <Grid item xs={6} sx={{ marginTop: '4vh', display: 'flex', alignItems: 'center' }}>
                  <span>What is your minor? (you can add more)</span>
                  <IconButton onClick={addMinorField} sx={{ marginLeft: '10px', color: theme.palette.primary.main }}>
                    <AddIcon />
                  </IconButton>
                  {minor.length > 1 && (
                    <IconButton onClick={() => removeMinorField(minor.length - 1)} sx={{ color: theme.palette.primary.main }}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={4}></Grid>
                {minor.map((m, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`minor-input-${index}`}
                        placeholder="Enter your minor"
                        value={m}
                        error={!!errors.minor}
                        helperText={errors.minor}
                        onChange={(e) => handleMinorChange(index, e)}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            },
                            '&::placeholder': {
                              color: theme.palette.text.primary,
                            },
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}></Grid>
                  </React.Fragment>
                ))}

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
*/
