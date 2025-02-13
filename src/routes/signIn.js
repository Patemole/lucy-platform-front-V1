import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import lucyLogo from '../logo_lucy.png';
import { motion } from 'framer-motion'; // Framer Motion for animations
import config from '../config';


const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,/^.+@my-lucy\.com$/i,],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  holyfamily: [/^.+@([a-zA-Z0-9._-]+\.)*holyfamily\.edu$/i, /^.+@my-lucy\.com$/i],
  lehigh: [/^.+@([a-zA-Z0-9._-]+\.)*lehigh\.edu$/i, /^.+@my-lucy\.com$/i],
  case: [/^.+@([a-zA-Z0-9._-]+\.)*case\.edu$/i, /^.+@my-lucy\.com$/i],
  usc: [/^.+@([a-zA-Z0-9._-]+\.)*usc\.edu$/i, /^.+@my-lucy\.com$/i],
  purdue: [/^.+@([a-zA-Z0-9._-]+\.)*purdue\.edu$/i, /^.+@my-lucy\.com$/i],
  hofstra: [/^.+@([a-zA-Z0-9._-]+\.)*hofstra\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn email',
    harvard: 'Harvard email',
    mit: 'MIT email',
    lasell: 'Lasell email',
    oakland: 'Oakland email',
    arizona: 'Arizona email',
    uci: 'Uci email',
    ucdavis: 'Ucdavis email',
    cornell: 'Cornell email',
    berkeleycollege: 'BerkeleyCollege email',
    brown: 'Brown email',
    stanford: 'Stanford email',
    berkeley: 'Berkeley email',
    miami: 'Miami email',
    usyd: 'Usyd email',
    columbia: 'Columbia email',
    drexel: 'Drexel email',
    temple: 'Temple email',
    psu: 'PennState email',
    ccp: 'Ccp email',
    holyfamily: 'HolyFamily email',
    lehigh: 'LeHigh email',
    case: 'Case email',
    usc: 'USC email',
    purdue: 'Purdue email',
    hofstra: 'Hofstra email',
    admin: 'Admin email'
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};


const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};


const SignIn = ({ handleToggleThemeMode }) => {
  const { isAuth, loading, user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { course_id } = useParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Tracks spinner in button

  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuth && user) {
      console.log("User authenticated, redirecting...");
      navigate(`/dashboard/${user?.role || 'defaultRole'}/${user?.id || 'defaultId'}`, { replace: true });
    }
  }, [loading, isAuth, user, navigate]);
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Optional: Fetch additional user data or validation here
      console.log("Sign-in successful, redirecting...");
      
      // Navigate immediately after successful sign-in
      //navigate(`/dashboard/${result.user.role || 'defaultRole'}/${result.user.uid || 'defaultId'}`, { replace: true });
    } catch (error) {
      const newErrors = {};
      if (error.code === 'auth/user-not-found') {
        newErrors.email = 'No user found with this email';
      } else if (error.code === 'auth/wrong-password') {
        newErrors.password = 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        newErrors.email = 'Account access blocked! Try again later';
      } else {
        newErrors.email = 'Login failed';
      }
      setErrors(newErrors);


    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for Framer Motion
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
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
      <div className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Sign in to your account</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Access your personalized dashboard by signing in below.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={email} // Bind to state
              onChange={(e) => setEmail(e.target.value)} // Update state
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Email address"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password} // Bind to state
              onChange={(e) => setPassword(e.target.value)} // Update state
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Password"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <CircularProgress size={20} color="inherit" />
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="mt-8 text-xs text-center text-gray-600">
            Don't have an account?{' '}
            <a href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} className="text-blue-600 hover:underline">
              Sign up now!
            </a>
          </p>

          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-400 mr-2">Powered by Lucy</p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignIn;
