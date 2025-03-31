import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import getTheme from './themes';

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
import { AuthProvider } from './auth/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config';

//Sign in Sign-up, onboarding
import SignIn from './routes/SignIn_Sign_up_Onboarding/signIn';
import SignUp from './routes/SignIn_Sign_up_Onboarding/signUp';
import OnboardingPage from './routes/SignIn_Sign_up_Onboarding/onboardingPage';
import ResetPassword from "./routes/SignIn_Sign_up_Onboarding/ResetPassword";
import LtiLogin from "./routes/SignIn_Sign_up_Onboarding/LtiLogin";
import UniversityWaitlist from "./routes/SignIn_Sign_up_Onboarding/UniversityWaitlist";
import OnboardingLucyQuestions from "./routes/SignIn_Sign_up_Onboarding/onboardingLucyQuestions";

//Compliance document pages
import DataPrivacy from './routes/compliance_document/DataPrivacy';
import CookiePolicy from './routes/compliance_document/CookiePolicy';


const App: React.FC = () => {
    const subdomain = config.subdomain || 'default';

    // State to manage theme mode (light/dark)
    const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
    const theme = useMemo(() => getTheme(subdomain, themeMode), [subdomain, themeMode]);

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

    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <ErrorBoundary>
                    <Router>
                        <AnimatedRoutes /> {/* Utilisation des routes animées */}
                    </Router>
                </ErrorBoundary>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;