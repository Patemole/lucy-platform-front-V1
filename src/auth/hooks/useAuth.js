// src/auth/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, setUser, isAuth, setIsAuth, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = (userData) => {
    console.log("useAuth: Login appelé avec:", userData);
    setUser(userData);
    setIsAuth(true);
    // La persistance est gérée par Firebase via AuthContext
  };

  const logout = async () => {
    try {
      console.log("useAuth: Tentative de déconnexion.");
      await signOut(auth);
      setUser(null);
      setIsAuth(false);
      // Supprime les autres données non sensibles stockées dans le localStorage
      localStorage.removeItem('course_id');
      localStorage.removeItem('chat_id');
      localStorage.removeItem('faculty');
      localStorage.removeItem('major');
      localStorage.removeItem('minor');
      localStorage.removeItem('student_profile');
      localStorage.removeItem('year');
      // Redirige vers la page de connexion
      navigate('/auth/sign-in');
    } catch (error) {
      console.error("useAuth: Erreur lors de la déconnexion:", error);
    }
  };

  return { user, login, logout, isAuth, loading };
};













