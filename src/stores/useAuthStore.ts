/*
Description:
Ce store Zustand centralise la gestion de l'état d'authentification et des données
de l'utilisateur connecté.

Fonctionnement Principal:
1.  **État Utilisateur Temps Réel**: Maintient l'état `user` (profil complet),
    `isAuthenticated`, `isLoading` (pour l'auth Firebase initiale), `error`, et
    `chatIds` (liste des IDs de conversation de l'utilisateur).
2.  **Écouteur Firebase Auth**: `initializeAuthListener` utilise `onAuthStateChanged`
    pour détecter les connexions/déconnexions Firebase.
3.  **Écouteur Firestore Utilisateur**: Une fois l'utilisateur authentifié via Firebase,
    `_initializeUserListener` démarre un écouteur `onSnapshot` sur le document
    Firestore de l'utilisateur (`users/{userId}`). Cet écouteur met à jour
    automatiquement l'état `user` et `chatIds` à chaque modification dans Firestore,
    assurant une synchronisation temps réel.
4.  **Actions Firestore**: Fournit des actions (`addChatIdToFirestore`,
    `removeChatIdFromFirestore`) pour modifier Firestore. La mise à jour de l'état
    local est gérée par l'écouteur (étape 3).
5.  **Déconnexion**: `logoutUser` arrête l'écouteur Firestore *avant* de se
    déconnecter de Firebase Auth.

Ce store est la source unique de vérité pour les informations de l'utilisateur connecté.
*/

import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../auth/firebase';
import { User } from '../interfaces/interfaces_eleve';

// Note: La gestion de l'unsubscribe Firestore est maintenant dans l'état du store.

interface AuthState {
  user: User | null; // Données complètes de l'utilisateur (synchronisées depuis Firestore)
  isAuthenticated: boolean; // L'utilisateur est-il authentifié via Firebase?
  isLoading: boolean; // Chargement de l'état initial de Firebase Auth en cours?
  error: string | null; // Erreur liée à l'authentification ou au chargement des données user
  chatIds: string[]; // Liste des IDs de chat de l'utilisateur (synchronisée depuis user.chatsessions)
  userListenerUnsubscribe: Unsubscribe | null; // Fonction pour arrêter l'écouteur Firestore de l'utilisateur

  // --- Actions Internes --- (Utilisées par le store lui-même)
  _setUserAndAuth: (user: User | null) => void; // Met à jour user, isAuthenticated, chatIds, et gère l'arrêt du listener Firestore si user est null.
  _setLoading: (loading: boolean) => void; // Met à jour l'état de chargement de Firebase Auth
  _setError: (error: string | null) => void; // Met à jour l'état d'erreur
  _setChatIds: (chatIds: string[]) => void; // Met à jour directement chatIds (moins utilisé maintenant)
  _setUserListenerUnsubscribe: (unsubscribe: Unsubscribe | null) => void; // Stocke ou nettoie la fonction d'arrêt de l'écouteur Firestore

  // --- Actions Publiques --- (Utilisables par les composants)
  addChatIdToFirestore: (chatId: string) => Promise<void>; // Ajoute un chatId au tableau 'chatsessions' dans Firestore. L'état local est mis à jour par l'écouteur.
  removeChatIdFromFirestore: (chatId: string) => Promise<void>; // Supprime un chatId du tableau 'chatsessions' dans Firestore. L'état local est mis à jour par l'écouteur.
  logoutUser: () => Promise<void>; // Arrête l'écouteur Firestore et déconnecte de Firebase Auth.

  // --- Initialisation des Écouteurs ---
  initializeAuthListener: () => () => void; // Démarre l'écouteur Firebase Auth et retourne sa fonction d'arrêt.
  _initializeUserListener: (userId: string) => void; // Démarre l'écouteur Firestore pour le document utilisateur donné.
}



