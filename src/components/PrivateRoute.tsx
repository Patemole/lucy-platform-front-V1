import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import LoadingScreen from './LoadingScreen';

const PrivateRoute: React.FC = () => {
    // Auth Store
    const { isAuthenticated: isAuth, isLoading: authLoading, user } = useAuthStore();
    
    // Chat Store
    const {
        isLoadingConversations,
        isLoadingMessages,
        currentChatId,
        isLandingPageVisible,
    } = useChatStore();

    // App Initialization Store
    const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);

    const location = useLocation();

    useEffect(() => {
        console.log("PrivateRoute: Current location:", location.pathname);
        console.log("PrivateRoute: Auth state:", { isAuth, authLoading, userId: user?.id });
        console.log("PrivateRoute: Data loading state:", {
            isAppInitialized,
            isLoadingConversations,
            isLoadingMessages,
            currentChatId,
            isLandingPageVisible
        });
    }, [location, isAuth, authLoading, user, isAppInitialized, isLoadingConversations, isLoadingMessages, currentChatId, isLandingPageVisible]);

    // Vérifier si les données sont en cours de chargement
    const isDataLoading = !isAppInitialized || 
                         isLoadingConversations || 
                         (!isLandingPageVisible && isLoadingMessages);

    // 1. Afficher le loader pendant le chargement de l'authentification
    if (authLoading || isDataLoading) {
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

