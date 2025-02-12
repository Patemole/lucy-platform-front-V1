// src/auth/context/AuthContext.js



// src/auth/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase"; // Assurez-vous que le chemin est correct
import { doc, getDoc } from 'firebase/firestore';

// Création du contexte d'authentification
export const AuthContext = createContext();

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatIds, setChatIds] = useState([]);

  useEffect(() => {
    // Liste des routes publiques pour lesquelles l'authentification n'est pas nécessaire
    const publicPaths = ['/chatWidget'];
    const isPublicPath = publicPaths.includes(window.location.pathname);

    if (isPublicPath) {
      console.log("AuthProvider: Auth non requis pour", window.location.pathname);
      setLoading(false); // Pas besoin d'authentification pour cette route
      return;
    }

    console.log("AuthProvider: Initialisation de l'écouteur d'état d'authentification.");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("AuthProvider: Utilisateur connecté:", currentUser);
        try {
          // Récupération des données utilisateur depuis Firestore
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              id: currentUser.uid,
              name: userData.name || '',
              email: currentUser.email,
              university: userData.university || '',
              faculty: userData.faculty || [],
              year: userData.year || '',
              academic_advisor: userData.academic_advisor || '',
              interests: userData.interests || [],
              major: userData.major || [],
              minor: userData.minor || [],
              role: userData.role || '',
              registered_club_status: userData.registered_club_status || '',
              registered_clubs: userData.registered_clubs || '',
            });
            // Récupération des sessions de chat depuis Firestore
              const chatSessions = userData.chatsessions || [];
              console.log("This is the chatsessions:", chatSessions);
              // Définir les chatIds dans le contexte
              setChatIds(chatSessions);
              // Déterminer le dernier chat_id ou utiliser un identifiant par défaut
              const lastChatId = chatSessions.length > 0 ? chatSessions[chatSessions.length - 1] : 'default_chat_id';
              console.log("Voici le chatId que l'on a récupéré de Firestore:", lastChatId);
              // Définir le chat_id principal avec le dernier chat_id
              setPrimaryChatId(lastChatId);
          } else {
            console.error("Données utilisateur non trouvées dans Firestore");
            setUser({
              id: currentUser.uid,
              email: currentUser.email,
              role: '',
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur :", error);
          setUser({
            id: currentUser.uid,
            email: currentUser.email,
            role: '',
          });
        }
        setIsAuth(true);
      } else {
        console.log("AuthProvider: Utilisateur déconnecté.");
        setUser(null);
        setIsAuth(false);
        setChatIds([]);
      }
      setLoading(false); // Fin du chargement après vérification de l'authentification
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      console.log("AuthProvider: Nettoyage de l'écouteur d'état d'authentification.");
      unsubscribe();
    };
  }, []);

  
  // Fonction pour définir le chat_id principal
  const setPrimaryChatId = (newChatId) => {
    setChatIds((prevChatIds) => {
      if (prevChatIds.length > 0) {
        const updatedChatIds = [...prevChatIds];
        updatedChatIds[0] = newChatId;
        return updatedChatIds;
      } else {
        return [newChatId];
      }
    });
    console.log(`AuthProvider: chat_id principal mis à jour dans le contexte: ${newChatId}`);
  };

  // Fonction pour ajouter un chat_id au contexte
  const addChatId = (chatId) => {
    setChatIds((prevChatIds) => [...prevChatIds, chatId]);
    console.log(`AuthProvider: chat_id ajouté au contexte: ${chatId}`);
  };

  // Fonction pour retirer un chat_id du contexte
  const removeChatId = (chatId) => {
    setChatIds((prevChatIds) => prevChatIds.filter(id => id !== chatId));
    console.log(`AuthProvider: chat_id retiré du contexte: ${chatId}`);
  };

  // Fonction de login (gérée par onAuthStateChanged)
  const login = () => {
    setIsAuth(true);
  };

  // Fonction de logout pour réinitialiser l'état de l'utilisateur
  const logout = async () => {
    try {
      console.log("AuthProvider: Tentative de déconnexion.");
      await signOut(auth);
      setUser(null);
      setIsAuth(false);
      setChatIds([]); // Réinitialiser les chat_ids lors de la déconnexion
      console.log("AuthProvider: Utilisateur déconnecté via logout.");
    } catch (error) {
      console.error("AuthProvider: Erreur lors de la déconnexion:", error);
    }
  };

  // Observer les changements de l'état du contexte et loguer les mises à jour
  useEffect(() => {
    console.log("AuthProvider: Contexte mis à jour:", {
      user,
      isAuth,
      loading,
      chatIds,
    });
  }, [user, isAuth, loading, chatIds]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuth,
      setIsAuth,
      loading,
      chatIds,
      addChatId,
      removeChatId,
      setPrimaryChatId,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};








