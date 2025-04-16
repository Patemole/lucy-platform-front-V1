import { useNavigate } from 'react-router-dom';
import { EventStudentProfile } from '../../../interfaces/interfaces_eleve';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import useAuthStore from '../../../stores/useAuthStore';

export const useUserProfile = ({
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
    const navigate = useNavigate();

/*
    useEffect(() => {
        if (!user?.id) return;
        fetchUserInfo();
      }, [user]);
*/

/*
    //Aller chercher la photo de profile de l utilisateur 
 useEffect(() => {
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
      
        fetchProfilePicture();
      }, [user?.id]);
*/


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


      /*
    // fonction pour envoyer les infos de l'utilisateur au backend et récupérer les événements
    const fetchUserInfo = async () => {
        if (!user) {
        console.warn('User data is unavailable.');
        return;
        }
    
        const userInfo: StudentProfile = {
        username: user.name || 'default_username_username_fetch_info',
        university: user.university || 'University Name',
        year: user.year || 'Null',
        studentProfile: localStorage.getItem('student_profile') || 'Brief profile description',
        interests: Array.isArray(user.interests) ? user.interests : ['No interests now'], //Adding interest to the student profile
        registered_club_status: user.registered_club_status || 'No registered_club_status',
        registered_clubs: user.registered_clubs || 'No registered_clubs',
        major: Array.isArray(user.major) ? user.major : ['None_Default'],
        minor: Array.isArray(user.minor) ? user.minor : ['None_Default'],
        faculty: Array.isArray(user.faculty) ? user.faculty : ['None_Default'],
        email: user.email || 'No email provided',
        userId: user.id || 'No ID',
        role: user.role || 'No role',
        createdAt: user?.createdAt || 'Unknown',
        lastLogin: user?.lastLogin || 'Unknown',
        profilePicture: user?.profilePicture || 'No profile picture',
        name: user.name || 'default_username_name_fetch_info',
        academic_advisor: user.academic_advisor || 'Unknown',
        };
    
        console.log('Fetched user info:', userInfo);
    
        try {
        const response = await sendUserInfoToBackend(userInfo);
        if (response && response.events) {
            setEvents(response.events);
            console.log('Events successfully retrieved:', response.events);
        } else {
            console.warn('No events found in response.');
        }
        } catch (error) {
        console.error('Error fetching events:', error);
        }
    };
    */



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
        //fetchUserInfo,
        handleProfileMenuClick,
        handleLogout,
        handleDeleteAccount,
        handleProfileMenuClose,
        handleParametersMenuClose,
        handleParametersMenuClick,
        fetchProfilePicture,
      };
    };






