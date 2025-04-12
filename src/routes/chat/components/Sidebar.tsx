import React from 'react';
import {
  Drawer, Box, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  MapsUgcRounded as MapsUgcRoundedIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ProfileEdit from '@mui/icons-material/Edit';

import { Conversation, SocialThread, User } from '../../../interfaces/interfaces_eleve';



type SidebarProps = {
    theme: any;
    isSmallScreen: boolean;
    drawerOpen: boolean;
    toggleDrawer: () => void;
    profilePicture: string | null;
    user: User | null;
    isLandingPageVisible: boolean;
    isHistory: boolean;
    setIsHistory: (val: boolean) => void;
    profileMenuAnchorEl: HTMLElement | null;
    handleProfileMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
    handleProfileMenuClose: () => void;
    handleParametersMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
    handleLogout: () => void;
    handleDialogOpen: () => void;
    conversations: Conversation[];
    handleNewConversation: () => void;
    setShowOnboardingProfilePopup: (v: boolean) => void;
    handleConversationClick: (id: string) => void;
    activeChatId: string | null;
    unreadCount: number;
    menuAnchorEl: HTMLElement | null;
    handleMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
    handleMenuClose: () => void;
    handleRename: () => void;
    handleDelete: () => void;
    socialThreads: SocialThread[];
    loadingSocialThreads: boolean;
    topicColors: { [key: string]: string };
    setShowOnboardingModifyConvPopup: (v: boolean) => void;
    setShowOnboardingSocialThreadPopup: (v: boolean) => void;
    formatDate: (timestamp: { toDate: () => Date }) => string;
  };


  const Sidebar: React.FC<SidebarProps> = ({
    theme, isSmallScreen, drawerOpen, toggleDrawer,
    profilePicture, user, isLandingPageVisible,
    isHistory, setIsHistory, profileMenuAnchorEl,
    handleProfileMenuClick, handleProfileMenuClose,
    handleParametersMenuClick, handleLogout, handleDialogOpen,
    conversations, handleConversationClick, activeChatId,
    unreadCount, menuAnchorEl, handleMenuOpen, handleMenuClose,
    handleRename, handleDelete, socialThreads, loadingSocialThreads,
    topicColors, setShowOnboardingModifyConvPopup, 
    setShowOnboardingSocialThreadPopup, handleNewConversation,setShowOnboardingProfilePopup, formatDate
  }) => {

    const drawerWidth = 270;

    


    return(



    <Drawer
                variant={isSmallScreen ? "temporary" : "persistent"}
                anchor="left"
                open={drawerOpen}
                onClose={isSmallScreen ? toggleDrawer : undefined}
                PaperProps={{
                style: {
                    width: isSmallScreen ? '80vw' : drawerWidth,
                    borderRadius: '0',
                    position: 'fixed',
                    height: '100%',
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                    zIndex: 49,
                },
                }}
                ModalProps={{
                keepMounted: true,
                BackdropProps: {
                    style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                },
                }}
            >
                {/* header avec boutons de menu et nouvelle conversation */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                <IconButton aria-label="open menu" onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                    {drawerOpen ? <KeyboardDoubleArrowLeftIcon /> : <MenuIcon />}
                </IconButton>
                {isSmallScreen ? (
                    <nav aria-label="mobile profile menu">
                    <Box style={{ padding: '10px', borderTop: `0px solid ${theme.palette.divider}` }}>
                        {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="profile"
                            style={{ width: '50px', height: '50px' }}
                            className="rounded-full object-cover cursor-pointer"
                            //onClick={(event) =>handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)}
                            onClick={(event) => {
                                if (!user?.onboardingComplete) { // quand l onboarding n est pas fini
                                setShowOnboardingProfilePopup(true);
                                return
                                } else {
                                handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>);
                                }
                            }}
                        />
                        ) : (
                        <AccountCircleIcon
                            fontSize="inherit"
                            component="svg"
                            style={{
                            color: '#9e9e9e',
                            cursor: 'pointer',
                            margin: '0 auto 0 10px',
                            fontSize: '2.2rem',
                            }}
                            onClick={(event) =>
                            handleProfileMenuClick(event as unknown as React.MouseEvent<HTMLElement>)
                            }
                        />
                        )}
                        <Menu
                        anchorEl={profileMenuAnchorEl}     
                        open={Boolean(profileMenuAnchorEl)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                            style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper },
                        }}
                        >
                        <MenuItem
                            onClick={() => {
                            handleDialogOpen();
                            handleProfileMenuClose();
                            setTimeout(toggleDrawer, 50);
                            }}
                        >
                            <ListItemIcon>
                            <ProfileEdit fontSize="small" sx={{ color: '#011F5B' }} />
                            </ListItemIcon>
                            <ListItemText primary="edit profile" />
                        </MenuItem>
                        <MenuItem
                            onClick={(event) => {
                            handleParametersMenuClick(event);
                            handleProfileMenuClose();
                            }}
                        >
                            <ListItemIcon>
                            <SettingsIcon fontSize="small" sx={{ color: '#011F5B' }} />
                            </ListItemIcon>
                            <ListItemText primary="parameters" />
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                            <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
                            </ListItemIcon>
                            <ListItemText primary="log-out" />
                        </MenuItem>
                        </Menu>
                    </Box>
                    </nav>
                ) : (
                    <IconButton
                    onClick={() => {
                        if (!isLandingPageVisible) {
                        handleNewConversation();
                        if (isSmallScreen) toggleDrawer();
                        }
                    }}
                    aria-label="new conversation"
                    sx={{
                        color: isLandingPageVisible ? 'grey' : theme.palette.sidebar,
                        cursor: isLandingPageVisible ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isLandingPageVisible || !user?.onboardingComplete}
                    >
                    <MapsUgcRoundedIcon />
                    </IconButton>
                )}
                </Box>

                {/* navigation de la sidebar */}
                <nav aria-label="sidebar navigation">
                <List component="ul" style={{ padding: '0 10px' }}>
                    {/*
                    ancien bouton "your events" commenté :
                    <ListItem
                    component="li"
                    tabIndex={0}
                    onClick={...}
                    ...
                    >
                    <ListItemIcon ...>
                        <DashboardIcon sx={{ fontSize: '22px' }} />
                    </ListItemIcon>
                    <ListItemText primary="your events" ... />
                    </ListItem>
                    */}

                    {/* bouton conversation history */}
                    <ListItem
                    component="li"
                    tabIndex={0}
                    onClick={() => {
                        setIsHistory(true);
                        if (isSmallScreen) setTimeout(toggleDrawer, 50);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsHistory(true);
                        if (isSmallScreen) setTimeout(toggleDrawer, 50);
                        }
                    }}
                    sx={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: isHistory ? theme.palette.button.background : "transparent",
                        mb: 1,
                        "&:hover": {
                        backgroundColor: isHistory ? theme.palette.button.background : theme.palette.action.hover,
                        },
                    }}
                    >
                    <ListItemIcon
                        sx={{
                        color: isHistory ? theme.palette.primary.main : theme.palette.sidebar,
                        minWidth: "35px",
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: "22px" }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Conversation history"
                        primaryTypographyProps={{
                        style: {
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color: isHistory ? theme.palette.primary.main : theme.palette.text.primary,
                        },
                        }}
                    />
                    </ListItem>

                    {/* bouton social thread */}
                    <ListItem
                    component="li"
                    tabIndex={0}
                    onClick={() => {
                        setIsHistory(false);
                        if (isSmallScreen) setTimeout(toggleDrawer, 50);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsHistory(false);
                        if (isSmallScreen) setTimeout(toggleDrawer, 50);
                        }
                    }}
                    sx={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: !isHistory ? theme.palette.button.background : "transparent",
                        mb: 1,
                        "&:hover": {
                        backgroundColor: !isHistory ? theme.palette.button.background : theme.palette.action.hover,
                        },
                    }}
                    >
                    <ListItemIcon
                        sx={{
                        color: !isHistory ? theme.palette.primary.main : theme.palette.sidebar,
                        minWidth: "35px",
                        }}
                    >
                        <PeopleIcon sx={{ fontSize: "22px" }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                        <Box display="flex" alignItems="center">
                            <Typography
                            variant="body2"
                            sx={{
                                fontWeight: "500",
                                fontSize: "0.875rem",
                                color: !isHistory ? theme.palette.primary.main : theme.palette.text.primary,
                            }}
                            >
                            Social thread
                            </Typography>
                            {unreadCount > 0 && (
                            <Box
                                sx={{
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "8px",
                                padding: "2px 6px",
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minWidth: "20px",
                                }}
                            >
                                {unreadCount}
                            </Box>
                            )}
                        </Box>
                        }
                    />
                    </ListItem>
                </List>
                </nav>

                <Divider style={{ backgroundColor: 'lightgray' }} />

                {/* en-tête de la section affichée */}
                <section aria-label={isHistory ? "Conversation History" : "Last Public Interactions"}>
                <div
                    className="text-center text-black-500 font-semibold mt-5 mb-2 flex justify-center items-center"
                    style={{
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    marginBottom: '8px',
                    }}
                >
                    <span>
                    {isHistory ? "Conversation History" : "Last Public Interactions"}
                    </span>
                    {!isHistory && unreadCount > 0 && (
                    <div
                        className="ml-2 flex items-center justify-center text-white"
                        style={{
                        backgroundColor: 'red',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        minWidth: '20px',
                        height: '20px',
                        }}
                    >
                        {unreadCount}
                    </div>
                    )}
                </div>
                </section>

                {/* conteneur défilant pour la liste */}
                <Box style={{ flexGrow: 1, overflowY: 'auto', padding: '0 5px' }}>
                {isHistory ? (
                    <nav
                    aria-label="Conversations list"
                    onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Escape') {
                        e.preventDefault();
                        document.getElementById('chat-section')?.focus();
                        }
                    }}
                    >
                    <List component="ul">
                        {conversations.length > 0 ? (
                        conversations.sort((a, b) => a.chat_id === 'onboarding_chat_id' ? -1 : 1).map((conversation) => (
                            <ListItem
                            key={conversation.chat_id}
                            component="li"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                handleConversationClick(conversation.chat_id);
                                if (isSmallScreen) toggleDrawer();
                            }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleConversationClick(conversation.chat_id);
                                if (isSmallScreen) toggleDrawer();
                                }
                            }}
                            sx={{
                                cursor: 'pointer',
                                position: 'relative',
                                borderRadius: '8px',
                                margin: '2px 0',
                                paddingRight: '40px',
                                backgroundColor:
                                activeChatId === conversation.chat_id
                                    ? theme.palette.button.background
                                    : 'transparent',
                                '& .circle': {
                                backgroundColor:
                                    activeChatId === conversation.chat_id
                                    ? conversation.thread_type === 'Private'
                                        ? '#6F6F6F'
                                        : '#4A90E2'
                                    : conversation.thread_type === 'Private'
                                    ? '#BDBDBD'
                                    : '#A9C2E8',
                                },
                                '@media (hover: hover) and (pointer: fine)': {
                                '&:hover': {
                                    backgroundColor: theme.palette.button.background,
                                    '& .circle': {
                                    backgroundColor:
                                        activeChatId === conversation.chat_id
                                        ? conversation.thread_type === 'Private'
                                            ? '#6F6F6F'
                                            : '#4A90E2'
                                        : conversation.thread_type === 'Private'
                                        ? '#6F6F6F'
                                        : '#4A90E2',
                                    },
                                },
                                },
                            }}
                            >
                            <Box
                                className="circle"
                                sx={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                marginRight: '14px',
                                flexShrink: 0,
                                }}
                            />
                            <ListItemText
                                primary={conversation.name}
                                primaryTypographyProps={{
                                style: {
                                    fontWeight: '500',
                                    fontSize: '0.850rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                },
                                }}
                                secondary={
                                <Box
                                    sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginTop: '2px',
                                    }}
                                >
                                    <Box
                                    sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        color: conversation.thread_type === 'Private' ? '#6F6F6F' : '#4A90E2',
                                        backgroundColor: conversation.thread_type === 'Private' ? '#F0F0F0' : '#E0F2FF',
                                        padding: '2px 6px',
                                        borderRadius: '5px',
                                        display: 'inline-block',
                                    }}
                                    >
                                    {conversation.thread_type === 'Private' ? 'Private' : 'Public'}
                                    </Box>
                                    {conversation.topic && (
                                    <Box
                                        sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        color: topicColors[conversation.topic] || topicColors["Default"],
                                        backgroundColor: `${(topicColors[conversation.topic] || topicColors["Default"])}20`,
                                        padding: '2px 6px',
                                        borderRadius: '5px',
                                        display: 'inline-block',
                                        }}
                                    >
                                        {conversation.topic}
                                    </Box>
                                    )}
                                </Box>
                                }
                                sx={{
                                maxWidth: 'calc(100% - 40px)',
                                flexShrink: 1,
                                }}
                            />

                            <IconButton
                                edge="end"
                                aria-label="More options"
                                //onClick={(e) => {e.stopPropagation();handleMenuOpen(e, conversation.chat_id);}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!user?.onboardingComplete) {
                                    setShowOnboardingModifyConvPopup(true); // Affiche la popup d'onboarding
                                    return; // Empêche explicitement l'ouverture du menu contextuel
                                    }
                                    handleMenuOpen(e, conversation.chat_id);
                                }}
                                sx={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: theme.palette.text.primary,
                                opacity: activeChatId === conversation.chat_id ? 1 : 0,
                                pointerEvents: activeChatId === conversation.chat_id ? 'auto' : 'none',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                                mr: '1px',
                                }}
                            >
                                <MoreHorizIcon
                                fontSize="small"
                                sx={{
                                    color: 'gray',
                                    fontSize: '20px',
                                }}
                                />
                            </IconButton>
                            </ListItem>
                        ))
                        ) : (
                        <Typography
                            align="center"
                            sx={{
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary,
                            marginTop: '30px',
                            }}
                        >
                            You have no conversations yet
                        </Typography>
                        )}
                    </List>
                    </nav>
                ) : (
                    <nav aria-label="Social Thread list">
                    <List component="ul">
                        {loadingSocialThreads ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                            <CircularProgress size={24} />
                        </Box>
                        ) : socialThreads.length > 0 ? (
                        socialThreads.map((thread) => {
                            console.log("💬 Sidebar socialThreads:", socialThreads);
                            const topic = thread.topic || "Default";
                            const color = topicColors[topic] || topicColors["Default"];
                            return (
                            <ListItem
                                key={thread.chat_id}
                                component="li"
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    if (!user?.onboardingComplete) {
                                    setShowOnboardingSocialThreadPopup(true);
                                    } else {
                                    handleConversationClick(thread.chat_id);
                                    if (isSmallScreen) toggleDrawer();
                                    }
                                }}
                                sx={{
                                position: 'relative',
                                borderRadius: '8px',
                                margin: '0.5px 0',
                                paddingRight: '20px',
                                backgroundColor:
                                    activeChatId === thread.chat_id ? theme.palette.button.background : 'transparent',
                                '& .MuiIconButton-root': {
                                    opacity: activeChatId === thread.chat_id ? 1 : 0,
                                    pointerEvents: activeChatId === thread.chat_id ? 'auto' : 'none',
                                },
                                '& .MuiTypography-root': {
                                    color:
                                    activeChatId === thread.chat_id
                                        ? theme.palette.text_human_message_historic
                                        : theme.palette.text.primary,
                                },
                                '@media (hover: hover) and (pointer: fine)': {
                                    '&:hover': {
                                    backgroundColor: theme.palette.button.background,
                                    color: theme.palette.text_human_message_historic,
                                    '& .MuiIconButton-root': {
                                        opacity: 1,
                                        pointerEvents: 'auto',
                                    },
                                    },
                                },
                                }}
                            >
                                <Box
                                sx={{
                                    width: '8px',
                                    minWidth: '8px',
                                    height: '38px',
                                    backgroundColor: color,
                                    borderRadius: '3px',
                                    marginRight: '10px',
                                }}
                                />
                                <ListItemText
                                primary={thread.name}
                                secondary={
                                    <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        whiteSpace: 'nowrap',
                                        marginTop: '2px',
                                    }}
                                    >
                                    <Typography
                                        variant="caption"
                                        sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}
                                    >
                                        {formatDate(thread.created_at).slice(-17)}
                                    </Typography>
                                    {thread.topic && (
                                        <Box
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            color: topicColors[thread.topic] || topicColors["Default"],
                                            backgroundColor: `${(topicColors[thread.topic] || topicColors["Default"])}20`,
                                            padding: '2px 6px',
                                            borderRadius: '5px',
                                            display: 'inline-block',
                                        }}
                                        >
                                        {thread.topic}
                                        </Box>
                                    )}
                                    </Box>
                                }
                                sx={{
                                    maxWidth: 'calc(100% - 40px)',
                                    flexShrink: 1,
                                }}
                                primaryTypographyProps={{
                                    style: {
                                    fontWeight: '500',
                                    fontSize: '0.850rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    },
                                }}
                                />
                                <Box
                                sx={{
                                    width: '7px',
                                    minWidth: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: thread.isRead ? 'transparent' : '#3155CC',
                                    transition: 'background-color 0.3s ease',
                                    marginLeft: 'auto',
                                    marginRight: '3px',
                                }}
                                />
                            </ListItem>
                            );
                        })
                        ) : (
                        <Typography
                            align="center"
                            sx={{
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary,
                            marginTop: '30px',
                            }}
                        >
                            You have no social threads yet
                        </Typography>
                        )}
                    </List>
                    </nav>
                )}
                </Box>




                {/* menu contextuel for each conversations to rename or delete */}
                <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                    margin: '8px',
                    borderRadius: '16px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '4px',
                    },
                }}
                >
                <MenuItem
                    aria-label="Rename Conversation"
                    onClick={handleRename}
                    sx={{
                    padding: '8px',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    }}
                >
                    <EditIcon fontSize="small" sx={{ marginRight: '8px' }} />
                    <Typography
                    variant="body2"
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: '400',
                    }}
                    >
                    Rename
                    </Typography>
                </MenuItem>

                <MenuItem
                    aria-label="Delete conversation"
                    onClick={handleDelete}
                    sx={{
                    padding: '8px',
                    color: 'red',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    }}
                >
                    <DeleteIcon fontSize="small" sx={{ marginRight: '8px' }} />
                    <Typography
                    variant="body2"
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: '400',
                    }}
                    >
                    Delete
                    </Typography>
                </MenuItem>
                </Menu>
            </Drawer>

)}


export default Sidebar;