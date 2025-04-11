/*
C'est le gestionnaire central pour tout ce qui concerne l'utilisateur connecté dans votre application.
Il fait principalement 4 choses :

1) Garder en mémoire l'état actuel: Il sait si quelqu'un est connecté (isAuthenticated), qui est cette personne (user), 
s'il y a un chargement en cours (isLoading) ou une erreur (error), et la liste des conversations de l'utilisateur (chatIds).

2) Écouter Firebase Auth : Il se connecte à Firebase pour être notifié automatiquement si un utilisateur se connecte ou 
se déconnecte (initializeAuthListener qui utilise onAuthStateChanged).

3) Parler à Firestore : Quand un utilisateur est connecté, il va chercher ses informations détaillées (nom, rôle, etc.) 
dans votre base de données Firestore (fetchUserData). Il peut aussi y écrire des informations (comme ajouter un nouveau chatId).

4) Fournir des actions : Il offre des fonctions simples (logoutUser, addChatIdToStoreAndFirestore, etc.) que vos composants
peuvent appeler pour déconnecter l'utilisateur, ajouter une conversation, etc., sans avoir à connaître les détails de Firebase.
En gros, c'est la source unique de vérité et le contrôleur pour l'authentification et les données de base de l'utilisateur.
*/

import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Ajoutez updateDoc si nécessaire pour mettre à jour Firestore
import { auth, db } from '../auth/firebase'; // Assurez-vous que ce chemin est correct
import { User } from '../interfaces/interfaces_eleve'; // Assurez-vous que ce chemin est correct

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Pour le chargement initial de l'état d'auth
  isFetchingUserData: boolean; // Pour le chargement spécifique des données Firestore
  error: string | null;
  chatIds: string[];

  // Actions internes pour modifier l'état
  _setUserAndAuth: (user: User | null, firebaseUser?: any) => void; // Renommée pour clarté
  _setLoading: (loading: boolean) => void;
  _setFetchingUserData: (fetching: boolean) => void;
  _setError: (error: string | null) => void;
  _setChatIds: (chatIds: string[]) => void;

  // Actions publiques utilisables par les composants
  fetchUserData: (userId: string) => Promise<void>;
  addChatIdToStoreAndFirestore: (chatId: string) => Promise<void>; // Renommée pour clarté
  removeChatIdFromStore: (chatId: string) => void; // Simplifié, la suppression Firestore se fait ailleurs si besoin
  logoutUser: () => Promise<void>;
  updateUserProfileInStore: (updatedProfileData: Partial<User>) => void; // Pour les mises à jour locales

  // Fonction pour initialiser l'écouteur Firebase
  initializeAuthListener: () => () => void; // Retourne la fonction unsubscribe
}

