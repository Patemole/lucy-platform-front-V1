import React, { useState, useEffect } from 'react';
import { useTheme, Theme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RemoveIcon from '@mui/icons-material/Remove';
import useAuthStore from '../../../stores/useAuthStore';
import { User } from '../../../interfaces/interfaces_eleve';

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
}

const StudentProfileDialog: React.FC<StudentProfileDialogProps> = ({ open, onClose, setProfilePicture }) => {
  const { user, updateUserProfileInStoreAndFirestore, isFetchingUserData, error: authError } = useAuthStore((state) => ({
    user: state.user,
    updateUserProfileInStoreAndFirestore: state.updateUserProfileInStoreAndFirestore,
    isFetchingUserData: state.isFetchingUserData,
    error: state.error,
  }));
  const theme: Theme = useTheme();

  const [firstName, setFirstName] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [academicAdvisor, setAcademicAdvisor] = useState<string>('');
  const [faculty, setFaculty] = useState<string[]>(['']);
  const [major, setMajor] = useState<string[]>(['']);
  const [minor, setMinor] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [interests, setInterests] = useState<string[]>(['']);
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState<string>('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [loadedImages, setLoadedImages] = useState<number>(0);
  const [newInterest, setNewInterest] = useState<string>("");
  const [isChangingProfilePicture, setIsChangingProfilePicture] = useState<boolean>(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (open) {
      if (user) {
        setFirstName(user.name || '');
        setYear(user.year || '');
        setAcademicAdvisor(user.academic_advisor || '');
        setFaculty(Array.isArray(user.faculty) && user.faculty.length > 0 ? user.faculty : ['']);
        setMajor(Array.isArray(user.major) && user.major.length > 0 ? user.major : ['']);
        setMinor(Array.isArray(user.minor) && user.minor.length > 0 ? user.minor : ['']);
        setInterests(Array.isArray(user.interests) && user.interests.length > 0 ? user.interests : ['']);
        setCurrentProfilePictureUrl(user.profilePicture || '');
        setProfilePicture(user.profilePicture || null);
        setErrors({});
        setIsSubmitting(false);
        setIsChangingProfilePicture(false);
        setSelectedImageUrl('');
      }
    } else {
      setFirstName('');
      setYear('');
      setAcademicAdvisor('');
      setFaculty(['']);
      setMajor(['']);
      setMinor(['']);
      setInterests(['']);
      setCurrentProfilePictureUrl('');
      setErrors({});
      setIsSubmitting(false);
      setIsChangingProfilePicture(false);
      setSelectedImageUrl('');
      setProfilePicture(null);
    }
  }, [user, open]);

  const handleSubmit = async () => {
    setErrors({});
    if (firstName.trim() === '') {
      setErrors((prev) => ({ ...prev, firstName: 'name is required.' }));
      return;
    }
    if (year === '') {
      setErrors((prev) => ({ ...prev, year: 'please select your current year.' }));
      return;
    }

    const validInterests = interests.filter(interest => interest.trim() !== '');
    if (validInterests.length < 1) {
      setErrors(prev => ({ ...prev, interests: 'please add at least one interest.' }));
      return;
    }

    if (!user) {
      console.error('User data not available in store.');
      alert('An error occurred. User data not found.');
      return;
    }

    setIsSubmitting(true);

    const updatedProfileData: Partial<Omit<User, 'id' | 'email'>> = {
      name: firstName.trim(),
      academic_advisor: academicAdvisor.trim(),
      faculty: faculty.filter(f => f.trim() !== ''),
      year,
      major: major.filter(m => m.trim() !== ''),
      minor: minor.filter(m => m.trim() !== ''),
      interests: validInterests,
    };

    try {
      await updateUserProfileInStoreAndFirestore(updatedProfileData);
      console.log('Profile updated successfully via store action.');
      onClose();
    } catch (error) {
      console.error('Error updating profile via store action:', error);
      setErrors(prev => ({ ...prev, submit: authError || 'An error occurred while updating the profile.' }));
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
    if (defaultImages && defaultImages.length > 0) {
      setLoadedImages((prev) => {
        const updatedCount = prev + 1;
        console.log(`images loaded: ${updatedCount} / ${defaultImages.length}`);
        return updatedCount;
      });
    }
  };

  const handleUpdatePicture = async () => {
    if (!selectedImageUrl || !user) {
      console.error("No image selected or user not available in store.");
      return;
    }

    setIsSubmitting(true);

    const profileUpdateData: Partial<Omit<User, 'id' | 'email'>> = {
      profilePicture: selectedImageUrl,
    };

    try {
      await updateUserProfileInStoreAndFirestore(profileUpdateData);
      console.log('Profile picture updated successfully via store action.');

      setProfilePicture(selectedImageUrl);

      setSelectedImageUrl('');
      setIsChangingProfilePicture(false);

    } catch (error) {
      console.error('Error updating profile picture via store action:', error);
      alert(authError || 'An error occurred while updating the profile picture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectImagePreview = (url: string) => {
    setSelectedImageUrl(url);
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

  const handleInterestChange = (index: number, value: string) => {
    const updatedInterests = [...interests];
    updatedInterests[index] = value;
    setInterests(updatedInterests);
  };

  const removeInterestField = (index: number) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    setInterests(updatedInterests);
  };

  const addInterestField = () => {
    setInterests([...interests, '']);
  };

  const handleMajorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMajors = [...major];
    updatedMajors[index] = event.target.value;
    setMajor(updatedMajors);
  };

  const addMajorField = () => setMajor([...major, '']);
  const removeMajorField = (index: number) => setMajor(major.filter((_, i) => i !== index));

  const handleMinorChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMinors = [...minor];
    updatedMinors[index] = event.target.value;
    setMinor(updatedMinors);
  };

  const addMinorField = () => setMinor([...minor, '']);
  const removeMinorField = (index: number) => setMinor(minor.filter((_, i) => i !== index));

  const isLoading = isFetchingUserData || isSubmitting;

  return open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden"
      onClick={handleOverlayClick}
      tabIndex={-1}
    >
      <div
        className="bg-white w-full max-w-2xl mx-4 p-6 rounded-lg shadow-lg relative flex flex-col overflow-x-hidden"
        style={{ maxHeight: '90vh'}}
      >
        <div
          className="overflow-y-auto px-4 flex-grow"
          style={{ maxHeight: '80vh' }}
        >
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
                    className={`w-24 h-24 flex items-center justify-center rounded-full cursor-pointer overflow-hidden transition-all ${currentProfilePictureUrl ? "bg-transparent" : "bg-gray-200"}`}
                  >
                    {currentProfilePictureUrl ? (
                      <img src={currentProfilePictureUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <AccountCircleIcon fontSize="large" style={{ color: '#9e9e9e', fontSize: '3rem' }} />
                    )}
                  </div>
                </div>
                <h1 id="student-profile-title" className="text-2xl font-semibold text-center mb-6">student profile</h1>
              </>
            )}
          </section>

          {isLoading && !isChangingProfilePicture ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full"></div>
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
                  ) : currentProfilePictureUrl ? (
                    <img
                      src={currentProfilePictureUrl}
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
                  <h2 className="text-2xl font-semibold text-center mb-6">student profile</h2>
                  <label className="block mb-5 text-sm font-medium text-gray-700">select a new picture profile</label>
                  <div className="absolute top-[90px] left-0 right-0 h-[50px] rounded-[15px] bg-gradient-to-b from-black/5 to-transparent z-10" />

                  <div className="grid grid-cols-5 gap-4 mb-5 overflow-y-auto mx-auto max-h-[450px] w-fit">
                    {defaultImages.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`default profile ${index + 1}`}
                        className={`w-24 h-24 rounded-full object-cover cursor-pointer ${selectedImageUrl === url ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleSelectImagePreview(url)}
                        onLoad={handleImageLoad}
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
                    aria-label="Cancel"
                  >
                    cancel
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 ${selectedImageUrl && !isSubmitting ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!selectedImageUrl || isSubmitting}
                    onClick={handleUpdatePicture}
                    aria-label="Update Picture"
                  >
                    {isSubmitting ? 'updating...' : 'update picture'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">name</label>
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
                      <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700">current year?*</label>
                      <select
                        id="yearSelect"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                        }}
                      >
                        <option value="" disabled>select your year</option>
                        <option value="Freshman">freshman (1st year)</option>
                        <option value="Sophomore">sophomore (2nd year)</option>
                        <option value="Junior">junior (3rd year)</option>
                        <option value="Senior">senior (4th year)</option>
                        <option value="Grad 1">grad 1 (5th year)</option>
                        <option value="Grad 2">grad 2 (6th year)</option>
                      </select>
                      {errors.year && (
                        <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.year}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="academicAdvisorInput" className="block text-sm font-medium text-gray-700">
                      academic advisor
                    </label>
                    <input
                      id="academicAdvisorInput"
                      type="text"
                      value={academicAdvisor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcademicAdvisor(e.target.value)}
                      className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                    />
                    {errors.academicAdvisor && (
                      <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.academicAdvisor}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="FacultySelect" className="block text-sm font-medium text-gray-700">faculty</label>
                      {faculty.length < 3 && (
                        <button
                          type="button"
                          onClick={addFacultyField}
                          className="text-green-500 text-2xl hover:text-green-700"
                          aria-label="add a faculty"
                        >
                          +
                        </button>
                      )}
                    </div>
                    {faculty.map((facultyValue, index) => (
                      <div key={index} className="relative mb-2">
                        <select
                          value={facultyValue}
                          aria-label={`faculty ${index + 1}`}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const updatedFaculties = [...faculty];
                            updatedFaculties[index] = e.target.value;
                            setFaculty(updatedFaculties);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500 appearance-none"
                        >
                          <option value="" disabled>
                            select your faculty
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
                            aria-label="remove this faculty"
                          >
                            -
                          </button>
                        )}
                        {errors.faculty && index === 0 && (
                          <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">major (if declared)</label>
                      {major.length < 10 && (
                        <button
                          type="button"
                          onClick={addMajorField}
                          className="text-green-500 text-2xl hover:text-green-700"
                          aria-label="add a major"
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
                          placeholder="enter your major"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeMajorField(index)}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                            aria-label="remove this major"
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
                      <label className="block text-sm font-medium text-gray-700">minor (optional)</label>
                      {minor.length < 10 && (
                        <button
                          type="button"
                          onClick={addMinorField}
                          className="text-green-500 text-2xl hover:text-green-700"
                          aria-label="add a minor"
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
                          placeholder="enter your minor"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeMinorField(index)}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-red-500 text-2xl hover:text-red-700"
                            aria-label="remove this minor"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    select at least 5 interest tags*
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {interests.filter(tag => tag.trim() !== "").map((tag, index) => (
                      <div
                        key={`${tag}-${index}`}
                        className="group relative inline-block px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700"
                      >
                        {tag}
                        <button
                         type="button"
                         aria-label="remove this interest"
                         className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
                                    flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white"
                         onClick={() => removeInterestField(index)}
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
                      placeholder="add a new interest"
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
                    aria-label="Cancel"
                    disabled={isSubmitting}
                  >
                    cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300"
                    disabled={isSubmitting}
                    aria-label="Update Profile"
                  >
                    {isSubmitting ? 'updating...' : 'update profile'}
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

