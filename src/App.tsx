import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion'; // Pour les animations de transition entre les routes
import getTheme from './themes'; // Fonction pour obtenir le thème basé sur le sous-domaine et le mode (light/dark)
import useAuthStore from './stores/useAuthStore'; // Store Zustand pour la gestion de l'authentification
import { InitializeAppLogic } from './initialization/initializeAppLogic'; // Logique d'initialisation des données après connexion
import useChatStore from './stores/useChatStore'; // Store Zustand pour la gestion du chat
import { useAppInitializationStore } from './stores/useAppInitializationStore'; // Store Zustand pour suivre l'état d'initialisation de l'app

// --- Importation des composants de page (Routes) ---

// Page principale (Chat)
import WebChat from './routes/website_widget/WebChat';
import WebChatWIDGET from './routes/website_widget/WebWIDGETChat'; // Variante Widget

// Anciens Dashboards (potentiellement obsolètes ou spécifiques)
import FlagingDashboard from './routes/dashboard_for_university/FlagingDashboard';
import DataSelectionPage from './routes/dashboard_for_university/DataSelectionPage';
import EnrollmentDashboard from './routes/dashboard_for_university/EnrollmentDashboard';
import SignUpEnrollment from './routes/SignIn_Sign_up_Onboarding/signUp_Enrollment';

// Analytics pour les administrateurs/fondateurs
import UserAnalytics from './routes/dashboard_for_admin/User_analytics';

// Composants Utilitaires
import NotFound from './routes/utilities/NotFound'; // Page 404
import PrivateRoute from './components/PrivateRoute'; // Composant pour protéger les routes nécessitant une connexion
import ErrorBoundary from './components/ErrorBoundary'; // Composant pour attraper les erreurs JS dans l'arbre de composants
import config from './config'; // Fichier de configuration (pour sous-domaine, etc.)

// Pages d'authentification et d'Onboarding
import SignIn from './routes/SignIn_Sign_up_Onboarding/signIn';
import SignUp from './routes/SignIn_Sign_up_Onboarding/signUp';
import OnboardingPage from './routes/SignIn_Sign_up_Onboarding/onboardingPage'; // Questionnaire de style d'apprentissage
import ResetPassword from "./routes/SignIn_Sign_up_Onboarding/ResetPassword";
import LtiLogin from "./routes/SignIn_Sign_up_Onboarding/LtiLogin"; // Connexion via LTI
import UniversityWaitlist from "./routes/SignIn_Sign_up_Onboarding/UniversityWaitlist"; // Liste d'attente université
import OnboardingLucyQuestions from "./routes/chat/onboardingLucyQuestions"; // Onboarding spécifique via chat

// Pages de documents légaux
import DataPrivacy from './routes/compliance_document/DataPrivacy';
import CookiePolicy from './routes/compliance_document/CookiePolicy';

/**
 * Composant principal de l'application React.
 * Gère le thème, l'authentification, le routage et l'initialisation globale.
 */
