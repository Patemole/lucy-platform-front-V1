import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import LoadingScreen from './LoadingScreen';

const PrivateRoute: React.FC = () => {
    // Auth Store
    const { isAuthenticated: isAuth, isLoading: authLoading, user } = useAuthStore();
    
    // App Initialization Store
    const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);

    const location = useLocation();

    useEffect(() => {
        console.log("PrivateRoute: Current location:", location.pathname);
        console.log("PrivateRoute: Auth state:", { isAuth, authLoading, userId: user?.id });
        console.log("PrivateRoute: App initialization state:", { isAppInitialized });
    }, [location, isAuth, authLoading, user, isAppInitialized]);

    // 1. Afficher le loader pendant le chargement de l'authentification ou l'initialisation
    if (authLoading || !isAppInitialized) {
        return <LoadingScreen />;
    }

    // 2. Rediriger vers la connexion si non authentifié
    if (!isAuth) {
        console.log("PrivateRoute: Utilisateur non authentifié, redirection vers /auth/sign-in");
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    // 3. Rediriger depuis '/' vers le tableau de bord si authentifié
    if (location.pathname === '/' && user?.id) {
        console.log(`PrivateRoute: Redirection de '/' vers /onboarding-with-lucy/${user.id}`);
        return <Navigate to={`/onboarding-with-lucy/${user.id}`} replace />;
    }
    
    // 4. Rendre le contenu protégé si tout est prêt
    console.log("PrivateRoute: Tout est prêt, affichage du contenu protégé");
    return <Outlet />;
};

export default PrivateRoute;

