import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import { Unsubscribe } from 'firebase/firestore'; // Importer pour le type de retour de fetchSocialThreads

// Variable globale pour garder une trace de la fonction de désinscription des threads sociaux
let socialThreadsUnsubscribe: Unsubscribe | null = null;

/**
 * Fonction principale pour initialiser les données essentielles de l'application
 * après l'authentification de l'utilisateur.
 * Appelée depuis App.tsx lorsque l'utilisateur est authentifié et ses données chargées.
 */
export const initializeAppLogic = async (): Promise<void> => {
  console.log("[initializeAppLogic] Starting application data initialization...");

  const { user, chatIds } = useAuthStore.getState(); // Récupère les chatIds ACTUELS du store
  const chatStore = useChatStore.getState();
  const appInitStore = useAppInitializationStore.getState();

  // 0. S'assurer que l'état d'initialisation est bien false au début.
  //    Normalement géré par App.tsx avant l'appel, mais double-vérification possible.
  // appInitStore.setAppInitialized(false); // Normalement déjà fait par App.tsx

  // 1. Vérification utilisateur
  if (!user?.id || !user.university) {
    console.warn("[initializeAppLogic] User ID or University missing. Aborting.");
    chatStore.clearChatState();
    // Assurez-vous que l'initialisation est marquée comme terminée même en cas d'échec précoce
    if (!appInitStore.isAppInitialized) {
        appInitStore.setAppInitialized(true);
    }
    return;
  }

  console.log(`[initializeAppLogic] Initializing for user: ${user.id}. Available chatIds from AuthStore: ${JSON.stringify(chatIds)}`);
  // ^^^ CE LOG EST CRUCIAL: Vérifiez si le nouveau chatId est DÉJÀ ici.

  try {
    // 2. Se désabonner de l'ancien listener de threads sociaux (s'il y en avait un d'une session précédente)
    // Cela évite les écoutes multiples si initializeAppLogic est appelé plusieurs fois (ex: changement rapide d'utilisateur)
    if (socialThreadsUnsubscribe) {
      console.log("[initializeAppLogic] Unsubscribing from previous social threads listener.");
      socialThreadsUnsubscribe();
      socialThreadsUnsubscribe = null;
    }

    // 3. Charger les conversations basées sur les chatIds du AuthStore
    console.log("[initializeAppLogic] Fetching user conversations based on current chatIds...");
    await chatStore.fetchConversations(); // Utilise les chatIds récupérés au début
    const conversationsAfterFetch = chatStore.conversations; // Vérifier les conversations chargées
    console.log(`[initializeAppLogic] User conversations fetched. Count: ${conversationsAfterFetch.length}`);
    // Log pour voir si le nouveau chat est dans la liste chargée
    console.log("[initializeAppLogic] Fetched conversation IDs:", conversationsAfterFetch.map(c => c.chat_id));

    // 4. Initialiser le listener social threads ...
    console.log("[initializeAppLogic] Initializing social threads listener...");
    socialThreadsUnsubscribe = chatStore.fetchSocialThreads();
    console.log(`[initializeAppLogic] Social threads listener initialized.`);

    // 5. Déterminer et charger le chat initial en utilisant la PREMIÈRE conversation de la liste récupérée
    //    (car fetchConversations les trie par modified_at desc)
    const conversationsFromStore = useChatStore.getState().conversations; // Récupère la liste MISE À JOUR
    const initialChatId = conversationsFromStore.length > 0 ? conversationsFromStore[0].chat_id : null;
    console.log(`[initializeAppLogic] Determined initialChatId: ${initialChatId} (based on the first conversation in the fetched & sorted list)`);

    if (initialChatId) {
      console.log(`[initializeAppLogic] Setting active chat and loading messages for chatId: ${initialChatId}`);
      // Plus besoin de vérifier chatExists car on prend directement depuis la liste qu'on vient de mettre dans le store
      // L'action setActiveChat va maintenant gérer le chargement des messages
      chatStore.setActiveChat(initialChatId);
      // L'appel loadChatMessages est maintenant redondant car setActiveChat s'en charge
      // await chatStore.loadChatMessages(initialChatId); 
      console.log(`[initializeAppLogic] setActiveChat called for ${initialChatId}. Message loading initiated by setActiveChat.`);
    } else {
      console.log("[initializeAppLogic] No initial chat ID found (no conversations fetched?). Setting active chat to null.");
      chatStore.setActiveChat(null);
    }

    console.log("[initializeAppLogic] Data initialization process seemingly completed.");

  } catch (error) {
    console.error("[initializeAppLogic] Error during initialization:", error);
  } finally {
    // 6. Marquer l'initialisation comme terminée (déjà fait dans App.tsx avant l'appel)
    //    On peut le refaire ici pour être sûr, mais attention aux effets de bord si appelé plusieurs fois.
    if (!appInitStore.isAppInitialized) {
        appInitStore.setAppInitialized(true);
        console.log("[initializeAppLogic] isAppInitialized set to true (finally block - safety net).");
    }
  }
};

// NOTE: Pour que ce code fonctionne, vous devrez créer les stores Zustand
// `useChatStore` et `useUserProfileStore` (ou équivalents) avec les états
// et actions correspondants (fetchProfilePicture, fetchChatSessions,
// fetchSocialThreads, loadInitialMessages, setMessages, setIsLandingPageVisible).
// Les `Promise.resolve()` sont des placeholders pour rendre le code exécutable. 