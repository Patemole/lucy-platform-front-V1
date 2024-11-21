import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { useParams } from 'react-router-dom';
import { useTheme, Theme } from '@mui/material/styles';

// Extend the MUI theme to include `facultyOptions`
declare module '@mui/material/styles' {
  interface Theme {
    facultyOptions: string[];
  }
  interface ThemeOptions {
    facultyOptions?: string[];
  }
}

interface StudentProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const StudentProfileDialog: React.FC<StudentProfileDialogProps> = ({ open, onClose }) => {
  const { uid } = useParams<{ uid: string }>();
  const { setUser } = useAuth(); // Import `setUser` from AuthContext
  const theme: Theme = useTheme();

  const [firstName, setFirstName] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [academicAdvisor, setAcademicAdvisor] = useState<string>('');
  const [faculty, setFaculty] = useState<string[]>(['']);
  const [major, setMajor] = useState<string[]>(['']);
  const [minor, setMinor] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        console.error('User ID not found in URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const userRef = doc(db, 'users', uid);
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFirstName(userData.name || '');
          setYear(userData.year || '');
          setAcademicAdvisor(userData.academic_advisor || '');
          setFaculty(userData.faculty || ['']);
          setMajor(userData.major || ['']);
          setMinor(userData.minor || ['']);
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

  const handleSubmit = async () => {
    setErrors({});
    setIsSubmitting(true);
    try {
      if (!uid) {
        console.error('User ID not found in URL.');
        return;
      }

      // Basic validation (can be extended)
      if (firstName.trim() === '') {
        setErrors((prev) => ({ ...prev, firstName: 'Name is required.' }));
        return;
      }
      if (year === '') {
        setErrors((prev) => ({ ...prev, year: 'Please select your current year.' }));
        return;
      }

      // Prepare the updated profile data
      const updatedProfile: any = {
        name: firstName,
        academic_advisor: academicAdvisor,
        faculty,
        year,
        major,
        minor,
        updatedAt: serverTimestamp(),
      };

      // Update Firebase
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updatedProfile);

      // Update the context with the new data (excluding `serverTimestamp`)
      setUser((prevUser: any) => ({
        ...(prevUser || {}), // Avoid errors if prevUser is null
        name: firstName,
        year,
        academic_advisor: academicAdvisor,
        faculty,
        major,
        minor,
      }));

      onClose(); // Close the dialog on success
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click outside to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFacultyChange = (index: number, value: string) => {
    const updatedFaculties = [...faculty];
    updatedFaculties[index] = value;
    setFaculty(updatedFaculties);
  };

  const removeFacultyField = (index: number) => {
    if (faculty.length > 1) {
      setFaculty(faculty.filter((_, i) => i !== index));
    }
  };

  const addFacultyField = () => {
    if (faculty.length < 3) {
      setFaculty([...faculty, '']);
    }
  };

  // Add or remove major and minor fields
  const addMajorField = () => setMajor([...major, '']);
  const removeMajorField = (index: number) => setMajor(major.filter((_, i) => i !== index));
  const handleMajorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMajors = [...major];
    updatedMajors[index] = event.target.value;
    setMajor(updatedMajors);
  };

  const addMinorField = () => setMinor([...minor, '']);
  const removeMinorField = (index: number) => setMinor(minor.filter((_, i) => i !== index));
  const handleMinorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMinors = [...minor];
    updatedMinors[index] = event.target.value;
    setMinor(updatedMinors);
  };

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-2xl mx-4 p-8 rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-semibold text-center mb-6">Student Profile</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full"></div>
          </div>
        ) : (
          <form>
            {/* Grille principale à une seule colonne */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Grille imbriquée pour "Name" et "Current Year" - Toujours sur la même ligne */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
  
                {/* Current Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">What is your current year?*</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
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
                  {errors.year && (
                    <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                  )}
                </div>
              </div>
  
              {/* Academic Advisor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Advisor</label>
                <input
                  type="text"
                  value={academicAdvisor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcademicAdvisor(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                />
                {errors.academicAdvisor && (
                  <p className="text-red-500 text-xs mt-1">{errors.academicAdvisor}</p>
                )}
              </div>
  
              {/* Faculty */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  {faculty.length < 3 && (
                    <button
                      type="button"
                      onClick={addFacultyField}
                      className="text-green-500 text-2xl hover:text-green-700"
                      aria-label="Add a faculty"
                    >
                      +
                    </button>
                  )}
                </div>
                {faculty.map((facultyValue, index) => (
                  <div key={index} className="relative mb-2">
                    <select
                      value={facultyValue}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFacultyChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
                    >
                      <option value="" disabled>
                        Select your faculty
                      </option>
                      {theme.facultyOptions.map((option: string, optionIndex: number) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeFacultyField(index)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                        aria-label="Remove this faculty"
                      >
                        -
                      </button>
                    )}
                    {errors.faculty && (
                      <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
  
            {/* Major and Minor Section - Toujours sur la même ligne */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Major */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Major (if declared)</label>
                  {major.length < 10 && (
                    <button
                      type="button"
                      onClick={addMajorField}
                      className="text-green-500 text-2xl hover:text-green-700"
                      aria-label="Add a major"
                    >
                      +
                    </button>
                  )}
                </div>
                {major.map((majorValue, index) => (
                  <div key={index} className="relative mb-2">
                    <input
                      type="text"
                      value={majorValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMajorChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Enter your major"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMajorField(index)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                        aria-label="Remove this major"
                      >
                        -
                      </button>
                    )}
                    {errors.major && (
                      <p className="text-red-500 text-xs mt-1">{errors.major}</p>
                    )}
                  </div>
                ))}
              </div>
  
              {/* Minor */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Minor (optional)</label>
                  {minor.length < 10 && (
                    <button
                      type="button"
                      onClick={addMinorField}
                      className="text-green-500 text-2xl hover:text-green-700"
                      aria-label="Add a minor"
                    >
                      +
                    </button>
                  )}
                </div>
                {minor.map((minorValue, index) => (
                  <div key={index} className="relative mb-2">
                    <input
                      type="text"
                      value={minorValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMinorChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Enter your minor"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMinorField(index)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                        aria-label="Remove this minor"
                      >
                        -
                      </button>
                    )}
                    {errors.minor && (
                      <p className="text-red-500 text-xs mt-1">{errors.minor}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
  
            {/* Boutons d'action */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null;

};

export default StudentProfileDialog;