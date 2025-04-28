import * as React from 'react';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  OAuthProvider,
  signInWithPopup,
  AuthErrorCodes // Import specific error codes for better handling
} from 'firebase/auth';
import { auth, db } from '../../auth/firebase';
import { doc, setDoc, getDoc, Timestamp, serverTimestamp, updateDoc } from 'firebase/firestore';
import useAuthStore from '../../stores/useAuthStore'; // Import the Zustand store
import useChatStore from '../../stores/useChatStore'; // Import the Chat store
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import lucyLogo from '../../logo_lucy.png';
import config from '../../config';
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { v4 as uuidv4 } from 'uuid';
import { useRef } from 'react';
import { sendUserInfoLinkedInScraping } from '../../api/auth_and_onboarding';


const isEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const allowedDomains = {
  upenn: [/^.+@.+$/i],
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
  brynmawr: [/^.+@([a-zA-Z0-9._-]+\.)*brynmawr\.edu$/i, /^.+@my-lucy\.com$/i],
  charteroak: [/^.+@([a-zA-Z0-9._-]+\.)*charteroak\.edu$/i, /^.+@my-lucy\.com$/i],
  yale: [/^.+@([a-zA-Z0-9._-]+\.)*yale\.edu$/i, /^.+@my-lucy\.com$/i],
  kedge: [/^.+@([a-zA-Z0-9._-]+\.)*kedge\.edu$/i, /^.+@my-lucy\.com$/i],
  admin: [/^.+@my-lucy\.com$/i]
};

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
  const isKedge = subdomain === 'kedge';
  const universityNames = {
    upenn: 'Upenn email',
    yale: 'Yale email',
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
    charteroak: 'Charter Oak email',
    brynmawr: 'Bryn Mawr email',
    admin: 'Admin email',
    kedge: 'Kedge email'
  };

  const baseMessage = isKedge ? "Seuls les e-mails" : "Only";
  const suffixMessage = isKedge ? "peuvent s'inscrire" : "email addresses from allowed domains can register";
  const universityName = universityNames[subdomain] || "";
  const emailWord = isKedge ? "e-mail" : "email";

  if (universityNames[subdomain]) {
    return `${baseMessage} ${universityName} ${emailWord} ${suffixMessage}`.trim();
  } else {
    return isKedge ? "Seuls les e-mails des domaines autorisés peuvent s'inscrire" : "Only email addresses from allowed domains can register";
  }
};

