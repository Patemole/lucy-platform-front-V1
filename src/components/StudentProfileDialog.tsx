import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { useParams } from 'react-router-dom';

interface StudentProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const StudentProfileDialog: React.FC<StudentProfileDialogProps> = ({ open, onClose }) => {
  const { uid } = useParams<{ uid: string }>(); // Get userId from URL

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
  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        console.error('User ID not found in URL.');
        setIsLoading(false);
        return;
      }

      console.log(`Fetching data for userId: ${uid}`);
      setIsLoading(true);

      const userRef = doc(db, 'users', uid);
      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log('User data retrieved from Firestore:', userData);

          // Populate state with Firestore data
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
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [uid, open]);

  // Update localStorage for specified fields
  const updateLocalStorage = () => {
    localStorage.setItem('username', firstName);
    localStorage.setItem('year', year);
    localStorage.setItem('university', school);
    localStorage.setItem('faculty', faculty);
    localStorage.setItem('major', JSON.stringify(major));
    localStorage.setItem('minor', JSON.stringify(minor));
  };

  // Form validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis.';
    if (!email.trim()) newErrors.email = 'L\'adresse mail est requise.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track if the form has been modified
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsModified(true);
  };

  // Form submission handler to update Firestore data and localStorage
  const handleSubmit = async () => {
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (!uid) {
        console.error('User ID not found in URL.');
        return;
      }
      const userRef = doc(db, 'users', uid);
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
      updateLocalStorage(); // Update localStorage on successful update
      onClose(); // Close the dialog on success
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for dynamically managing majors and minors
  const handleMajorChange = (index: number, value: string) => {
    const newMajors = [...major];
    newMajors[index] = value;
    setMajor(newMajors);
    setIsModified(true);
  };

  const handleMinorChange = (index: number, value: string) => {
    const newMinors = [...minor];
    newMinors[index] = value;
    setMinor(newMinors);
    setIsModified(true);
  };

  const addMajorField = () => {
    setMajor([...major, '']);
    setIsModified(true);
  };
  
  const removeMajorField = (index: number) => {
    setMajor(major.filter((_, i) => i !== index));
    setIsModified(true);
  };

  const addMinorField = () => {
    setMinor([...minor, '']);
    setIsModified(true);
  };

  const removeMinorField = (index: number) => {
    setMinor(minor.filter((_, i) => i !== index));
    setIsModified(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>Student Profile</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Name"
                  value={firstName}
                  onChange={(e) => handleInputChange(setFirstName, e.target.value)}
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
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
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
                  onChange={(e) => handleInputChange(setSchool, e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="faculty"
                  label="Faculty"
                  value={faculty}
                  onChange={(e) => handleInputChange(setFaculty, e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="year"
                  label="Year"
                  value={year}
                  onChange={(e) => handleInputChange(setYear, e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="academicAdvisor"
                  label="Academic Advisor"
                  value={academicAdvisor}
                  onChange={(e) => handleInputChange(setAcademicAdvisor, e.target.value)}
                  sx={{ my: 2 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              {/* Majors Section */}
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Majors</Typography>
                {major.map((maj, index) => (
                  <Box key={index} sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => removeMajorField(index)}
                        color="error"
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        remove
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      label={`Major ${index + 1}`}
                      value={maj}
                      onChange={(e) => handleMajorChange(index, e.target.value)}
                    />
                  </Box>
                ))}
                <Button onClick={addMajorField} sx={{ mt: 1, textTransform: 'none' }}>
                  Add Major
                </Button>
              </Grid>

              {/* Minors Section */}
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Minors</Typography>
                {minor.map((min, index) => (
                  <Box key={index} sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => removeMinorField(index)}
                        color="error"
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        remove
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      label={`Minor ${index + 1}`}
                      value={min}
                      onChange={(e) => handleMinorChange(index, e.target.value)}
                    />
                  </Box>
                ))}
                <Button onClick={addMinorField} sx={{ mt: 1, textTransform: 'none' }}>
                  Add Minor
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {isModified && !isLoading && (
          <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} color="primary" disabled={isSubmitting || isLoading} sx={{ textTransform: 'none' }}>
          {isSubmitting ? <CircularProgress size={24} /> : "Update Profile"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentProfileDialog;