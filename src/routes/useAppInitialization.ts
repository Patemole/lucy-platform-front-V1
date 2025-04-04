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
    fetchCourseOptionsAndChatSessions,
    fetchSocialThreads,
    handleConversationClick,
  } = useConversations({
    isStreaming: false,
    setSelectedFilter: noop,
    setIsPrivate: noop,
    setCurrentView: noop,
    setRelatedQuestions: noop,
    setUnreadCount: noop,
    setActiveChatId: noop,
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

    console.log("🚀 Initializing app for user:", user.id);

    try {
      // Étape 1 – photo de profil et historiques
      await Promise.all([
        fetchProfilePicture(),
        fetchCourseOptionsAndChatSessions(),
      ]);

      // Étape 2 – social threads en écoute
      fetchSocialThreads();
     
      console.log("📡 This is after socialthread");

      // Étape 3 – messages de la dernière conversation
      const latestChatId = chatIds?.[0];
      if (latestChatId) {
        await handleConversationClick(latestChatId);
        setPrimaryChatId(latestChatId);
        setIsLandingPageVisible(false);
        console.log("✅ Chargé le chat actif :", latestChatId);
      } else {
        setMessages([]);
        setIsLandingPageVisible(true);
        console.log("📭 Aucun chat précédent. Affichage de la landing page.");
      }

      console.log("✅ App initialization finished.");
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
    }
  }, [user?.id, user?.university, chatIds]);

  return { initializeApp };
};