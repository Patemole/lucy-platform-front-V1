//nouveau test
import React, { useMemo, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './themes';
import Chat_eleve from './routes/Chat_eleve';
import ScheduleMeeting from './routes/Schedule_meeting';

import Dashboard_teacher_template from './routes/Dashboard_teacher_template';
import Dashboard_eleve_template from './routes/Dashboard_eleve_template';
import Analytics_eleve_template from './routes/analytics_eleve_template';
import LearningStyleSurveyTeacher from './routes/learningStyleSurvey_teacher';
import SignIn from './routes/signIn';
import SignUp from './routes/signUp';
import ChooseRole from './routes/chooseRole';
import LearningStyleSurvey from './routes/learningStyleSurvey';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './auth/context/AuthContext';



const App: React.FC = () => {
    const { isAuth, user } = useContext(AuthContext);

    console.log("App: isAuth:", isAuth, "user:", user);

    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0]; // Supposons que le format est subdomain.localhost

    const theme = useMemo(() => getTheme(subdomain), [subdomain]);

    const getPublicRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
                return (
                    <>
                        <Route path={`/auth/sign-up`} element={<SignUp />} />
                        <Route path={`/auth/sign-up/:course_id`} element={<SignUp />} />
                        <Route path={`/auth/sign-in`} element={<SignIn />} />
                        <Route path={`/auth/sign-in/:course_id`} element={<SignIn />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/sign-in/admin" />} />;
        }
    };

    const getPrivateRoutesForSubdomain = (subdomain: string) => {
        switch (subdomain) {
            case 'upenn':
            case 'harvard':
            case 'usyd':
                return (
                    <>
                        <Route path="/onboarding/choose-role" element={<ChooseRole />} />

                        <Route path="/onboarding/learningStyleSurvey" element={<LearningStyleSurvey />} />
                        <Route path="/onboarding/learningStyleSurvey/:course_id" element={<LearningStyleSurvey />} />

                        <Route path="/onboarding/course-creation" element={<LearningStyleSurveyTeacher />} />

                        <Route path="/dashboard/teacher/:uid/:course_id" element={<Dashboard_teacher_template />} />

                        <Route path="/dashboard/student/:uid" element={<Dashboard_eleve_template />} />
                        <Route path="/dashboard/analytics" element={<Analytics_eleve_template />} />
                        
                        <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
                        <Route path="/" element={<Chat_eleve />} />
                    </>
                );
            default:
                return <Route path="*" element={<Navigate to="/sign-in/admin" />} />;
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

