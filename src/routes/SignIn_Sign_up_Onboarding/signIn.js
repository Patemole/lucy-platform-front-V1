import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, OAuthProvider, signInWithPopup} from 'firebase/auth';
import { auth, db } from '../../auth/firebase';
import useAuthStore from '../../stores/useAuthStore'; // Importer le store Zustand
import { doc, setDoc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import lucyLogo from '../../logo_lucy.png';
import { motion } from 'framer-motion'; // Framer Motion for animations
import config from '../../config';
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { v4 as uuidv4 } from 'uuid'; // <-- AJOUTER CET IMPORT


const allowedDomains = {
  upenn: [/^.+@.+$/i],
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
  brynmawr: [/^.+@([a-zA-Z0-9._-]+\.)*brynmawr\.edu$/i, /^.+@my-lucy\.com$/i],
  charteroak: [/^.+@([a-zA-Z0-9._-]+\.)*charteroak\.edu$/i, /^.+@my-lucy\.com$/i],
  yale: [/^.+@([a-zA-Z0-9._-]+\.)*yale\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i],
  kedge: [/^.+@([a-zA-Z0-9._-]+\.)*kedgebs\.com$/i, /^.+@my-lucy\.com$/i],
};

// Fonction pour obtenir les messages d'erreur par sous-domaine (EN/FR)
const getErrorMessage = (subdomain) => {
  const isKedge = subdomain === 'kedge';
  const universityNames = {
    upenn: 'Upenn email',
    harvard: 'Harvard email',
    yale: 'Yale email',
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
    charteroak: 'Charter Oak email',
    brynmawr: 'Bryn Mawr email',
    admin: 'Admin email',
    kedge: 'Kedge email'
  };

  const baseMessage = isKedge ? "Seuls les e-mails" : "Only";
  const suffixMessage = isKedge ? "peuvent s'inscrire" : "email addresses from allowed domains can register";
  const universityName = universityNames[subdomain] || (isKedge ? "des domaines autorisés" : "");
  const emailWord = isKedge ? "e-mail" : "email";

  if (universityNames[subdomain]) {
    return `${baseMessage} ${universityName} ${emailWord} ${suffixMessage}`.trim();
  } else {
    return isKedge ? "Seuls les e-mails des domaines autorisés peuvent s'inscrire" : "Only email addresses from allowed domains can register";
  }
};


const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};


