import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import getTheme from './themes';
import useAuthStore from './stores/useAuthStore'; // Importez le nouveau store
import { initializeAppLogic } from './initialization/initializeAppLogic';
import useChatStore from './stores/useChatStore'; // Potentiellement utile pour vérifier l'état du chat
import { useAppInitializationStore } from './stores/useAppInitializationStore'; // Pour vérifier l'état d'initialisation

//Main page
//import DashboardEleveTemplate from './routes/Dashboard_eleve_template';

//For the widget on the website
import WebChat from './routes/website_widget/WebChat';
import WebChatWIDGET from './routes/website_widget/WebWIDGETChat';


//Old Dashboard 
import FlagingDashboard from './routes/dashboard_for_university/FlagingDashboard'; //Dashboard for flagging student at risk
import DataSelectionPage from './routes/dashboard_for_university/DataSelectionPage'; //To select the data that you want
import EnrollmentDashboard from './routes/dashboard_for_university/EnrollmentDashboard'; //Dashboard for the enrollment 
import SignUpEnrollment from './routes/SignIn_Sign_up_Onboarding/signUp_Enrollment';

//For Founders analytics
import UserAnalytics from './routes/dashboard_for_admin/User_analytics';

//Utilies
import NotFound from './routes/utilities/NotFound';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config';

//Sign in Sign-up, onboarding
import SignIn from './routes/SignIn_Sign_up_Onboarding/signIn';
import SignUp from './routes/SignIn_Sign_up_Onboarding/signUp';
import OnboardingPage from './routes/SignIn_Sign_up_Onboarding/onboardingPage';
import ResetPassword from "./routes/SignIn_Sign_up_Onboarding/ResetPassword";
import LtiLogin from "./routes/SignIn_Sign_up_Onboarding/LtiLogin";
import UniversityWaitlist from "./routes/SignIn_Sign_up_Onboarding/UniversityWaitlist";
import OnboardingLucyQuestions from "./routes/chat/onboardingLucyQuestions";

//Compliance document pages
import DataPrivacy from './routes/compliance_document/DataPrivacy';
import CookiePolicy from './routes/compliance_document/CookiePolicy';


