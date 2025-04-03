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
            console.log(`PrivateRoute: Redirection vers /onboarding-with-lucy/${user.id}`);
            return <Navigate to={`/onboarding-with-lucy/${user.id}`} />;
        } else {
            console.log("PrivateRoute: UID non disponible, redirection vers /auth/sign-in.");
            return <Navigate to="/auth/sign-in" />;
        }
    }

    console.log("PrivateRoute: Utilisateur authentifié, accès aux routes protégées.");
    return <Outlet />;
};

export default PrivateRoute;

