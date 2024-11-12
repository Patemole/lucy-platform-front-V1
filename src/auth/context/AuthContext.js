import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); 

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("AuthProvider: Utilisateur connecté:", currentUser);
        setUser({
          id: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email,
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
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/* CODE QUI MARCHE BIEN MAIS ON TEST POUR PAS D AUTHENTIFICATION POUR CHATWIDGET
import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // Ajout de l'état de chargement
  const auth = getAuth(); // Initialise Firebase Auth

  useEffect(() => {
    console.log("AuthProvider: Initialisation de l'écouteur d'état d'authentification.");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("AuthProvider: Utilisateur connecté:", currentUser);
        setUser({
          id: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email,
          // Ajoute d'autres propriétés si nécessaire
        });
        setIsAuth(true);
      } else {
        console.log("AuthProvider: Utilisateur déconnecté.");
        setUser(null);
        setIsAuth(false);
      }
      setLoading(false); // Fin du chargement après la vérification
    });

    // Nettoyer l'écouteur lors de la déconnexion ou du changement
    return () => {
      console.log("AuthProvider: Nettoyage de l'écouteur d'état d'authentification.");
      unsubscribe();
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
*/ 





// src/auth/context/AuthContext.js
/*
import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth"; // Importe la persistance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // Ajout de l'état de chargement
  const auth = getAuth(); // Initialise Firebase Auth

  useEffect(() => {
    console.log("AuthProvider: Initialisation de l'écouteur d'état d'authentification.");

    // Configurer la persistance locale des sessions
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Écoute l'état de l'utilisateur connecté
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            console.log("AuthProvider: Utilisateur connecté:", currentUser);
            setUser({
              id: currentUser.uid,
              name: currentUser.displayName || "",
              email: currentUser.email,
              // Ajoute d'autres propriétés si nécessaire
            });
            setIsAuth(true);
          } else {
            console.log("AuthProvider: Utilisateur déconnecté.");
            setUser(null);
            setIsAuth(false);
          }
          setLoading(false); // Fin du chargement après la vérification
        });

        // Nettoyer l'écouteur lors de la déconnexion ou du changement
        return () => {
          console.log("AuthProvider: Nettoyage de l'écouteur d'état d'authentification.");
          unsubscribe();
        };
      })
      .catch((error) => {
        console.error("Erreur lors de la configuration de la persistance :", error);
        setLoading(false); // Fin du chargement même en cas d'erreur
      });

  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
*/