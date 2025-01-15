import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { useParams } from 'react-router-dom';
import { useTheme, Theme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Assurez-vous que ce composant est importé
import { CircularProgress } from '@mui/material';

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
  setProfilePicture: (url: string | null) => void; // Nouvelle prop pour mettre à jour l'image dans le parent
}

const StudentProfileDialog: React.FC<StudentProfileDialogProps> = ({ open, onClose, setProfilePicture  }) => {
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
  const [interests, setInterests] = useState<string[]>(['']);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(true);
  const [loadedImages, setLoadedImages] = useState<number>(0);

  // État pour la photo de profil
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [isChangingProfilePicture, setIsChangingProfilePicture] = useState<boolean>(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingImages(true); // Réinitialiser à true à chaque fois
      setLoadedImages(0); // Réinitialiser le compteur
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
          setInterests(userData.interests || ['']);
          setProfilePictureUrl(userData.profile_picture || '');
        } else {
          console.error('No data found for this user.');
        }

        // Définissez ici les images par défaut (URLs publiques sur S3)
        setDefaultImages([
          'https://profile-images-app.s3.us-east-1.amazonaws.com/default_picture.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/38.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/42.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=9.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/47.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/48.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/52.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/57.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/58.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/61.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/64.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/66.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=10.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=12.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=13.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=23.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=25.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=26.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=28.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=32.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=33.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=34.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=4.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/Avatar=8.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/43.png',
          'https://profile-images-app.s3.us-east-1.amazonaws.com/44.png',
          
          // Ajoutez d'autres URLs si nécessaire
        ]);
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

      // Basic validation
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
        interests,
        profile_picture: profilePictureUrl, // Inclure la photo de profil
        updatedAt: serverTimestamp(),
      };

      // Update Firebase
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updatedProfile);

      // Update the context with the new data
      setUser((prevUser: any) => ({
        ...(prevUser || {}),
        name: firstName,
        year,
        academic_advisor: academicAdvisor,
        faculty,
        major,
        minor,
        interests,
        profile_picture: profilePictureUrl,
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



  const handleImageLoad = () => {
    setLoadedImages((prev) => {
      const updatedCount = prev + 1;
      console.log(`Images loaded: ${updatedCount} / ${defaultImages.length}`);
      if (updatedCount === defaultImages.length) {
        setIsLoadingImages(false);
      }
      return updatedCount;
    });
  };


  const handleUpdatePicture = async () => {
    if (!selectedImageUrl || !uid) return;
  
    try {
      // Mettre à jour Firestore
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        profile_picture: selectedImageUrl,
        updatedAt: serverTimestamp(),
      });

      // Mettre à jour l'image dans le parent
      setProfilePicture(selectedImageUrl);
  
      // Mettre à jour l'état local
      setProfilePictureUrl(selectedImageUrl);
      setSelectedImageUrl(''); // Réinitialiser la sélection
      setIsChangingProfilePicture(false); // Revenir à l'écran principal

    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('An error occurred while updating the profile picture.');
    }
  };

  // Intérêts
  const addInterestField = () => {
    setInterests([...interests, '']);
  };
  const handleInterestChange = (index: number, value: string) => {
    const updatedInterests = [...interests];
    updatedInterests[index] = value;
    setInterests(updatedInterests);
  };
  const removeInterestField = (index: number) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    setInterests(updatedInterests);
  };

  // Faculty
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

  const handleSelectImagePreview = (url: string) => {
    setSelectedImageUrl(url); // Met à jour l'image sélectionnée
  };

  // Major
  const addMajorField = () => setMajor([...major, '']);
  const removeMajorField = (index: number) => setMajor(major.filter((_, i) => i !== index));
  const handleMajorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMajors = [...major];
    updatedMajors[index] = event.target.value;
    setMajor(updatedMajors);
  };

  // Minor
  const addMinorField = () => setMinor([...minor, '']);
  const removeMinorField = (index: number) => setMinor(minor.filter((_, i) => i !== index));
  const handleMinorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMinors = [...minor];
    updatedMinors[index] = event.target.value;
    setMinor(updatedMinors);
  };

  // Sélection d'une image
  const handleSelectImage = async (url: string) => {
    if (!uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        profile_picture: url,
        updatedAt: serverTimestamp(),
      });

      setProfilePictureUrl(url);
      setIsChangingProfilePicture(false);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('An error occurred while updating the profile picture.');
    }
  };

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-2xl mx-4 p-8 rounded-lg shadow-lg relative">

      
      {!isChangingProfilePicture && (
        <>
          <div className="flex flex-col items-center mb-4">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover cursor-pointer"
                onClick={() => setIsChangingProfilePicture(true)}
              />
            ) : (
              <AccountCircleIcon
                fontSize="inherit"
                component="svg"
                style={{
                  color: '#9e9e9e',
                  cursor: 'pointer',
                  margin: '0 auto 0 16px',
                  fontSize: '2.5rem',
                }}
                onClick={() => setIsChangingProfilePicture(true)}
              />
            )}
          </div>
          <h2 className="text-2xl font-semibold text-center mb-6">Student Profile</h2>
        </>
      )}



        
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full"></div>
  </div>
) : (
  isChangingProfilePicture ? (
    <div>
      {/* Image preview en haut */}
      <div className="flex flex-col items-center mb-6">
        {selectedImageUrl ? (
          <img
            src={selectedImageUrl}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt="Current Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <AccountCircleIcon
            fontSize="inherit"
            component="svg"
            style={{
              color: '#9e9e9e',
              cursor: 'pointer',
              margin: '0 auto 0 16px',
              fontSize: '2.5rem',
            }}
          />
        )}
      </div>

      <div style={{ position: "relative" }}>
      <h2 className="text-2xl font-semibold text-center mb-6">Student Profile</h2>

      <label className="block mb-5 text-sm font-medium text-gray-700">Select a new picture profile</label>
      {/* Ombre en haut */}
      <div
        style={{
          position: "absolute",
          top: '90px',
          borderRadius: '15px',
          left: 0,
          right: 0,
          height: "50px", // Hauteur de l'ombre
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent)",
          zIndex: 1,
        }}
      />

{/*
      {isLoadingImages ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (*/}
      <div
        className="grid grid-cols-5 gap-4 mb-5 overflow-y-auto mx-auto"
        style={{
          maxHeight: '450px', // Hauteur fixe pour activer le défilement
          width: 'fit-content', // Ajuste la largeur au contenu
        }}
      >
        {defaultImages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Default Profile ${index + 1}`}
            className="w-24 h-24 rounded-full object-cover cursor-pointer"
            onClick={() => handleSelectImagePreview(url)} // Met à jour la preview
            onLoad={() => handleImageLoad()}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50px",
          borderRadius: '15px',
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent)",
          zIndex: 1,
        }}
      />
      

      </div>

      {/* Boutons Cancel et Update */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          onClick={() => setIsChangingProfilePicture(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 ${
            selectedImageUrl ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!selectedImageUrl}
          onClick={handleUpdatePicture}
        >
          Update Picture
        </button>
      </div>
    </div>
  )
         : (
            <form>
              {/* Grille principale à une seule colonne */}
              <div className="grid grid-cols-1 gap-4 mb-4">
                {/* Grille imbriquée pour "Name" et "Current Year" */}
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
                    <label className="block text-sm font-medium text-gray-700">Current year?*</label>
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
                        onClick={() => {
                          if (faculty.length < 3) setFaculty([...faculty, '']);
                        }}
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
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const updatedFaculties = [...faculty];
                          updatedFaculties[index] = e.target.value;
                          setFaculty(updatedFaculties);
                        }}
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
                          onClick={() => {
                            if (faculty.length > 1) setFaculty(faculty.filter((_, i) => i !== index));
                          }}
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

              {/* Major and Minor Section */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Major */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Major (if declared)</label>
                    {major.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setMajor([...major, ''])}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedMajors = [...major];
                          updatedMajors[index] = e.target.value;
                          setMajor(updatedMajors);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Enter your major"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => setMajor(major.filter((_, i) => i !== index))}
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
                        onClick={() => setMinor([...minor, ''])}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedMinors = [...minor];
                          updatedMinors[index] = e.target.value;
                          setMinor(updatedMinors);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Enter your minor"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => setMinor(minor.filter((_, i) => i !== index))}
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

              {/* Center of Interests */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Center of Interests</label>
                  {interests.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setInterests([...interests, ''])}
                      className="text-green-500 text-2xl hover:text-green-700"
                      aria-label="Add an interest"
                    >
                      +
                    </button>
                  )}
                </div>
                {interests.map((interest, index) => (
                  <div key={index} className="relative mb-2">
                    <input
                      type="text"
                      value={interest}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updatedInterests = [...interests];
                        updatedInterests[index] = e.target.value;
                        setInterests(updatedInterests);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Enter your interest"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                        aria-label="Remove this interest"
                      >
                        -
                      </button>
                    )}
                    {errors.interests && errors.interests[index] && (
                      <p className="text-red-500 text-xs mt-1">{errors.interests[index]}</p>
                    )}
                  </div>
                ))}
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
          )
        )}
      </div>
    </div>
  ) : null;
};

export default StudentProfileDialog;