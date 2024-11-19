import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute: React.FC = () => {
    const { isAuth, loading, user } = useAuth(); // Utilisez `user` depuis le contexte
    const location = useLocation();

    useEffect(() => {
        console.log("PrivateRoute: Current location:", location.pathname);
    }, [location]);

    console.log("PrivateRoute: isAuth =", isAuth, ", loading =", loading);

    // Affiche un loader pendant le chargement
    if (loading) {
        console.log("PrivateRoute: Chargement en cours, affichage du loader.");
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Redirige si l'utilisateur n'est pas authentifié
    if (!isAuth || !user) {
        console.log("PrivateRoute: Utilisateur non authentifié, redirection vers /auth/sign-in.");
        return <Navigate to="/auth/sign-in" />;
    }

    // Redirige depuis `/` vers le tableau de bord de l'utilisateur
    if (location.pathname === '/') {
        if (user?.id) {
            console.log(`PrivateRoute: Redirection vers /dashboard/student/${user.id}`);
            return <Navigate to={`/dashboard/student/${user.id}`} />;
        } else {
            console.log("PrivateRoute: UID non disponible, redirection vers /auth/sign-in.");
            return <Navigate to="/auth/sign-in" />;
        }
    }

    console.log("PrivateRoute: Utilisateur authentifié, accès aux routes protégées.");
    return <Outlet />;
};

export default PrivateRoute;

/*
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute: React.FC = () => {
    const { isAuth, loading, user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        console.log("PrivateRoute: Current location:", location.pathname);
    }, [location]);

    console.log("PrivateRoute: isAuth =", isAuth, ", loading =", loading);

    if (loading) {
        console.log("PrivateRoute: Chargement en cours, affichage du loader.");
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuth) {
        console.log("PrivateRoute: Utilisateur non authentifié, redirection vers /auth/sign-in.");
        return <Navigate to="/auth/sign-in" />;
    }

    if (location.pathname === '/') {
        // Check if the user exists in localStorage and parse it safely
        const storedUser = localStorage.getItem('user');
        const uid = storedUser ? JSON.parse(storedUser).id : '';

        if (uid) {
            console.log(`PrivateRoute: Redirection vers /dashboard/student/${uid}`);
            return <Navigate to={`/dashboard/student/${uid}`} />;
        } else {
            console.log("PrivateRoute: UID non disponible, redirection vers /auth/sign-in.");
            return <Navigate to="/auth/sign-in" />;
        }
    }

    console.log("PrivateRoute: Utilisateur authentifié, accès aux routes protégées.");
    return <Outlet />;
};

export default PrivateRoute;
*/





/*
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute: React.FC = () => {
    const { isAuth, loading } = useAuth();

    console.log("PrivateRoute: isAuth =", isAuth, ", loading =", loading);

    if (loading) {
        console.log("PrivateRoute: Chargement en cours, affichage du loader.");
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuth) {
        console.log("PrivateRoute: Utilisateur non authentifié, redirection vers /auth/sign-in.");
        return <Navigate to="/auth/sign-in" />;
    }

    console.log("PrivateRoute: Utilisateur authentifié, accès aux routes protégées.");
    return <Outlet />;
};

export default PrivateRoute;
*/



/*
import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../auth/context/AuthContext';

const PrivateRoute = () => {
  const { isAuth, user, setUser, setIsAuth } = useContext(AuthContext);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAuth = localStorage.getItem('isAuth') === 'true';

    console.log("PrivateRoute useEffect: storedUser:", storedUser, "storedIsAuth:", storedIsAuth);

    if (storedUser && storedIsAuth) {
      setUser(JSON.parse(storedUser));
      setIsAuth(true);
    }
  }, [setUser, setIsAuth]);

  console.log("PrivateRoute: isAuth:", isAuth, "user:", user);

  
  if (!isAuth || !user) {
    console.log("PrivateRoute: Not authenticated, redirecting to /auth/sign-in");
    return <Navigate to="/auth/sign-in" />;
  }

  console.log("PrivateRoute: Authenticated, rendering Outlet");
  return <Outlet />;
};

export default PrivateRoute;
*/