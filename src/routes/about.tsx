import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, IconButton, Menu, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo_greg from '../student_face.png';
import { useAuth } from '../auth/hooks/useAuth';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;

    const feedbackData = {
      userId: uid,
      feedback: feedback,
      courseId: location.pathname === '/about' ? 'about' : 'default_course_id',
    };

    await submitFeedbackAnswer(feedbackData);
    setFeedback('');
    setError(false);
    setSnackbarOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{ 
            style: { 
              width: drawerWidth, 
              backgroundColor: theme.palette.background.paper, 
              borderRight: `1px solid ${theme.palette.divider}` 
            } 
          }}
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
            <ListItem button onClick={handleHomeClick} sx={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>

            <ListItem button onClick={() => navigate('/about')} sx={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.sidebar, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Give us feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary } }} />
            </ListItem>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 flex items-center justify-between" style={{ backgroundColor: theme.palette.background.default, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.sidebar }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ textAlign: 'left', color: theme.palette.text.primary }}>Give us feedback</Typography>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem'
              }}
            >
              Beta V1.3
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '20px', marginLeft: '15px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{ style: { borderRadius: '12px', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" style={{ color: '#F04261' }} />
                </ListItemIcon>
                <ListItemText primary={<Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261' }}>Log-out</Typography>} />
              </MenuItem>
            </Menu>

            {location.pathname === "/about" && (
              <Button variant="outlined" onClick={handleMeetingClick} sx={{ borderColor: theme.palette.sidebar, color: theme.palette.sidebar }}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4" style={{ backgroundColor: theme.palette.background.default }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.text.primary }}>
              We are experimenting with Lucy, and we welcome your feedback:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 2, borderRadius: '12px', backgroundColor: theme.palette.background.paper }}
              InputProps={{
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please enter some feedback before submitting.
              </Typography>
            )}
            <Button 
              onClick={handleSubmitFeedback} 
              sx={{ mt: 2, backgroundColor: theme.palette.button_sign_in, color: theme.palette.button_text_sign_in }} 
              variant="contained"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default About;




/*
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, IconButton, Menu, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../student_new_face_contour2.png';
import { useAuth } from '../auth/hooks/useAuth';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;

    const feedbackData = {
      userId: uid,
      feedback: feedback,
      courseId: location.pathname === '/about' ? 'about' : 'default_course_id',
    };

    await submitFeedbackAnswer(feedbackData);
    setFeedback('');
    setError(false);
    setSnackbarOpen(true);
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={handleHomeClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ textAlign: 'left' }}>About</Typography>
            <div style={{ flexGrow: 1 }}></div>

            <div 
              style={{ 
                backgroundColor: '#FEEAEA', 
                color: '#F04261', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                marginRight: '10px',
                fontWeight: '500', 
                fontSize: '0.875rem'
              }}
            >
              Beta
            </div>

            <img src={logo_greg} alt="Logo face" className="h-10 w-auto" style={{ marginRight: '20px', marginLeft: '15px', cursor: 'pointer' }} onClick={handleProfileMenuClick} />
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

            {location.pathname === "/about" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
            <Typography variant="subtitle1" gutterBottom>
              We are experimenting with Lucy, and all your feedback is welcome:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 2, borderRadius: '12px' }}
              InputProps={{
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please enter some feedback before submitting.
              </Typography>
            )}
            <Button onClick={handleSubmitFeedback} sx={{ mt: 2 }} variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default About;
*/



/*
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, IconButton, Menu, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../student_new_face_contour2.png';
import { useAuth } from '../auth/hooks/useAuth';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;

    const feedbackData = {
      userId: uid,
      feedback: feedback,
      courseId: location.pathname === '/about' ? 'about' : 'default_course_id',
    };

    await submitFeedbackAnswer(feedbackData);
    setFeedback('');
    setError(false);
    setSnackbarOpen(true);
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={handleHomeClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ textAlign: 'left' }}>About</Typography>
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

            {location.pathname === "/about" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
            <Typography variant="subtitle1" gutterBottom>
              We are experimenting with Lucy, and all your feedback is welcome:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 2, borderRadius: '12px' }}
              InputProps={{
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please enter some feedback before submitting.
              </Typography>
            )}
            <Button onClick={handleSubmitFeedback} sx={{ mt: 2 }} variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default About;






/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, IconButton, Menu, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import { useAuth } from '../auth/hooks/useAuth';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const courseId = localStorage.getItem('course_id');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;

    const feedbackData = {
      userId: uid,
      feedback: feedback,
      courseId: courseId || 'default_course_id',
    };

    await submitFeedbackAnswer(feedbackData);
    setFeedback('');
    setError(false);
    setSnackbarOpen(true);
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={handleHomeClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ textAlign: 'left' }}>About</Typography>
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

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
            <Typography variant="subtitle1" gutterBottom>
              We are experimenting with Lucy, and all your feedback is welcome:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 2, borderRadius: '12px' }}
              InputProps={{
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please enter some feedback before submitting.
              </Typography>
            )}
            <Button onClick={handleSubmitFeedback} sx={{ mt: 2 }} variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully. Thank you!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default About;
*/






/*
//Adding logic to call function for endpoint on submit button
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import { useAuth } from '../auth/hooks/useAuth';
import { submitFeedbackAnswer } from '../api/feedback_wrong_answer';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const courseId = localStorage.getItem('course_id');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      setError(true);
      return;
    }
    await submitFeedbackAnswer(feedback);
    setFeedback('');
    setError(false);
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={handleHomeClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ textAlign: 'left' }}>About</Typography>
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

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
            <Typography variant="subtitle1" gutterBottom>
              We are experimenting with Lucy, and all your feedback is welcome:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 2, borderRadius: '12px' }}
              InputProps={{
                style: {
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Please enter some feedback before submitting.
              </Typography>
            )}
            <Button onClick={handleSubmitFeedback} sx={{ mt: 2 }} variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default About;
*/









/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import { useAuth } from '../auth/hooks/useAuth';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const courseId = localStorage.getItem('course_id');

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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
  };

  const handleHomeClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={handleHomeClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
           
            
          </List>
        </Drawer>

        <div className={`flex flex-col flex-grow transition-all duration-300 ${drawerOpen ? 'ml-60' : 'ml-0'}`}>
          <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
            {!drawerOpen && (
              <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center' }}>About</Typography>
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

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
           
            <Typography variant="h4">We are experimenting Lucy all your feedbacks are welcome:</Typography>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default About;
*/




/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Menu, MenuItem, Avatar, Divider, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import logo from '../logo_lucy.png';
import logo_greg from '../photo_greg.png';
import { usePopup } from '../components/popup';
import { useAuth } from '../auth/hooks/useAuth';

const drawerWidth = 240;

const About: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { popup, setPopup } = usePopup();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const courseId = localStorage.getItem('course_id');

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
    console.log("Selected option from menu:", option);
    setSelectedFilter(option);
    setAnchorEl(null);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMeetingClick = () => {
    navigate('/contact/academic_advisor');
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
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/student')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
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
              </>
            )}
            <div style={{ width: '16px' }} />
            <div
              onClick={handleDropDownClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                ...getBackgroundColor(selectedFilter)
              }}>
              <Typography
                sx={{
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  marginRight: '8px',
                  color: getBackgroundColor(selectedFilter).color
                }}>
                {selectedFilter}
              </Typography>
              <ArrowDropDownIcon
                sx={{
                  fontSize: '1rem',
                  color: getBackgroundColor(selectedFilter).color
                }}
              />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuCloseWithoutSelection}
              PaperProps={{ style: { borderRadius: '12px' } }}
            >
              <MenuItem onClick={() => handleMenuClose('Campus Life')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                  Campus Life
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose('Career Advisor')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                  Career Advisor
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose('Study Abroad')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', padding: '4px 8px', borderRadius: '8px' }}>
                  Study Abroad
                </Typography>
              </MenuItem>
            </Menu>
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

            {courseId === "6f9b98d4-7f92-4f7b-abe5-71c2c634edb2" && (
              <Button variant="outlined" color="primary" onClick={handleMeetingClick}>
                Contact my Academic Advisor
              </Button>
            )}
          </div>
          <div className="flex-grow p-4 bg-white">
            
            <Typography variant="h4">New Page Content</Typography>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default About;
*/