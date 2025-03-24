import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '../../auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../auth/hooks/useAuth';

const LTILogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token'); //take the token from the url 
    const newUser = searchParams.get('newUser') === 'true'; //know if the user has already an account or not from the url

    if (token) {
      signInWithCustomToken(auth, token) //fonction allowing instant connexion with firestore without asking user to enter passeword, email address for login/logout
        .then(async (userCredential) => {
          const firebaseUser = userCredential.user;
          console.log("Firebase login via LTI:", firebaseUser.uid);

          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            login({
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              university: userData.university || 'canvas',
              onboardingComplete: userData.onboardingComplete,
              role: userData.roles,
            });

            if (newUser) {
              navigate('/onboarding/learningStyleSurvey', { replace: true });
            } else {
              navigate(`/dashboard/student/${firebaseUser.uid}`, { replace: true });
            }

          } else {
            console.error("Utilisateur introuvable dans Firestore");
            navigate("/auth/sign-in");
          }
        })
        .catch((error) => {
          console.error("Erreur Firebase via Custom Token:", error);
          navigate("/auth/sign-in");
        });
    } else {
      console.error("Token Firebase absent");
      navigate("/auth/sign-in");
    }
  }, [searchParams, navigate, login]);

  return <div>Connexion via Canvas en cours...</div>;
};

export default LTILogin;