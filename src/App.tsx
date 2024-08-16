import React, { useMemo, useContext, useEffect } from 'react';
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
