import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { useParams } from 'react-router-dom';
import { useTheme, Theme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RemoveIcon from '@mui/icons-material/Remove';

import image1 from '../../image_profile/38.png';
import image2 from '../../image_profile/42.png';
import image3 from '../../image_profile/43.png';
import image4 from '../../image_profile/44.png';
import image5 from '../../image_profile/47.png';
import image6 from '../../image_profile/48.png';
import image7 from '../../image_profile/52.png';
import image8 from '../../image_profile/57.png';
import image9 from '../../image_profile/58.png';
import image10 from '../../image_profile/61.png';
import image11 from '../../image_profile/64.png';
import image12 from '../../image_profile/66.png';
import image13 from '../../image_profile/Avatar=4.png';
import image14 from '../../image_profile/Avatar=8.png';
import image15 from '../../image_profile/Avatar=9.png';
import image16 from '../../image_profile/Avatar=10.png';
import image17 from '../../image_profile/Avatar=12.png';
import image18 from '../../image_profile/Avatar=13.png';
import image19 from '../../image_profile/Avatar=23.png';
import image20 from '../../image_profile/Avatar=25.png';
import image21 from '../../image_profile/Avatar=26.png';
import image22 from '../../image_profile/Avatar=28.png';
import image23 from '../../image_profile/Avatar=32.png';
import image24 from '../../image_profile/Avatar=33.png';
import image25 from '../../image_profile/Avatar=34.png';
import image26 from '../../image_profile/default_picture.png';

// extend the mui theme to include `facultyOptions`
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
  setProfilePicture: (url: string | null) => void;
  userUniversity?: string;
}

