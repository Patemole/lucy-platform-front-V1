



import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import upenn_logo from '../upenn_logo.png';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleChatClick = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id;
    navigate(`/chat/academic-advisor/${uid}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <img src={upenn_logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={handleChatClick} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : '0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>
                <img src={upenn_logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import upenn_logo from '../upenn_logo.png';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user.id;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <img src={upenn_logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate(`/chat/academic-advisor/${uid}`)} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chat" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button onClick={() => navigate('/about')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: 'lightgray', margin: '30px 0' }} />
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : '0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>
                <img src={upenn_logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/

/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import upenn_logo from '../upenn_logo.png';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <Box component="img" src={upenn_logo} alt="UPenn Logo" sx={{ width: 40, height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
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
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : '0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            {!drawerOpen && (
              <>
                <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.primary.main }}>
                  <MenuIcon />
                </IconButton>
                <Box component="img" src={upenn_logo} alt="UPenn Logo" sx={{ width: 40, height: 'auto', marginLeft: 1 }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/






/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import upenn_logo from '../upenn_logo.png';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
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
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : '0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
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
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
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
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : '0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
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
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA' }}>
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
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
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
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.3s', marginLeft: drawerOpen ? drawerWidth : 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
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
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/







/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const drawerWidth = 240;

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
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
            <ListItem button onClick={() => navigate(`/dashboard/student`)} style={{ borderRadius: '8px' }}>
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
          </List>
        </Drawer>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
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
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/








/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUsageData = (filter: string) => {
  switch (filter) {
    case 'Last Week':
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Usage',
            data: [180, 200, 220, 210, 230, 240, 250],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    case 'Today':
    default:
      return {
        labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
        datasets: [
          {
            label: 'Usage',
            data: [120, 150, 200, 170, 140, 180],
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
  }
};

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');
  const [usageData, setUsageData] = useState(getUsageData('Today'));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    const filter = event.target.value as string;
    setUsageTimeFilter(filter);
    setUsageData(getUsageData(filter));
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }} onClick={() => navigate('/chat/academic-advisor/:uid')}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/






/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, SelectChangeEvent
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [usageTimeFilter, setUsageTimeFilter] = useState('Today');
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('Today');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value as string);
  };

  const handleUsageTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setUsageTimeFilter(event.target.value as string);
  };

  const handleTrendsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTrendsTimeFilter(event.target.value as string);
  };

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Metrics</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={metricsTimeFilter}
                      onChange={handleMetricsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.675rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Actionable Insights</Typography>
                  <IconButton sx={{ color: '#B3B3B3' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Usage</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={usageTimeFilter}
                      onChange={handleUsageTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Trends Clustering</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={trendsTimeFilter}
                      onChange={handleTrendsTimeFilterChange}
                      IconComponent={ArrowDropDownIcon}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      sx={{
                        border: 'none',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSvgIcon-root': { color: '#B3B3B3' },
                        '& .MuiSelect-select': { padding: 0, fontWeight: '500', fontSize: '0.875rem' }
                      }}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="Last Week">Last Week</MenuItem>
                      <MenuItem value="Last Month">Last Month</MenuItem>
                      <MenuItem value="Last Year">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/






/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, CircularProgress, SelectChangeEvent
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('Today');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value as string);
  };

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <FormControl variant="outlined" size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <Select
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                    IconComponent={ArrowDropDownIcon}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{ border: 'none', '& .MuiOutlinedInput-notchedOutline': { border: 0 } }}
                  >
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.700rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.700rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', fontSize: '0.700rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox, Select, FormControl, InputLabel, CircularProgress, SelectChangeEvent
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('Today');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value as string);
  };

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <FormControl variant="outlined" size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <Select
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                    IconComponent={ArrowDropDownIcon}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 2, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ff5c5c', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#66ff66', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'left', height: '100px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffb366', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45/50</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/







/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <BarChartIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <ChatIcon />
          </IconButton>
          <IconButton sx={{ color: '#B3B3B3', mb: 2 }}>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2, fontWeight: '500', fontSize: '0.875rem' }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center', height: '120px' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center', height: '80px' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center', height: '100px' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/





/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <BarChartIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'calc(100% - 16px)', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/





/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <BarChartIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <GroupIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '280px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Line data={usageData} options={usageOptions} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff', height: '250px' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)' }}>
                  <Line data={usageData} options={usageOptions} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F6F8FA', overflow: 'hidden' }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0', position: 'relative' }}>
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Academic Advisor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <IconButton>
                <NotificationsIcon sx={{ color: '#100F32', marginRight: 2 }} />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 200 }}> {/* Adjusted height 
                  <Line data={usageData} options={usageOptions} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%', position: 'relative', backgroundColor: '#fff' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
        tension: 0.4, // Make the line smoother
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_academic_advisor.html";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', marginLeft: 80 }}>Academic Advisor Dashboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative' }}>
                <Typography variant="h6">Metrics</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative' }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative' }}>
                <Typography variant="h6">Usage</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2 }}>
                  <Line data={usageData} options={usageOptions} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%', position: 'relative' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <MoreVertIcon />
                </IconButton>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  <iframe src={graphURL_academic_advisor} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/





/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Divider, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';
import picture_face from '../photo_greg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>Academic Advisor Dashboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              <Avatar src={picture_face} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2 }}>
                <Typography variant="h6">Metrics</Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2 }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6">Usage</Typography>
                <Box sx={{ mt: 2 }}>
                  <Line data={usageData} options={usageOptions} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/





/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Divider, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  const usageData = {
    labels: ['07 am', '08 am', '09 am', '10 am', '11 am', '12 pm'],
    datasets: [
      {
        label: 'Usage',
        data: [120, 150, 200, 170, 140, 180],
        borderColor: '#FF7043',
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        fill: true,
      },
    ],
  };

  const usageOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderRight: '1px solid #e0e0e0' }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 40, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>Academic Advisor Dashboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              <Avatar src={lucyLogo} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6">Metrics</Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5">98</Typography>
                    <Typography variant="body2">Missing data</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5">700</Typography>
                    <Typography variant="body2">Solved</Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5">45/50</Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mt: 2 }}>
                <Typography variant="h6">Actionable Insights</Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox />
                    <Typography>You shall schedule a meeting with Mathieu Perez</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox />
                    <Typography>Missing informations about deadline to drop a course</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mt: 2 }}>
                <Typography variant="h6">Usage</Typography>
                <Box sx={{ mt: 2 }}>
                  <Line data={usageData} options={usageOptions} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import logo_univ from '../upenn_logo.png';
import lucyLogo from '../logo_lucy.png';

const AcademicAdvisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');

  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>
        <Box sx={{ width: 80, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <img src={logo_univ} alt="University Logo" style={{ width: 50, height: 'auto', marginBottom: 20 }} />
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
          <IconButton>
            <Avatar src={lucyLogo} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6">Academic Advisor Dashboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              <Avatar src={lucyLogo} style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
              <Typography sx={{ marginLeft: 2 }}>{userName}</Typography>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{ style: { borderRadius: '12px' } }}
              >
                <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ padding: 20, flexGrow: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%' }}>
                <Typography variant="h6">Metrics</Typography>
                
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2 }}>98 Missing data</Box>
                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2 }}>700 Solved</Box>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2 }}>45/50 Students</Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%' }}>
                <Typography variant="h6">Trends Clustering</Typography>
                
                <Box sx={{ mt: 2, height: 'calc(100% - 40px)', backgroundColor: '#f0f0f0', borderRadius: 2 }}>
                  
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AcademicAdvisorDashboard;
*/
