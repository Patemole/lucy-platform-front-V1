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
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  holyfamily: [/^.+@([a-zA-Z0-9._-]+\.)*holyfamily\.edu$/i, /^.+@my-lucy\.com$/i],
  lehigh: [/^.+@([a-zA-Z0-9._-]+\.)*lehigh\.edu$/i, /^.+@my-lucy\.com$/i],
  cwru: [/^.+@([a-zA-Z0-9._-]+\.)*case\.edu$/i, /^.+@my-lucy\.com$/i],
  usc: [/^.+@([a-zA-Z0-9._-]+\.)*usc\.edu$/i, /^.+@my-lucy\.com$/i],
  purdue: [/^.+@([a-zA-Z0-9._-]+\.)*purdue\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    holyfamily: 'HolyFamily',
    lehigh: 'LeHigh',
    purdue: 'Purdue',
    cwru: 'Case',
    
    usc: "USC",
    admin: 'Admin',
    // other universities...
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

/*
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import lucyLogo from '../logo_lucy.png';



const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

const SignIn = ({ handleToggleThemeMode }) => {
  const { login, isAuth, loading, user, setPrimaryChatId, setUser, setIsAuth } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = auth.currentUser;


  //permet de automatiquement navigate vers la bonne page si on est deja connecte pour eviter de se reconnecter
  
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('--- useEffect Triggered ---');
      console.log('loading:', loading);
      console.log('isAuth:', isAuth);
      console.log('user:', user);
      console.log('setUser:', typeof setUser);

      if (!loading && isAuth && user) {
        console.log("Before redirection");
        console.log("isAuth:", isAuth);
        console.log("user:", user);

        try {
          const docRef = doc(db, 'users', user.id); // Utilisez user.id directement
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data fetched from Firestore:", userData);

            // Mettre à jour les informations de l'utilisateur si nécessaire
            setUser({
              ...user, // Conserver les propriétés existantes
              name: userData.name || '',
              university: userData.university || '',
              faculty: userData.faculty || [],
              year: userData.year || '',
              academic_advisor: userData.academic_advisor || '',
              major: userData.major || [],
              minor: userData.minor || [],
              role: userData.role || '',
            });
            // Redirection basée sur le rôle de l'utilisateur
            
              navigate(`/dashboard/student/${user.id}`);
          } 
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("Conditions not met for fetching user data");
      }
    };

    fetchUserData();
  }, [isAuth]); // Utiliser uniquement isAuth comme dépendance
  



  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);
  
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};
  
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        login({
          id: user.uid,
          name: userData.name || '',
          email: user.email || '',
          university: userData.university || '',
          faculty: userData.faculty || '',
          year: userData.year || '',
          academic_advisor: userData.academic_advisor || '',
          major: userData.major || [],
          minor: userData.minor || [],
          role: userData.role || '',
        });

        // Vérifier les sessions de chat
        const chatSessions = userData.chatsessions || [];
        console.log("Recuperation du chatSessions de firestore")
        console.log(chatSessions)
        const lastChatId = chatSessions.length > 0 ? chatSessions[chatSessions.length - 1] : 'default_chat_id';

        console.log("Voici le chatId que l on a recupere de firestore")
        console.log(lastChatId)

        setPrimaryChatId(lastChatId);
  
        /*
        if (userData.role === 'student') {
          navigate(`/dashboard/student/${user.uid}`);
        } else if (userData.role === 'academic_advisor') {
          navigate(`/dashboard/academic-advisor/${user.uid}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ email: 'No user data found' }); *
      }
       
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



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Sign in to your account</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Access your personalized dashboard by signing in below.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Password"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300"
          >
            {isLoading ? 'Loading...' : 'Sign In'}
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
    </div>
  );
};

export default SignIn;

*/

/*
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../auth/firebase';
import { useAuth } from '../auth/hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import lucyLogo from '../logo_lucy.png';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

const SignIn = ({ handleToggleThemeMode }) => {
  const { login, isAuth, loading } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAuth) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = storedUser.role;
      const uid = storedUser.id;

      if (userRole === 'student') {
        navigate(`/dashboard/student/${uid}`);
      } else if (userRole === 'academic_advisor') {
        navigate(`/dashboard/academic-advisor/${uid}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuth, loading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        login({
          id: user.uid,
          name: userData.name,
          email,
          role: userData.role,
        });

        if (userData.role === 'student') {
          navigate(`/dashboard/student/${user.uid}`);
        } else if (userData.role === 'academic_advisor') {
          navigate(`/dashboard/academic-advisor/${user.uid}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ email: 'No user data found' });
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Sign in to your account</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Access your personalized dashboard by signing in below.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Password"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300"
          >
            {isLoading ? 'Loading...' : 'Sign In'}
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
    </div>
  );
};

export default SignIn;
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid);
            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" style={{ height: 50, width: 'auto' }} />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.sidebar }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: `2px 2px 12px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem', color: theme.palette.text.primary }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: '800', fontSize: '1rem', color: theme.palette.text.primary }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6, color: theme.palette.text.primary } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6, color: theme.palette.text.primary } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                padding: 1.5,
                borderRadius: 5,
                width: '50%',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in,
                '&:hover': {
                  backgroundColor: theme.palette.button_sign_in_hover,
                },
              }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ mr: 1, color: theme.palette.text.primary }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/




/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.sidebar }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                padding: 1.5,
                borderRadius: 5,
                width: '50%',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in,
                '&:hover': {
                  backgroundColor: theme.palette.button_sign_in_hover,
                },
              }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2" sx={{ color: theme.palette.sign_up_link }}>
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    admin: 'Admin',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn({ handleToggleThemeMode }) {  // Added prop
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleToggleThemeMode} sx={{ color: theme.palette.primary.main }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  // other allowed domains...
};

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    // other universities...
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const theme = useTheme(); // Using the external theme
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const generateChatId = () => uuidv4();

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, { state: { userName } });
            return;
          }
        }
      }
    }

    if (role === 'teacher') {
      navigate(`/dashboard/teacher/${uid}/${course_id}`, { state: { userName } });
    } else if (role === 'student') {
      navigate(`/dashboard/student/${uid}`, { state: { userName } });
    } else if (role === 'academic_advisor') {
      navigate(`/dashboard/academic-advisor/${uid}`, { state: { userName } });
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
            redirectBasedOnRole(userRole, userName, user.uid, university);

            login({ id: user.uid, name: userName, email: email, role: userRole });
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton onClick={handleDarkModeToggle} sx={{ color: theme.palette.primary.main }}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>Sign In</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading}
            >
              Sign In
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/


/*
// signIn.tsx
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

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
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    admin: 'Admin',
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile'),
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });

    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, 'courses', firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName },
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName },
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName },
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName },
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName },
      });
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions
              ? docSnap.data().chatsessions.slice(-1)[0]
              : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId),
              });

              await setDoc(doc(db, 'chatsessions', newChatId), {
                chat_id: newChatId,
                name: 'New chat',
                created_at: serverTimestamp(),
                modified_at: serverTimestamp(),
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile'),
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole,
            });
          } else {
            console.log('No such document!');
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later';
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />

        <IconButton
          onClick={handleDarkModeToggle}
          sx={{ color: theme.palette.primary.main }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            padding: 4,
            outline: 0,
            borderRadius: 3,
            boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: darkMode
              ? theme.palette.background.paper
              : theme.palette.background.default,
            color: darkMode
              ? theme.palette.text.primary
              : theme.palette.text.primary,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are
                required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}></Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed *
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
      </Box>
    </Container>
  );
}
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  mit: [
    /^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  lasell: [
    /^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  oakland: [
    /^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  arizona: [
    /^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  uci: [
    /^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  ucidavis: [
    /^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  cornell: [
    /^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [
    /^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  stanford: [
    /^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeley: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  miami: [
    /^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  admin: [
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    admin: 'Admin',
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });

    if (subdomain === 'admin') {
      navigate(`/dashboard/admin`, { state: { userName } });
      return;
    }

    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed *
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/


/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  mit: [
    /^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  lasell: [
    /^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  oakland: [
    /^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  arizona: [
    /^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  uci: [
    /^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  ucidavis: [
    /^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  cornell: [
    /^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeleycollege: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  brown: [
    /^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  stanford: [
    /^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  berkeley: [
    /^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  miami: [
    /^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  admin: [
  /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    mit: 'MIT',
    lasell: 'Lasell',
    oakland: 'Oakland',
    arizona: 'Arizona',
    uci: 'Uci',
    ucdavis: 'Ucdavis',
    cornell: 'Cornell',
    berkeleycollege: 'BerkeleyCollege',
    brown: 'Brown',
    stanford: 'Stanford',
    berkeley: 'Berkeley',
    miami: 'Miami',
    usyd: 'Usyd',
    columbia: 'Columbia'
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true); // Start loading

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
      setIsLoading(false); // Stop loading if errors exist
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          setIsLoading(false); // Stop loading on error
          console.log(error.code, error.message);
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
              disabled={isLoading} // Disable button while loading
            >
              Sign In
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
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/* Add Google Sign In Button if needed 
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/



/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId, studentProfile) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);
    localStorage.setItem('student_profile', JSON.stringify(studentProfile));

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university'),
      student_profile: localStorage.getItem('student_profile')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;
            const studentProfile = docSnap.data().student_profile;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              localStorage.setItem('student_profile', JSON.stringify(studentProfile));

              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university'),
                student_profile: localStorage.getItem('student_profile')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId, studentProfile);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor/${uid}`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor/${uid}`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  /*
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };
  

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/*
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [
    /^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  harvard: [
    /^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i,
    /^.+@my-lucy\.com$/i,
  ],
  // Ajouter d'autres sous-domaines et leurs domaines autorisés ici
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const universityNames = {
    upenn: 'Upenn',
    harvard: 'Harvard',
    // Ajouter d'autres sous-domaines et leurs noms ici
  };

  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register`;
};

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
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
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  /*
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };
  

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
             
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            {/*
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href={`/auth/sign-up${course_id ? `/${course_id}` : ''}`} variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/





/*
//DERNIERE MISE À JOUR AVEC LE DERNIER CHAT_ID ET LE PREMIER COURSE_ID (ACADEMIC ADVISOR) - À MODIFIER LORSQU'ON PRENDRA EN COMPTE LA MODIFICATION DES MESSAGES ET LE LIEN ENTRE LE CHAT_ID ET LE COURSE_ID
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, firstCourseId, lastChatId) => {
    const subdomain = config.subdomain;
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', firstCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain;
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const firstCourseId = docSnap.data().courses ? docSnap.data().courses[0] : null; // First course ID
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, firstCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/





/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, lastCourseId, lastChatId) => {
    const subdomain = config.subdomain
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = config.subdomain
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/







/* Problème avec le chat_id et le course_id
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  /*
  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };
  
  
  

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, lastCourseId, lastChatId) => {
    //const subdomain = getSubdomain();
    const subdomain = config.subdomain
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);
    localStorage.setItem('university', subdomain);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id'),
      university: localStorage.getItem('university')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    //const subdomain = getSubdomain();
    const subdomain = config.subdomain
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              localStorage.setItem('university', config.subdomain);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id'),
                university: localStorage.getItem('university')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }







  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            localStorage.setItem('university', config.subdomain);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id'),
              university: localStorage.getItem('university')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/











//Ancien code qui marche - dans le code du dessus, on va ajouter l'enregistrement de l'université dans le localStorage lorsqu'on est connecté
/*
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../auth/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import './signUp.css';
import lucyLogo from '../logo_lucy.png';
import { v4 as uuidv4 } from 'uuid';

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { course_id } = useParams();
  const [errors, setErrors] = React.useState({});

  const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };

  const generateChatId = () => {
    let chatId = uuidv4(); // Generate a unique chat ID
    return chatId;
  };

  const checkLocalStorage = (user, role, name, university, lastCourseId, lastChatId) => {
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify({ id: user.uid, name, email: user.email, role }));
    localStorage.setItem('course_id', lastCourseId);
    localStorage.setItem('chat_id', lastChatId);

    console.log('Stored in localStorage:', {
      isAuth: localStorage.getItem('isAuth'),
      user: localStorage.getItem('user'),
      course_id: localStorage.getItem('course_id'),
      chat_id: localStorage.getItem('chat_id')
    });
  };

  const redirectBasedOnRole = async (role, userName, uid, university) => {
    const subdomain = getSubdomain();
    console.log('Redirect based on role:', { role, userName, uid, university, subdomain });
    if (subdomain !== university) {
      setErrors({ university: `You need to log in to the ${university} portal` });
      return;
    }

    if (!course_id) {
      if (role === 'teacher') {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses;
          if (courses && courses.length > 0) {
            const firstCourseId = courses[0];

            // Fetch pinecone_index_name from the courses collection
            const courseDocRef = doc(db, "courses", firstCourseId);
            const courseDocSnap = await getDoc(courseDocRef);
            if (courseDocSnap.exists()) {
              const pineconeIndexName = courseDocSnap.data()['pinecone-index'];
              localStorage.setItem('pinecone_index_name', pineconeIndexName);
            }

            console.log('Navigating to teacher dashboard with firstCourseId:', firstCourseId);
            navigate(`/dashboard/teacher/${uid}/${firstCourseId}`, {
              state: { userName }
            });
            return;
          }
        }
      } else if (role === 'academic_advisor') {
        console.log('Navigating to academic advisor dashboard');
        navigate(`/dashboard/academic-advisor`, {
          state: { userName }
        });
        return;
      }
    }

    if (role === 'teacher') {
      console.log('Navigating to teacher dashboard with course_id:', course_id);
      navigate(`/dashboard/teacher/${uid}/${course_id}`, {
        state: { userName }
      });
    } else if (role === 'student') {
      console.log('Navigating to student dashboard');
      navigate(`/dashboard/student/${uid}`, {
        state: { userName }
      });
    } else if (role === 'academic_advisor') {
      console.log('Navigating to academic advisor dashboard');
      navigate(`/dashboard/academic-advisor`, {
        state: { userName }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({})

    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            const userName = docSnap.data().name;
            const university = docSnap.data().university;
            const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
            const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

            if (course_id && userRole === 'student') {
              const newChatId = generateChatId();
              await updateDoc(docRef, {
                courses: arrayUnion(course_id),
                chatsessions: arrayUnion(newChatId)
              });

              // Add the chat session document to the chatsessions collection
              await setDoc(doc(db, "chatsessions", newChatId), {
                chat_id: newChatId,
                name: "New chat",
                created_at: serverTimestamp(),
                modified_at: serverTimestamp()
              });

              localStorage.setItem('course_id', course_id);
              localStorage.setItem('chat_id', newChatId);
              console.log('Stored in localStorage:', {
                isAuth: localStorage.getItem('isAuth'),
                user: localStorage.getItem('user'),
                course_id: localStorage.getItem('course_id'),
                chat_id: localStorage.getItem('chat_id')
              });
              redirectBasedOnRole(userRole, userName, user.uid, university);
            } else {
              checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
              redirectBasedOnRole(userRole, userName, user.uid, university);
            }

            login({
              id: user.uid,
              name: userName,
              email: email,
              role: userRole
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-credential') {
            newErrors.email = 'Invalid email and/or password';
            newErrors.password = 'Invalid email and/or password';
          } else if (error.code === 'auth/too-many-requests') {
            newErrors.email = 'Account access blocked! Try again later'
          }
          setErrors(newErrors);
          console.log(error.code, error.message);
        });
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userRole = docSnap.data().role;
          const userName = user.displayName;
          const university = docSnap.data().university;
          const lastCourseId = docSnap.data().courses ? docSnap.data().courses.slice(-1)[0] : null;
          const lastChatId = docSnap.data().chatsessions ? docSnap.data().chatsessions.slice(-1)[0] : null;

          if (course_id && userRole === 'student') {
            const newChatId = generateChatId();
            await updateDoc(docRef, {
              courses: arrayUnion(course_id),
              chatsessions: arrayUnion(newChatId)
            });

            // Add the chat session document to the chatsessions collection
            await setDoc(doc(db, "chatsessions", newChatId), {
              chat_id: newChatId,
              name: "New chat",
              created_at: serverTimestamp(),
              modified_at: serverTimestamp()
            });

            localStorage.setItem('course_id', course_id);
            localStorage.setItem('chat_id', newChatId);
            console.log('Stored in localStorage:', {
              isAuth: localStorage.getItem('isAuth'),
              user: localStorage.getItem('user'),
              course_id: localStorage.getItem('course_id'),
              chat_id: localStorage.getItem('chat_id')
            });
            redirectBasedOnRole(userRole, userName, user.uid, university);
          } else {
            checkLocalStorage(user, userRole, userName, university, lastCourseId, lastChatId);
            redirectBasedOnRole(userRole, userName, user.uid, university);
          }

          login({
            id: user.uid,
            name: userName,
            email: user.email,
            role: userRole
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log(error.code, error.message);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={theme.logo} alt="University Logo" className="h-12 w-auto" />
      </Box>

      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: 4, outline: 0, borderRadius: 3, boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                Sign In
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography style={{ fontWeight: '800', fontSize: '1rem' }}>
                For the purpose of industry regulation, your details are required.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                InputProps={{ sx: { borderRadius: 6 } }}
              />
            </Grid>
          </Grid>
          {errors.university && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.university}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, padding: 1.5, borderRadius: 5, width: '50%' }}
            >
              Sign In
            </Button>
          </Box>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Or log in with
            </Typography>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>
            <Button
              onClick={handleGoogleSignIn}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: '5px 15px',
                textTransform: 'none',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                },
              }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </Box>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/auth/sign-up" variant="body2">
                Don't have an account yet? Create one now!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: theme.spacing(2),
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 5,
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          powered by Lucy
        </Typography>
        <Avatar
          src={lucyLogo}
          alt="Lucy Logo"
          sx={{ width: 20, height: 20 }}
        />
      </Box>
    </Container>
  );
}
*/
