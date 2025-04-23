import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { sendUserInfoToBackend } from '../../../api/calendar-event-studentProfile';
import { StudentProfile, EventStudentProfile, User } from '../../../interfaces/interfaces_eleve';
import { MouseEvent } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../auth/firebase';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { fetchProxiedImage } from '../../../api/auth_and_onboarding';

export const useUserProfile = ({
  setEvents,
  setProfileMenuAnchorEl,
  setParametersMenuAnchorEl,
  setProfilePicture,
}: {
  setEvents: (val: EventStudentProfile[]) => void;
  setProfileMenuAnchorEl: (el: HTMLElement | null) => void;
  setParametersMenuAnchorEl: (el: HTMLElement | null) => void;
  setProfilePicture: (val: string | null) => void;

}) => {

    const user = useAuthStore(state => state.user);
    const userId = user?.id;
    const logout = useAuthStore(state => state.logoutUser);
    const { setIsLandingPageVisible } = useChatStore();
    const navigate = useNavigate();
    // État pour suivre l'URL traitée pour éviter les re-téléchargements inutiles
    const [processedLinkedInUrl, setProcessedLinkedInUrl] = useState<string | null>(null);


    // Fonction pour récupérer l'URL depuis Firestore (peut-être manuelle ou déjà traitée)
    const fetchProfilePictureFromFirestore = useCallback(async () => {
        console.log("[useUserProfile fetchProfilePictureFromFirestore] Attempting fetch for user:", userId);
        if (!userId) {
            console.log("[useUserProfile fetchProfilePictureFromFirestore] No userId.");
             setProfilePicture(null);
            return;
        }

        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Utilise l'URL stockée dans Firestore
            const storedPicUrl = userData.profilePicture || null;
            console.log('[useUserProfile fetchProfilePictureFromFirestore] Found stored URL:', storedPicUrl);
            setProfilePicture(storedPicUrl);
             // Si l'URL stockée vient de LinkedIn (et a été traitée), la mémoriser
             if (storedPicUrl && storedPicUrl.includes('firebasestorage.googleapis.com')) {
                 // On pourrait stocker l'URL LinkedIn d'origine si nécessaire pour une comparaison future
                 // Pour l'instant, on suppose que si une URL firebase existe, elle est à jour.
             }

          } else {
            console.warn('[useUserProfile fetchProfilePictureFromFirestore] User doc not found for:', userId);
            setProfilePicture(null);
          }
        } catch (error) {
          console.error('[useUserProfile fetchProfilePictureFromFirestore] Error:', error);
          setProfilePicture(null);
        }
      }, [userId, setProfilePicture]);


    // Fonction pour traiter l'URL LinkedIn : télécharger et uploader sur Firebase Storage
    const processAndStoreLinkedInPicture = useCallback(async (linkedinUrl: string, currentUserId: string) => {
        console.log("[useUserProfile processAndStoreLinkedInPicture] Processing URL via proxy:", linkedinUrl);
        try {
            // 1. Obtenir le Blob de l'image via l'API backend (proxy)
            const blob = await fetchProxiedImage(linkedinUrl);

            if (!blob) {
                 console.error("[useUserProfile processAndStoreLinkedInPicture] Failed to get image blob from proxy.");
                 // Optionnel: Tenter de charger depuis Firestore comme fallback ?
                 fetchProfilePictureFromFirestore();
                 return; // Arrêter le processus si le blob n'est pas obtenu
            }

            console.log("[useUserProfile processAndStoreLinkedInPicture] Received blob from proxy, proceeding to upload to Firebase Storage.");

            // 2. Créer une référence dans Firebase Storage
            // Utiliser le type du blob s'il existe, sinon fallback sur jpg
            const fileExtension = blob.type.split('/')[1] || 'jpg';
            const storageRef = ref(storage, `profilePictures/${currentUserId}/linkedin_profile_${Date.now()}.${fileExtension}`);

            // 3. Uploader l'image (blob)
            const uploadTask = uploadBytesResumable(storageRef, blob);

            // Attendre la fin de l'upload
            await uploadTask;

            // 4. Obtenir l'URL de téléchargement permanente
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[useUserProfile processAndStoreLinkedInPicture] Upload successful, permanent URL:', downloadURL);

            // 5. Mettre à jour Firestore avec la nouvelle URL permanente
            const userRef = doc(db, 'users', currentUserId);
            await updateDoc(userRef, {
                profilePicture: downloadURL,
                originalLinkedInPicUrl: linkedinUrl // Stocker l'URL d'origine peut être utile
            });
            console.log('[useUserProfile processAndStoreLinkedInPicture] Firestore updated.');

             // Mettre à jour l'état local immédiatement
            setProfilePicture(downloadURL);
            // Marquer cette URL comme traitée
            setProcessedLinkedInUrl(linkedinUrl);


        } catch (error) {
            console.error('[useUserProfile processAndStoreLinkedInPicture] Error processing LinkedIn picture:', error);
            // En cas d'erreur, tenter de récupérer l'ancienne depuis Firestore
            fetchProfilePictureFromFirestore();
        }

    }, [storage, setProfilePicture, fetchProfilePictureFromFirestore]);


    const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setProfileMenuAnchorEl(event.currentTarget);
    };

     //gere la fermeture du menu de log-out
    const handleProfileMenuClose = () => {
        setProfileMenuAnchorEl(null);
    };


    const handleParametersMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setParametersMenuAnchorEl(event.currentTarget);
      };

    const handleParametersMenuClose = () => {
        setParametersMenuAnchorEl(null);
      };


    //gestion du log-out
    const handleLogout = () => {
        console.log("handleLogout called from useUserProfile");
        logout();
        navigate('/auth/sign-in', { replace: true });
    };


    const handleDeleteAccount = () => {
        console.log('Delete Account clicked');
        handleParametersMenuClose();
    };

     // useEffect principal pour gérer la photo de profil
    useEffect(() => {
        const linkedinUrl = user?.linkedin_profile?.profile_pic_url;
        console.log("[useUserProfile useEffect] Running. User:", userId, "LinkedIn URL:", linkedinUrl);

        if (linkedinUrl && userId) {
             // Vérifier si l'URL a déjà été traitée dans cette session ou si elle est différente
             if (linkedinUrl !== processedLinkedInUrl) {
                console.log("[useUserProfile useEffect] New or unprocessed LinkedIn URL detected. Processing:", linkedinUrl);
                // Lancer le processus d'upload/stockage
                processAndStoreLinkedInPicture(linkedinUrl, userId);
             } else {
                 console.log("[useUserProfile useEffect] LinkedIn URL already processed in this session. Using existing state.");
                 // Si déjà traitée, on ne fait rien, l'état `profilePicture` doit déjà être correct (soit via process, soit via fetch initial)
             }

        } else {
            console.log("[useUserProfile useEffect] No LinkedIn URL found or no userId. Fetching from Firestore.");
            // Si pas d'URL LinkedIn, essayer de charger depuis Firestore (peut être une URL manuelle ou une ancienne URL LinkedIn traitée)
            fetchProfilePictureFromFirestore();
        }
        // La dépendance inclut l'URL LinkedIn et userId pour réagir aux changements
        // On inclut aussi les fonctions pour la stabilité selon les règles des hooks
    }, [user?.linkedin_profile?.profile_pic_url, userId, processAndStoreLinkedInPicture, fetchProfilePictureFromFirestore, processedLinkedInUrl]);



    return {
        handleProfileMenuClick,
        handleLogout,
        handleDeleteAccount,
        handleProfileMenuClose,
        handleParametersMenuClose,
        handleParametersMenuClick,
        fetchProfilePicture: fetchProfilePictureFromFirestore, // Exposer la fonction de fetch Firestore si nécessaire ailleurs
      };
    };






