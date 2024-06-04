import { createContext, useState, useEffect, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const { getItem, setItem, removeItem } = useLocalStorage();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      const storedUser = getItem("user");
      const storedIsAuth = getItem("isAuth") === 'true';

      console.log("AuthProvider initial load: storedUser:", storedUser, "storedIsAuth:", storedIsAuth);

      if (storedUser && storedIsAuth) {
        setUser(JSON.parse(storedUser));
        setIsAuth(true);
      }
    }
  }, [getItem]);

  useEffect(() => {
    console.log("AuthProvider User state changed: user:", user, "isAuth:", isAuth);
    if (user && isAuth) {
      setItem("user", JSON.stringify(user));
      setItem("isAuth", "true");
    } else {
      removeItem("user");
      removeItem("isAuth");
    }
  }, [user, isAuth, setItem, removeItem]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};


