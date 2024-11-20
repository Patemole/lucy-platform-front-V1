// src/components/LearningStyleSurvey.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import lucyLogo from '../logo_lucy.png';
import Avatar from '@mui/material/Avatar';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion'; // Import de Framer Motion



export default function LearningStyleSurvey() {
  const { user, login, setPrimaryChatId, chatIds, isAuth, loading } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { course_id } = useParams();

  const [schools, setSchools] = useState(['']);
  const [majors, setMajors] = useState(['']);
  const [minors, setMinors] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  const variants = {
    initial: { opacity: 0, y: 20 }, // Départ (invisible, en bas)
    animate: { opacity: 1, y: 0 }, // Arrivée (visible, à sa position normale)
    exit: { opacity: 0, y: -20 },  // Sortie (invisible, vers le haut)
  };

  // Handlers pour les écoles
  const handleSchoolChange = (index, event) => {
    const newSchools = [...schools];
    newSchools[index] = event.target.value;
    setSchools(newSchools);
  };

  //Pour ajouter jusqu a 5 faculty en meme temps
  const addSchoolField = () => {
    if (schools.length < 5) {
      setSchools([...schools, '']);
    }
  };
//Pour pouvoir enlever une ecole
  const removeSchoolField = (index) => {
    if (schools.length > 1) {
      setSchools(schools.filter((_, i) => i !== index));
    }
  };

  // Handlers pour les majors
  const handleMajorChange = (index, event) => {
    const newMajors = [...majors];
    newMajors[index] = event.target.value;
    setMajors(newMajors);
  };

  //Pour pouvoir ajouter une major
  const addMajorField = () => {
    if (majors.length < 5) {
      setMajors([...majors, '']);
    }
  };

  //Pour pouvoir enlever une major
  const removeMajorField = (index) => {
    if (majors.length > 1) {
      setMajors(majors.filter((_, i) => i !== index));
    }
  };

  // Handlers pour les minors
  const handleMinorChange = (index, event) => {
    const newMinors = [...minors];
    newMinors[index] = event.target.value;
    setMinors(newMinors);
  };

  //Pouvoir rajouter une minor
  const addMinorField = () => {
    if (minors.length < 10) {
      setMinors([...minors, '']);
    }
  };

  //pouvoir enlever une minor
  const removeMinorField = (index) => {
    if (minors.length > 1) {
      setMinors(minors.filter((_, i) => i !== index));
    }
  };

  const handleLearnerTypeChange = (event) => setLearnerType(event.target.value);
  const handleAdvisorChange = (event) => setAdvisor(event.target.value);


  // useEffect pour observer les changements dans le contexte et loguer les valeurs mises à jour
  useEffect(() => {
    if (isAuth && !loading) {
      console.log("Contexte Auth mis à jour:", {
        user,
        isAuth,
        loading,
        chatIds
      });
    }
  }, [user, isAuth, loading, chatIds]);



  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[Étape 1] Soumission du formulaire déclenchée");
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    // Validation des champs
    if (schools.some((s) => !s)) newErrors.schools = 'Au moins une école est requise';
    if (!learnerType) newErrors.learnerType = 'Le type d\'apprenant est requis';

    if (Object.keys(newErrors).length > 0) {
      console.log("[Étape 2] Erreurs de validation:", newErrors);
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        console.log("[Étape 3] Mise à jour des informations de l'utilisateur dans Firestore");
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          role: "student",
          faculty: schools,
          year: learnerType,
          academic_advisor: advisor,
          major: majors,
          minor: minors,
        });

        console.log("[Étape 4] Récupération des données de l'utilisateur");
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        console.log("[Étape 5] Création d'une nouvelle session de chat");
        let chatId = uuidv4();
    
        await updateDoc(userRef, {
          chatsessions: arrayUnion(chatId),
        });

        await setDoc(doc(db, "chatsessions", chatId), {
          chat_id: chatId,
          name: "New Chat",
          created_at: serverTimestamp(),
          modified_at: serverTimestamp(),
        });

        //addChatId(chatId); // Ajout du chat_id au contexte
        setPrimaryChatId(chatId)

        console.log("[Étape 6] Mise à jour du contexte avec les données de l'utilisateur");
        login({
          id: user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          university: userData.university,
          year: learnerType,
          faculty: schools,             // Ajout de 'faculty'
          academic_advisor: advisor,    // Ajout de 'academic_advisor'
          major: majors,                // Ajout de 'major'
          minor: minors,                // Ajout de 'minor'
        });


        console.log("[Étape 7] Redirection vers le tableau de bord de l'étudiant");
        navigate(`/dashboard/student/${user.id}`);
      } catch (error) {
        console.error("[Erreur] Une erreur est survenue:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial="initial" // Animation au chargement
      animate="animate" // Animation quand visible
      exit="exit"       // Animation à la sortie
      variants={variants}
      transition={{ duration: 0.5 }} // Durée de la transition
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <div className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Tell Us About Yourself</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">To start your journey, please fill in the details below.</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section École */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Which school are you affiliated with? (You can add more)*</label>
              {schools.length < 10 && (
                <button
                  type="button"
                  onClick={addSchoolField}
                  className="text-green-500 hover:text-green-700"
                  aria-label="Add a school"
                >
                  <AddIcon />
                </button>
              )}
            </div>
            {schools.map((school, index) => (
              <div key={index} className="relative mb-4">
                <select
                  value={school}
                  onChange={(e) => handleSchoolChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white bg-no-repeat bg-right pr-10 focus:ring focus:ring-blue-100 focus:border-blue-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                  }}
                >
                  <option value="" disabled>Select your school</option>
                  {theme.facultyOptions && theme.facultyOptions.map((faculty) => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
                {schools.length > 1 && index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSchoolField(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label="Remove this school"
                  >
                    <RemoveIcon />
                  </button>
                )}
              </div>
            ))}
            {errors.schools && <p className="text-xs text-red-600 mt-1">{errors.schools}</p>}
          </div>

          {/* Section Année */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">What is your current year?*</label>
            <select
              value={learnerType}
              onChange={handleLearnerTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white bg-no-repeat bg-right pr-10 focus:ring focus:ring-blue-100 focus:border-blue-500"
              style={{
                backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
              }}
            >
              <option value="" disabled>Select your year</option>
              <option value="Freshman">Freshman (1st Year)</option>
              <option value="Sophomore">Sophomore (2nd Year)</option>
              <option value="Junior">Junior (3rd Year)</option>
              <option value="Senior">Senior (4th Year)</option>
              <option value="Grad 1">Grad 1 (5th Year)</option>
              <option value="Grad 2">Grad 2 (6th Year)</option>
            </select>
            {errors.learnerType && <p className="text-xs text-red-600 mt-1">{errors.learnerType}</p>}
          </div>

          {/* Section Conseiller Académique */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Academic Advisor (optional)</label>
            <input
              type="text"
              value={advisor}
              onChange={handleAdvisorChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Enter your academic advisor's name"
            />
          </div>

          {/* Section Major et Minor */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Section Major */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Major (if declared)</label>
                {majors.length < 10 && (
                  <button
                    type="button"
                    onClick={addMajorField}
                    className="text-green-500 hover:text-green-700"
                    aria-label="Add a major"
                  >
                    <AddIcon />
                  </button>
                )}
              </div>
              {majors.map((major, index) => (
                <div key={index} className="relative mb-4">
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => handleMajorChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Enter your major"
                  />
                  {majors.length > 1 && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMajorField(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      aria-label="Remove this major"
                    >
                      <RemoveIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Section Minor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Minor (optional)</label>
                {minors.length < 10 && (
                  <button
                    type="button"
                    onClick={addMinorField}
                    className="text-green-500 hover:text-green-700"
                    aria-label="Add a minor"
                  >
                    <AddIcon />
                  </button>
                )}
              </div>
              {minors.map((minor, index) => (
                <div key={index} className="relative mb-4">
                  <input
                    type="text"
                    value={minor}
                    onChange={(e) => handleMinorChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Enter your minor"
                  />
                  {minors.length > 1 && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMinorField(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      aria-label="Remove this minor"
                    >
                      <RemoveIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 mt-1 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Create Your Profile"}
          </button>

          {/* Texte supplémentaire */}
          <p className="mt-4 text-xs text-center text-gray-500">
            By signing up, you agree to our <a href="#" className="underline text-blue-500 hover:text-blue-700">Terms of Service</a> and <a href="https://trust-ressources.s3.us-east-1.amazonaws.com/Privacy+Policy+-+My+Lucy+Corp+-+2024+-+11%3A11%3A24.pdf" target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-700">Privacy Policy</a>. You also admit that you are beautiful.
          </p>

          {/* Pied de page */}
          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-400 mr-2">Powered by Lucy</p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>

        {/* (Optionnel) Composant de débogage pour afficher le contexte dans l'UI */}
        {/*<DebugContext />*/}
      </div>
    </motion.div>
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
          minor: minor,
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

        // Store the data in localStorage instead of sending to an endpoint
        const profileData = {
          academic_advisor: advisor,
          faculty: year,
          major: major,
          minor: minor,
          name: userData.name,
          university: userData.university,
          year: learnerType,
        };

        localStorage.setItem('university', userData.university || 'default_university');
        localStorage.setItem('major', JSON.stringify(major) || 'default_major');
        localStorage.setItem('minor', JSON.stringify(minor) || 'default_minor');
        localStorage.setItem('year', learnerType || 'default_year');
        localStorage.setItem('faculty', JSON.stringify(year) || 'default_faculty');
        localStorage.setItem('username', profileData.name || 'default_username');
        localStorage.setItem('student_profile', JSON.stringify(profileData));

        navigate(`/dashboard/student/${location.state.uid}`);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left section *
        <Grid item xs={0} sm={4} sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', backgroundColor: theme.palette.background.paper }}>
          <Box sx={{ padding: 2 }}>
            <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
          </Box>
        </Grid>

        {/* Right section *
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
            {/* Logo and Heading on mobile *
            <Box sx={{ width: '100%', display: { xs: 'flex', sm: 'none' }, alignItems: 'center', marginBottom: '2vh' }}>
              <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />
            </Box>

            {/* Headings *
            <Box sx={{ width: '100%', marginBottom: '2vh', maxWidth: 600, marginLeft: { xs: 0, sm: 'auto' }, marginRight: { xs: 0, sm: 'auto' } }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Tell me more about you
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                To begin your journey, I need a couple of informations
              </Typography>
            </Box>

            {/* Form *
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: '100%', boxSizing: 'border-box' }}>
              <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
                {/* What is your school? *
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

                {/* What year are you? *
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
                    <MenuItem value={'Grad 1'}>Grad 1</MenuItem>
                    <MenuItem value={'Grad 2'}>Grad 2</MenuItem>
                  </Select>
                  <FormHelperText sx={{ marginLeft: 0, color: theme.palette.error.main }}>{errors.learnerType}</FormHelperText>
                </FormControl>

                {/* Academic Advisor *
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

                {/* Major *
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

                {/* Minor *
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

                {/* Submit button *
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

          {/* Footer *
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
