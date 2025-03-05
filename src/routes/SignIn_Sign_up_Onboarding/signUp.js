import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, OAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { auth, db } from '../../auth/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import lucyLogo from '../../logo_lucy.png';
import config from '../../config';
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";


const isEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
  harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
  mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
  lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
  oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
  arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
  uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
  ucdavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
  cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeleycollege: [/^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i, /^.+@my-lucy\.com$/i],
  brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
  stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
  berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
  miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
  usyd: [/^.+@([a-zA-Z0-9._-]+\.)*usyd\.edu$/i, /^.+@my-lucy\.com$/i],
  columbia: [/^.+@([a-zA-Z0-9._-]+\.)*columbia\.edu$/i, /^.+@my-lucy\.com$/i],
  drexel: [/^.+@([a-zA-Z0-9._-]+\.)*drexel\.edu$/i, /^.+@my-lucy\.com$/i],
  temple: [/^.+@([a-zA-Z0-9._-]+\.)*temple\.edu$/i, /^.+@my-lucy\.com$/i],
  psu: [/^.+@([a-zA-Z0-9._-]+\.)*psu\.edu$/i, /^.+@my-lucy\.com$/i],
  ccp: [/^.+@([a-zA-Z0-9._-]+\.)*ccp\.edu$/i, /^.+@my-lucy\.com$/i],
  holyfamily: [/^.+@([a-zA-Z0-9._-]+\.)*holyfamily\.edu$/i, /^.+@my-lucy\.com$/i],
  lehigh: [/^.+@([a-zA-Z0-9._-]+\.)*lehigh\.edu$/i, /^.+@my-lucy\.com$/i],
  purdue: [/^.+@([a-zA-Z0-9._-]+\.)*purdue\.edu$/i, /^.+@my-lucy\.com$/i],
  hofstra: [/^.+@([a-zA-Z0-9._-]+\.)*hofstra\.edu$/i, /^.+@my-lucy\.com$/i],
  case: [/^.+@([a-zA-Z0-9._-]+\.)*case\.edu$/i, /^.+@my-lucy\.com$/i],
  usc: [/^.+@([a-zA-Z0-9._-]+\.)*usc\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i]
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
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
  return `Only ${universityNames[subdomain] || 'email addresses from allowed domains'} can register.`;
};

