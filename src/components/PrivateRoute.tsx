import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore'; // Importer le store Zustand
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute: React.FC = () => {
    // Utiliser useAuthStore pour récupérer l'état
    const { isAuthenticated: isAuth, isLoading: loading, user } = useAuthStore(); 
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
    // On vérifie `isAuth` qui vient maintenant du store
    if (!isAuth) {
        console.log("PrivateRoute: Utilisateur non authentifié (isAuth=", isAuth, "), redirection vers /auth/sign-in.");
        // Redirige vers sign-in mais garde la location d'origine pour un potentiel retour
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    // Redirige depuis `/` vers le tableau de bord de l'utilisateur si authentifié
    if (location.pathname === '/' && user?.id) {
        console.log(`PrivateRoute: Redirection de '/' vers /onboarding-with-lucy/${user.id}`);
        return <Navigate to={`/onboarding-with-lucy/${user.id}`} replace />;
    }
    
    // Si l'utilisateur est authentifié et n'est pas sur `/` ou si la redirection n'est pas nécessaire
    console.log("PrivateRoute: Utilisateur authentifié (isAuth=", isAuth, "), accès aux routes protégées.");
    return <Outlet />; // Affiche le composant enfant correspondant à la route
};

export default PrivateRoute;

