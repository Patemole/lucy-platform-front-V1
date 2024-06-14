import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Button, Divider
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import { useParams, useNavigate } from 'react-router-dom';
import logo_prof from '../teacher_face.png';
import '../index.css';
import { useAuth } from '../auth/hooks/useAuth';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import getTheme from '../themes/index'; // Ensure this path is correct
import logo_univ from '../upenn_logo.png';
//import logo_univ from '../Cornell_University_Logo.png';

const Dashboard_teacher_template: React.FC = () => {
  const { uid, course_id } = useParams<{ uid: string; course_id: string }>();
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { logout } = useAuth();

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Get subdomain from URL
  const subdomain = window.location.hostname.split('.')[0];
  const theme_univ = getTheme(subdomain);

  // Sample data for course popularity
  const courseData = {
    labels: ['ECON0100', 'ECON 0120', 'ECON 0200', 'ECON 0410', 'ECON 0420', 'ECON 0465'],
    datasets: [
      {
        label: 'Previous Semester',
        backgroundColor: '#CDE4FE',
        data: [300, 450, 700, 320, 500, 600]
      },
      {
        label: 'Current Semester',
        backgroundColor: '#92B1D6',
        data: [180, 400, 600, 300, 470, 580]
      }
    ]
  };

  // Sample data for doughnut chart
  const doughnutData = {
    labels: ['Chosen Courses', 'Remaining'],
    datasets: [
      {
        data: [65, 35], // Example values
        backgroundColor: ['#CDE4FE', '#92B1D6'],
        hoverBackgroundColor: ['#B8D2FD', '#7D9DC2']
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // explicitly defining the type
      }
    }
  };

  // URL statique du graphique intégré
  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme_univ}>
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme_univ.palette.background.default }}>
        <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
          <img src={logo_univ} alt="University Logo" className="w-10 h-10 mr-4"/>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Typography sx={{ fontWeight: '1000', fontSize: '1.35rem', color: theme_univ.palette.text.primary }}>
              Department of Economics
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <img src={logo_prof} alt="Profile" className="w-10 h-10 mr-4" style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{ style: { borderRadius: '12px' } }}
          >
            <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme_univ.palette.error.main }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" style={{ color: theme_univ.palette.error.main }} />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </MenuItem>
          </Menu>

          <Button
            variant="contained"
            startIcon={<FeedbackIcon />}
            style={{ backgroundColor: theme_univ.palette.primary.main, color: '#ffffff', marginLeft: '0px' }}
          >
            Feedback
          </Button>
        </div>
        <Grid container spacing={2} style={{ padding: '20px' }}>
          <Grid item xs={12} md={5} style={{ marginLeft: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Course Popularity
            </Typography>
            <Box>
              <Bar
                data={courseData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top'
                    }
                  }
                }}
              />
            </Box>
            <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
              Choosing Courses
            </Typography>
            <Box display="flex" justifyContent="center">
              <div style={{ height: '300px', width: '60%' }}>
                <Doughnut
                  data={doughnutData}
                  options={doughnutOptions}
                />
              </div>
            </Box>
          </Grid>
          <Divider orientation="vertical" flexItem style={{ backgroundColor: '#e0e0e0', margin: '0 20px' }} />
          <Grid item xs={12} md={6} style={{ minHeight: '100vh' }}>
            <Typography variant="h6" gutterBottom>
              Trends
            </Typography>
            <Box>
              {graphURL_academic_advisor ? (
                <iframe src={graphURL_academic_advisor} width="100%" height="600px" />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading graph...
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: '#DDFCE5',
            color: '#43AE58', // Setting text color to #43AE58
            borderRadius: '15px',
          },
        }}
      />
    </ThemeProvider>
  );
};

export default Dashboard_teacher_template;

