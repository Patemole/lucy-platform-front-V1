
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { db } from '../../auth/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import { doc, updateDoc, getDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import lucyLogo from '../../logo_lucy.png';
import Avatar from '@mui/material/Avatar';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { sendWelcomeEmail, scrapeLinkedInProfile } from '../../api/auth_and_onboarding';




export default function LearningStyleSurvey() {
  const { user, login, setPrimaryChatId, chatIds, isAuth, loading } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  //const { course_id } = useParams();

  // État pour les écoles, majeures, mineures, etc.
  const [schools, setSchools] = useState(['']);
  const [majors, setMajors] = useState(['']);
  const [minors, setMinors] = useState(['']);
  const [learnerType, setLearnerType] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  //const isMobile = window.innerWidth <= 768;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [cookieConsent, setCookieConsent] = useState(false);
  



  // Nouveau state pour les tags d'intérêts
  const availableInterests = [
    "Clubs",
    "Internships",
    "Music",
    "Sports",
    "Tutoring",
    "Photography",
    "Cinema",
    "Entrepreneurship",
    "Theater",
    "Arts",
    "Workshops",
    "Technology",
    "Esport",
    "Culture",
    "Food",
    "Religious",
    "Research",
    "Volunteer",
    "Gym",
    "Networking"
  ];
  const [selectedInterests, setSelectedInterests] = useState([]);

  // États pour la registration aux clubs
  const [registeredClubStatus, setRegisteredClubStatus] = useState('');
  const [registeredClubs, setRegisteredClubs] = useState('');

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Handlers pour les écoles
  const handleSchoolChange = (index, event) => {
    const newSchools = [...schools];
    newSchools[index] = event.target.value;
    setSchools(newSchools);
  };

  const addSchoolField = () => {
    if (schools.length < 5) {
      setSchools([...schools, '']);
    }
  };

  const removeSchoolField = (index) => {
    if (schools.length > 1) {
      setSchools(schools.filter((_, i) => i !== index));
    }
  };

  // Handlers pour les majeures
  const handleMajorChange = (index, event) => {
    const newMajors = [...majors];
    newMajors[index] = event.target.value;
    setMajors(newMajors);
  };

  const addMajorField = () => {
    if (majors.length < 5) {
      setMajors([...majors, '']);
    }
  };

  const removeMajorField = (index) => {
    if (majors.length > 1) {
      setMajors(majors.filter((_, i) => i !== index));
    }
  };

  // Handlers pour les mineures
  const handleMinorChange = (index, event) => {
    const newMinors = [...minors];
    newMinors[index] = event.target.value;
    setMinors(newMinors);
  };

  const addMinorField = () => {
    if (minors.length < 10) {
      setMinors([...minors, '']);
    }
  };

  const removeMinorField = (index) => {
    if (minors.length > 1) {
      setMinors(minors.filter((_, i) => i !== index));
    }
  };

  const handleLearnerTypeChange = (event) => setLearnerType(event.target.value);
  const handleAdvisorChange = (event) => setAdvisor(event.target.value);

  // Handler pour la sélection des tags d'intérêts
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handler pour le statut d'inscription aux clubs
  const handleRegisteredClubStatusChange = (event) => {
    setRegisteredClubStatus(event.target.value);
    if (event.target.value !== 'yes') {
      setRegisteredClubs('');
    }
  };

  const handleRegisteredClubsChange = (event) => setRegisteredClubs(event.target.value);

  useEffect(() => {
    if (isAuth && !loading) {
      console.log("Auth context updated:", { user, isAuth, loading, chatIds });
    }
  }, [user, isAuth, loading, chatIds]);




  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[Step 1] Form submission triggered");
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    // Validation
    if (schools.some((s) => !s)) newErrors.schools = 'At least one school is required';
    if (!learnerType) newErrors.learnerType = 'Learner type is required';
    if (selectedInterests.length < 5) newErrors.interests = 'Please choose at least 5 interest tags';
    if (!cookieConsent) newErrors.cookieConsent = 'You must accept the Cookie Policy to continue.';


    if (Object.keys(newErrors).length > 0) {
      console.log("[Step 2] Validation errors:", newErrors);
      setErrors(newErrors);
      setIsLoading(false);
    } else {
      try {
        console.log("[Step 3] Updating user information in Firestore");
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          role: "student",
          faculty: schools,
          year: learnerType,
          academic_advisor: advisor,
          major: majors,
          minor: minors,
          interests: selectedInterests,
          linkedin_url: linkedinUrl || null,  // Enregistre l'URL si renseignée
          registered_club_status: registeredClubStatus,
          registered_clubs: registeredClubs,
          onboardingComplete: false, // 🔹 L'utilisateur n'a pas encore vu les popups
        });

        console.log("[Step 4] Retrieving user data");
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // Scraping LinkedIn si une URL est fournie
        let linkedinData = null;
        if (linkedinUrl) {
            console.log("[Step 5] Scraping LinkedIn profile");
            linkedinData = await scrapeLinkedInProfile(linkedinUrl);
            if (linkedinData) {
                console.log("Données LinkedIn récupérées:", linkedinData);

                // Mise à jour Firestore avec les données scrappées
                await updateDoc(userRef, { linkedin_profile: linkedinData });
            }
        }

        console.log("[Step 5] Creating a new chat session");
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

        setPrimaryChatId(chatId);

        console.log("[Step 6] Sending welcome email via backend API");
        await sendWelcomeEmail(userData.email, userData.name)

        console.log("[Step 7] Updating auth context with user data");
        login({
          id: user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          university: userData.university,
          year: learnerType,
          faculty: schools,
          academic_advisor: advisor,
          major: majors,
          minor: minors,
          interests: selectedInterests,
          registered_club_status: registeredClubStatus,
          registered_clubs: registeredClubs,
          linkedin_url: linkedinUrl || null,
          linkedin_profile: linkedinData || null,
          onboardingComplete: false, // 🔹 L'utilisateur n'a pas encore vu les popups
        });

        console.log("[Step 7] Redirecting to student dashboard");
        navigate(`/dashboard/student/${user.id}`);
      } catch (error) {
        console.error("[Error] An error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <header className="absolute top-4 left-4" aria-label="University branding">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </header>

      <main className="w-full max-w-2xl bg-white rounded-xl shadow-md p-10 mx-4" role="main">
        <h1 className="text-xl font-semibold text-center mb-4">Tell us about yourself</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          {isMobile ? "Please fill in the details below." : "To start your journey, please fill in the details below."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section School */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {isMobile ? "Your school (add more)" : "Which school are you affiliated with? (you can add more)*"}
              </label>
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
                <label
                 htmlFor={`school-${index}`}
                 className="block text-sm font-medium text-gray-700"
               >
               </label>
                <select
                  id={`school-${index}`}
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
            {errors.schools && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.schools}</p>}
          </div>

          {/* Combined Section: Year and Academic Advisor */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="currentyear" className="block text-sm font-medium text-gray-700 mb-4">
              {isMobile ? "Your year*":"What is your current year?*"} 
              </label >
              <select
                id="currentyear"
                value={learnerType}
                onChange={handleLearnerTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white bg-no-repeat bg-right pr-10 focus:ring focus:ring-blue-100 focus:border-blue-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgOCI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBMOCA2TCA0IDYiIGZpbGw9IiM2NjYiLz48L3N2Zz4=")`,
                }}
              >
                <option value="" disabled>Current year</option>
                <option value="Freshman">Freshman (1st year)</option>
                <option value="Sophomore">Sophomore (2nd year)</option>
                <option value="Junior">Junior (3rd year)</option>
                <option value="Senior">Senior (4th year)</option>
                <option value="Grad 1">Grad 1 (5th year)</option>
                <option value="Grad 2">Grad 2 (6th year)</option>
              </select>
              {errors.learnerType && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.learnerType}</p>}
            </div>
            <div>
              <label htmlFor="academicAdvisor" className="block text-sm font-medium text-gray-700 mb-4">
                {isMobile ? "Academic Advisor":"Academic Advisor (Optional)"} 
              </label>
              
              <input
                id="academicAdvisor"
                type="text"
                value={advisor}
                onChange={handleAdvisorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                placeholder="Enter your academic advisor's name"
              />
            </div>
          </div>

          {/* Section Interest Tags */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select at least 5 interest tags*
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedInterests.includes(interest)
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.interests}</p>}
          </div>

          {/* Section LinkedIn Profile */}
          <div className="mb-8">
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-4">
              {isMobile ? "LinkedIn Profile URL" : "Enter your LinkedIn Profile URL"}
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </div>

          {/*
          {/* Section Club Registration 
          <div className="mb-8">
            <label htmlFor="registeredYes" className="block text-sm font-medium text-gray-700 mb-4">
              Are you registered to some clubs yet? (to know more about your interests)*
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="registeredYes"
                  name="registeredClubStatus"
                  value="yes"
                  checked={registeredClubStatus === 'yes'}
                  onChange={handleRegisteredClubStatusChange}
                  className="mr-1"
                />
                <label htmlFor="registeredNo" className="text-sm text-gray-700">Yes</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="registeredNo"
                  name="registeredClubStatus"
                  value="no"
                  checked={registeredClubStatus === 'no'}
                  onChange={handleRegisteredClubStatusChange}
                  className="mr-1"
                />
                <label htmlFor="registeredNo" className="text-sm text-gray-700">No</label>
              </div>
            </div>
            {registeredClubStatus === 'yes' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={registeredClubs}
                  onChange={handleRegisteredClubsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Enter the clubs you belong to"
                />
              </div>
            )}
          </div>
          */}

          {/* Section Major and Minor */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Section Major */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {isMobile ? "Major" : "Major (If declared)"}
                </label>
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
                  <label htmlFor={`major-${index}`} className="sr-only">
                    Major #{index + 1}
                  </label>
                  <input
                    id={`major-${index}`}
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
                <label className="block text-sm font-medium text-gray-700">
                  {isMobile ? "Minor" : "Minor (Optional)"}
                </label>
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
                  <label htmlFor={`minor-${index}`} className="sr-only">
                    Minor #{index + 1}
                  </label>
                  <input
                    id={`minor-${index}`}
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

          {/* Cookie Consent Checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="cookieConsent"
              checked={cookieConsent}
              onChange={() => setCookieConsent(!cookieConsent)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setCookieConsent(!cookieConsent);
                }
              }}
              className="mr-2"
            />
            <label htmlFor="cookieConsent" className="text-sm text-gray-700">
              I agree to the{" "}
              <a
                href="/documents/GDPR_Cookie_Policy_v1.0.0-0.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                Cookie Policy
              </a>
            </label>
          </div>

          {/* Affichage de l'erreur si l'utilisateur ne coche pas la case */}
          {errors.cookieConsent && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.cookieConsent}</p>}


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !cookieConsent}
            className={`w-full py-2 mt-1 text-white rounded-lg 
              ${cookieConsent ? "bg-gray-800 hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"} 
              focus:ring focus:ring-blue-300 disabled:opacity-50`}
          >
            {isLoading ? "Loading..." : "Create Your Profile"}
          </button>


          {/* Additional Text */}
          <p className="mt-4 text-xs text-center text-gray-500">
            By signing up, you agree to our <a href="#" className="underline text-blue-700 hover:text-blue-900">Terms of Service</a> and <a href="https://trust-ressources.s3.us-east-1.amazonaws.com/Privacy+Policy+-+My+Lucy+Corp+-+2024+-+11%3A11%3A24.pdf" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900">Privacy Policy</a>. You also admit that you are beautiful.
          </p>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-600 mr-2">Powered by Lucy</p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>
      </main>
    </motion.div>
  );
}


