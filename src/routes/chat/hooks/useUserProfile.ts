import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
//import { sendUserInfoToBackend } from '../../../api/calendar-event-studentProfile';
import { StudentProfile, EventStudentProfile, User } from '../../../interfaces/interfaces_eleve';
import { MouseEvent } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';

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

    const fetchProfilePicture = useCallback(async () => {
        console.log("[useUserProfile fetchProfilePicture] Attempting fetch for user:", userId);
        if (!userId) {
            console.log("[useUserProfile fetchProfilePicture] No userId.");
             setProfilePicture(null);
            return;
        }
    
        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
    
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const manualPicUrl = userData.profilePicture || null; 
            console.log('[useUserProfile fetchProfilePicture] Calling setProfilePicture with manual URL:', manualPicUrl);
            setProfilePicture(manualPicUrl);
          } else {
            console.warn('[useUserProfile fetchProfilePicture] User doc not found for:', userId);
            console.log('[useUserProfile fetchProfilePicture] Calling setProfilePicture with null (doc not found).');
            setProfilePicture(null);
          }
        } catch (error) {
          console.error('[useUserProfile fetchProfilePicture] Error:', error);
          console.log('[useUserProfile fetchProfilePicture] Calling setProfilePicture with null (error).');
          setProfilePicture(null);
        }
      }, [userId, setProfilePicture]);

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

    // useEffect qui réagit aux changements de user.linkedin_profile.logo_url
    useEffect(() => {
        console.log("[useUserProfile useEffect] Running. LinkedIn profile data:", user?.linkedin_profile);
        
        const linkedinUrl = user?.linkedin_profile?.profile_pic_url;

        if (linkedinUrl) {
            console.log("[useUserProfile useEffect] Using LinkedIn URL:", linkedinUrl);
            console.log('[useUserProfile useEffect] Calling setProfilePicture with LinkedIn URL:', linkedinUrl);
            setProfilePicture(linkedinUrl);
        } else {
            console.log("[useUserProfile useEffect] No LinkedIn URL, calling fetchProfilePicture.");
            fetchProfilePicture();
        }
    }, [user?.linkedin_profile?.profile_pic_url, fetchProfilePicture, setProfilePicture]);

    
    return {
        handleProfileMenuClick,
        handleLogout,
        handleDeleteAccount,
        handleProfileMenuClose,
        handleParametersMenuClose,
        handleParametersMenuClick,
        fetchProfilePicture,
      };
    };






