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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore'; // Ajoutez updateDoc si nécessaire pour mettre à jour Firestore
import { auth, db } from '../auth/firebase'; // Assurez-vous que ce chemin est correct
import { User } from '../interfaces/interfaces_eleve'; // Assurez-vous que ce chemin est correct

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Pour le chargement initial de l'état d'auth
  isFetchingUserData: boolean; // Pour le chargement spécifique des données Firestore
  error: string | null;
  chatIds: string[]; // Gardons ceci pour une référence rapide, mais la vérité est dans user.chatsessions
  _userDocUnsubscribe: Unsubscribe | null; // <-- Stocker l'unsubscribe du listener user doc

  // Actions internes pour modifier l'état
  _setUserAndAuth: (user: User | null, firebaseUser?: any) => void; // Renommée pour clarté
  _setLoading: (loading: boolean) => void;
  _setFetchingUserData: (fetching: boolean) => void;
  _setError: (error: string | null) => void;
  _setChatIds: (chatIds: string[]) => void;
  _setUserDocUnsubscribe: (unsubscribe: Unsubscribe | null) => void; // <-- Setter pour l'unsubscribe

  // Actions publiques utilisables par les composants
  // fetchUserData n'est plus nécessaire car le listener s'en charge
  // fetchUserData: (userId: string) => Promise<void>; 
  addChatIdToStoreAndFirestore: (chatId: string) => Promise<void>; 
  removeChatIdFromStore: (chatId: string) => void; 
  logoutUser: () => Promise<void>;
  updateUserProfileInStore: (updatedProfileData: Partial<User>) => void; // Pour les mises à jour locales

  // Fonction pour initialiser l'écouteur Firebase Auth (et maintenant User Doc)
  initializeListeners: () => () => void; // Renommé pour clarté, retourne l'unsubscribe de l'Auth
}