const useAuthStore = create<AuthState>((set, get) => ({
  // --- État Initial ---
  user: null,
  isAuthenticated: false,
  isLoading: true, // Commence en chargement jusqu'à ce que onAuthStateChanged réponde
  isFetchingUserData: false,
  error: null,
  chatIds: [],

  // --- Actions Internes (pour le store lui-même) ---
  _setLoading: (loading) => set({ isLoading: loading }),
  _setFetchingUserData: (fetching) => set({ isFetchingUserData: fetching }),
  _setError: (error) => set({ error: error, isLoading: false, isFetchingUserData: false }),
  _setChatIds: (chatIds) => set({ chatIds }),

  _setUserAndAuth: (userData, firebaseUser = null) => {
     // Si on reçoit null, c'est une déconnexion
    if (userData === null) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isFetchingUserData: false,
        error: null,
        chatIds: [],
      });
      console.log("AuthStore: Utilisateur déconnecté (via _setUserAndAuth)");
    } else {
       // Sinon, c'est une connexion ou une mise à jour
       // On récupère les chat sessions directement depuis userData si elles y sont
       const chatSessions = userData.chatsessions || []; // Assurez-vous que 'chatsessions' est dans votre type User si nécessaire

       set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        isFetchingUserData: false,
        error: null,
        chatIds: chatSessions,
      });
      console.log("AuthStore: Utilisateur authentifié/mis à jour:", userData);
      console.log("AuthStore: Chat IDs mis à jour:", chatSessions);
    }
  },


  // --- Actions Publiques (pour les composants) ---

  fetchUserData: async (userId) => {
    const { _setUserAndAuth, _setFetchingUserData, _setError } = get();
    console.log(`AuthStore: Tentative de récupération des données pour l'utilisateur ${userId}`);
    _setFetchingUserData(true);
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userDataFromDb = docSnap.data() as Omit<User, 'id' | 'email'>; // Typage partiel
        const currentUser = get().user; // Récupère l'utilisateur actuel pour garder l'id/email de l'auth Firebase
        const fullUserData: User = {
            // Priorité aux données de Firebase Auth pour id et email
            id: currentUser?.id || userId,
            email: currentUser?.email || '', // Peut-être récupérer de firebaseUser si disponible
            // Le reste vient de Firestore
            name: userDataFromDb.name || '',
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
            // Ajout des chat sessions ici si elles sont dans le document user
            chatsessions: userDataFromDb.chatsessions || [],
        };
        _setUserAndAuth(fullUserData); // Met à jour l'état avec les données complètes
        console.log("AuthStore: Données utilisateur récupérées depuis Firestore:", fullUserData);
      } else {
        console.error("AuthStore: Données utilisateur non trouvées dans Firestore pour", userId);
        // Que faire ici ? Garder l'utilisateur de base ou définir une erreur ?
        // Pour l'instant, on garde l'utilisateur de base fourni par onAuthStateChanged et on log une erreur.
         _setError("Profil utilisateur introuvable dans la base de données.");
         // On pourrait aussi créer un profil par défaut ici si nécessaire
         // _setUserAndAuth({ id: userId, email: get().user?.email || '', name: 'Utilisateur Inconnu', ... autres champs par défaut ...});
      }
    } catch (error) {
      console.error("AuthStore: Erreur lors de la récupération des données utilisateur Firestore:", error);
      _setError("Erreur lors du chargement du profil.");
    } finally {
       _setFetchingUserData(false);
    }
  },

  // Met à jour le profil localement dans le store
  updateUserProfileInStore: (updatedProfileData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedProfileData };
      set({ user: updatedUser });
      console.log("AuthStore: Profil utilisateur mis à jour localement:", updatedUser);
      // Note : Ceci ne met PAS à jour Firestore.
      // Vous aurez besoin d'une autre fonction pour persister ces changements dans Firestore.
    }
  },


 addChatIdToStoreAndFirestore: async (chatId) => {
    const { user, chatIds, _setChatIds, _setError } = get();
    if (!user || !user.id) {
        console.error("AuthStore: Utilisateur non connecté, impossible d'ajouter un chatId.");
        _setError("Vous devez être connecté pour ajouter une conversation.");
        return;
    }
    if (chatIds.includes(chatId)) {
        console.warn(`AuthStore: ChatId ${chatId} existe déjà.`);
        return; // Ne rien faire si l'ID existe déjà
    }

    // Sauvegarde état avant modif optimiste
    const originalChatIds = [...chatIds];

    // Mise à jour optimiste UI
    const newChatIds = [...chatIds, chatId];
    _setChatIds(newChatIds);

    try {
        const userDocRef = doc(db, 'users', user.id);
        // Lire le document d'abord pour obtenir le tableau actuel est plus sûr
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            const currentDbChatIds = userSnap.data().chatsessions || [];
            // S'assurer qu'on ne l'ajoute pas si déjà présent dans la DB (cohérence)
            if (!currentDbChatIds.includes(chatId)) {
                await updateDoc(userDocRef, { chatsessions: [...currentDbChatIds, chatId] });
                 console.log(`AuthStore: ChatId ${chatId} ajouté à Firestore.`);
            } else {
                 console.warn(`AuthStore: ChatId ${chatId} déjà présent dans Firestore, mise à jour locale conservée.`);
            }
        } else {
             console.error(`AuthStore: Document utilisateur ${user.id} non trouvé pour ajouter chatId.`);
             throw new Error("User document not found"); // Provoquer une erreur pour le catch
        }

    } catch (error) {
        console.error("❌ AuthStore: Erreur lors de l'ajout du chatId à Firestore:", error);
        _setError("Erreur lors de la sauvegarde de la nouvelle conversation.");
        // !! ROLLBACK !!
        _setChatIds(originalChatIds); // Restaurer la liste originale
    }
},

  removeChatIdFromStore: (chatId) => {
    const currentChatIds = get().chatIds;
    const newChatIds = currentChatIds.filter(id => id !== chatId);
    set({ chatIds: newChatIds });
    console.log(`AuthStore: ChatId ${chatId} retiré du store local.`);
    // Note : La suppression de Firestore devrait être gérée séparément,
    // peut-être déclenchée par une action utilisateur spécifique.
  },

  logoutUser: async () => {
    const { _setUserAndAuth, _setError } = get();
    console.log("AuthStore: Tentative de déconnexion Firebase...");
    try {
      await signOut(auth);
      _setUserAndAuth(null); // Réinitialise l'état du store via l'action interne
      console.log("AuthStore: Déconnexion Firebase réussie.");
      // La redirection (navigate) doit être faite dans le composant qui appelle logoutUser
    } catch (error) {
      console.error("AuthStore: Erreur lors de la déconnexion Firebase:", error);
       _setError("Erreur lors de la déconnexion.");
        // Même en cas d'erreur, on déconnecte côté client
       _setUserAndAuth(null);
    }
  },


  // --- Initialisation de l'écouteur Firebase ---
  initializeAuthListener: () => {
    console.log("AuthStore: Initialisation de l'écouteur onAuthStateChanged.");
    const { _setUserAndAuth, fetchUserData, _setLoading, _setError } = get();
    _setLoading(true); // Commence en chargement

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("AuthStore: onAuthStateChanged - Utilisateur Firebase détecté:", firebaseUser.uid);
         // Met à jour l'état de base rapidement
         set({ isAuthenticated: true, isLoading: false, user: { id: firebaseUser.uid, email: firebaseUser.email || '', /* autres champs potentiellement vides */ } as User });
        // Ensuite, récupère les données complètes depuis Firestore
        await fetchUserData(firebaseUser.uid);
      } else {
        console.log("AuthStore: onAuthStateChanged - Aucun utilisateur Firebase.");
        _setUserAndAuth(null); // Réinitialise complètement l'état si pas d'utilisateur
        _setLoading(false); // Fin du chargement
      }
    }, (error) => {
        // Gère les erreurs potentielles de l'écouteur lui-même
        console.error("AuthStore: Erreur dans onAuthStateChanged listener:", error);
        _setError("Erreur d'authentification Firebase.");
        _setUserAndAuth(null); // Déconnecte en cas d'erreur listener
        _setLoading(false);
    });

    return unsubscribe; // Retourne la fonction pour pouvoir l'appeler au démontage
  },
}));

// --- Initialisation Globale de l'Écouteur ---
// Appeler initializeAuthListener une seule fois au démarrage de l'app
// N'EST PAS FAIT ICI, mais doit être appelé depuis App.tsx ou index.tsx
// const unsubscribe = useAuthStore.getState().initializeAuthListener();
// Stockez 'unsubscribe' quelque part pour l'appeler au démontage de l'app si nécessaire.

export default useAuthStore;
