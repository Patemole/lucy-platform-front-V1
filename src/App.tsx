import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
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
import SignUp_enrollment from './routes/signUp_Enrollment'
import DataSelectionPage from './routes/DataSelectionPage';
import SignUp_admin from './routes/signUp_admin';
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import DashboardAAchat from './routes/DashboardAAchat'
import AllStudentTable from './routes/AllStudentTable'
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './auth/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config';
import { useAuth } from './auth/hooks/useAuth';
import NotFound from './routes/NotFound';
import StudentProfilePage from './routes/StudentProfilePage'

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

    // Get uid from localStorage
    const uid = localStorage.getItem('uid') || '';

    const getPublicRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'drexel':
            case 'temple':
            case 'admin':
            case 'trust':
                console.log(`App: Chargement des routes publiques pour le sous-domaine ${subdomain}.`);
                return (
                    <>
                        <Route path="/overview" element={<TrustPage />} />
                        <Route path="/controls" element={<TrustControlPage />} />
                        <Route path="/auth/sign-up" element={<SignUp />} />
                        <Route path="/auth/sign-up/academic_advisor" element={<SignUp_academic_advisor />} />
                        <Route path="/auth/sign-up/admin" element={<SignUp_admin />} />
                        <Route path="/auth/sign-up/:course_id" element={<SignUp />} />
                        <Route path="/auth/sign-in" element={<SignIn handleToggleThemeMode={handleToggleThemeMode} />} />
                        <Route path="/auth/sign-in/:course_id" element={<SignIn handleToggleThemeMode={handleToggleThemeMode} />} />
                    </>
                );
            default:
                console.log(`App: Sous-domaine inconnu ${subdomain}, redirection vers /notfound.`);
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    const getPrivateRoutesForSubdomain = (subdomain: string) => {
        const uid = localStorage.getItem('uid') || '';
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'drexel':
            case 'temple':
            case 'admin':
            case 'trust':
                console.log(`App: Chargement des routes privées pour le sous-domaine ${subdomain}.`);
                return (
                    <>
                        <Route path="/overview" element={<TrustPage />} />
                        <Route path="/onboarding/choose-role" element={<ChooseRole />} />

                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />

                        <Route path="/onboarding/course-creation" element={<LearningStyleSurveyTeacher />} />
                        <Route path="/dashboard/teacher/:uid/:course_id" element={<Dashboard_teacher_template />} />

                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />

                        <Route path="/dashboard/student/course_selection/:uid" element={<Course_selection_eleve_template />} />
                        <Route path="/dashboard/student/schedule/:uid" element={<Schedule_eleve_template />} />
                        <Route path="/dashboard/analytics" element={<Analytics_eleve_template />} />
                        <Route path="/dashboard/academic-advisor/:uid" element={<Dashboard_academic_advisor />} />

                        <Route path="/dashboard/academic-advisor/:uid" element={<FlagingDashboard />} />


                        <Route path="/onboarding/student-list/:uid" element={<Student_list_academic_advisor />} />
                        <Route path="/dashboard/admin" element={<Dashboard_admin />} />
                        <Route path="/dashboard/admin/feedback" element={<Dashboard_feedback_admin />} />
                        <Route path="/chat/academic-advisor/:uid" element={<Chat_academic_advisor />} />
                        <Route path="/contact/academic_advisor" element={<AcademicAdvisorContact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/" element={<Navigate to={`/dashboard/student/${uid}`} />} />
                    </>
                );
            default:
                console.log(`App: Sous-domaine inconnu ${subdomain}, redirection vers /notfound.`);
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <ErrorBoundary>
                    <Router>
                        <Routes>
                            <Route path="/auth/sign-in" element={<SignIn handleToggleThemeMode={handleToggleThemeMode} />} />
                            <Route path="/auth/sign-up" element={<SignUp />} />
                            <Route path="/auth/sign-up/academic_advisor" element={<SignUp_academic_advisor />} />
                            <Route path="/chat" element={<WebChat />} />
                            <Route path="/chatWidget" element={<WebChatWIDGET />} />
                            <Route path="/auth/sign-up/enrollment" element={<SignUp_enrollment />} />
                            <Route path="/overview" element={<TrustPage />} />
                            <Route path="/controls" element={<TrustControlPage />} />

                            <Route path="/" element={<PrivateRoute />}>
                                <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
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
                    </Router>
                </ErrorBoundary>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;




/*
import React, { useMemo, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import getTheme, { toggleThemeMode } from './themes';  // Import toggleThemeMode to switch between themes
import Dashboard_teacher_template from './routes/Dashboard_teacher_template';
import Dashboard_eleve_template from './routes/Dashboard_eleve_template';
import Dashboard_academic_advisor from './routes/Dashboard_academic_advisor';
import Dashboard_admin from './routes/Dashboard_admin';
import AcademicAdvisorContact from './routes/Academic_advisor_contact';
import About from './routes/about';
import Analytics_eleve_template from './routes/analytics_student';
import LearningStyleSurveyTeacher from './routes/learningStyleSurvey_teacher';
import Chat_academic_advisor from './routes/chat_academic_advisor';
import SignIn from './routes/signIn';
import SignUp from './routes/signUp';
import SignUp_academic_advisor from './routes/signUp_academic_advisor';
import SignUp_admin from './routes/signUp_admin';
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './auth/context/AuthContext';
import config from './config';

const App: React.FC = () => {
    const { isAuth, user } = useContext(AuthContext);
    const subdomain = config.subdomain || 'default';

    // State to manage theme mode (light/dark)
    const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');

    const theme = useMemo(() => getTheme(subdomain, themeMode), [subdomain, themeMode]);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
            favicon.href = theme.logo; // Update favicon based on the theme
        }
    }, [theme]);

    // Function to toggle theme mode
    const handleToggleThemeMode = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    const getPublicRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'admin':
                return (
                    <>
                        <Route path={`/auth/sign-up`} element={<SignUp />} />
                        <Route path={`/auth/sign-up/academic_advisor`} element={<SignUp_academic_advisor />} />
                        <Route path={`/auth/sign-up/admin`} element={<SignUp_admin />} />
                        <Route path={`/auth/sign-up/:course_id`} element={<SignUp />} />
                        <Route path={`/auth/sign-in`} element={<SignIn />} />
                        <Route path={`/auth/sign-in/:course_id`} element={<SignIn />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    const getPrivateRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'admin':
                return (
                    <>
                        <Route path="/onboarding/choose-role" element={<ChooseRole />} />
                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/course-creation" element={<LearningStyleSurveyTeacher />} />
                        <Route path="/dashboard/teacher/:uid/:course_id" element={<Dashboard_teacher_template />} />
                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
                        <Route path="/dashboard/analytics" element={<Analytics_eleve_template />} />
                        <Route path="/dashboard/academic-advisor/:uid" element={<Dashboard_academic_advisor />} />
                        <Route path="/dashboard/admin" element={<Dashboard_admin />} />
                        <Route path="/chat/academic-advisor/:uid" element={<Chat_academic_advisor />} />
                        <Route path="/contact/academic_advisor" element={<AcademicAdvisorContact />} />
                        <Route path="/about" element={<About />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    {getPublicRoutesForSubdomain(subdomain)}
                    <Route path={`/`} element={<PrivateRoute />}>
                        {getPrivateRoutesForSubdomain(subdomain)}
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
*/


/*
import React, { useMemo, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './themes';

import Dashboard_teacher_template from './routes/Dashboard_teacher_template';
import Dashboard_eleve_template from './routes/Dashboard_eleve_template';
import Dashboard_academic_advisor from './routes/Dashboard_academic_advisor';
import Dashboard_admin from './routes/Dashboard_admin';
import AcademicAdvisorContact from './routes/Academic_advisor_contact';
import About from './routes/about'; 
import Analytics_eleve_template from './routes/analytics_student';
import LearningStyleSurveyTeacher from './routes/learningStyleSurvey_teacher';
import Chat_academic_advisor from './routes/chat_academic_advisor';
import SignIn from './routes/signIn';
import SignUp from './routes/signUp';
import SignUp_academic_advisor from './routes/signUp_academic_advisor'; 
import SignUp_admin from './routes/signUp_admin'
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './auth/context/AuthContext';
import config from './config';

const App: React.FC = () => {
    const { isAuth, user } = useContext(AuthContext);

    console.log("App: isAuth:", isAuth, "user:", user);

    const subdomain = config.subdomain || 'default';

    const theme = useMemo(() => getTheme(subdomain), [subdomain]);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
            favicon.href = theme.logo; // Mise à jour de l'icône en fonction du thème
        }
    }, [theme]);

    const getPublicRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'admin':
                return (
                    <>
                        <Route path={`/auth/sign-up`} element={<SignUp />} />
                        <Route path={`/auth/sign-up/academic_advisor`} element={<SignUp_academic_advisor />} />
                        <Route path={`/auth/sign-up/admin`} element={<SignUp_admin />} />
                        <Route path={`/auth/sign-up/:course_id`} element={<SignUp />} />
                        <Route path={`/auth/sign-in`} element={<SignIn />} />
                        <Route path={`/auth/sign-in/:course_id`} element={<SignIn />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    const getPrivateRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oakland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'miami':
            case 'admin':
                return (
                    <>
                        <Route path="/onboarding/choose-role" element={<ChooseRole />} />
                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/course-creation" element={<LearningStyleSurveyTeacher />} />
                        <Route path="/dashboard/teacher/:uid/:course_id" element={<Dashboard_teacher_template />} />
                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
                        <Route path="/dashboard/analytics" element={<Analytics_eleve_template />} />
                        <Route path="/dashboard/academic-advisor/:uid" element={<Dashboard_academic_advisor />} />
                        <Route path="/dashboard/admin" element={<Dashboard_admin />} />
                        <Route path="/chat/academic-advisor/:uid" element={<Chat_academic_advisor />} />
                        <Route path="/contact/academic_advisor" element={<AcademicAdvisorContact />} />
                        <Route path="/about" element={<About />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    {getPublicRoutesForSubdomain(subdomain)}
                    <Route path={`/`} element={<PrivateRoute />}>
                        {getPrivateRoutesForSubdomain(subdomain)}
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;

*/


/*
import React, { useMemo, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './themes';

import Dashboard_teacher_template from './routes/Dashboard_teacher_template';
import Dashboard_eleve_template from './routes/Dashboard_eleve_template';
import Dashboard_academic_advisor from './routes/Dashboard_academic_advisor';
import AcademicAdvisorContact from './routes/Academic_advisor_contact';
import About from './routes/about'; 
import Analytics_eleve_template from './routes/analytics_student';
import LearningStyleSurveyTeacher from './routes/learningStyleSurvey_teacher';
import Chat_academic_advisor from './routes/chat_academic_advisor';
import SignIn from './routes/signIn';
import SignUp from './routes/signUp';
import SignUp_academic_advisor from './routes/signUp_academic_advisor'; 
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './auth/context/AuthContext';
import config from './config';



const App: React.FC = () => {
    const { isAuth, user } = useContext(AuthContext);

    console.log("App: isAuth:", isAuth, "user:", user);

    /*
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0]; // Supposons que le format est subdomain.localhost
    *
    const subdomain = config.subdomain || 'default';


    const theme = useMemo(() => getTheme(subdomain), [subdomain]);

    const getPublicRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oackland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'umiami':
                
                return (
                    <>
                        <Route path={`/auth/sign-up`} element={<SignUp />} />
                        <Route path={`/auth/sign-up/academic_advisor`} element={<SignUp_academic_advisor />} />
                        <Route path={`/auth/sign-up/:course_id`} element={<SignUp />} />
                        <Route path={`/auth/sign-in`} element={<SignIn />} />
                        <Route path={`/auth/sign-in/:course_id`} element={<SignIn />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    const getPrivateRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
            case 'columbia':
            case 'mit':
            case 'lasell':
            case 'oackland':
            case 'arizona':
            case 'uci':
            case 'ucdavis':
            case 'cornell':
            case 'berkeleycollege':
            case 'brown':
            case 'stanford':
            case 'berkeley':
            case 'umiami':
                return (
                    <>
                        <Route path="/onboarding/choose-role" element={<ChooseRole />} />

                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />

                        <Route path="/onboarding/course-creation" element={<LearningStyleSurveyTeacher />} />

                        <Route path="/dashboard/teacher/:uid/:course_id" element={<Dashboard_teacher_template />} />

                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
                        <Route path="/dashboard/analytics" element={<Analytics_eleve_template />} />

                        <Route path="/dashboard/academic-advisor/:uid" element={<Dashboard_academic_advisor />} />

                        <Route path="/chat/academic-advisor/:uid" element={<Chat_academic_advisor />} />
                        
                        

                        <Route path="/contact/academic_advisor" element={<AcademicAdvisorContact />} />

                        <Route path="/about" element={<About />} />

                       
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/notfound" />} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    {getPublicRoutesForSubdomain(subdomain)}

                    <Route path={`/`} element={<PrivateRoute />}>
                        {getPrivateRoutesForSubdomain(subdomain)}
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
*/