export default function SignUp() {
  console.log('<<< RENDERING SignUp >>>');
  const [errors, setErrors] = React.useState({});
  const [emailError, setEmailError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSSOLoading, setIsSSOLoading] = React.useState(false);

  const { user, setUser } = useAuthStore();
  const isLoadingAuth = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const subdomain = config.subdomain;
  const isKedge = subdomain === 'kedge';
  const courseId = location.pathname.split('/sign-up/')[1] || '';

  const [shouldRedirect, setShouldRedirect] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user && shouldRedirect) {
      console.log("[SignUp Page] User authenticated via useEffect (using Zustand state), redirecting...");
      navigate(`/onboarding-with-lucy/${user?.id || 'defaultId'}`, { replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, user?.id, shouldRedirect, navigate]);

  
  async function handleSignUpWithSSO() {
    console.log("🚀 [SSO Harmonisée - SignUp] Début du processus de connexion/inscription SSO...");
    setShouldRedirect(false);
    setErrors({});
    setIsSSOLoading(true);
    setIsLoading(false);

    try {
      const university = config.subdomain;
      console.log("🔍 [SSO Harmonisée - SignUp] Université détectée :", university);

      if (!university) {
        throw new Error("Université non reconnue (subdomain manquant).");
      }

      const providerId = `oidc.${university}`;
      console.log("🛠️ [SSO Harmonisée - SignUp] Construction du provider Firebase avec OIDC :", providerId);
      const provider = new OAuthProvider(providerId);

      console.log("🔄 [SSO Harmonisée - SignUp] Début de l'authentification Firebase Popup...");
      const result = await signInWithPopup(auth, provider);
      const ssoUser = result.user;

      let firstName = '';
      let lastName = '';

      try {
        const credential = OAuthProvider.credentialFromResult(result);
        if (credential?.idToken) {
          const payload = JSON.parse(atob(credential.idToken.split('.')[1]));
          console.log("📝 [SSO Harmonisée - SignUp] Payload OIDC:", payload);
          
          // Extraire le prénom et le nom du payload OIDC
          firstName = payload.given_name || '';
          lastName = payload.family_name || '';
        }
      } catch (tokenError) {
        console.warn("⚠️ [SSO Harmonisée - SignUp] Impossible de parser les détails du token OIDC:", tokenError);
      }

      console.log("✅ [SSO Harmonisée - SignUp] Utilisateur connecté via SSO :", ssoUser.email, "| UID :", ssoUser.uid);

      const userRef = doc(db, "users", ssoUser.uid);
      console.log("📡 [SSO Harmonisée - SignUp] Vérification de l'existence Firestore...");
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("🆕 [SSO Harmonisée - SignUp] Nouvel utilisateur détecté. Création Firestore...");
        const initialChatId = uuidv4();
        const currentTime = serverTimestamp();

        const newUserFirestoreData = {
          uid: ssoUser.uid,
          email: ssoUser.email || '',
          name: ssoUser.displayName || "New User",
          university,
          role: university === 'admin' ? 'admin' : 'student',
          onboardingComplete: false,
          createdAt: currentTime,
          chatsessions: [initialChatId],
          major: [], minor: [], interests: [], year: null, faculty: [], linkedin_profile: null,
        };
        await setDoc(userRef, newUserFirestoreData);

        const chatDocRef = doc(db, "chatsessions", initialChatId);
        const initialChatData = {
          chat_id: initialChatId,
          name: `${newUserFirestoreData.name} Onboarding`,
          created_at: currentTime,
          modified_at: currentTime,
          is_private: true,
          user_ids: [ssoUser.uid],
          last_message_preview: "Welcome! Let's get you started.",
          university: university,
          thread_type: 'Private',
          topic: 'Onboarding',
        };
        await setDoc(chatDocRef, initialChatData);

        // ---> AJOUT : Mise à jour optimiste de l'état du chat store <---
        useChatStore.setState({
          currentChatId: initialChatId,
          messages: [], // Nouvelle conversation, pas de messages initiaux à afficher
          isLoadingMessages: false,
          isSocialThreadActive: false,
          isCurrentChatPrivate: true, // <-- Force l'état privé !
          isLandingPageVisible: false, // On va direct sur le chat (ou la page qui l'affichera)
        });
        console.log(`[SSO Harmonisée - SignUp] Optimistically set chat store state for onboarding chat ${initialChatId} (private).`);
        // ---> FIN AJOUT <---

        // Mettre à jour le store avec les données initiales
        const userForStore = {
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
          linkedin_profile: null,
          createdAt: new Date(),
          chatsessions: newUserFirestoreData.chatsessions,
        };
        setUser(userForStore);

        // Lancer la requête LinkedIn en parallèle
        sendUserInfoLinkedInScraping({
          firstName,
          lastName,
          university,
          userId: ssoUser.uid
        }).then(linkedInFound => {
          // Mettre à jour Firestore quand la réponse arrive
          updateDoc(userRef, { linkedin_profile: linkedInFound });
          
          // Mettre à jour le store local si l'utilisateur est toujours connecté
          const currentUser = useAuthStore.getState().user;
          if (currentUser && currentUser.id === ssoUser.uid) {
            useAuthStore.getState().setUser({
              ...currentUser,
              linkedin_profile: linkedInFound
            });
          }
        }).catch(error => {
          console.error("Erreur lors de la vérification LinkedIn:", error);
        });

      } else {
        console.log("🔄 [SSO Harmonisée - SignUp] Utilisateur existant trouvé. Récupération Firestore...");
        const userData = userSnap.data();
        console.log("✅ [SSO Harmonisée - SignUp] Données Firestore existantes:", userData);

        const userForStore = {
          id: userData.uid || ssoUser.uid,
          email: userData.email || ssoUser.email || '',
          name: userData.name || ssoUser.displayName || "",
          university: userData.university || university,
          onboardingComplete: userData.onboardingComplete !== undefined ? userData.onboardingComplete : true,
          role: userData.role || (university === 'admin' ? 'admin' : 'student'),
          major: userData.major || [],
          minor: userData.minor || [],
          interests: userData.interests || [],
          year: userData.year || null,
          faculty: userData.faculty || [],
          linkedin_profile: userData.linkedin_profile || null,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
          chatsessions: userData.chatsessions || [],
        };
        setUser(userForStore);
        console.log("🔄 [SSO Harmonisée - SignUp] Store Zustand mis à jour pour l'utilisateur existant.");
      }

    } catch (error) {
      console.error("❌ [SSO Harmonisée - SignUp] Erreur lors de la connexion/inscription SSO:", error);
      const ssoErrorMessage = isKedge ? `Échec de l'inscription / connexion SSO. Veuillez réessayer. (${error.code || error.message})` : `Sign Up / Sign In with SSO failed. Please try again. (${error.code || error.message})`;
      setErrors({ general: ssoErrorMessage });
    } finally {
      setIsSSOLoading(false);
      setShouldRedirect(true);
      console.log("🏁 [SSO Harmonisée - SignUp] Processus terminé. Redirection useEffect réactivée.");
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setEmailError('');
    setIsLoading(true);
    setIsSSOLoading(false);
    console.log("[Step 1] Email/Password form submission initiated.");

    const data = new FormData(event.currentTarget);
    const firstName = data.get('firstName')?.toString().trim() || '';
    const lastName = data.get('firstName')?.toString().trim() || '';
    const email = data.get('email')?.toString().trim() || '';
    const password = data.get('password')?.toString() || '';

    const newErrors = {};
    if (!firstName) newErrors.firstName = isKedge ? 'Le prénom est requis' : 'First name is required';
    if (!email) {
        newErrors.email = isKedge ? 'L\'e-mail est requis' : 'Email is required';
    } else if (!isEmail(email)) {
        newErrors.email = isKedge ? 'Veuillez fournir une adresse e-mail valide' : 'Please provide a valid email address';
    } else if (!isAllowedEmail(email, subdomain)) {
        newErrors.email = getErrorMessage(subdomain);
    }
    if (!password) {
        newErrors.password = isKedge ? 'Le mot de passe est requis' : 'Password is required';
    } else if (password.length < 6) {
        newErrors.password = isKedge ? 'Le mot de passe doit comporter au moins 6 caractères' : 'Password must be at least 6 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      console.warn("[Step 2] Validation errors found:", newErrors);
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("[Step 3] Creating user with Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const timestamp = Timestamp.now();
      console.log(`✅ Firebase Auth user created: ${newUser.email} (UID: ${newUser.uid})`);

      console.log("[Step 4] Creating initial chat session ID...");
      const chatId = uuidv4();

      console.log("[Step 5] Creating Firestore documents (user and chat session)...");
      const userDocRef = doc(db, "users", newUser.uid);
      const userData = {
        uid: newUser.uid,
        name: firstName,
        email: email,
        university: subdomain,
        role: subdomain === 'admin' ? "admin" : "student",
        createdAt: timestamp,
        onboardingComplete: false,
        chatsessions: [chatId],
        major: [], minor: [], interests: [], year: null, faculty: [], linkedin_profile: null,
      };
      await setDoc(userDocRef, userData);

      const chatDocRef = doc(db, "chatsessions", chatId);
      const chatData = {
        chat_id: chatId,
        name: `${firstName} Onboarding`,
        created_at: timestamp,
        modified_at: timestamp,
        is_private: true,
        user_ids: [newUser.uid],
        last_message_preview: "Welcome! Let's get you started.",
        university: subdomain,
        thread_type: 'Private',
        topic: 'Onboarding',
      };
      await setDoc(chatDocRef, chatData);
      console.log("✅ Firestore documents created manually.");

      // ---> AJOUT : Mise à jour optimiste de l'état du chat store <---
      useChatStore.setState({
        currentChatId: chatId,
        messages: [], // Nouvelle conversation, pas de messages initiaux à afficher
        isLoadingMessages: false,
        isSocialThreadActive: false,
        isCurrentChatPrivate: true, // <-- Force l'état privé !
        isLandingPageVisible: false // On va direct sur le chat
      });
      console.log(`[Step 6] Optimistically set chat store state for onboarding chat ${chatId} (private).`);
      // ---> FIN AJOUT <---

      // Lancer la requête LinkedIn en parallèle
      sendUserInfoLinkedInScraping({
        firstName,
        lastName,
        university: subdomain,
        userId: newUser.uid
      }).then(linkedInFound => {
        // Mettre à jour Firestore quand la réponse arrive
        updateDoc(userDocRef, { linkedin_profile: linkedInFound });
        
        // Mettre à jour le store local si l'utilisateur est toujours connecté
        const currentUser = useAuthStore.getState().user;
        if (currentUser && currentUser.id === newUser.uid) {
          useAuthStore.getState().setUser({
            ...currentUser,
            linkedin_profile: linkedInFound
          });
        }
      }).catch(error => {
        console.error("Erreur lors de la vérification LinkedIn:", error);
      });

      console.log(`[Step 7] Navigating to onboarding page for user ${newUser.uid}...`);
      setTimeout(() => {
        navigate(`/onboarding-with-lucy/${newUser.uid}`, { replace: true });
      }, 300);

    } catch (error) {
      console.error("❌ Sign Up failed:", error);
      const newErrors = {};
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        newErrors.email = isKedge ? 'Cette adresse e-mail est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse e-mail.' : 'This email address is already in use. Please sign in or use a different email.';
      } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
         newErrors.password = isKedge ? 'Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.' : 'Password is too weak. Please use a stronger password.';
      } else {
        newErrors.general = isKedge ? `Échec de l'inscription. Veuillez réessayer. (${error.code || error.message})` : `Sign Up failed. Please try again. (${error.code || error.message})`;
      }
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailBlur = (event) => {
    const email = event.target.value.trim();
    if (!email) {
      setEmailError('');
    } else if (!isEmail(email)) {
      setEmailError(isKedge ? 'Veuillez fournir une adresse e-mail valide' : 'Please provide a valid email address');
    } else if (!isAllowedEmail(email, subdomain)) {
      setEmailError(getErrorMessage(subdomain));
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <header aria-label="University branding" className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </header>

      <main className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4" role="main">
        <h1 className="text-xl font-semibold text-center mb-4">
          {isKedge ? 'Créez votre compte' : 'Create your account'}
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          {isKedge ? 'Bienvenue ! Inscrivez-vous avec vos identifiants universitaires.' : 'Welcome! Sign-up with your university credentials.'}
        </p>

        {/* Afficher le bouton SSO uniquement pour holyfamily (ou kedge commenté) */}
        {subdomain === 'holyfamily' /* || subdomain === 'kedge' */ && (
          <button
            type="button"
            onClick={handleSignUpWithSSO}
            disabled={isLoading || isSSOLoading}
            className={`w-full flex items-center justify-center gap-3 py-2 bg-blue-600 text-white border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:ring focus:ring-blue-300 ${isLoading || isSSOLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <AccountBalanceIcon sx={{ fontSize: 20 }} />
            {isSSOLoading ? <CircularProgress size={20} color="inherit" /> : (isKedge ? 'S\'inscrire avec SSO' : 'Sign Up with SSO')}
          </button>
        )}

        {/* Afficher le séparateur "OR" uniquement pour holyfamily (ou kedge commenté) */}
        {subdomain === 'holyfamily' /* || subdomain === 'kedge' */ && (
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-xs font-semibold">
              {isKedge ? 'OU' : 'OR'}
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Afficher l'erreur générale seulement si le formulaire email/pwd est visible */}
          {errors.general && subdomain !== 'holyfamily' /* && subdomain !== 'kedge' */ && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mb-4 text-center">{errors.general}</p>}

          {/* Cacher le formulaire email/password si holyfamily (ou kedge commenté) */}
          {subdomain !== 'holyfamily' /* && subdomain !== 'kedge' */ && (
            <>
              <div className="mb-6">
                <label htmlFor="firstname" className="block text-xs font-medium text-gray-700 mb-1">
                  {isKedge ? 'Prénom' : 'First Name'}
                </label>
                <input
                  id="firstname"
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                  placeholder={isKedge ? 'Prénom' : 'First Name'}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstname-error" : undefined}
                />
                {errors.firstName && <p id="firstname-error" role="alert" className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  {isKedge ? 'Adresse e-mail' : 'Email Address'}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  onBlur={handleEmailBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                  placeholder={isKedge ? 'Votre adresse e-mail universitaire' : 'Your university email address'}
                  aria-invalid={!!errors.email || !!emailError}
                  aria-describedby={errors.email ? "email-error-submit" : (emailError ? "email-error-blur" : undefined)}
                />
                {emailError && <p id="email-error-blur" role="alert" className="text-xs text-red-600 mt-1">{emailError}</p>}
                {errors.email && !emailError && <p id="email-error-submit" role="alert" className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  {isKedge ? 'Mot de passe' : 'Password'}
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
                  placeholder={isKedge ? 'Créez un mot de passe (6 caractères min.)' : 'Create a password (min. 6 characters)'}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && <p id="password-error" role="alert" className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || isSSOLoading}
                className={`w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 transition duration-150 ease-in-out ${isLoading || isSSOLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : (isKedge ? 'Continuer \u2192' : 'Continue \u2192')}
              </button>
            </>
          )}

          <p className="mt-8 text-xs text-center text-gray-600">
            {isKedge ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
            <a href={`/auth/sign-in${courseId ? `/${courseId}` : ''}`} className="text-blue-600 underline hover:text-blue-800">
              {isKedge ? 'Se connecter' : 'Sign in'}
            </a>
          </p>

          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-600 mr-2">
              {isKedge ? 'Propulsé par Lucy' : 'Powered by Lucy'}
            </p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>
      </main>
    </div>
  );
}