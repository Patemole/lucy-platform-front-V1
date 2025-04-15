import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import { Unsubscribe } from 'firebase/firestore'; // Importer pour le type de retour de fetchSocialThreads
import { Message } from '../interfaces/interfaces_eleve';
import { startOnboarding } from '../services/onboardingService';

// Variables globales pour garder une trace des fonctions de désinscription
let privateConversationsUnsubscribe: Unsubscribe | null = null;
let socialThreadsUnsubscribe: Unsubscribe | null = null;

/**
 * Fonction principale pour initialiser les écouteurs de données de l'application
 * après l'authentification de l'utilisateur.
 * Appelée depuis App.tsx lorsque l'utilisateur est authentifié et ses données chargées.
 */
export const initializeAppLogic = async (): Promise<void> => {
  console.log("[initializeAppLogic] Starting application listeners initialization...");

  // Note : userId et university sont récupérés DANS les actions du store maintenant
  const chatStore = useChatStore.getState();
  const appInitStore = useAppInitializationStore.getState();
  const { user } = useAuthStore.getState(); // Récupérer l'utilisateur pour la vérification initiale

  // 0. S'assurer que l'état d'initialisation est bien false au début.
  //    Normalement géré par App.tsx, mais utile pour la clarté du flux.
  // appInitStore.setAppInitialized(false); // Déjà fait par App.tsx avant l'appel

  // 1. Vérification utilisateur (garde essentielle)
  if (!user?.id || !user.university) {
    console.warn("[initializeAppLogic] User ID or University missing. Aborting listener setup.");
    chatStore.clearChatState(); // Nettoyer l'état du chat si l'utilisateur n'est pas valide
    // Important : Se désabonner des listeners potentiellement actifs d'une session précédente invalide
    if (privateConversationsUnsubscribe) {
      console.log("[initializeAppLogic] Unsubscribing from previous private conversations listener (user invalid).");
      privateConversationsUnsubscribe();
      privateConversationsUnsubscribe = null;
    }
    if (socialThreadsUnsubscribe) {
      console.log("[initializeAppLogic] Unsubscribing from previous social threads listener (user invalid).");
      socialThreadsUnsubscribe();
      socialThreadsUnsubscribe = null;
    }
    // Marquer l'initialisation comme terminée (même si échec) pour éviter boucle si App.tsx le gère
    if (!appInitStore.isAppInitialized) {
        appInitStore.setAppInitialized(true);
    }
    return;
  }

  console.log(`[initializeAppLogic] Initializing listeners for user: ${user.id}.`);

  try {
    // 2. Se désabonner des anciens listeners (si existants)
    // Important pour éviter les écoutes multiples lors des changements d'utilisateur ou rechargements rapides
    if (privateConversationsUnsubscribe) {
      console.log("[initializeAppLogic] Unsubscribing from previous private conversations listener.");
      privateConversationsUnsubscribe();
      privateConversationsUnsubscribe = null;
    }
    if (socialThreadsUnsubscribe) {
      console.log("[initializeAppLogic] Unsubscribing from previous social threads listener.");
      socialThreadsUnsubscribe();
      socialThreadsUnsubscribe = null;
    }

    // 3. Initialiser le listener pour les conversations PRIVÉES de l'utilisateur
    //    Cette fonction retourne maintenant une fonction `Unsubscribe`
    console.log("[initializeAppLogic] Initializing private conversations listener...");
    privateConversationsUnsubscribe = chatStore.fetchConversations();
    // La logique de sélection du chat initial est MAINTENANT GÉRÉE DANS fetchConversations (onSnapshot callback)
    console.log(`[initializeAppLogic] Private conversations listener initialized.`);

    // 4. Initialiser le listener pour les threads SOCIAUX de l'université
    //    Cette fonction retourne également une fonction `Unsubscribe`
    console.log("[initializeAppLogic] Initializing social threads listener...");
    socialThreadsUnsubscribe = chatStore.fetchSocialThreads();
    console.log(`[initializeAppLogic] Social threads listener initialized.`);

    // 5. Vérifier si l'onboarding est nécessaire
    if (!user.onboardingComplete) {
      console.log("[initializeAppLogic] User needs onboarding. Starting onboarding sequence...");
      await startOnboarding();
    }

    console.log("[initializeAppLogic] Listener initialization process completed.");
    // Le chat actif sera défini par le callback de fetchConversations s'il y a des conversations.

  } catch (error) {
    console.error("[initializeAppLogic] Error during listener initialization:", error);
    // En cas d'erreur ici, les listeners pourraient ne pas être actifs.
    // clearChatState pourrait être appelé ici aussi pour être sûr.
    chatStore.clearChatState();
  } finally {
    // 6. Marquer l'initialisation comme terminée (géré par App.tsx)
    // On ne le fait plus ici pour éviter les conflits avec App.tsx
    // if (!appInitStore.isAppInitialized) {
    //     appInitStore.setAppInitialized(true);
    //     console.log("[initializeAppLogic] isAppInitialized set to true (finally block - safety net).");
    // }
    console.log("[initializeAppLogic] Execution finished.");
  }
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