const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // --- État Initial ---
      user: null,
      isAuthenticated: false,
      isLoading: true, 
      isFetchingUserData: false, // Sera géré par le listener maintenant
      error: null,
      chatIds: [],
      _userDocUnsubscribe: null, // <-- Initialisé à null

      // --- Actions Internes (pour le store lui-même) ---
      _setLoading: (loading) => set({ isLoading: loading }, false, 'auth/setLoading'),
      _setFetchingUserData: (fetching) => set({ isFetchingUserData: fetching }, false, 'auth/setFetchingUserData'),
      _setError: (error) => set({ error: error, isLoading: false, isFetchingUserData: false }, false, 'auth/setError'),
      _setChatIds: (chatIds) => set({ chatIds }, false, 'auth/setChatIds'),
      _setUserDocUnsubscribe: (unsubscribe) => set({ _userDocUnsubscribe: unsubscribe }, false, 'auth/setUserDocUnsubscribe'),

      _setUserAndAuth: (userData, firebaseUser = null) => {
        const wasAuth = get().isAuthenticated;
        if (userData === null) {
          get()._userDocUnsubscribe?.(); 
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isFetchingUserData: false,
            error: null,
            chatIds: [],
            _userDocUnsubscribe: null, 
          }, false, 'auth/setUserLoggedOut');
          if (wasAuth) console.log("AuthStore: Utilisateur déconnecté.");
        } else {
           const chatSessions = userData.chatsessions || [];
           const oldUser = get().user;
           set(state => ({
            user: state.user ? { ...state.user, ...userData } : userData, 
            isAuthenticated: true,
            isLoading: false, 
            isFetchingUserData: false, 
            error: null,
            chatIds: chatSessions, 
          }), false, 'auth/setUserLoggedInOrUpdated');
          const newUser = get().user;
          if (!wasAuth || oldUser?.id !== newUser?.id) {
               console.log("AuthStore: Utilisateur authentifié/mis à jour:", newUser);
          }
           if (JSON.stringify(oldUser?.chatsessions) !== JSON.stringify(chatSessions)) {
                console.log("AuthStore: Chat IDs mis à jour:", chatSessions);
           }
        }
      },

      // --- Actions Publiques (pour les composants) ---

      // La fonction fetchUserData n'est plus nécessaire publiquement, le listener s'en occupe.
      /*
      fetchUserData: async (userId) => {
         ... ancienne logique ...
      },
      */

      // Met à jour le profil localement dans le store
      updateUserProfileInStore: (updatedProfileData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updatedProfileData };
          set({ user: updatedUser }, false, 'auth/updateProfileStoreOnly'); 
          console.log("AuthStore: Profil utilisateur mis à jour localement:", updatedUser);
          // Rappel : Nécessite une autre action pour persister dans Firestore.
        }
      },

      addChatIdToStoreAndFirestore: async (chatId) => {
        const { user, _setError } = get();
        if (!user || !user.id) {
            console.error("AuthStore: Utilisateur non connecté, impossible d'ajouter un chatId.");
            _setError("Vous devez être connecté pour ajouter une conversation.");
            return;
        }
        
        const userDocRef = doc(db, 'users', user.id);
        try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const currentDbChatIds = userSnap.data().chatsessions || [];
                if (!currentDbChatIds.includes(chatId)) {
                    await updateDoc(userDocRef, { chatsessions: [...currentDbChatIds, chatId] });
                     console.log(`AuthStore: ChatId ${chatId} ajouté à Firestore (le listener mettra à jour le store).`);
                } else {
                     console.warn(`AuthStore: ChatId ${chatId} déjà présent dans Firestore.`);
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

      removeChatIdFromStore: (chatId) => {
        console.warn("AuthStore: removeChatIdFromStore est obsolète. La suppression Firestore déclenche la mise à jour.");
      },

      logoutUser: async () => {
        const { _setUserAndAuth, _setError, _userDocUnsubscribe } = get();
        
        if (_userDocUnsubscribe) {
          console.log("AuthStore: Arrêt de l'écouteur du document utilisateur.");
          _userDocUnsubscribe();
          set({ _userDocUnsubscribe: null }, false, 'auth/cleanupUserDocListener'); 
        } else {
            console.warn("AuthStore: Aucun écouteur de document utilisateur à arrêter lors de la déconnexion.");
        }

        console.log("AuthStore: Tentative de déconnexion Firebase...");
        try {
          await signOut(auth);
          _setUserAndAuth(null);
          console.log("AuthStore: Déconnexion Firebase réussie.");
        } catch (error) {
          console.error("AuthStore: Erreur lors de la déconnexion Firebase:", error);
           _setError("Erreur lors de la déconnexion.");
           _setUserAndAuth(null);
        }
      },

      // --- Initialisation des écouteurs ---
      initializeListeners: () => {
        console.log("AuthStore: Initialisation de l'écouteur onAuthStateChanged.");
        const { _setUserAndAuth, _setLoading, _setError, _userDocUnsubscribe, _setUserDocUnsubscribe } = get();
        _setLoading(true); 

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
          _userDocUnsubscribe?.();
          _setUserDocUnsubscribe(null);

          if (firebaseUser) {
            console.log("AuthStore: onAuthStateChanged - Utilisateur Firebase détecté:", firebaseUser.uid);
             const basicUser = { id: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || 'Loading...' } as User;
             set({ user: basicUser, isAuthenticated: true, isLoading: false, isFetchingUserData: true }, false, 'auth/authStateChanged_UserDetected');

             console.log(`AuthStore: Mise en place du listener pour le document user ${firebaseUser.uid}`);
             const userDocRef = doc(db, 'users', firebaseUser.uid);
             const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
                 if (docSnap.exists()) {
                     const userDataFromDb = docSnap.data() as Omit<User, 'id'>;
                     const fullUserData: User = {
                         id: firebaseUser.uid, 
                         email: firebaseUser.email || '', 
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
                         linkedin_profile: userDataFromDb.linkedin_profile || null, 
                         onboardingMessageSent: userDataFromDb.onboardingMessageSent !== undefined ? userDataFromDb.onboardingMessageSent : true,
                         chatsessions: userDataFromDb.chatsessions || [], 
                         createdAt: (userDataFromDb.createdAt as any)?.toDate ? (userDataFromDb.createdAt as any).toDate().toISOString() : undefined, 
                         lastLogin: (userDataFromDb.lastLogin as any)?.toDate ? (userDataFromDb.lastLogin as any).toDate().toISOString() : undefined,
                         profilePicture: userDataFromDb.profilePicture || undefined,
                         complianceAccepted: userDataFromDb.complianceAccepted !== undefined ? userDataFromDb.complianceAccepted : false,
                         termsAccepted: userDataFromDb.termsAccepted !== undefined ? userDataFromDb.termsAccepted : false,
                         ageConfirmed: userDataFromDb.ageConfirmed !== undefined ? userDataFromDb.ageConfirmed : false,
                         instagram_username: userDataFromDb.instagram_username || undefined,
                         instagram_profile: userDataFromDb.instagram_profile || undefined,
                     };
                     set({ user: fullUserData, isAuthenticated: true, isLoading: false, isFetchingUserData: false, chatIds: fullUserData.chatsessions || [], error: null }, false, 'auth/userDocSnapshot_Updated');
                 } else {
                     console.error("AuthStore: Listener UserDoc - Document non trouvé pour", firebaseUser.uid);
                     _setError("Profil utilisateur introuvable.");
                      set({ isFetchingUserData: false }); 
                 }
             }, (error) => {
                 console.error(`AuthStore: Erreur dans le listener UserDoc (${firebaseUser.uid}):`, error);
                 _setError("Erreur de chargement du profil.");
                  set({ isFetchingUserData: false });
             });
             _setUserDocUnsubscribe(unsubscribeUserDoc);

          } else {
            console.log("AuthStore: onAuthStateChanged - Aucun utilisateur Firebase.");
            _setUserAndAuth(null);
            _setLoading(false);
          }
        }, (error) => {
            console.error("AuthStore: Erreur dans onAuthStateChanged listener:", error);
            _setError("Erreur d'authentification Firebase.");
            _setUserAndAuth(null); 
            _setLoading(false);
        });

        return unsubscribeAuth; 
      },
    }),
    { name: "AuthStore" }
  )
);

// --- Initialisation Globale de l'Écouteur ---
// Appeler initializeAuthListener une seule fois au démarrage de l'app
// N'EST PAS FAIT ICI, mais doit être appelé depuis App.tsx ou index.tsx
// const unsubscribe = useAuthStore.getState().initializeAuthListener();
// Stockez 'unsubscribe' quelque part pour l'appeler au démontage de l'app si nécessaire.

export default useAuthStore;