export default function SignUp() {
  const theme = useTheme();
  const { login } = useAuth(); // Utiliser la fonction `login` du contexte
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const subdomain = config.subdomain;
  const courseId = location.pathname.split('/sign-up/')[1] || '';
  const provider = new OAuthProvider("oidc.holyfamily"); // 🔥 Utiliser le Provider ID configuré dans Firebase
  const auth = getAuth(); // Récupère directement l'instance Firebase Auth





  async function signInWithSSO() {
    try {
      console.log("🚀 Début du processus de connexion SSO...");
  
      // 🔥 Récupérer le sous-domaine (université)
      const university = config.subdomain;
      console.log("🔍 Université détectée :", university);
  
      if (!university) {
        console.error("❌ Erreur : Université non reconnue.");
        return;
      }
  
      // 🔥 Construire dynamiquement le provider Firebase
      const providerId = `oidc.${university}`;
      console.log("🛠️ Construction du provider Firebase avec OIDC :", providerId);
  
      const provider = new OAuthProvider(providerId);
  
      console.log("🔄 Début de l'authentification avec Firebase...");
  
      // 🔥 Démarrer l'authentification avec Firebase
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      console.log("✅ Utilisateur connecté via SSO :", user.email, " | UID :", user.uid);
  
      // 🔥 Vérifier si l'utilisateur existe déjà dans Firestore
      const userRef = doc(db, "users", user.uid);
      console.log("📡 Vérification de l'existence de l'utilisateur dans Firestore...");
  
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.log("🆕 Nouvel utilisateur détecté. Création d'un compte Firestore...");
  
        // 🚀 Nouvel utilisateur → Création du compte Firestore et redirection vers onboarding
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          university,
          onboardingComplete: false,
          createdAt: new Date(),
        });
  
        console.log("✅ Compte Firestore créé avec succès.");
  
        // 🔥 Mettre à jour le contexte utilisateur avec useAuth
        login({
          id: user.uid,
          name: user.displayName || "",
          email: user.email,
          university,
          onboardingComplete: false,
        });
  
        console.log("🔄 Redirection vers l'onboarding...");
        navigate(`/onboarding/learningStyleSurvey`);
      } else {
        console.log("🔄 Utilisateur existant trouvé dans Firestore. Récupération des données...");
  
        // 🔥 Utilisateur existant → Récupérer ses infos et rediriger vers le dashboard
        const userData = userSnap.data();
        console.log("✅ Données utilisateur Firestore :", userData);
  
        login(userData);
        console.log("🔄 Redirection vers le dashboard...");
        navigate(`/dashboard/student/${user.uid}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion SSO :", error);
    }
  }
  


  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[Step 1] Form submission triggered");
    setErrors({});
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName');
    //const lastName = data.get('lastName');
    const email = data.get('email');
    const password = data.get('password');
    const newErrors = {};

    // Validation des champs
    if (!firstName) newErrors.firstName = 'First name is required';
    //if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!isAllowedEmail(email, subdomain)) newErrors.email = getErrorMessage(subdomain);
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      console.log("[Step 2] Validation errors:", newErrors);
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("[Step 3] Creating user with Firebase Authentication");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const timestamp = Timestamp.now();

      console.log("[Step 4] Storing user data in Firestore");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        //name: `${firstName} ${lastName}`,
        name: firstName,
        email,
        university: subdomain,
        role: subdomain === 'admin' ? "admin" : "student",
        createdAt: timestamp,
      });

      console.log("[Step 5] Updating context with user data");
      login({
        id: user.uid,
        name: firstName,
        email,
        university: subdomain,
        role: subdomain === 'admin' ? "admin" : "student",
        createdAt: timestamp,
      });

      console.log("[Step 6] Redirecting user to appropriate dashboard");
      const redirectUrl = subdomain === 'admin' ? '/dashboard/admin' : `/onboarding/learningStyleSurvey/${courseId || ''}`;
      navigate(redirectUrl);
    } catch (error) {
      console.error("[Error] An error occurred:", error);
      const newErrors = {};
      if (error.code === 'auth/email-already-in-use') {
        newErrors.email = 'Email address already in use!';
      }
      setErrors(newErrors);
      setIsLoading(false);
    }
  };

  const handleEmailBlur = (event) => {
    const email = event.target.value;
    if (!email) {
      setEmailError('');
    } else if (!isEmail(email)) {
      setEmailError('Please provide a valid email');
    } else if (!isAllowedEmail(email, subdomain)) {
      setEmailError(getErrorMessage(subdomain));
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4 flex items-center">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Create your account</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Welcome! Sign-up with your university credentials.</p>

        {/* Bouton SSO */}
        <button
          type="button"
          onClick={signInWithSSO}
          className="w-full flex items-center justify-center gap-3 py-2 bg-blue-600 text-white border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:ring focus:ring-blue-300"
        >
          <AccountBalanceIcon sx={{ fontSize: 20 }} /> {/* Icône université */}
          <span className="font-medium">Sign Up with SSO</span>
        </button>

        {/* Séparateur avec "OR" */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-xs font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

      
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
          {subdomain === 'holyfamily' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="firstName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500" placeholder="First Name" />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>
          )}

            {/*
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="lastName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500" placeholder="Last Name" />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
            */}
          </div>
            
          {subdomain === 'holyfamily' && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" onBlur={handleEmailBlur} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500" placeholder="Email address" />
            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          )}
          
          {subdomain === 'holyfamily' && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500" placeholder="Password" />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          )}

          {subdomain === 'holyfamily' && (
          <button type="submit" disabled={isLoading} className="w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300">
            {isLoading ? <span>Loading...</span> : <span>Continue &rarr;</span>}
          </button>
          )}
        
          <p className="mt-8 text-xs text-center text-gray-600">Already have an account? <a href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} className="text-blue-600 hover:underline">Sign in</a></p>

          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-400 mr-2">Powered by Lucy</p>
            <Avatar
              src={lucyLogo}
              alt="Lucy Logo"
              sx={{ width: 20, height: 20 }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}