const SignIn = ({ handleToggleThemeMode }) => {
  const { isAuthenticated: isAuth, isLoading: loading, user, setUser } = useAuthStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const { referralCode } = useParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Tracks spinner in button
  const subdomain = config.subdomain;
  const isKedge = subdomain === 'kedge'; // Déterminer si Kedge pour les traductions
  const [shouldRedirect, setShouldRedirect] = useState(true); // Par défaut, on redirige

  // ============================================================
  //                FONCTION SSO HARMONISÉE
  // ============================================================
  async function signInWithSSO() {
    console.log("🚀 [SSO Harmonisée - SignIn] Début du processus de connexion/inscription SSO...");
    setShouldRedirect(false); // Désactive temporairement le useEffect pour éviter double redirection
    setErrors({}); // Reset errors

    try {
      const university = config.subdomain;
      console.log("🔍 [SSO Harmonisée - SignIn] Université détectée :", university);

      if (!university) {
        throw new Error("Université non reconnue (subdomain manquant).");
      }

      const providerId = `oidc.${university}`;
      console.log("🛠️ [SSO Harmonisée - SignIn] Construction du provider Firebase avec OIDC :", providerId);
      const provider = new OAuthProvider(providerId);

      console.log("🔄 [SSO Harmonisée - SignIn] Début de l'authentification Firebase Popup...");
      const result = await signInWithPopup(auth, provider);
      const ssoUser = result.user; // Utilisateur retourné par Firebase Auth

      // Debug: Log OIDC token details (facultatif mais utile)
      try {
        const credential = OAuthProvider.credentialFromResult(result);
        if (credential?.idToken) {
            const payload = JSON.parse(atob(credential.idToken.split('.')[1]));
            console.log("📝 [SSO Harmonisée - SignIn] Payload OIDC:", payload);
        }
      } catch (tokenError) {
          console.warn("⚠️ [SSO Harmonisée - SignIn] Impossible de parser les détails du token OIDC:", tokenError);
      }

      console.log("✅ [SSO Harmonisée - SignIn] Utilisateur connecté via SSO :", ssoUser.email, "| UID :", ssoUser.uid);

      // Vérifier l'existence dans Firestore
      const userRef = doc(db, "users", ssoUser.uid);
      console.log("📡 [SSO Harmonisée - SignIn] Vérification de l'existence Firestore...");
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // ---- CAS NOUVEL UTILISATEUR ----
        console.log("🆕 [SSO Harmonisée - SignIn] Nouvel utilisateur détecté. Création Firestore...");
        const initialChatId = uuidv4();
        const currentTime = serverTimestamp();

        // Créer le document utilisateur
        const newUserFirestoreData = {
          uid: ssoUser.uid,
          email: ssoUser.email || '',
          name: ssoUser.displayName || "New User", // Utiliser le displayName SSO ou un défaut
          university,
          role: university === 'admin' ? 'admin' : 'student', // Rôle basé sur l'université
          onboardingComplete: false, // Nouvel utilisateur -> onboarding nécessaire
          createdAt: currentTime,
          chatsessions: [initialChatId], // Ajouter le chat initial
          // Ajouter d'autres champs par défaut si nécessaire
          major: [], minor: [], interests: [], year: null, faculty: [], linkedin_profile: null,
        };
        await setDoc(userRef, newUserFirestoreData);

        // Créer le document chat initial
        const chatDocRef = doc(db, "chatsessions", initialChatId);
        const initialChatData = {
          chat_id: initialChatId,
          name: `${newUserFirestoreData.name} Onboarding`, // Nom basé sur le nom user
          created_at: currentTime,
          modified_at: currentTime,
          is_private: true, // Chat d'onboarding est privé
          user_ids: [ssoUser.uid], // Lié à l'utilisateur
          last_message_preview: "Welcome! Let's get you started.", // Peut être traduit plus tard si nécessaire
          university: university,
          thread_type: 'Private', // Type privé
          topic: 'Onboarding', // Peut être traduit plus tard si nécessaire
        };
        await setDoc(chatDocRef, initialChatData);

        console.log("✅ [SSO Harmonisée - SignIn] Firestore: Utilisateur et chat initial créés.");

        // Mettre à jour l'état Zustand avec les infos du NOUVEL utilisateur
        // Important : utiliser les données qu'on vient de mettre dans Firestore
        const userForStore/*: User*/ = {
          id: newUserFirestoreData.uid,
          email: newUserFirestoreData.email,
          name: newUserFirestoreData.name,
          university: newUserFirestoreData.university,
          onboardingComplete: newUserFirestoreData.onboardingComplete,
          role: newUserFirestoreData.role,
          major: newUserFirestoreData.major,
          minor: newUserFirestoreData.minor,
          interests: newUserFirestoreData.interests,
          year: newUserFirestoreData.year,
          faculty: newUserFirestoreData.faculty,
          linkedin_profile: newUserFirestoreData.linkedin_profile,
          createdAt: new Date(), // Approximation pour le store, Firestore a le vrai timestamp
          chatsessions: newUserFirestoreData.chatsessions,
          // S'assurer que tous les champs du type User sont présents
        };
        setUser(userForStore);
        console.log("🔄 [SSO Harmonisée - SignIn] Store Zustand mis à jour pour le nouvel utilisateur.");
        // PAS DE REDIRECTION ICI -> Laissé au useEffect global

      } else {
        // ---- CAS UTILISATEUR EXISTANT ----
        console.log("🔄 [SSO Harmonisée - SignIn] Utilisateur existant trouvé. Récupération Firestore...");
        const userData = userSnap.data();
        console.log("✅ [SSO Harmonisée - SignIn] Données Firestore existantes:", userData);

        // Mettre à jour l'état Zustand avec les infos de l'utilisateur EXISTANT
        const userForStore/*: User*/ = {
          id: userData.uid || ssoUser.uid, // Priorité Firestore
          email: userData.email || ssoUser.email || '', // Priorité Firestore
          name: userData.name || ssoUser.displayName || "", // Priorité Firestore
          university: userData.university || university, // Priorité Firestore
          onboardingComplete: userData.onboardingComplete !== undefined ? userData.onboardingComplete : true, // Default true si existant mais champ manquant
          role: userData.role || (university === 'admin' ? 'admin' : 'student'),
          major: userData.major || [],
          minor: userData.minor || [],
          interests: userData.interests || [],
          year: userData.year || null,
          faculty: userData.faculty || [],
          linkedin_profile: userData.linkedin_profile || null,
          // Conversion Timestamp Firestore -> Date JS pour le store
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
          chatsessions: userData.chatsessions || [],
          // S'assurer que tous les champs du type User sont présents
        };
        setUser(userForStore);
        console.log("🔄 [SSO Harmonisée - SignIn] Store Zustand mis à jour pour l'utilisateur existant.");
        // PAS DE REDIRECTION ICI -> Laissé au useEffect global
      }

    } catch (error) {
      console.error("❌ [SSO Harmonisée - SignIn] Erreur lors de la connexion/inscription SSO:", error);
      // Traduction de l'erreur générale SSO
      const ssoErrorMessage = isKedge ? `Échec SSO. Veuillez réessayer. (${error.code || error.message})` : `SSO failed. Please try again. (${error.code || error.message})`;
      setErrors({ general: ssoErrorMessage });
    } finally {
        // Important: Réactiver la redirection via useEffect après la tentative SSO
        setShouldRedirect(true);
        console.log("🏁 [SSO Harmonisée - SignIn] Processus terminé. Redirection useEffect réactivée.");
    }
  }
  // ============================================================
  //              FIN FONCTION SSO HARMONISÉE
  // ============================================================


  // Redirect if user is already authenticated (Utilise maintenant les états du store)
  useEffect(() => {
    // 'loading' correspond maintenant à isLoading du store
    if (!loading && isAuth && user && shouldRedirect) {
      console.log("User authenticated via useEffect (using Zustand state), redirecting...");
      console.log("user.id est", user?.id || 'defaultId');
      // Redirige vers l'onboarding, cohérent avec handleSubmit
      navigate(`/onboarding-with-lucy/${user?.id || 'defaultId'}`, { replace: true });
    }
  }, [loading, isAuth, user?.id, shouldRedirect, navigate]); //[loading, isAuth, user, shouldRedirect, navigate]





  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};
    if (!email) {
      newErrors.email = isKedge ? 'L\'e-mail est requis' : 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = isKedge ? 'Veuillez fournir une adresse e-mail valide' : 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = isKedge ? 'Le mot de passe est requis' : 'Password is required';
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
      console.log("Sign-in successful in manual, redirecting...");

      // La redirection se fait maintenant via le useEffect après la mise à jour de l'état par l'écouteur Firebase
      // navigate(`/onboarding-with-lucy/${result.user.uid || 'defaultId'}`, { replace: true });


    } catch (error) {
      const newErrors = {};
      if (error.code === 'auth/user-not-found') {
        newErrors.email = isKedge ? 'Aucun utilisateur trouvé avec cet e-mail' : 'No user found with this email';
      } else if (error.code === 'auth/wrong-password') {
        newErrors.password = isKedge ? 'Mot de passe incorrect' : 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        newErrors.email = isKedge ? 'Accès au compte bloqué ! Réessayez plus tard' : 'Account access blocked! Try again later';
      } else {
        // Utiliser errors.general pour les erreurs non spécifiques
        newErrors.general = isKedge ? 'Échec de la connexion. Veuillez vérifier vos identifiants.' : 'Login failed. Please check your credentials.';
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

      {/* header landmark */}
      <header aria-label="University branding" className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-16" />
      </header>


      <main className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4" role="main">
        <h1 className="text-xl font-semibold text-center mb-4">
          {isKedge ? 'Connectez-vous à votre compte' : 'Sign In to your account'}
        </h1>
        <p className="text-gray-500 text-center mb-5 text-sm">
          {isKedge ? 'Connectez-vous avec vos identifiants universitaires.' : 'Sign In with your university credentials.'}
        </p>

        {/* Afficher l'erreur générale SSO si elle existe */}
        {errors.general && (subdomain === 'holyfamily' || subdomain === 'kedge') && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mb-4 text-center">{errors.general}</p>}

        {/* Bouton SSO - Afficher uniquement pour holyfamily et kedge */}
        {(subdomain === 'holyfamily' || subdomain === 'kedge') && (
          <button
            type="button"
            onClick={signInWithSSO} // Utilise la nouvelle fonction SSO
            className="w-full flex items-center justify-center gap-3 py-2 bg-blue-600 text-white border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:ring focus:ring-blue-300"
          >
            <AccountBalanceIcon sx={{ fontSize: 20 }} /> {/* Icône université */}
            <span className="font-medium">
              {isKedge ? 'Se connecter avec SSO' : 'Sign In with SSO'}
            </span>
          </button>
        )}


        {/* Séparateur avec "OR" - N'afficher que si SSO est affiché (donc pour holyfamily ou kedge) */}
        {(subdomain === 'holyfamily' || subdomain === 'kedge') && (
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-xs font-semibold">
            {isKedge ? 'OU' : 'OR'}
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        )}


        <form onSubmit={handleSubmit} noValidate>
        {/* Afficher l'erreur générale Email/Password si elle existe */}
        {/* NOTE: On pourrait aussi cacher cette erreur si holyfamily/kedge est le seul moyen */}
        {errors.general && !(subdomain === 'holyfamily' || subdomain === 'kedge') && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mb-4 text-center">{errors.general}</p>}

        {/* Cacher le formulaire email/password si holyfamily ou kedge */}
        {!(subdomain === 'holyfamily' || subdomain === 'kedge') && (
          <>
            <div className="mb-6">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                {isKedge ? 'Adresse e-mail' : 'Email Address'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email} // Bind to state
                onChange={(e) => setEmail(e.target.value)} // x state
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                placeholder="Email address"
              />
              {errors.email && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password} // Bind to state
                onChange={(e) => setPassword(e.target.value)} // Update state
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                placeholder="Password"
              />
              {errors.password && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mt-1">{errors.password}</p>}
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

            <p className="mt-6 text-xs text-center text-gray-600">
              <a href="/auth/reset-password" className="text-blue-600 underline hover:underline">
                Forgot your password?
              </a>
            </p>
          </>
        )}

          {/* Traduction de la section "Don't have an account?" */}
          <p className="mt-5 text-xs text-center text-gray-600">
            {isKedge ? "Vous n'avez pas de compte ?" : "Don't have an account?"}{' '}
            <a href={`/auth/sign-up${referralCode ? `/${referralCode}` : ''}`} className="text-blue-600 underline hover:underline">
              {isKedge ? 'Inscrivez-vous !' : 'Sign up now!'}
            </a>
          </p>

          {/* Traduction de la section "Powered by Lucy" */}
          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-600 mr-2">
              {isKedge ? 'Lucy' : 'Powered by Lucy'}
            </p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>
      </main>
    </motion.div>
  );
};

export default SignIn;

