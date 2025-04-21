import { useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
//import { sendUserInfoToBackend } from '../../../api/calendar-event-studentProfile';
import { StudentProfile, EventStudentProfile } from '../../../interfaces/interfaces_eleve';
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

    const { user, logoutUser: logout } = useAuthStore();
    const { setIsLandingPageVisible } = useChatStore();
    const navigate = useNavigate();


    const fetchProfilePicture = async () => {
        if (!user?.id) return;
    
        try {
          const userRef = doc(db, 'users', user.id);
          const userSnap = await getDoc(userRef);
    
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setProfilePicture(userData.profile_picture || null); // Met à jour avec l'URL ou null
            console.log('Fetched profile picture:', userData.profile_picture || 'No profile picture found');
          } else {
            console.warn('User document does not exist.');
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      };


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