/*
import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase"; // Assurez-vous que le chemin est correct

// Création du contexte d'authentification
export const AuthContext = createContext();

// Définition d'un type pour l'utilisateur


// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatIds, setChatIds] = useState([]); // État pour stocker les chat_ids
  const authInstance = getAuth(); 

  useEffect(() => {
    // Liste des routes publiques pour lesquelles l'authentification n'est pas nécessaire
    const publicPaths = ['/chatWidget'];
    const isPublicPath = publicPaths.includes(window.location.pathname);

    if (isPublicPath) {
      console.log("AuthProvider: Auth non requis pour", window.location.pathname);
      setLoading(false); // Pas besoin d'authentification pour cette route
      return;
    }

    console.log("AuthProvider: Initialisation de l'écouteur d'état d'authentification.");
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        console.log("AuthProvider: Utilisateur connecté:", currentUser);
        setUser({
          id: currentUser.uid,
          name: currentUser.name || "Mauvais name",
          email: currentUser.email,
          role: currentUser.role,
        });
        setIsAuth(true);
      } else {
        console.log("AuthProvider: Utilisateur déconnecté.");
        setUser(null);
        setIsAuth(false);
      }
      setLoading(false); // Fin du chargement après vérification de l'authentification
    });

    // Nettoyer l'écouteur lors de la déconnexion ou du changement
    return () => {
      console.log("AuthProvider: Nettoyage de l'écouteur d'état d'authentification.");
      unsubscribe();
    };
  }, [authInstance]);


  // **Nouvelle Fonction** : Définir chatIds[0] avec un nouveau chat_id
  const setPrimaryChatId = (newChatId) => {
    setChatIds((prevChatIds) => {
      if (prevChatIds.length > 0) {
        const updatedChatIds = [...prevChatIds];
        updatedChatIds[0] = newChatId;
        return updatedChatIds;
      } else {
        return [newChatId];
      }
    });
    console.log(`AuthProvider: chat_id principal mis à jour dans le contexte: ${newChatId}`);
  };

  // Fonction pour ajouter un chat_id au contexte
  const addChatId = (chatId) => {
    setChatIds((prevChatIds) => [...prevChatIds, chatId]);
    console.log(`AuthProvider: chat_id ajouté au contexte: ${chatId}`);
  };

  // Fonction pour retirer un chat_id du contexte (optionnel)
  const removeChatId = (chatId) => {
    setChatIds((prevChatIds) => prevChatIds.filter(id => id !== chatId));
    console.log(`AuthProvider: chat_id retiré du contexte: ${chatId}`);
  };

  // Fonction de login pour mettre à jour l'état de l'utilisateur
  const login = (userData) => {
    setUser(userData);
    setIsAuth(true);
    console.log("AuthProvider: Utilisateur mis à jour via login:", userData);
  };

  // Fonction de logout pour réinitialiser l'état de l'utilisateur
  const logout = async () => {
    try {
      console.log("AuthProvider: Tentative de déconnexion.");
      await signOut(authInstance);
      setUser(null);
      setIsAuth(false);
      setChatIds([]); // Réinitialiser les chat_ids lors de la déconnexion
      console.log("AuthProvider: Utilisateur déconnecté via logout.");
    } catch (error) {
      console.error("AuthProvider: Erreur lors de la déconnexion:", error);
    }
  };

  // Observer les changements de l'état du contexte et loguer les mises à jour
  useEffect(() => {
    console.log("AuthProvider: Contexte mis à jour:", {
      user,
      isAuth,
      loading,
      chatIds,
    });
  }, [user, isAuth, loading, chatIds]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading, chatIds, addChatId, removeChatId, setPrimaryChatId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
*/