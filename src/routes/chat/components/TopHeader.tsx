import React from 'react';
import {
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import ProfileEdit from '@mui/icons-material/Edit';
import { Theme } from '@mui/material/styles';
import { User } from '../../../interfaces/interfaces_eleve';
import ChatIcon from '@mui/icons-material/Chat';


interface TopHeaderProps {
    isLandingPageVisible: boolean;
    isSmallScreen: boolean;
    drawerOpen: boolean;
    toggleDrawer: () => void;
    handleNewConversation: () => void;
    onboardingComplete: boolean | undefined;
    profilePicture: string | null;
    onlineUsers: number;
    isLastStep: boolean;
    progressPercent: number;
    theme: Theme;
    profileMenuAnchorEl: HTMLElement | null;
    parametersMenuAnchorEl: HTMLElement | null;
    handleProfileMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
    handleProfileMenuClose: () => void;
    handleDialogOpen: () => void;
    handleParametersMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
    handleParametersMenuClose: () => void;
    handleDeleteAccount: () => void;
    handleLogout: () => void;
    setShowOnboardingProfilePopup: (v: boolean) => void;
    userUniversity: string | null | undefined;
  }


  const TopHeader: React.FC<TopHeaderProps> = ({
    isLandingPageVisible, isSmallScreen, drawerOpen, toggleDrawer,
    handleNewConversation, onboardingComplete, profilePicture, onlineUsers,
    isLastStep, progressPercent, theme, profileMenuAnchorEl,
    parametersMenuAnchorEl, handleProfileMenuClick, handleProfileMenuClose,
    handleDialogOpen, handleParametersMenuClick, handleParametersMenuClose,
    handleDeleteAccount, handleLogout, setShowOnboardingProfilePopup,
    userUniversity,
  }) => {
    console.log('<<< RENDERING TopHeader >>>');
    const isKedge = userUniversity === 'kedge';

    return (


        <div
                    className="relative p-4 flex items-center justify-between w-full"
                    style={{ 
                        backgroundColor: isLandingPageVisible ? '#F0F4FC' : 'transparent',
                        borderColor: theme.palette.divider,
                    }}
                    >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {!drawerOpen && (
                        <>
                            <IconButton aria-label={isKedge ? "Ouvrir le menu" : "Open menu"} onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                            <MenuIcon />
                            </IconButton>
                            {!isSmallScreen && !isLandingPageVisible && (
                            <IconButton
                                onClick={handleNewConversation}
                                aria-label={isKedge ? "Nouvelle conversation" : "New conversation"}
                                sx={{
                                color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                                cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                                }}
                                disabled={isLandingPageVisible || !onboardingComplete}
                            >
                                <MapsUgcRoundedIcon />
                            </IconButton>
                            )}
                        </>
                        )}
                    </div>

                    <header aria-label="University logo header">
                        <img 
                        src={theme.logo} 
                        alt="University Logo" 
                        style={{ height: '40px', marginRight: '10px' }} 
                        />
                    </header>
                    
                    {/*
                    <img
                        src={theme.logo}
                        alt="University Logo"
                        style={{ height: '40px', marginRight: '10px' }}
                    />
                    */}
        
                    {/* Vignette avec le nombre d'étudiants en ligne */}
                    <div className="flex items-center flex-1 gap-x-4 overflow-hidden">
                    <section aria-label="Online users" className="shrink-0">
                    <div
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '0px',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        border: '1.3px solid #27AE60',
                        backgroundColor: 'transparent',
                        color: '#011F5B',
                        fontSize: '0.83rem',
                        }}
                    >
                        {/*{onlineUsers} online users*/}
                        {onlineUsers} {isSmallScreen ? (isKedge ? "en ligne" : "online") : (isKedge ? "utilisateurs en ligne" : "online users")}
                        <div
                        style={{
                            width: '8.5px',
                            height: '8.5px',
                            borderRadius: '50%',
                            backgroundColor: '#27AE60',
                            marginLeft: '6px',
                        }}
                        />
                    </div>
                    </section>

                    {!onboardingComplete && (
                        <div className="flex-1">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`
                                h-2 rounded-full transition-all duration-500
                                ${isLastStep ? 'bg-[#27AE60] animate-[pulse_1.2s_ease-in-out_infinite]' : 'bg-blue-600'}
                                `}
                                style={{
                                width: progressPercent > 0 ? `${progressPercent}%` : '4px'
                                }}
                            />
                            </div>
                        </div>
                        )}
                    </div>
        
                    


                    
        

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isSmallScreen ? (
                        <>
                            <IconButton
                            onClick={handleNewConversation}
                            aria-label={isKedge ? "Nouvelle conversation" : "New conversation"}
                            sx={{
                                color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                                cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                            }}
                            disabled={isLandingPageVisible || !onboardingComplete}
                            >
                            <MapsUgcRoundedIcon />
                            </IconButton>
                        </>
                        ) : (
                        <>
                            <nav aria-label="Profile menu">
                            <IconButton
                            //onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                            onClick={(event) => {

                                handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);

                                if (!onboardingComplete) {
                                setShowOnboardingProfilePopup(true);
                                return
                                } else {
                                handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);
                                }
                            
                            }}
                            aria-label={isKedge ? "Ouvrir le menu profil" : "Open profile menu"}
                            aria-haspopup="true"
                            aria-controls={profileMenuAnchorEl ? 'profile-menu' : undefined}
                            aria-expanded={Boolean(profileMenuAnchorEl)}
                            sx={{ padding: 0, marginLeft: '5px' }}
                            >
                            {profilePicture ? (
                            <>
                                {/* {console.log('Rendering profile picture with URL:', profilePicture)} */}
                                <img
                                src={profilePicture}
                                alt={isKedge ? "Profil" : "Profile"}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                }}
                                className="rounded-full object-cover cursor-pointer"
                                //onClick={(event) => handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                                />
                            </>
                            ) : (
                            <>
                               
                                <AccountCircleIcon
                                fontSize="inherit"
                                component="svg"
                                style={{
                                    color: '#9e9e9e',
                                    cursor: 'pointer',
                                    margin: '0 auto 0 16px',
                                    fontSize: '2.5rem',
                                }}
                                
                                />
                            </>
                            )}
                            </IconButton>
                            <Menu
                            anchorEl={profileMenuAnchorEl}
                            open={Boolean(profileMenuAnchorEl)}
                            onClose={handleProfileMenuClose}
                            PaperProps={{
                                style: {
                                borderRadius: '12px',
                                backgroundColor: theme.palette.background.paper,
                                },
                            }}
                            >
                            <MenuItem onClick={handleDialogOpen}>
                                <ListItemIcon>
                                <ProfileEdit fontSize="small" sx={{ color: '#011F5B' }} />
                                </ListItemIcon>
                                <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                                    {isKedge ? "Modifier le profil" : "Edit Profile"}
                                    </Typography>
                                }
                                />
                            </MenuItem>
                            
                            <MenuItem onClick={(event) => {
                            handleParametersMenuClick(event);
                            handleProfileMenuClose(); // 🔥 Ferme le menu après le clic
                            }}>

                            
                                <ListItemIcon>
                                <SettingsIcon fontSize="small" sx={{ color: '#011F5B' }} />
                                </ListItemIcon>
                                <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                                    {isKedge ? "Paramètres" : "Parameters"}
                                    </Typography>
                                }
                                />
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                                </ListItemIcon>
                                <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                                    {isKedge ? "Se déconnecter" : "Log-out"}
                                    </Typography>
                                }
                                />
                            </MenuItem>
                            </Menu>
                            <Menu
                            anchorEl={parametersMenuAnchorEl}
                            open={Boolean(parametersMenuAnchorEl)}
                            onClose={handleParametersMenuClose}
                            PaperProps={{
                                style: {
                                borderRadius: '12px',
                                backgroundColor: theme.palette.background.paper,
                                },
                            }}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            sx={{
                                mt: -1,
                                ml: -18,
                            }}
                            >
                            <MenuItem onClick={handleDeleteAccount}>
                                <ListItemIcon>
                                <DeleteIcon fontSize="small" sx={{ color: '#F04261' }} />
                                </ListItemIcon>
                                <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                                    {isKedge ? "Supprimer le compte" : "Delete Account"}
                                    </Typography>
                                }
                                />
                            </MenuItem>
                            </Menu>
                            </nav>
                        </>
                        )}
                    </div>
                    </div>

)}


export default TopHeader;