const StudentProfileDialog: React.FC<StudentProfileDialogProps> = ({ open, onClose, setProfilePicture, userUniversity }) => {
  console.log('<<< RENDERING StudentProfileDialog >>>');
  const { uid } = useParams<{ uid: string }>();
  // const { setUser } = useAuth(); // Supprimé
  // Correction: updateUserProfileInStore n'existe plus, l'écouteur Firestore s'en charge.
  // const updateUserProfileInStore = useAuthStore(state => state.updateUserProfileInStore);
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
  const [newInterest, setNewInterest] = useState<string>("");

  // état pour la photo de profil
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [isChangingProfilePicture, setIsChangingProfilePicture] = useState<boolean>(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingImages(true);
      setLoadedImages(0);
      if (!uid) {
        console.error('user id not found in url.');
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
          console.error('no data found for this user.');
        }

        setDefaultImages([
          image1,
          image2,
          image3,
          image4,
          image5,
          image6,
          image7,
          image8,
          image9,
          image10,
          image11,
          image12,
          image13,
          image14,
          image15,
          image16,
          image17,
          image18,
          image19,
          image20,
          image21,
          image22,
          image23,
          image24,
          image25,
          image26,
        ]);
      } catch (error) {
        console.error('error fetching user data:', error);
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
        console.error('user id not found in url.');
        return;
      }

      if (firstName.trim() === '') {
        setErrors((prev) => ({ ...prev, firstName: userUniversity === 'kedge' ? 'Le prénom est requis.' : 'Name is required.' }));
        return;
      }
      if (year === '') {
        setErrors((prev) => ({ ...prev, year: userUniversity === 'kedge' ? 'Veuillez sélectionner votre année actuelle.' : 'Please select your current year.' }));
        return;
      }

      const firestoreUpdateData: any = {
        name: firstName,
        academic_advisor: academicAdvisor,
        faculty,
        year,
        major,
        minor,
        interests,
        profile_picture: profilePictureUrl,
        updatedAt: serverTimestamp(),
      };

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, firestoreUpdateData);
      console.log("[StudentProfileDialog] Firestore updated. Listener will update the store.");

      onClose();
    } catch (error) {
      console.error('error updating profile:', error);
      alert(userUniversity === 'kedge' ? 'Une erreur est survenue lors de la mise à jour du profil.' : 'An error occurred while updating the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setLoadedImages((prev) => {
      const updatedCount = prev + 1;
      console.log(`images loaded: ${updatedCount} / ${defaultImages.length}`);
      if (updatedCount === defaultImages.length) {
        setIsLoadingImages(false);
      }
      return updatedCount;
    });
  };

  const handleUpdatePicture = async () => {
    if (!selectedImageUrl || !uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        profile_picture: selectedImageUrl,
        updatedAt: serverTimestamp(),
      });

      setProfilePicture(selectedImageUrl);
      setProfilePictureUrl(selectedImageUrl);
      setSelectedImageUrl('');
      setIsChangingProfilePicture(false);
    } catch (error) {
      console.error('error updating profile picture:', error);
      alert(userUniversity === 'kedge' ? 'Une erreur est survenue lors de la mise à jour de la photo de profil.' : 'An error occurred while updating the profile picture.');
    }
  };

  // intérêts
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

  // faculty
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
    setSelectedImageUrl(url);
  };

  // major
  const addMajorField = () => setMajor([...major, '']);
  const removeMajorField = (index: number) => setMajor(major.filter((_, i) => i !== index));
  const handleMajorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMajors = [...major];
    updatedMajors[index] = event.target.value;
    setMajor(updatedMajors);
  };

  // minor
  const addMinorField = () => setMinor([...minor, '']);
  const removeMinorField = (index: number) => setMinor(minor.filter((_, i) => i !== index));
  const handleMinorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMinors = [...minor];
    updatedMinors[index] = event.target.value;
    setMinor(updatedMinors);
  };

  // sélection d'une image
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
      console.error('error updating profile picture:', error);
      alert('an error occurred while updating the profile picture.');
    }
  };

  return open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden"
      onClick={handleOverlayClick}
      tabIndex={-1}  // Permet de définir le focus sur l'overlay si nécessaire
      >

    <div 
      className="bg-white w-full max-w-2xl mx-4 p-6 rounded-lg shadow-lg relative flex flex-col overflow-x-hidden"
      style={{ maxHeight: '90vh'}} // 🔥 Limite bien la hauteur de la popup
    >
      {/* Conteneur scrollable */}
      <div 
        className="overflow-y-auto px-4 flex-grow" // 🔥 Ajout de flex-grow pour occuper l'espace disponible et scroller
        style={{ maxHeight: '80vh' }}
      >

        {/* Header fixe */}
        <section className="mb-4">
          {!isChangingProfilePicture && (
            <>
              <div className="flex flex-col items-center">
              <div
               tabIndex={0}
               role="button"
               aria-label="change profile picture"
               onClick={() => setIsChangingProfilePicture(true)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   setIsChangingProfilePicture(true);
                 }
               }}
               className={`w-24 h-24 flex items-center justify-center rounded-full cursor-pointer overflow-hidden transition-all ${profilePictureUrl ? "bg-transparent" : "bg-gray-200"}`}
             >
               {profilePictureUrl ? (
                 <img src={profilePictureUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
               ) : (
                 <AccountCircleIcon fontSize="large" style={{ color: '#9e9e9e', fontSize: '3rem' }} />
               )}
             </div>
            </div>
            {/* Traduction Titre principal */}
            <h1 id="student-profile-title" className="text-2xl font-semibold text-center mb-6">{userUniversity === 'kedge' ? 'Profil Étudiant' : 'Student Profile'}</h1>
          </>
        )}
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             {/* Traduction Message de chargement */}
             <p>{userUniversity === 'kedge' ? 'Chargement du profil...' : 'Loading profile...'}</p>
          </div>
        ) : (
          isChangingProfilePicture ? (
            <div>
              <div className="flex flex-col items-center mb-6">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt="profile preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="current profile"
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

              <div className="relative">
                 {/* Traduction Titre secondaire */}
                 <h2 className="text-2xl font-semibold text-center mb-6">{userUniversity === 'kedge' ? 'Profil Étudiant' : 'Student Profile'}</h2>
                 {/* Traduction Label sélection image */}
                 <label className="block mb-5 text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Sélectionnez une nouvelle photo de profil' : 'Select a new profile picture'}</label>
                <div className="absolute top-[90px] left-0 right-0 h-[50px] rounded-[15px] bg-gradient-to-b from-black/5 to-transparent z-10" />

                 {/* Traduction Message chargement images */}
                 {isLoadingImages && <p className="text-center text-gray-500 mb-4">{userUniversity === 'kedge' ? 'Chargement des images...' : 'Loading images...'}</p>}
                <div className="grid grid-cols-5 gap-4 mb-5 overflow-y-auto mx-auto max-h-[450px] w-fit">
                  {defaultImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`default profile ${index + 1}`}
                      className="w-24 h-24 rounded-full object-cover cursor-pointer"
                      onClick={() => handleSelectImagePreview(url)}
                      onLoad={() => handleImageLoad()}
                    />
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[50px] rounded-[15px] bg-gradient-to-t from-black/5 to-transparent z-10" />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  onClick={() => setIsChangingProfilePicture(false)}
                  aria-label={userUniversity === 'kedge' ? 'Annuler' : 'Cancel'}
                >
                  {userUniversity === 'kedge' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 ${selectedImageUrl ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={!selectedImageUrl}
                  onClick={handleUpdatePicture}
                  aria-label={userUniversity === 'kedge' ? 'Mettre à jour la photo' : 'Update Picture'}
                >
                  {userUniversity === 'kedge' ? 'Mettre à jour la photo' : 'Update Picture'}
                </button>
              </div>
            </div>
          ) : (
            <form>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* Traduction Label Prénom */}
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Prénom*' : 'Name*'}</label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                    />
                    {errors.firstName && (
                      <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    {/* Traduction Label Année */}
                    <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Année actuelle ?*' : 'Current year?*'}</label>
                    <select
                      id="yearSelect"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                        backgroundSize: '8px 6px'
                      }}
                    >
                      {/* Traduction Option par défaut Année */}
                      <option value="" disabled>{userUniversity === 'kedge' ? 'Sélectionnez votre année' : 'Select your year'}</option>
                       {/* Traduction Options Année */}
                      <option value="1st Year">{userUniversity === 'kedge' ? '1ère Année' : '1st Year'}</option>
                      <option value="2nd Year">{userUniversity === 'kedge' ? '2ème Année' : '2nd Year'}</option>
                      <option value="3rd Year">{userUniversity === 'kedge' ? '3ème Année' : '3rd Year'}</option>
                      <option value="4th Year">{userUniversity === 'kedge' ? '4ème Année' : '4th Year'}</option>
                      <option value="Master">Master</option> // Pas de traduction spécifique nécessaire
                      <option value="PhD">{userUniversity === 'kedge' ? 'Doctorat' : 'PhD'}</option>
                      {/* Traduction Options Grad */}
                      <option value="Grad 1">{userUniversity === 'kedge' ? 'Master 1 / 5ème année' : 'Grad 1 (5th year)'}</option>
                      <option value="Grad 2">{userUniversity === 'kedge' ? 'Master 2 / 6ème année' : 'Grad 2 (6th year)'}</option>
                    </select>
                    {errors.year && (
                      <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.year}</p>
                    )}
                  </div>
                </div>

                <div>
                   {/* Traduction Label Conseiller */}
                   <label htmlFor="academicAdvisorInput" className="block text-sm font-medium text-gray-700">
                     {userUniversity === 'kedge' ? 'Conseiller Académique' : 'Academic Advisor'}
                   </label>
                  <input
                    id="academicAdvisorInput"
                    type="text"
                    value={academicAdvisor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcademicAdvisor(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                    placeholder={userUniversity === 'kedge' ? 'Nom du conseiller (optionnel)' : 'Advisor\'s name (optional)'}
                  />
                  {errors.academicAdvisor && (
                    <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.academicAdvisor}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    {/* Traduction Label Filière */}
                    <label htmlFor="FacultySelect" className="block text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Filière' : 'Faculty'}</label>
                    {faculty.length < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (faculty.length < 3) setFaculty([...faculty, '']);
                        }}
                        className="text-green-500 text-2xl hover:text-green-700"
                        // Traduction aria-label bouton Ajouter Filière
                        aria-label={userUniversity === 'kedge' ? 'Ajouter une filière' : 'Add a faculty'}
                      >
                        +
                      </button>
                    )}
                  </div>
                  {faculty.map((facultyValue, index) => (
                    <div key={index} className="relative mb-2">
                      <select
                        value={facultyValue}
                        // L'aria-label ici reste en anglais car il est plus technique (pour accessibilité)
                        aria-label={`faculty ${index + 1}`}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const updatedFaculties = [...faculty];
                          updatedFaculties[index] = e.target.value;
                          setFaculty(updatedFaculties);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '8px 6px'
                        }}
                      >
                        {/* Traduction Option par défaut Filière */}
                        <option value="" disabled>
                          {userUniversity === 'kedge' ? 'Sélectionnez votre filière' : 'Select your faculty'}
                        </option>
                        {/* Les options viennent du thème, pas de traduction ici */}
                        {theme.facultyOptions?.map((option: string, optionIndex: number) => (
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
                           // Traduction aria-label bouton Supprimer Filière
                          aria-label={userUniversity === 'kedge' ? 'Supprimer cette filière' : 'Remove this faculty'}
                        >
                          -
                        </button>
                      )}
                      {errors.faculty && (
                        <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    {/* Traduction Label Majeure */}
                    <label className="block text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Majeure (si déclarée)' : 'Major (if declared)'}</label>
                    {major.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setMajor([...major, ''])}
                        className="text-green-500 text-2xl hover:text-green-700"
                        // Traduction aria-label bouton Ajouter Majeure
                        aria-label={userUniversity === 'kedge' ? 'Ajouter une majeure' : 'Add a major'}
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
                        // Traduction Placeholder Majeure
                        placeholder={userUniversity === 'kedge' ? 'Entrez votre majeure' : 'Enter your major'}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => setMajor(major.filter((_, i) => i !== index))}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                          // Traduction aria-label bouton Supprimer Majeure
                          aria-label={userUniversity === 'kedge' ? 'Supprimer cette majeure' : 'Remove this major'}
                        >
                          -
                        </button>
                      )}
                      {errors.major && (
                        <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.major}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                     {/* Traduction Label Mineure */}
                    <label className="block text-sm font-medium text-gray-700">{userUniversity === 'kedge' ? 'Mineure (optionnel)' : 'Minor (optional)'}</label>
                    {minor.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setMinor([...minor, ''])}
                        className="text-green-500 text-2xl hover:text-green-700"
                         // Traduction aria-label bouton Ajouter Mineure
                        aria-label={userUniversity === 'kedge' ? 'Ajouter une mineure' : 'Add a minor'}
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
                        // Traduction Placeholder Mineure
                        placeholder={userUniversity === 'kedge' ? 'Entrez votre mineure' : 'Enter your minor'}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => setMinor(minor.filter((_, i) => i !== index))}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                           // Traduction aria-label bouton Supprimer Mineure
                          aria-label={userUniversity === 'kedge' ? 'Supprimer cette mineure' : 'Remove this minor'}
                        >
                          -
                        </button>
                      )}
                      {errors.minor && (
                        <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.minor}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                 {/* Traduction Label Intérêts */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userUniversity === 'kedge' ? 'Sélectionnez au moins 5 centres d\'intérêt*' : 'Select at least 5 interest tags*'}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {interests.filter(tag => tag.trim() !== "").map((tag, index) => (
                    <div
                      key={index}
                      className="group relative inline-block px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700"
                    >
                      {tag}
                      <button
                       type="button"
                       // Traduction aria-label bouton Supprimer Intérêt
                       aria-label={userUniversity === 'kedge' ? 'Supprimer cet intérêt' : 'Remove this interest'}
                       className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
                                  flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white"
                       onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                     >
                       <RemoveIcon fontSize="small" />
                     </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onBlur={() => {
                      const trimmed = newInterest.trim();
                      if (trimmed && !interests.includes(trimmed)) {
                        setInterests([...interests, trimmed]);
                      }
                      setNewInterest("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newInterest.trim();
                        if (trimmed && !interests.includes(trimmed)) {
                          setInterests([...interests, trimmed]);
                        }
                        setNewInterest("");
                      }
                    }}
                    // Traduction Placeholder Intérêt
                    placeholder={userUniversity === 'kedge' ? 'Ajouter un nouvel intérêt' : 'Add a new interest'}
                    className="inline-block w-auto max-w-xs px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-100"
                  />
                </div>
                {errors.interests && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.interests}</p>}
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                   // Traduction aria-label et texte bouton Annuler final
                  aria-label={userUniversity === 'kedge' ? 'Annuler' : 'Cancel'}
                >
                  {userUniversity === 'kedge' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300"
                  disabled={isSubmitting}
                   // Traduction aria-label et texte bouton Mettre à jour final
                  aria-label={userUniversity === 'kedge' ? 'Mettre à jour le profil' : 'Update Profile'}
                >
                  {isSubmitting ? (userUniversity === 'kedge' ? 'Mise à jour...' : 'Updating...') : (userUniversity === 'kedge' ? 'Mettre à jour le profil' : 'Update Profile')}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
    </div>
   
  ) : null;
};

export default StudentProfileDialog;
