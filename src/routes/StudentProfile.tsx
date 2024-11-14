import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';

const drawerWidth = 240;

const StudentProfile: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Get userId from URL

  const [drawerOpen, setDrawerOpen] = useState(true);

  // Form states for user data
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');
  const [academicAdvisor, setAcademicAdvisor] = useState('');
  const [major, setMajor] = useState<string[]>([]);
  const [minor, setMinor] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.error('User ID not found in URL.');
        return;
      }

      console.log(`Fetching data for userId: ${userId}`);

      const userRef = doc(db, 'users', userId);
      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          console.log('User data retrieved from Firestore:', userData);

          // Populate state with Firestore data, ensuring correct mapping
          setFirstName(userData.name || ''); 
          setEmail(userData.email || '');
          setSchool(userData.university || ''); 
          setFaculty(userData.faculty || ''); 
          setYear(userData.year || ''); 
          setAcademicAdvisor(userData.academic_advisor || ''); 
          setMajor(userData.major || []);
          setMinor(userData.minor || []);
          
        } else {
          console.error('No data found for this user.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Form validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis.';
    if (!email.trim()) newErrors.email = 'L\'adresse mail est requise.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHomeClick = () => {
    const uid = userId;
    navigate(`/dashboard/student/${uid}`);
  };

  // Form submission handler to update Firestore data
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (!userId) {
        console.error('User ID not found in URL.');
        return;
      }
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name: firstName,
        email,
        university: school,
        faculty,
        year,
        academic_advisor: academicAdvisor,
        major,
        minor,
        updatedAt: serverTimestamp(),
      });
      alert('Profil mis à jour avec succès.');
      navigate(`/dashboard/student/${userId}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle sidebar visibility
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handlers for dynamically managing majors and minors
  const handleMajorChange = (index: number, value: string) => {
    const newMajors = [...major];
    newMajors[index] = value;
    setMajor(newMajors);
  };

  const handleMinorChange = (index: number, value: string) => {
    const newMinors = [...minor];
    newMinors[index] = value;
    setMinor(newMinors);
  };

  const addMajorField = () => setMajor([...major, '']);
  const removeMajorField = (index: number) => setMajor(major.filter((_, i) => i !== index));

  const addMinorField = () => setMinor([...minor, '']);
  const removeMinorField = (index: number) => setMinor(minor.filter((_, i) => i !== index));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        {/* Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, backgroundColor: theme.palette.background.paper } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={handleHomeClick} sx={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </List>
        </Drawer>

        {/* Content */}
        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          {/* Header */}
          <div className="relative p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6">Student Profile</Typography>
          </div>

          {/* Form Content */}
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, px: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="school"
                  label="University"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="faculty"
                  label="Faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="year"
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="academicAdvisor"
                  label="Academic Advisor"
                  value={academicAdvisor}
                  onChange={(e) => setAcademicAdvisor(e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
            </Grid>

            {/* Major fields */}
            <Typography variant="h6" sx={{ mt: 3 }}>Majors</Typography>
            {major.map((maj, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <TextField
                  fullWidth
                  label={`Major ${index + 1}`}
                  value={maj}
                  onChange={(e) => handleMajorChange(index, e.target.value)}
                  sx={{ my: 1 }}
                />
                <Button onClick={() => removeMajorField(index)} color="error">Remove</Button>
              </Box>
            ))}
            <Button onClick={addMajorField} sx={{ my: 1 }}>Add Major</Button>

            {/* Minor fields */}
            <Typography variant="h6" sx={{ mt: 3 }}>Minors</Typography>
            {minor.map((min, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <TextField
                  fullWidth
                  label={`Minor ${index + 1}`}
                  value={min}
                  onChange={(e) => handleMinorChange(index, e.target.value)}
                  sx={{ my: 1 }}
                />
                <Button onClick={() => removeMinorField(index)} color="error">Remove</Button>
              </Box>
            ))}
            <Button onClick={addMinorField} sx={{ my: 1 }}>Add Minor</Button>

            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" sx={{ width: '100%' }} disabled={isSubmitting}>
                Update Profile
              </Button>
              {isSubmitting && <CircularProgress sx={{ mt: 2 }} />}
            </Box>
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default StudentProfile;