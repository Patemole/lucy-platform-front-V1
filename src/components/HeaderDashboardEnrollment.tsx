import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, IconButton, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface HeaderDashboardProps {
    onModifyDashboard: () => void;
}

const Header: React.FC<HeaderDashboardProps> = ({ onModifyDashboard }) => {
    const navigate = useNavigate();

    return (
        <div 
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px',
                backgroundColor: '#fff',
                padding: '0 20px',
                borderBottom: '2px solid #e0e0e0', 
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ color: '#0a0a0a', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                    Dashboard
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Bouton pour ouvrir la popup de modification des widgets */}
                <button 
                    onClick={onModifyDashboard}
                    style={{
                        backgroundColor: 'rgba(0, 123, 255, 0.15)', // Pastel transparent blue
                        color: '#004080', // Darker blue for contrast
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Modify Dashboard
                </button>


                {/* Bouton pour changer les variables de score *
                <button 
                    onClick={() => navigate('/change-score')}
                    style={{
                        backgroundColor: '#E8F5FE',
                        color: '#0366d6',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Change Score Variables
                </button>

                {/* Bouton Beta *
                <button 
                    style={{
                        backgroundColor: '#FEEAEA',
                        color: '#EF4361',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '20px',
                    }}
                >
                    Beta
                </button>

                {/* Icône de notification avec badge */}
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