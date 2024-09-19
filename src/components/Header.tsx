import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/hooks/useAuth';

import logo_greg from '../student_face.png';
import '../index.css';

const drawerWidth = 240;

interface HeaderProps {
  handleNavigateToAcademicAdvisor: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleNavigateToAcademicAdvisor }) => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  // Static course options directly defined in the component
  const courseOptions = [
    { course_id: 'moRgToBTOAJZdMQPs7Ci', name: 'Course Selection' },
    { course_id: '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2', name: 'Academic Advisor' },
    { course_id: 'tyPR1RAulPfqLLfNgIqF', name: 'Career Advisor' },
    { course_id: 'Q1SjXBe30FyX6GxvJVIG', name: 'Campus Life' },
    //{ course_id: 'Connf4P2TpKXXGooaQD5', name: 'Study Abroad' },
  ];

  const [selectedFilter, setSelectedFilter] = useState(courseOptions[0].name);

  // Load course_id from localStorage and set the corresponding course name
  useEffect(() => {
    const storedCourseId = localStorage.getItem('course_id');
    if (storedCourseId) {
      const selectedCourse = courseOptions.find((course) => course.course_id === storedCourseId);
      if (selectedCourse) {
        setSelectedFilter(selectedCourse.name);
      }
    }
  }, []);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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

  /*
  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.course_id); // Store selected course_id in localStorage
      setAnchorEl(null);
    }
  };
  */

  const handleMenuClose = (option: string) => {
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.course_id); // Store selected course_id in localStorage
      
      // If Academic Advisor is selected, navigate accordingly
      if (selectedCourse.course_id === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2') {
        handleNavigateToAcademicAdvisor();
      }

      setAnchorEl(null);
    }
  };
  

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ style: { width: drawerWidth, backgroundColor: theme.palette.background.paper } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <List style={{ padding: '0 15px' }}>
          <ListItem
            button
            onClick={() => navigate(`/dashboard/student/${uid}`)}
            sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
          >
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
        </List>
      </Drawer>

      <Box
        sx={{
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <div className={`relative p-4 flex items-center justify-between border-b`} style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
          {!drawerOpen && (
            <>
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>
            </>
          )}
          <div
            onClick={handleDropDownClick}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', ...getBackgroundColor(selectedFilter) }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', marginRight: '8px', color: getBackgroundColor(selectedFilter).color }}>{selectedFilter}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
          </div>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            {courseOptions.map((option) => (
              <MenuItem key={option.course_id} onClick={() => handleMenuClose(option.name)}>
                <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>{option.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <div style={{ flexGrow: 1 }}></div>

          <div
            style={{
              backgroundColor: '#FEEAEA',
              color: '#F04261',
              padding: '4px 8px',
              borderRadius: '8px',
              marginRight: '10px',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
            onClick={() => console.log('Beta V1.3 clicked')}
          >
            Beta V1.3
          </div>

          <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
          <Menu anchorEl={profileMenuAnchorEl} open={Boolean(profileMenuAnchorEl)} onClose={handleProfileMenuClose} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                    Log-out
                  </Typography>
                }
              />
            </MenuItem>
          </Menu>

          {courseOptions[0].course_id === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
            <Button
              variant="outlined"
              onClick={() => navigate('/contact/academic_advisor')}
              sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
            >
              Contact my Academic Advisor
            </Button>
          )}
        </div>

        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
            Feedback submitted successfully. Thank you!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Header;



/*
import React, { useState } from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/hooks/useAuth';

import logo_greg from '../student_face.png';
import '../index.css';

const drawerWidth = 240;

const Header: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  // Static course options directly defined in the component
  const courseOptions = [
    { id: '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2', name: 'Academic Advisor' },
    { id: 'Q1SjXBe30FyX6GxvJVIG', name: 'Campus Life' },
    { id: 'tyPR1RAulPfqLLfNgIqF', name: 'Career Advisor' },
    { id: 'Connf4P2TpKXXGooaQD5', name: 'Study Abroad' },
    { id: 'moRgToBTOAJZdMQPs7Ci', name: 'Course Selection' },
  ];

  const [selectedFilter, setSelectedFilter] = useState(courseOptions[0].name);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      setAnchorEl(null);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ style: { width: drawerWidth, backgroundColor: theme.palette.background.paper } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <List style={{ padding: '0 15px' }}>
          <ListItem
            button
            onClick={() => navigate(`/dashboard/student/${uid}`)}
            sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
          >
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
        </List>
      </Drawer>

      <Box
        sx={{
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <div className={`relative p-4 flex items-center justify-between border-b`} style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
          {!drawerOpen && (
            <>
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>
            </>
          )}
          <div
            onClick={handleDropDownClick}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', ...getBackgroundColor(selectedFilter) }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', marginRight: '8px', color: getBackgroundColor(selectedFilter).color }}>{selectedFilter}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
          </div>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            {courseOptions.map((option) => (
              <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>{option.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <div style={{ flexGrow: 1 }}></div>

          <div
            style={{
              backgroundColor: '#FEEAEA',
              color: '#F04261',
              padding: '4px 8px',
              borderRadius: '8px',
              marginRight: '10px',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
            onClick={() => console.log('Beta V1.3 clicked')}
          >
            Beta V1.3
          </div>

          <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
          <Menu anchorEl={profileMenuAnchorEl} open={Boolean(profileMenuAnchorEl)} onClose={handleProfileMenuClose} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                    Log-out
                  </Typography>
                }
              />
            </MenuItem>
          </Menu>

          {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
            <Button
              variant="outlined"
              onClick={() => navigate('/contact/academic_advisor')}
              sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
            >
              Contact my Academic Advisor
            </Button>
          )}
        </div>

        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
            Feedback submitted successfully. Thank you!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Header;
*/




/*
import React, { useState } from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../auth/hooks/useAuth';

import logo_greg from '../student_face.png';
import '../index.css';

const drawerWidth = 240;

const Header: React.FC = () => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  // Static course options directly defined in the component
  const courseOptions = [
    { id: 'course1', name: 'Course 1' },
    { id: 'course2', name: 'Course 2' },
    { id: 'course3', name: 'Course 3' },
  ];

  const [selectedFilter, setSelectedFilter] = useState(courseOptions[0].name);

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      setAnchorEl(null);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ style: { width: drawerWidth, backgroundColor: theme.palette.background.paper } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
            <MenuIcon />
          </IconButton>
          <IconButton sx={{ color: theme.palette.sidebar }}>
            <MapsUgcRoundedIcon />
          </IconButton>
        </Box>
        <List style={{ padding: '0 15px' }}>
          <ListItem
            button
            onClick={() => navigate(`/dashboard/student/${uid}`)}
            sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
          >
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
        </List>
      </Drawer>

      <Box
        sx={{
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <div className={`relative p-4 flex items-center justify-between border-b`} style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
          {!drawerOpen && (
            <>
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>
            </>
          )}
          <div
            onClick={handleDropDownClick}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', ...getBackgroundColor(selectedFilter) }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', marginRight: '8px', color: getBackgroundColor(selectedFilter).color }}>{selectedFilter}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
          </div>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            {courseOptions.map((option) => (
              <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>{option.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <div style={{ flexGrow: 1 }}></div>

          <div
            style={{
              backgroundColor: '#FEEAEA',
              color: '#F04261',
              padding: '4px 8px',
              borderRadius: '8px',
              marginRight: '10px',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
            onClick={() => console.log('Beta V1.3 clicked')}
          >
            Beta V1.3
          </div>

          <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
          <Menu anchorEl={profileMenuAnchorEl} open={Boolean(profileMenuAnchorEl)} onClose={handleProfileMenuClose} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                    Log-out
                  </Typography>
                }
              />
            </MenuItem>
          </Menu>

          {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
            <Button
              variant="outlined"
              onClick={() => navigate('/contact/academic_advisor')}
              sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
            >
              Contact my Academic Advisor
            </Button>
          )}
        </div>

        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
            Feedback submitted successfully. Thank you!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Header;
*/




/*
import React, { useState } from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { doc, getDoc } from 'firebase/firestore';

import logo_greg from '../student_face.png';
import { useAuth } from '../auth/hooks/useAuth';
import { db } from '../auth/firebase';
import '../index.css';

const drawerWidth = 240;

interface HeaderProps {
  conversations: { chat_id: string; name: string }[];
  courseOptions: { id: string; name: string }[];
  activeChatId: string | null;
  onNewConversation: () => void;
  onConversationClick: (chat_id: string) => void;
  onSendMessage: (inputValue: string) => void;
  selectedFilter: string;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({
  conversations,
  courseOptions,
  activeChatId,
  onNewConversation,
  onConversationClick,
  onSendMessage,
  selectedFilter,
  setSelectedFilter,
}) => {
  const theme = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const courseId = localStorage.getItem('course_id');
  const universityDomain = localStorage.getItem('university') || 'example.edu';

  const getBackgroundColor = (filter: string) => {
    switch (filter) {
      case 'Campus Life':
        return { backgroundColor: '#E0F7FA', color: '#00897B' };
      case 'Career Advisor':
        return { backgroundColor: '#FCE4EC', color: '#C2185B' };
      case 'Study Abroad':
        return { backgroundColor: '#FFF3E0', color: '#FB8C00' };
      default:
        return { backgroundColor: '#EBE2FC', color: '#7C3BEC' };
    }
  };

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
    const selectedCourse = courseOptions.find((course) => course.name === option);
    if (selectedCourse) {
      setSelectedFilter(selectedCourse.name);
      localStorage.setItem('course_id', selectedCourse.id);
      setAnchorEl(null);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ style: { width: drawerWidth, backgroundColor: theme.palette.background.paper } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
            <MenuIcon />
          </IconButton>
          <IconButton onClick={onNewConversation} sx={{ color: theme.palette.sidebar }}>
            <MapsUgcRoundedIcon />
          </IconButton>
        </Box>
        <List style={{ padding: '0 15px' }}>
          <ListItem
            button
            onClick={() => navigate(`/dashboard/student/${uid}`)}
            sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
          >
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard/analytics')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px', backgroundColor: theme.palette.background.paper }}>
            <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
          </ListItem>
          <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ListItem
                button
                key={conversation.chat_id}
                onClick={() => onConversationClick(conversation.chat_id)}
                sx={{
                  borderRadius: '8px',
                  margin: '5px 0',
                  backgroundColor: activeChatId === conversation.chat_id ? theme.palette.button.background : 'transparent',
                  '&:hover': { backgroundColor: theme.palette.button.background },
                  '& .MuiTypography-root': { color: activeChatId === conversation.chat_id ? theme.palette.text_human_message_historic : theme.palette.text.primary },
                }}
              >
                <ListItemText primary={conversation.name} primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
              </ListItem>
            ))
          ) : (
            <Typography align="center" sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary, marginTop: '30px' }}>
              You have no conversations yet
            </Typography>
          )}
        </List>
      </Drawer>

      <Box
        sx={{
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <div className={`relative p-4 flex items-center justify-between border-b`} style={{ backgroundColor: theme.palette.background.default, borderColor: theme.palette.divider }}>
          {!drawerOpen && (
            <>
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>

              <IconButton onClick={onNewConversation} sx={{ color: theme.palette.sidebar }}>
                <MapsUgcRoundedIcon />
              </IconButton>
            </>
          )}
          <div
            onClick={handleDropDownClick}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', ...getBackgroundColor(selectedFilter) }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', marginRight: '8px', color: getBackgroundColor(selectedFilter).color }}>{selectedFilter}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', color: getBackgroundColor(selectedFilter).color }} />
          </div>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            {courseOptions.map((option) => (
              <MenuItem key={option.id} onClick={() => handleMenuClose(option.name)}>
                <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px', color: theme.palette.text.primary }}>{option.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <div style={{ flexGrow: 1 }}></div>

          <div
            style={{
              backgroundColor: '#FEEAEA',
              color: '#F04261',
              padding: '4px 8px',
              borderRadius: '8px',
              marginRight: '10px',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
            onClick={() => console.log('Beta V1.3 clicked')}
          >
            Beta V1.3
          </div>

          <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ cursor: 'pointer', marginRight: '20px', marginLeft: '15px' }} onClick={handleProfileMenuClick} />
          <Menu anchorEl={profileMenuAnchorEl} open={Boolean(profileMenuAnchorEl)} onClose={handleProfileMenuClose} PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper } }}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#F04261' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>
                    Log-out
                  </Typography>
                }
              />
            </MenuItem>
          </Menu>

          {courseId === '6f9b98d4-7f92-4f7b-abe5-71c2c634edb2' && (
            <Button
              variant="outlined"
              onClick={() => navigate('/contact/academic_advisor')}
              sx={{ borderColor: theme.palette.button_sign_in, color: theme.palette.button_sign_in }}
            >
              Contact my Academic Advisor
            </Button>
          )}
        </div>

        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
            Feedback submitted successfully. Thank you!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Header;
*/

