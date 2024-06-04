
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import '../index.css';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';

const drawerWidth = 240;

const Dashboard_eleve_template: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('Academic Advisor');

  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: string) => {
    setAnchorEl(null);
    setSelectedFilter(option);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleMeetingClick = () => {
    navigate('/schedule-meeting');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-100">
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ style: { width: drawerWidth, borderRadius: '0 0 0 0' } }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
              <MenuIcon />
            </IconButton>
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <MapsUgcRoundedIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={() => navigate('/dashboard/student')}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 15px' }} />
            <Typography align="center" style={{ fontWeight: '500', fontSize: '0.875rem', color: 'gray', marginTop: '30px' }}>
              You have no conversations yet
            </Typography>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>
                <IconButton sx={{ color: theme.palette.primary.main }}>
                  <MapsUgcRoundedIcon />
                </IconButton>
              </>
            )}
            <div style={{ width: '16px' }} />
            <div onClick={handleDropDownClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: selectedFilter === 'Academic Advisor' ? '#EBE2FC' : '#DDFCE5', padding: '4px 8px', borderRadius: '8px' }}>
              <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: selectedFilter === 'Academic Advisor' ? '#7C3BEC' : '#43AE58', marginRight: '8px' }}>{selectedFilter}</Typography>
              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: selectedFilter === 'Academic Advisor' ? '#7C3BEC' : '#43AE58' }} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              {selectedFilter !== 'Socratic Academic Course' && (
                <MenuItem onClick={() => handleMenuClose('Socratic Academic Course')}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#43AE58', backgroundColor: '#DDFCE5', padding: '4px 8px', borderRadius: '8px' }}>Socratic Academic Course</Typography>
                </MenuItem>
              )}
              {selectedFilter !== 'Academic Advisor' && (
                <MenuItem onClick={() => handleMenuClose('Academic Advisor')}>
                  <Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#7C3BEC', backgroundColor: '#EBE2FC', padding: '4px 8px', borderRadius: '8px' }}>Academic Advisor</Typography>
                </MenuItem>
              )}
            </Menu>
            <Typography variant="h5" style={{ fontWeight: '600', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Analytics
            </Typography>
            <div style={{ flexGrow: 1 }}></div>
            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '10px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>
            <Button variant="outlined" color="primary" onClick={handleMeetingClick}>TA's help</Button>
          </div>

          <div className="flex flex-grow">
            <div className="flex-1 bg-white p-4">
              
            </div>
            <div className="flex-1 bg-white p-4">
              <iframe
                src="http://localhost:8001/static/cluster_plot.html"
                title="Cluster Plot"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard_eleve_template;