const App: React.FC = () => {
    const subdomain = config.subdomain || 'default';

    // State to manage theme mode (light/dark)
    const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
    const theme = useMemo(() => getTheme(subdomain, themeMode), [subdomain, themeMode]);

    // --- Utiliser l'état d'initialisation depuis le store ---
    const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);
    const setAppInitialized = useAppInitializationStore((state) => state.setAppInitialized);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
            favicon.href = theme.logo; // Update favicon based on the theme
            console.log("App: Favicon mis à jour.");
        }
    }, [theme]);

    // Function to toggle theme mode
    const handleToggleThemeMode = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
        localStorage.setItem('themeMode', newMode);
        console.log(`App: Mode thème changé en ${newMode}.`);
    };

    // Composant pour gérer les routes animées
    const AnimatedRoutes: React.FC = () => {
        const location = useLocation(); // Obtenir la localisation actuelle pour les transitions

        return (
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/auth/sign-in" element={<SignIn handleToggleThemeMode={handleToggleThemeMode} />} />
                    <Route path="/auth/sign-up" element={<SignUp />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/lti-login" element={<LtiLogin />} />

                    <Route path="/auth/choose-your-university" element={<UniversityWaitlist />} />

                    <Route path="/chat" element={<WebChat />} />
                    <Route path="/chatWidget" element={<WebChatWIDGET />} />

                    <Route path="/auth/sign-up/enrollment" element={<SignUpEnrollment />} />

                    <Route path="/dashboard/admin" element={<UserAnalytics />} />

                    <Route path="/dataprivacy" element={<DataPrivacy />} />
                    <Route path="/cookiepolicy" element={< CookiePolicy/>} />

                    
                    <Route path="/" element={<PrivateRoute />}>
                        {/*<Route path="/dashboard/student/:uid" element={<DashboardEleveTemplate />} />*/}
             
                        <Route path="/onboarding/learningStyleSurvey" element={<OnboardingPage />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<OnboardingPage />} />
                        <Route path="/onboarding-with-lucy/:uid" element={<OnboardingLucyQuestions />} />
        
                        <Route path="/dashboard/academic-advisor/:uid" element={<FlagingDashboard />} />
                        <Route path="/dashboard/enrollment/:uid" element={<EnrollmentDashboard />} />
                        <Route path="/dataselection/academic-advisor/:uid" element={<DataSelectionPage />} />


                        <Route path="*" element={<NotFound />} /> {/* Catch all route */}
                    </Route>
                </Routes>
            </AnimatePresence>
        );
    };

    // Récupère la fonction d'initialisation depuis le store
    const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);
    const isLoadingAuth = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // ... récupérez d'autres états/actions si nécessaire ici ...
    const logoutUser = useAuthStore((state) => state.logoutUser);
    const user = useAuthStore((state) => state.user);
   
    useEffect(() => {
        // Appelle l'initialisation de l'écouteur Firebase au montage de l'App
        const unsubscribe = initializeAuthListener();

        // Nettoie l'écouteur lors du démontage de l'App
        return () => {
            console.log("App: Nettoyage de l'écouteur Firebase Auth.");
            unsubscribe();
        };
    }, [initializeAuthListener]); // Dépendance pour s'assurer qu'elle n'est appelée qu'une fois


    // ✨ NOUVEAU useEffect pour déclencher l'initialisation de l'application ✨
    useEffect(() => {
        // Conditions pour lancer l'initialisation :
        // ...
        // Revenu à la condition initiale simple
        const basicUserDataIsReady = !!user?.id && user.chatsessions !== undefined; // <--- Revert ici

        // Récupérer l'état actuel du chat store pour potentiellement vérifier plus tard
        const currentChatIdFromStore = useChatStore.getState().currentChatId;

        if (!isLoadingAuth && isAuthenticated && basicUserDataIsReady && !isAppInitialized) {
            console.log("App: Conditions remplies (version initiale). Déclenchement de initializeAppLogic...");
            // IMPORTANT: Marquer comme initialisé AVANT l'appel asynchrone pour éviter les appels multiples.
            setAppInitialized(true);

            initializeAppLogic()
                .then(() => {
                    console.log("App: initializeAppLogic terminée avec succès.");
                    // Optionnel: Vérifier si le store de chat a été correctement mis à jour après initializeAppLogic
                    const finalChatId = useChatStore.getState().currentChatId;
                    console.log(`App: Chat ID after init: ${finalChatId}`);
                    // Si finalChatId est null alors qu'un chat aurait dû être chargé,
                    // cela peut indiquer que les chatIds n'étaient pas à jour au début de initializeAppLogic.
                })
                .catch((error) => {
                    console.error("App: Erreur pendant initializeAppLogic:", error);
                    // En cas d'erreur, il peut être pertinent de remettre isAppInitialized à false
                    // pour permettre une nouvelle tentative ou signaler l'erreur.
                    // setAppInitialized(false); // Décommentez si nécessaire
                });
        } else if (!isAuthenticated && isAppInitialized) {
             // Réinitialiser le flag si l'utilisateur se déconnecte
             console.log("App: Utilisateur déconnecté. Réinitialisation du flag isAppInitialized.");
             setAppInitialized(false); // Utiliser l'action du store
        }
        // Ajouter setAppInitialized aux dépendances si votre linter le demande,
        // mais cela ne devrait pas changer le comportement ici.
    }, [isLoadingAuth, isAuthenticated, user, isAppInitialized, setAppInitialized]);

    // Affiche un indicateur de chargement pendant l'initialisation de l'auth
    if (isLoadingAuth) {
        return <div>Chargement de l'authentification...</div>; // Ou un spinner, etc.
    }

    // Ajout du flag ici
    const future = { v7_startTransition: true };

    return (
        <ThemeProvider theme={theme}>
            <ErrorBoundary>
                <Router future={future}>
                    <AnimatedRoutes />
                </Router>
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default App;