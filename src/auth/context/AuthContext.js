// src/auth/context/AuthContext.js

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