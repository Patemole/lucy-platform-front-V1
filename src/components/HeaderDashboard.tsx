import React from 'react';
import { FaBell } from 'react-icons/fa'; // Icone de cloche
import { useNavigate } from 'react-router-dom';
import {
    Badge,
    IconButton,
  } from '@mui/material';
  import NotificationsIcon from '@mui/icons-material/Notifications';

const Header: React.FC = () => {
    const navigate = useNavigate();

    // Fonction pour récupérer userID depuis le localStorage
    const handleNavigate = () => {
        const storedUser = localStorage.getItem('userID');
        let userID: string | null = null;

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                userID = parsedUser.uid || storedUser; // Si c'est un objet avec uid, sinon utiliser la chaîne directement
            } catch (error) {
                // Si ce n'est pas un JSON valide, considérer que c'est directement l'uid
                userID = storedUser;
            }
        }

        if (userID) {
            navigate(`/dataselection/academic-advisor/${userID}`);
        } else {
            console.error('Aucun userID trouvé dans localStorage');
        }
    };

    return (
        <div 
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px',
                backgroundColor: '#fff',
                padding: '0 20px',
                borderBottom: '2px solid #e0e0e0', // Ligne fine en bas
            }}
        >
            {/* Titre Dashboard à gauche */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ color: '#0a0a0a', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                    Dashboard
                </h1>
            </div>

            {/* Section de droite avec le bouton Beta et l'icône de notification */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Nouveau bouton "Change Score Variables" */}
                <button 
                    onClick={handleNavigate}
                    style={{
                        backgroundColor: '#E8F5FE', // Couleur de fond du bouton
                        color: '#0366d6', // Couleur du texte du bouton
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '10px', // Espace entre les boutons
                    }}
                >
                    Change Score Variables
                </button>

                {/* Bouton Beta V1.3 */}
                <button 
                    style={{
                        backgroundColor: '#FEEAEA', // Couleur de fond du bouton
                        color: '#EF4361', // Couleur du texte du bouton
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '20px', // Espace entre le bouton et l'icône
                    }}
                >
                    Beta
                </button>

                {/* Icône de notification */}
                {/* Notification Bell Icon with Badge */}
                <IconButton>
                <Badge
                    badgeContent={8}
                    color="error"
                    sx={{
                    '& .MuiBadge-badge': {
                        fontSize: '1rem',
                        height: '20px',
                        minWidth: '20px',
                        backgroundColor: '#E60000',
                    },
                    }}
                >
                    <NotificationsIcon sx={{ color: '#011F5B', fontSize: '1.7rem' }} />
                </Badge>
                </IconButton>
            </div>
        </div>
    );
};

export default Header;