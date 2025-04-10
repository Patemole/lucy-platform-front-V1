import { useCallback, useState } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { useChat } from '../auth/hooks/useChat';
import { useConversations } from '../routes/chat/hooks/useConversations';
import { useUserProfile } from '../routes/chat/hooks/useUserProfile';
import { useRef } from 'react';

export const useAppInitialization = () => {
  const { user, chatIds, setPrimaryChatId } = useAuth();
  const { setMessages, setIsLandingPageVisible } = useChat();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const noop = () => {};
  const noopRef = useRef(false);

  // useConversations : nécessaire pour charger les threads/messages
  const {
    fetchChatSessions,
    fetchSocialThreads,
    loadInitialMessages,
  } = useConversations({
    isStreaming: false,
    setSelectedFilter: noop,
    setIsPrivate: noop,
    setRelatedQuestions: noop,
    setUnreadCount: noop,
    cancelConversationRef: noopRef,
    setCancelConversation: noop,
    setIsStreaming: noop,
  });

  const { fetchProfilePicture } = useUserProfile({
    setEvents: noop,
    setProfileMenuAnchorEl: noop,
    setParametersMenuAnchorEl: noop,
    setProfilePicture,
  });

  // Initialisation complète de l'app
  const initializeApp = useCallback(async () => {
    if (!user?.id || !user?.university) return;

    console.log("🚀 Initialisation de l'app pour l'utilisateur:", user.id);

    try {
      // Étape 1 - Chargement parallèle du profil et des conversations
      await Promise.all([
        fetchProfilePicture(),
        fetchChatSessions(),
      ]);

      // Étape 2 - Mise en place de l'écoute des social threads
      fetchSocialThreads();
      console.log("📡 Social threads en écoute");

      // Étape 3 - Chargement des messages de la dernière conversation
      const latestChatId = chatIds?.[0];
      if (latestChatId) {
        await loadInitialMessages(latestChatId);
        console.log("✅ Messages initiaux chargés pour:", latestChatId);
      } else {
        // Pas de conversation existante, afficher la landing page
        setMessages([]);
        setIsLandingPageVisible(true);
        console.log("📭 Aucune conversation existante - Affichage landing page");
      }

      console.log("✅ Initialisation complète de l'application");
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
      // En cas d'erreur, on affiche quand même la landing page
      setMessages([]);
      setIsLandingPageVisible(true);
    }
  }, [user?.id, user?.university, chatIds]);

  return { initializeApp };
};