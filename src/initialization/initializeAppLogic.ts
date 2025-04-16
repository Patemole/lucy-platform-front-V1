import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import { Unsubscribe } from 'firebase/firestore'; // Importer pour le type de retour de fetchSocialThreads
import React, { useRef, useEffect } from 'react';

// Variables globales pour garder une trace des fonctions de désinscription
let privateConversationsUnsubscribe: Unsubscribe | null = null;
let socialThreadsUnsubscribe: Unsubscribe | null = null;

/**
 * Fonction principale pour initialiser les écouteurs de données de l'application
 * après l'authentification de l'utilisateur.
 * Appelée depuis App.tsx lorsque l'utilisateur est authentifié et ses données chargées.
 */
export const InitializeAppLogic: React.FC = () => {
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
  }));
  const { 
    _listenToConversations, // <-- Utiliser la nouvelle fonction
    cleanupConversationListener, 
    fetchSocialThreads,
    clearChatState,
    conversations,
    isLoadingConversations,
    setActiveChat,
    currentChatId
  } = useChatStore();
  const setAppInitialized = useAppInitializationStore((state) => state.setAppInitialized);
  const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);

  // Références pour garder une trace si les listeners ont déjà été initialisés
  const socialThreadsListenerInitialized = useRef(false);
  //const conversationListenerInitialized = useRef(false); // Remplacé par la logique dynamique

  // IDs de chat actuels depuis useAuthStore (sera mis à jour par le listener userDoc)
  const currentChatIds = useAuthStore(state => state.user?.chatsessions || []);

  // Effet pour initialiser les listeners des conversations (privées)
  // Se déclenche quand l'utilisateur est authentifié et que ses IDs de chat changent
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`[initializeAppLogic] User authenticated. Chat IDs changed/loaded:`, currentChatIds);
      // Lance ou met à jour le listener pour les conversations privées
      _listenToConversations(currentChatIds);
      // conversationListenerInitialized.current = true; // Marquer comme initialisé
    } else {
      // Si l'utilisateur se déconnecte, nettoyer le listener
      console.log("[initializeAppLogic] User logged out or IDs cleared. Cleaning up conversation listener.");
      cleanupConversationListener();
      // conversationListenerInitialized.current = false;
    }

    // Fonction de nettoyage pour cet effet: appelée si l'utilisateur change ou le composant démonte
    return () => {
      console.log("[initializeAppLogic] Cleanup effect for conversation listener.");
      cleanupConversationListener();
      // conversationListenerInitialized.current = false;
    };
  }, [isAuthenticated, user, currentChatIds, _listenToConversations, cleanupConversationListener]); // Dépend de l'auth et des IDs


  // Effet pour initialiser le listener des threads sociaux (une seule fois après auth)
  useEffect(() => {
    if (isAuthenticated && user?.university && !socialThreadsListenerInitialized.current) {
      console.log("[initializeAppLogic] Initializing social threads listener...");
      const socialUnsubscribe = fetchSocialThreads();
      socialThreadsListenerInitialized.current = true;
      console.log("[initializeAppLogic] Social threads listener initialized.");
      // Nettoyage pour le listener social
      return () => {
        console.log("[initializeAppLogic] Cleaning up social threads listener.");
        socialUnsubscribe();
        socialThreadsListenerInitialized.current = false;
      };
    }
  }, [isAuthenticated, user?.university, fetchSocialThreads]);

  // Effet pour gérer la sélection du chat initial
  // Cet effet se déclenche quand les conversations finissent de charger (isLoadingConversations devient false)
  // après que l'utilisateur soit authentifié.
  const initialChatSelected = useRef(false); // Pour éviter de re-sélectionner
  useEffect(() => {
    if (isAuthenticated && !isLoadingConversations && conversations.length > 0 && !currentChatId && !initialChatSelected.current) {
      // Sélectionner la première conversation (la plus récente car triée dans le listener)
      const initialChatId = conversations[0].chat_id;
      console.log(`[initializeAppLogic] Conversations loaded. Setting initial active chat to: ${initialChatId}`);
      setActiveChat(initialChatId);
      initialChatSelected.current = true; // Marquer comme fait
    } else if (isAuthenticated && !isLoadingConversations && conversations.length === 0 && !currentChatId && !initialChatSelected.current) {
        console.log("[initializeAppLogic] Conversations loaded, but list is empty. Setting active chat to null.");
        setActiveChat(null); // Pas de conversations, aller à la landing page
        initialChatSelected.current = true; // Marquer comme fait
    }
  }, [isAuthenticated, isLoadingConversations, conversations, currentChatId, setActiveChat]);


  // Effet pour marquer l'application comme initialisée et nettoyer l'état du chat à la déconnexion
  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated) {
        console.log("[initializeAppLogic] Authentication complete, user loaded. App initialized.");
        setAppInitialized(true);
        // Réinitialiser le flag de sélection initiale si l'utilisateur change
        initialChatSelected.current = false; 
      } else {
        // Si l'utilisateur n'est plus authentifié (déconnexion)
        console.log("[initializeAppLogic] User logged out. Clearing chat state and marking app as uninitialized.");
        clearChatState();
        setAppInitialized(false); // Ou garder à true ? Discutable.
        // S'assurer que les flags des listeners sont réinitialisés
        socialThreadsListenerInitialized.current = false;
        initialChatSelected.current = false;
      }
    }
  }, [isLoadingAuth, isAuthenticated, setAppInitialized, clearChatState]);

  // Ce composant ne rend rien visuellement
  return null;
};

// NOTE: Pour que ce code fonctionne, vous devrez créer les stores Zustand
// `useChatStore` et `useUserProfileStore` (ou équivalents) avec les états
// et actions correspondants (fetchProfilePicture, fetchChatSessions,
// fetchSocialThreads, loadInitialMessages, setMessages, setIsLandingPageVisible).
// Les `Promise.resolve()` sont des placeholders pour rendre le code exécutable. 

// Note importante pour le nettoyage :
// Les fonctions `privateConversationsUnsubscribe` et `socialThreadsUnsubscribe`
// devraient idéalement être appelées lorsque l'utilisateur se déconnecte explicitement
// ou lorsque l'application est sur le point d'être fermée/démontée.
// L'endroit le plus logique serait dans `useChatStore.clearChatState()`
// ou potentiellement dans la fonction de nettoyage de l'effet `useEffect`
// qui appelle `initializeAppLogic` dans `App.tsx`.
// Pour l'instant, nous nous assurons seulement qu'elles sont appelées avant de
// ré-initialiser les listeners dans cette même fonction. 