const useAuthStore = create<AuthState>((set, get) => ({
  // --- État Initial ---
  user: null,
  isAuthenticated: false,
  isLoading: true, // Vrai jusqu'à ce que onAuthStateChanged réponde pour la première fois
  error: null,
  chatIds: [],
  userListenerUnsubscribe: null,



  // --- ACTIONS INTERNES --- 
  _setLoading: (loading) => set({ isLoading: loading }),
  _setError: (error) => set({ error: error, isLoading: false }), // Marque le chargement comme terminé en cas d'erreur
  _setChatIds: (chatIds) => set({ chatIds }), // Peut être utilisé si nécessaire, mais _setUserAndAuth est prioritaire
  _setUserListenerUnsubscribe: (unsubscribe) => set({ userListenerUnsubscribe: unsubscribe }),

  // Action centrale pour mettre à jour l'état utilisateur et l'authentification.
  // Gère aussi l'arrêt de l'écouteur Firestore lors de la déconnexion.
  _setUserAndAuth: (userData) => {
    if (userData === null) {
      // Déconnexion: Arrêter l'écouteur Firestore s'il existe
      const unsubscribe = get().userListenerUnsubscribe;
      if (unsubscribe) {
        console.log("AuthStore: Arrêt de l'écouteur utilisateur Firestore (via _setUserAndAuth).");
        unsubscribe();
      }
      // Réinitialiser l'état
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false, // Le statut Auth est connu (déconnecté)
        error: null,
        chatIds: [],
        userListenerUnsubscribe: null, // Nettoyer la référence à l'unsubscribe
      });
      console.log("AuthStore: Utilisateur déconnecté (via _setUserAndAuth)");

    } else {
      // Connexion ou Mise à Jour via l'écouteur Firestore:
      const chatSessions = userData.chatsessions || [];
      
      // Vérifier si l'utilisateur ou les chatIds ont réellement changé pour optimiser les re-renders
      const hasUserChanged = JSON.stringify(userData) !== JSON.stringify(get().user);
      const hasChatIdsChanged = JSON.stringify(chatSessions) !== JSON.stringify(get().chatIds);

      if (hasUserChanged || hasChatIdsChanged) {
          set({
            user: userData, // Mettre à jour le profil complet
            isAuthenticated: true, // Confirmer l'authentification
            isLoading: false, // Le statut Auth est connu et on a les données user
            error: null, // Réinitialiser l'erreur en cas de succès
            chatIds: chatSessions, // Mettre à jour les chatIds
          });
          if (hasUserChanged) console.log("AuthStore: Données utilisateur mises à jour depuis Firestore (via _setUserAndAuth):", userData);
          if (hasChatIdsChanged) console.log("AuthStore: Chat IDs mis à jour depuis Firestore:", chatSessions);
      } else {
          // Si les données reçues sont identiques, s'assurer au moins que isLoading est false.
           if (get().isLoading) {
              set({ isLoading: false });
          }
      }
    }
  },




  // --- ACTIONS PUBLIQUES --- 

  // Ajoute un chatId à la liste 'chatsessions' de l'utilisateur dans Firestore.
  // La mise à jour de l'état local (chatIds) est gérée par l'écouteur Firestore.
  addChatIdToFirestore: async (chatId) => {
    const { user, chatIds, _setError } = get();
    if (!user || !user.id) {
        console.error("AuthStore: Utilisateur non connecté, impossible d'ajouter un chatId.");
        _setError("Vous devez être connecté pour ajouter une conversation.");
        return;
    }
    // Vérification locale optionnelle pour éviter un appel inutile si l'ID est déjà dans l'état.
    if (chatIds.includes(chatId)) {
        console.warn(`AuthStore: Tentative d'ajout du chatId ${chatId} qui semble déjà exister localement.`);
        // On ne retourne pas forcément, Firestore reste la source de vérité.
    }

    try {
        const userDocRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const currentDbChatIds = userSnap.data().chatsessions || [];
            // S'assurer qu'on ne l'ajoute que s'il n'est pas DÉJÀ dans Firestore
            if (!currentDbChatIds.includes(chatId)) {
                await updateDoc(userDocRef, { chatsessions: [...currentDbChatIds, chatId] });
                console.log(`AuthStore: ChatId ${chatId} ajouté à Firestore. L'écouteur devrait mettre à jour le store.`);
            } else {
                 console.warn(`AuthStore: ChatId ${chatId} déjà présent dans Firestore. Aucune mise à jour Firestore effectuée.`);
            }
        } else {
             console.error(`AuthStore: Document utilisateur ${user.id} non trouvé pour ajouter chatId.`);
             throw new Error("User document not found");
        }
    } catch (error) {
        console.error("❌ AuthStore: Erreur lors de l'ajout du chatId à Firestore:", error);
        _setError("Erreur lors de la sauvegarde de la nouvelle conversation.");
    }
  },


  
  // Supprime un chatId de la liste 'chatsessions' de l'utilisateur dans Firestore.
  // La mise à jour de l'état local (chatIds) est gérée par l'écouteur Firestore.
  removeChatIdFromFirestore: async (chatId) => {
    const { user, _setError } = get();
    if (!user || !user.id) {
      console.error("AuthStore: Utilisateur non connecté, impossible de supprimer un chatId.");
      _setError("Vous devez être connecté pour supprimer une conversation.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const currentDbChatIds = userSnap.data().chatsessions || [];
        // Supprimer seulement si l'ID existe dans Firestore
        if (currentDbChatIds.includes(chatId)) {
          const newDbChatIds = currentDbChatIds.filter((id: string) => id !== chatId);
          await updateDoc(userDocRef, { chatsessions: newDbChatIds });
          console.log(`AuthStore: ChatId ${chatId} supprimé de Firestore. L'écouteur devrait mettre à jour le store.`);
        } else {
          console.warn(`AuthStore: ChatId ${chatId} non trouvé dans Firestore. Aucune suppression effectuée.`);
        }
      } else {
        console.error(`AuthStore: Document utilisateur ${user.id} non trouvé pour supprimer chatId.`);
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("❌ AuthStore: Erreur lors de la suppression du chatId de Firestore:", error);
      _setError("Erreur lors de la suppression de la conversation.");
    }
  },

  // Gère la déconnexion complète.
  logoutUser: async () => {
    const { _setUserAndAuth, _setError, userListenerUnsubscribe } = get();
    console.log("AuthStore: Tentative de déconnexion Firebase...");

    // 1. Arrêter l'écouteur Firestore utilisateur AVANT la déconnexion Firebase
    if (userListenerUnsubscribe) {
      console.log("AuthStore: Arrêt de l'écouteur utilisateur Firestore (logout).");
      userListenerUnsubscribe();
      set({ userListenerUnsubscribe: null }); // Nettoyer l'état du store
    } else {
        console.log("AuthStore: Aucun écouteur utilisateur à arrêter lors du logout.");
    }

    // 2. Effectuer la déconnexion Firebase
    try {
      await signOut(auth);
      console.log("AuthStore: Déconnexion Firebase réussie.");
      // L'écouteur onAuthStateChanged détectera ce changement et appellera _setUserAndAuth(null).
      // On peut aussi l'appeler ici pour une mise à jour immédiate de l'état UI.
      _setUserAndAuth(null);
    } catch (error) {
      console.error("AuthStore: Erreur lors de la déconnexion Firebase:", error);
      _setError("Erreur lors de la déconnexion.");
      // Forcer la déconnexion locale même en cas d'erreur Firebase
      _setUserAndAuth(null);
    }
  },






  // --- Initialisation des Écouteurs --- 

  // Démarre l'écouteur Firestore (onSnapshot) pour le document utilisateur spécifié.
  // Met à jour l'état `user` et `chatIds` à chaque modification.
  _initializeUserListener: (userId) => {
    const { _setUserAndAuth, _setError, _setUserListenerUnsubscribe, userListenerUnsubscribe: currentUserListenerUnsubscribe } = get();
    console.log(`AuthStore: Initialisation de l'écouteur Firestore pour l'utilisateur ${userId}.`);

    // Nettoyer un éventuel écouteur précédent (sécurité)
    if (currentUserListenerUnsubscribe) {
      console.warn("AuthStore: Tentative d'initialiser un nouvel écouteur utilisateur alors qu'un existait déjà. Annulation de l'ancien.");
      currentUserListenerUnsubscribe();
    }

    const docRef = doc(db, 'users', userId);
    // Création de l'écouteur Firestore
    const unsubscribe = onSnapshot(docRef,
      (docSnap) => {
        // Callback exécuté à chaque mise à jour du document
        if (docSnap.exists()) {
          // Le document existe, extraire les données
          const userDataFromDb = docSnap.data() as Omit<User, 'id' | 'email'>;
          const authUser = get().user; // Récupérer l'utilisateur actuel (peut contenir l'email de l'auth)
          // Construire l'objet utilisateur complet
          const fullUserData: User = {
            id: userId,
            email: authUser?.email || '', // Garder l'email de Firebase Auth si possible
            name: userDataFromDb.name || '',
            chatsessions: userDataFromDb.chatsessions || [], // Important pour `chatIds`
            university: userDataFromDb.university || '',
            faculty: userDataFromDb.faculty || [],
            year: userDataFromDb.year || '',
            academic_advisor: userDataFromDb.academic_advisor || '',
            interests: userDataFromDb.interests || [],
            major: userDataFromDb.major || [],
            minor: userDataFromDb.minor || [],
            role: userDataFromDb.role || '',
            registered_club_status: userDataFromDb.registered_club_status || '',
            registered_clubs: userDataFromDb.registered_clubs || '',
            onboardingComplete: userDataFromDb.onboardingComplete !== undefined ? userDataFromDb.onboardingComplete : true,
            linkedin_url: userDataFromDb.linkedin_url || '',
            linkedin_profile: userDataFromDb.linkedin_profile || {},
            onboardingMessageSent: userDataFromDb.onboardingMessageSent !== undefined ? userDataFromDb.onboardingMessageSent : true,
            
          };
          // Mettre à jour l'état centralisé via _setUserAndAuth
          _setUserAndAuth(fullUserData);
        } else {
          // Le document utilisateur n'existe pas dans Firestore
          console.error("AuthStore: (onSnapshot) Document utilisateur non trouvé dans Firestore pour", userId);
          _setError("Profil utilisateur introuvable.");
          // Option: Déconnecter complètement? Pour l'instant, on vide juste user/chatIds.
          set({ user: null, chatIds: [] });
        }
      },
      (error) => {
        // Erreur lors de l'écoute Firestore
        console.error("AuthStore: Erreur dans l'écouteur onSnapshot utilisateur:", error);
        _setError("Erreur de synchronisation du profil.");
        // Option: Déconnecter?
      }
    );

    // Stocker la fonction pour arrêter cet écouteur
    _setUserListenerUnsubscribe(unsubscribe);
    console.log(`AuthStore: Écouteur Firestore pour ${userId} activé.`);
  },




  // Démarre l'écouteur d'état d'authentification Firebase (onAuthStateChanged).
  // Appelle _initializeUserListener lors de la connexion.
  // Gère la déconnexion via _setUserAndAuth(null).
  initializeAuthListener: () => {
    console.log("AuthStore: Initialisation de l'écouteur onAuthStateChanged.");
    const { _setUserAndAuth, _initializeUserListener, _setLoading, _setError, userListenerUnsubscribe } = get();
    _setLoading(true); // Indiquer le début du chargement de l'état Auth

    // Nettoyer un écouteur user précédent si l'écouteur Auth est (ré)initialisé
    if (userListenerUnsubscribe) {
        console.warn("AuthStore: Nettoyage d'un écouteur utilisateur existant au démarrage de l'écouteur Auth.");
        userListenerUnsubscribe();
        set({ userListenerUnsubscribe: null });
    }

    // Création de l'écouteur Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      _setLoading(false); // L'état d'authentification est maintenant connu

      if (firebaseUser) {
        // Utilisateur connecté via Firebase
        console.log("AuthStore: onAuthStateChanged - Utilisateur Firebase détecté:", firebaseUser.uid);
        // 1. Mettre à jour l'état de base (isAuthenticated, id, email)
        set({ isAuthenticated: true, isLoading: false, user: { id: firebaseUser.uid, email: firebaseUser.email || ''} as User });
        // 2. Démarrer l'écouteur Firestore pour récupérer/synchroniser le reste du profil
        _initializeUserListener(firebaseUser.uid);
      } else {
        // Aucun utilisateur Firebase connecté
        console.log("AuthStore: onAuthStateChanged - Aucun utilisateur Firebase.");
        // Déclencher la logique de déconnexion (qui arrêtera aussi l'écouteur Firestore)
        _setUserAndAuth(null);
      }
    }, (error) => {
        // Erreur de l'écouteur Firebase Auth lui-même
        console.error("AuthStore: Erreur dans onAuthStateChanged listener:", error);
        _setError("Erreur d'authentification Firebase.");
        _setUserAndAuth(null); // Déconnecter en cas d'erreur critique de l'écouteur Auth
        _setLoading(false);
    });

    // Retourner la fonction pour arrêter l'écouteur onAuthStateChanged
    return unsubscribeAuth;
  },
}));



// --- Notes Générales ---
// L'écouteur `initializeAuthListener` doit être appelé une seule fois au démarrage
// de l'application (par exemple dans App.tsx) et sa fonction d'arrêt (retournée)
// doit être appelée lors du démontage de l'application.

export default useAuthStore;