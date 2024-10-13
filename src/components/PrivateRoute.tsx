// src/components/PrivateRoute.tsx

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