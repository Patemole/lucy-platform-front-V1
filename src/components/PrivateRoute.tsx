
import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../auth/context/AuthContext';

const PrivateRoute = () => {
  const { isAuth, user, setUser, setIsAuth } = useContext(AuthContext);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAuth = localStorage.getItem('isAuth') === 'true';

    console.log("PrivateRoute useEffect: storedUser:", storedUser, "storedIsAuth:", storedIsAuth);

    if (storedUser && storedIsAuth) {
      setUser(JSON.parse(storedUser));
      setIsAuth(true);
    }
  }, [setUser, setIsAuth]);

  console.log("PrivateRoute: isAuth:", isAuth, "user:", user);

  
  if (!isAuth || !user) {
    console.log("PrivateRoute: Not authenticated, redirecting to /sign-in/student");
    return <Navigate to="/sign-in/student" />;
  }

  console.log("PrivateRoute: Authenticated, rendering Outlet");
  return <Outlet />;
};

export default PrivateRoute;
