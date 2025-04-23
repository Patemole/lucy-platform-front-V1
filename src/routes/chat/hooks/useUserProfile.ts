import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { sendUserInfoToBackend } from '../../../api/calendar-event-studentProfile';
import { EventStudentProfile } from '../../../interfaces/interfaces_eleve';
import { MouseEvent } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../auth/firebase';
import useAuthStore from '../../../stores/useAuthStore';
import { fetchProxiedImage } from '../../../api/auth_and_onboarding';

// Styles CSS pour les logs
const logStyle = {
  info: 'color: blue; font-weight: bold;',
  process: 'color: orange; font-weight: bold;',
  success: 'color: green; font-weight: bold;',
  error: 'color: red; font-weight: bold;',
  firestore: 'color: purple; font-weight: bold;',
};

export const useUserProfile = ({
  setProfileMenuAnchorEl,
  setParametersMenuAnchorEl,
  setProfilePicture,
}: {
  setProfileMenuAnchorEl: (el: HTMLElement | null) => void;
  setParametersMenuAnchorEl: (el: HTMLElement | null) => void;
  setProfilePicture: (val: string | null) => void;

}) => {

    const userId = useAuthStore(state => state.user?.id);
    const linkedinUrlFromStore = useAuthStore(state => state.user?.linkedin_profile?.profile_pic_url);
    const logout = useAuthStore(state => state.logoutUser);
    const navigate = useNavigate();
    const [processedLinkedInUrl, setProcessedLinkedInUrl] = useState<string | null>(null);


    const fetchProfilePictureFromFirestore = useCallback(async () => {
        // Log début de récupération Firestore
        console.log(`%c[Firestore Fetch] Attempting for user: ${userId}`, logStyle.firestore);
        if (!userId) {
            console.log("[Firestore Fetch] No userId.");
             setProfilePicture(null);
            return;
        }

        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const storedPicUrl = userData.profilePicture || null;
            // Log succès récupération Firestore
            console.log(`%c[Firestore Fetch] Found stored URL: ${storedPicUrl}`, logStyle.success);
            setProfilePicture(storedPicUrl);
             if (storedPicUrl && storedPicUrl.includes('firebasestorage.googleapis.com')) {
             }

          } else {
             // Log non trouvé Firestore
            console.warn(`%c[Firestore Fetch] User doc not found for: ${userId}`, logStyle.error);
            setProfilePicture(null);
          }
        } catch (error) {
          // Log erreur Firestore
          console.error(`%c[Firestore Fetch] Error:`, logStyle.error, error);
          setProfilePicture(null);
        }
      }, [userId, setProfilePicture]);


    const processAndStoreLinkedInPicture = useCallback(async (linkedinUrl: string, currentUserId: string) => {
        // Log début traitement LinkedIn
        console.log(`%c[LinkedIn Process] Processing URL via proxy: ${linkedinUrl}`, logStyle.process);
        try {
             // Log avant appel API proxy
            console.log(`%c[LinkedIn Process] Fetching image blob from proxy...`, logStyle.process);
            const blob = await fetchProxiedImage(linkedinUrl);

            if (!blob) {
                 console.error(`%c[LinkedIn Process] Failed to get image blob from proxy.`, logStyle.error);
                 fetchProfilePictureFromFirestore(); // Fallback
                 return;
            }
             // Log succès récupération blob
             console.log(`%c[LinkedIn Process] Received blob from proxy, size: ${blob.size}, type: ${blob.type}`, logStyle.success);

            const fileExtension = blob.type.split('/')[1] || 'jpg';
            const storagePath = `profilePictures/${currentUserId}/linkedin_profile_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, storagePath);

            // Log avant upload Storage
            console.log(`%c[LinkedIn Process] Uploading to Firebase Storage at: ${storagePath}`, logStyle.process);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            await uploadTask;

            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
             // Log succès upload et récupération URL
            console.log(`%c[LinkedIn Process] Upload successful, permanent URL: ${downloadURL}`, logStyle.success);

            const userRef = doc(db, 'users', currentUserId);
             // Log avant mise à jour Firestore (envoi backend)
            console.log(`%c[LinkedIn Process] Updating Firestore for user ${currentUserId}...`, logStyle.firestore);
            await updateDoc(userRef, {
                profilePicture: downloadURL,
                originalLinkedInPicUrl: linkedinUrl
            });
             // Log succès mise à jour Firestore
            console.log(`%c[LinkedIn Process] Firestore updated successfully.`, logStyle.success);

            setProfilePicture(downloadURL);
            setProcessedLinkedInUrl(linkedinUrl);

        } catch (error) {
            // Log erreur traitement LinkedIn
            console.error(`%c[LinkedIn Process] Error processing LinkedIn picture:`, logStyle.error, error);
            fetchProfilePictureFromFirestore(); // Fallback
        }

    }, [storage, setProfilePicture, fetchProfilePictureFromFirestore, setProcessedLinkedInUrl]);


    const handleProfileMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setProfileMenuAnchorEl(event.currentTarget);
    }, [setProfileMenuAnchorEl]);

     const handleProfileMenuClose = useCallback(() => {
        setProfileMenuAnchorEl(null);
    }, [setProfileMenuAnchorEl]);


    const handleParametersMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setParametersMenuAnchorEl(event.currentTarget);
      }, [setParametersMenuAnchorEl]);

    const handleParametersMenuClose = useCallback(() => {
        setParametersMenuAnchorEl(null);
      }, [setParametersMenuAnchorEl]);


    const handleLogout = useCallback(() => {
        console.log("handleLogout called from useUserProfile");
        logout();
        navigate('/auth/sign-in', { replace: true });
    }, [logout, navigate]);


    const handleDeleteAccount = useCallback(() => {
        console.log('Delete Account clicked');
        handleParametersMenuClose();
    }, [handleParametersMenuClose]);


    
     useEffect(() => {
        const linkedinUrl = linkedinUrlFromStore;
         // Log initial useEffect
        console.log(`%c[Effect] Running. User: ${userId}, LinkedIn URL: ${linkedinUrl}`, logStyle.info);

        if (linkedinUrl && userId) {
             if (linkedinUrl !== processedLinkedInUrl) {
                 // Log nécessité de traitement
                console.log(`%c[Effect] New or unprocessed LinkedIn URL detected. Processing...`, logStyle.info);
                processAndStoreLinkedInPicture(linkedinUrl, userId);
             } else {
                 // Log URL déjà traitée
                 console.log(`%c[Effect] LinkedIn URL already processed in this session.`, logStyle.info);
             }

        } else {
             // Log absence d'URL LinkedIn ou userId -> Fetch Firestore
            console.log(`%c[Effect] No LinkedIn URL or userId. Fetching from Firestore...`, logStyle.info);
            fetchProfilePictureFromFirestore();
        }
    }, [linkedinUrlFromStore, userId, processAndStoreLinkedInPicture, fetchProfilePictureFromFirestore, processedLinkedInUrl]);



    return {
        handleProfileMenuClick,
        handleLogout,
        handleDeleteAccount,
        handleProfileMenuClose,
        handleParametersMenuClose,
        handleParametersMenuClick,
        fetchProfilePicture: fetchProfilePictureFromFirestore,
      };
    };