const App: React.FC = () => {
    // Récupère le sous-domaine depuis la configuration (pour le thème spécifique)
    const subdomain = config.subdomain || 'default';

    // --- Gestion du Thème ---
    // State pour le mode du thème (light/dark), persisté dans localStorage
    const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
    // Calcule l'objet thème MUI à utiliser basé sur le sous-domaine et le mode actuel
    const theme = useMemo(() => getTheme(subdomain, themeMode), [subdomain, themeMode]);

    // --- Gestion de l'état d'initialisation de l'application ---
    // Utilise le store Zustand pour savoir si l'initialisation (chargement données post-auth) a eu lieu
    const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);
    const setAppInitialized = useAppInitializationStore((state) => state.setAppInitialized);

    // --- Effet pour mettre à jour le Favicon ---
    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
            favicon.href = theme.logo; // Met à jour l'icône en fonction du logo du thème actuel
            console.log("App: Favicon mis à jour.");
        }
    }, [theme]); // Se déclenche si l'objet thème change

    // --- Fonction pour basculer le mode du thème ---
    const handleToggleThemeMode = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode); // Met à jour le state local
        localStorage.setItem('themeMode', newMode); // Persiste dans localStorage
        console.log(`App: Mode thème changé en ${newMode}.`);
    };

    /**
     * Composant interne pour gérer les routes et leurs transitions animées.
     * Utilise AnimatePresence de framer-motion.
     */
    const AnimatedRoutes: React.FC = () => {
        const location = useLocation(); // Hook de react-router pour obtenir l'URL actuelle

        return (
            // `AnimatePresence` permet d'animer les composants lorsqu'ils entrent ou sortent du DOM
            <AnimatePresence mode="wait" initial={false}>
                 {/* Le conteneur `Routes` définit les différentes URL et les composants associés */}
                 {/* `location` et `key` sont passés pour qu'AnimatePresence détecte les changements de page */}
                <Routes location={location} key={location.pathname}>
                    {/* Routes publiques (Authentification, Pages légales) */}
                    <Route path="/auth/sign-in" element={<SignIn handleToggleThemeMode={handleToggleThemeMode} />} />
                    <Route path="/auth/sign-up" element={<SignUp />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/lti-login" element={<LtiLogin />} />
                    <Route path="/auth/choose-your-university" element={<UniversityWaitlist />} />
                    <Route path="/chatWidget" element={<WebChatWIDGET />} /> {/* Chat version Widget */}
                    <Route path="/auth/sign-up/enrollment" element={<SignUpEnrollment />} />
                    <Route path="/dashboard/admin" element={<UserAnalytics />} /> {/* Dashboard Admin */}
                    <Route path="/dataprivacy" element={<DataPrivacy />} />
                    <Route path="/cookiepolicy" element={< CookiePolicy/>} />


                    {/* Route principale du Chat (peut être privée ou publique selon la configuration) */}
                    {/* Note: La gestion public/privé est généralement faite DANS le composant WebChat lui-même ou via une logique externe */}
                    <Route path="/chat" element={<WebChat />} />


                    {/* Routes privées nécessitant une authentification */}
                    {/* `PrivateRoute` vérifie si l'utilisateur est connecté avant de rendre les composants enfants */}
                    <Route path="/" element={<PrivateRoute />}>
                        {/* Routes spécifiques après connexion */}
                        {/* <Route path="/dashboard/student/:uid" element={<DashboardEleveTemplate />} /> */} {/* Ancien dashboard étudiant ? */}
                        <Route path="/onboarding/learningStyleSurvey" element={<OnboardingPage />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<OnboardingPage />} />
                        <Route path="/onboarding-with-lucy/:uid" element={<OnboardingLucyQuestions />} />
                        <Route path="/dashboard/academic-advisor/:uid" element={<FlagingDashboard />} />
                        <Route path="/dashboard/enrollment/:uid" element={<EnrollmentDashboard />} />
                        <Route path="/dataselection/academic-advisor/:uid" element={<DataSelectionPage />} />

                        {/* Route fourre-tout pour les URL non définies DANS les routes privées */}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                     {/* Note: Une route '*' globale pourrait être placée ici si non gérée dans PrivateRoute */}
                </Routes>
            </AnimatePresence>
        );
    };

    // --- Gestion de l'Authentification ---
    // Récupère l'état et les actions liés à l'authentification depuis le store Zustand
    const initializeListeners = useAuthStore((state) => state.initializeListeners); // <-- Utiliser initializeListeners
    const isLoadingAuth = useAuthStore((state) => state.isLoading); // État: l'authentification initiale est-elle en cours ?
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // État: l'utilisateur est-il connecté ?
    const user = useAuthStore((state) => state.user); // Données de l'utilisateur connecté

    // --- Effet pour initialiser l'écouteur d'authentification au montage de l'application
    useEffect(() => {
        console.log("[App] Mounting... Initializing Firebase listeners via useAuthStore.");
        // Lance l'initialisation et récupère la fonction pour arrêter l'écouteur d'authentification
        const unsubscribeAuth = initializeListeners();

        // Nettoie l'écouteur d'authentification lorsque le composant App est démonté
        return () => {
            console.log("[App] Unmounting... Cleaning up Firebase auth listener.");
            unsubscribeAuth();
        };
    }, [initializeListeners]); // Dépendance à initializeListeners

    // --- Effet pour déclencher l'initialisation de la logique applicative post-authentification ---
    // Cet état local va contrôler si InitializeAppLogic doit être rendu
    const [shouldInitializeLogic, setShouldInitializeLogic] = useState(false);

    useEffect(() => {
        const isFetchingUserData = useAuthStore.getState().isFetchingUserData;
        const canInitialize = 
            !isLoadingAuth && 
            isAuthenticated && 
            !isFetchingUserData && 
            user && 
            !isAppInitialized; // La condition principale

        if (canInitialize) {
            console.log("App: Conditions remplies pour l'initialisation. Rendu de InitializeAppLogic...");
            // On ne marque plus isAppInitialized ici, le composant InitializeAppLogic le fera
            // setAppInitialized(true);
            setShouldInitializeLogic(true); // Déclencher le rendu du composant d'initialisation

            // !! Suppression de l'appel direct et du .then/.catch !!
            /*
            initializeAppLogic()
                .then(() => {
                    console.log("App: initializeAppLogic terminée avec succès.");
                    const finalChatId = useChatStore.getState().currentChatId;
                    console.log(`App: Chat ID actif après initialisation: ${finalChatId}`);
                })
                .catch((error: any) => { // <-- Ajout du type ici
                    console.error("App: Erreur pendant initializeAppLogic:", error);
                });
            */
        } else if (!isAuthenticated && isAppInitialized) {
             console.log("App: Utilisateur déconnecté. Arrêt du rendu de InitializeAppLogic et réinitialisation.");
             setShouldInitializeLogic(false); // Arrêter le rendu
             setAppInitialized(false);
        } else if (!canInitialize && shouldInitializeLogic) {
             // Si les conditions ne sont plus remplies mais qu'on rendait le composant
             console.log("App: Conditions d'initialisation non remplies. Arrêt du rendu de InitializeAppLogic.");
             setShouldInitializeLogic(false);
        }

    }, [isLoadingAuth, isAuthenticated, user, isAppInitialized, setAppInitialized, shouldInitializeLogic]); // Ajouter shouldInitializeLogic aux dépendances

    // --- Affichage pendant le chargement initial de l'authentification ---
    if (isLoadingAuth) {
        // Affiche un simple message ou un composant Spinner pendant que Firebase vérifie l'état de connexion
        return <div>Chargement de l'authentification...</div>;
    }

    // Configuration pour react-router v6+ (gestion des transitions)
    const future = { v7_startTransition: true };

    // --- Rendu final du composant App ---
    return (
        // Fournit le thème MUI à tous les composants enfants
        <ThemeProvider theme={theme}>
             {/* Encapsule l'application dans un ErrorBoundary pour attraper les erreurs */}
            <ErrorBoundary>
                {/* Configure le routeur principal de l'application */}
                <Router future={future}>
                    {/* Rendre le composant d'initialisation s'il doit l'être */} 
                    {shouldInitializeLogic && <InitializeAppLogic />}
                    {/* Affiche les routes définies dans AnimatedRoutes */} 
                    <AnimatedRoutes />
                </Router>
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default App;