import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import getTheme from './themes';
import Dashboard_teacher_template from './routes/Dashboard_teacher_template';
import Dashboard_eleve_template from './routes/Dashboard_eleve_template';
import WebChat from './routes/WebChat';
import WebChatWIDGET from './routes/WebWIDGETChat';
import Course_selection_eleve_template from './routes/Course_selection_eleve_template';
import Schedule_eleve_template from './routes/Schedule_eleve_template';
import Dashboard_academic_advisor from './routes/Dashboard_academic_advisor';
import StudentProfile from './routes/StudentProfile';
import FlagingDashboard from './routes/FlagingDashboard';
import EnrollmentDashboard from './routes/EnrollmentDashboard';
import Student_list_academic_advisor from './routes/Student_list_academic_advisor';
import Dashboard_admin from './routes/Dashboard_admin';
import Dashboard_Dashboard from './routes/Dashboard_Dashboard';
import Dashboard_Calendar from './routes/Dashboard_Calendar';
import User_analytics from './routes/User_analytics';
//import Dashboard_Calendar_Kanban from './routes/Dashboard_Calendar_Kanban'
import Dashboard_feedback_admin from './routes/Dashboard_feedback_admin';
import AcademicAdvisorContact from './routes/Academic_advisor_contact';
import About from './routes/about';
import Analytics_eleve_template from './routes/analytics_student';
import LearningStyleSurveyTeacher from './routes/learningStyleSurvey_teacher';
import Chat_academic_advisor from './routes/chat_academic_advisor';
import SignIn from './routes/signIn';
import SignUp from './routes/signUp';
import TrustPage from './routes/trust';
import TrustControlPage from './routes/trust_controls';
import SignUp_academic_advisor from './routes/signUp_academic_advisor';
import SignUp_enrollment from './routes/signUp_Enrollment';
import DataSelectionPage from './routes/DataSelectionPage';
import SignUp_admin from './routes/signUp_admin';
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import DashboardAAchat from './routes/DashboardAAchat';
import AllStudentTable from './routes/AllStudentTable';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './auth/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config';
import NotFound from './routes/NotFound';
import StudentProfilePage from './routes/StudentProfilePage';

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
                    <Route path="/auth/sign-up/academic_advisor" element={<SignUp_academic_advisor />} />
                    <Route path="/chat" element={<WebChat />} />
                    <Route path="/chatWidget" element={<WebChatWIDGET />} />
                    <Route path="/auth/sign-up/enrollment" element={<SignUp_enrollment />} />
                    <Route path="/overview" element={<TrustPage />} />
                    <Route path="/controls" element={<TrustControlPage />} />
                    <Route path="/dashboard/admin" element={<User_analytics />} />

                    <Route path="/" element={<PrivateRoute />}>
                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
                        <Route path="/dashboard/dashboard/student/:uid" element={<Dashboard_Dashboard />} />

                        <Route path="/dashboard/calendar/student/:uid" element={<Dashboard_Calendar />} />

                        <Route path="/profile/student/:userId" element={<StudentProfile />} />
                        <Route path="/dashboard/academic-advisor/chat/:uid" element={<DashboardAAchat />} />
                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />
                        <Route path="/dashboard/admin" element={<Dashboard_admin />} />
                        <Route path="/dashboard/academic-advisor/:uid" element={<FlagingDashboard />} />
                        <Route path="/dashboard/enrollment/:uid" element={<EnrollmentDashboard />} />
                        <Route path="/dashboard/academic-advisor/all_profile/:uid" element={<AllStudentTable />} />
                        <Route path="/dashboard/academic-advisor/student_profile/:uid" element={<StudentProfilePage />} />
                        <Route path="/dataselection/academic-advisor/:uid" element={<DataSelectionPage />} />
                        <Route path="/about" element={<About />} />
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