import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import getUserData from '../api/fetchStudentsData'; // Fonction pour récupérer les données utilisateurs

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

const drawerWidth = 240;

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [statisticsTimeFilter, setStatisticsTimeFilter] = useState<string>('Today'); // Time filter for statistics block
  const [studentSignupTimeFilter, setStudentSignupTimeFilter] = useState<string>('Today'); // Time filter for student signup graph
  const [studentCount, setStudentCount] = useState<number>(0);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today');

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    // Fonction pour récupérer les données des statistiques globales
    const fetchStatisticsData = async () => {
      try {
        const { count } = await getUserData(statisticsTimeFilter);

        // Mettre à jour le nombre total d'inscriptions d'étudiants dans les statistiques globales
        setStudentCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques globales:', error);
      }
    };

    fetchStatisticsData();
  }, [statisticsTimeFilter]);

  useEffect(() => {
    // Fonction pour récupérer les données des inscriptions étudiantes et mettre à jour le graphe
    const fetchStudentData = async () => {
      try {
        const { dates } = await getUserData(studentSignupTimeFilter);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (studentSignupTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (studentSignupTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (studentSignupTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (studentSignupTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setStudentCountChart({
          labels,
          datasets: [
            {
              label: 'Student Signups',
              data: counts,
              borderColor: '#A57EFA',
              backgroundColor: 'rgba(165, 126, 250, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des utilisateurs:', error);
      }
    };

    fetchStudentData();
  }, [studentSignupTimeFilter]);

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

  const handleStatisticsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setStatisticsTimeFilter(event.target.value); // Gère le filtre de temps des statistiques globales
  };

  const handleStudentSignupTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setStudentSignupTimeFilter(event.target.value); // Gère le filtre de temps pour le graphique des inscriptions
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Chat & Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Technical Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for statistics */}
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={statisticsTimeFilter}
                      onChange={handleStatisticsTimeFilterChange}
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentCount}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0e0ff', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#a57efa', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>150</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+3% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the request chart */}
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Requests Over Time</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  {/* Empty chart area */}
                  <Line data={{ labels: [], datasets: [] }} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the student signup chart */}
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={studentSignupTimeFilter}
                      onChange={handleStudentSignupTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import getUserData from '../api/fetchStudentsData'; // Fonction pour récupérer les données utilisateurs
import { fetchRequestData } from '../api/fetchRequestData'; // Fonction pour récupérer les données des requêtes

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

const drawerWidth = 240;

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [statisticsTimeFilter, setStatisticsTimeFilter] = useState<string>('Today'); // Time filter for statistics block
  const [studentSignupTimeFilter, setStudentSignupTimeFilter] = useState<string>('Today'); // Time filter for student signup graph
  const [studentCount, setStudentCount] = useState<number>(0);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [requestCountChart, setRequestCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today');

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    // Fonction pour récupérer les données des statistiques globales
    const fetchStatisticsData = async () => {
      try {
        const { count } = await getUserData(statisticsTimeFilter);

        // Mettre à jour le nombre total d'inscriptions d'étudiants dans les statistiques globales
        setStudentCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques globales:', error);
      }
    };

    fetchStatisticsData();
  }, [statisticsTimeFilter]);

  useEffect(() => {
    // Fonction pour récupérer les données des inscriptions étudiantes et mettre à jour le graphe
    const fetchStudentData = async () => {
      try {
        const { dates } = await getUserData(studentSignupTimeFilter);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (studentSignupTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (studentSignupTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (studentSignupTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (studentSignupTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setStudentCountChart({
          labels,
          datasets: [
            {
              label: 'Student Signups',
              data: counts,
              borderColor: '#A57EFA',
              backgroundColor: 'rgba(165, 126, 250, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des utilisateurs:', error);
      }
    };

    fetchStudentData();
  }, [studentSignupTimeFilter]);

  useEffect(() => {
    // Fonction pour récupérer les données des requêtes et mettre à jour les statistiques
    const fetchRequestDataFunc = async () => {
      try {
        const { count, dates } = await fetchRequestData(universityFilter, requestTimeFilter);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (requestTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (requestTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (requestTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (requestTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setRequestCountChart({
          labels,
          datasets: [
            {
              label: 'Request Count',
              data: counts,
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des requêtes:', error);
      }
    };

    fetchRequestDataFunc();
  }, [universityFilter, requestTimeFilter]);

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

  const handleStatisticsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setStatisticsTimeFilter(event.target.value); // Gère le filtre de temps des statistiques globales
  };

  const handleStudentSignupTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setStudentSignupTimeFilter(event.target.value); // Gère le filtre de temps pour le graphique des inscriptions
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Chat & Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Technical Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for statistics 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={statisticsTimeFilter}
                      onChange={handleStatisticsTimeFilterChange}
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentCount}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0e0ff', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#a57efa', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>150</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+3% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the request chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Requests Over Time</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={requestCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the student signup chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={studentSignupTimeFilter}
                      onChange={handleStudentSignupTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import getUserData from '../api/fetchStudentsData'; // Fonction pour récupérer les données utilisateurs
import { fetchRequestData } from '../api/fetchRequestData'; // Fonction pour récupérer les données des requêtes

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

const drawerWidth = 240;

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [requestCountChart, setRequestCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today');

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    // Fonction pour récupérer les données des utilisateurs et mettre à jour les statistiques
    const fetchStudentData = async () => {
      try {
        const { count, dates } = await getUserData(metricsTimeFilter);

        // Mettre à jour le nombre total d'inscriptions d'étudiants
        setStudentCount(count);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (metricsTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (metricsTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (metricsTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (metricsTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setStudentCountChart({
          labels,
          datasets: [
            {
              label: 'Student Signups',
              data: counts,
              borderColor: '#A57EFA',
              backgroundColor: 'rgba(165, 126, 250, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des utilisateurs:', error);
      }
    };

    fetchStudentData();
  }, [metricsTimeFilter]);

  useEffect(() => {
    // Fonction pour récupérer les données des requêtes et mettre à jour les statistiques
    const fetchRequestDataFunc = async () => {
      try {
        const { count, dates } = await fetchRequestData(universityFilter, requestTimeFilter);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (requestTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (requestTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (requestTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (requestTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setRequestCountChart({
          labels,
          datasets: [
            {
              label: 'Request Count',
              data: counts,
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des requêtes:', error);
      }
    };

    fetchRequestDataFunc();
  }, [universityFilter, requestTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Chat & Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Technical Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for statistics 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentCount}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0e0ff', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#a57efa', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>150</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+3% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the request chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Requests Over Time</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={requestCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the student signup chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import getUserData from '../api/fetchStudentsData'; // Fonction pour récupérer les données utilisateurs
import { fetchRequestData } from '../api/fetchRequestData'; // Fonction pour récupérer les données des requêtes

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

const drawerWidth = 240;

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [requestCountChart, setRequestCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today');

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    // Fonction pour récupérer les données des utilisateurs et mettre à jour les statistiques
    const fetchStudentData = async () => {
      try {
        const { count, dates } = await getUserData(metricsTimeFilter);

        // Mettre à jour le nombre total d'inscriptions d'étudiants
        setStudentCount(count);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (metricsTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (metricsTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (metricsTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (metricsTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setStudentCountChart({
          labels,
          datasets: [
            {
              label: 'Student Signups',
              data: counts,
              borderColor: '#A57EFA',
              backgroundColor: 'rgba(165, 126, 250, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des utilisateurs:', error);
      }
    };

    fetchStudentData();
  }, [metricsTimeFilter]);

  useEffect(() => {
    // Fonction pour récupérer les données des requêtes et mettre à jour les statistiques
    const fetchRequestDataFunc = async () => {
      try {
        const { count, dates } = await fetchRequestData(universityFilter, requestTimeFilter);

        // Générer des labels et des valeurs pour le graphique en fonction de la période sélectionnée
        const labels: (string | number)[] = [];
        const counts: number[] = [];

        if (requestTimeFilter === 'Today') {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          labels.push(...hours.map(hour => `${hour}:00`));
          counts.push(...hours.map(hour => dates.filter(date => new Date(date).getHours() === hour).length));
        } else if (requestTimeFilter === 'Last Week') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          labels.push(...days);
          counts.push(...days.map((_, i) => dates.filter(date => new Date(date).getDay() === i).length));
        } else if (requestTimeFilter === 'Last Month') {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          labels.push(...days);
          counts.push(...days.map(day => dates.filter(date => new Date(date).getDate() === day).length));
        } else if (requestTimeFilter === 'Last Year') {
          const months = Array.from({ length: 12 }, (_, i) => i + 1);
          labels.push(...months.map(month => `Month ${month}`));
          counts.push(...months.map(month => dates.filter(date => new Date(date).getMonth() + 1 === month).length));
        }

        // Mettre à jour le graphique avec les nouvelles données
        setRequestCountChart({
          labels,
          datasets: [
            {
              label: 'Request Count',
              data: counts,
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données des requêtes:', error);
      }
    };

    fetchRequestDataFunc();
  }, [universityFilter, requestTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Chat & Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Technical Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for statistics 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{studentCount}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the student signup chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
                </Box>
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the request chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Requests Over Time</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={requestCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/


/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import fetchUserData from '../api/fetchStudentsData'

import { fetchRequestData } from '../api/fetchRequestData'; // Import the request data function

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

const drawerWidth = 240;

type Student = {
  id: string;
  university: string;
  timestamp: any;
};

type Request = {
  id: string;
  timestamp: any;
};

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [requestData, setRequestData] = useState<Request[]>([]); // New state for request data
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [requestCountChart, setRequestCountChart] = useState<ChartData>({ labels: [], datasets: [] }); // New state for request chart
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today'); // Time filter for requests

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      const data = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(data);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => data.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => data.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => data.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => data.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#A57EFA',
            backgroundColor: 'rgba(165, 126, 250, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchStudentData();
  }, [universityFilter, metricsTimeFilter]);

  // Fetch request data based on filters
  useEffect(() => {
    const fetchRequestDataFunc = async () => {
      const requests = await fetchRequestData(universityFilter, requestTimeFilter);
      setRequestData(requests);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      if (requestTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => requests.filter(request => new Date(request.timestamp.toDate()).getHours() === hour).length));
      } else if (requestTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => requests.filter(request => new Date(request.timestamp.toDate()).getDay() === i).length));
      } else if (requestTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => requests.filter(request => new Date(request.timestamp.toDate()).getDate() === day).length));
      } else if (requestTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => requests.filter(request => new Date(request.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setRequestCountChart({
        labels,
        datasets: [
          {
            label: 'Request Count',
            data: counts,
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchRequestDataFunc();
  }, [universityFilter, requestTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Chat & Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
            </ListItem>
            <ListItem button style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Technical Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for colored squares 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0e0ff', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#a57efa', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>150</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+3% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the request chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Requests Over Time</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={requestCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the student signup chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/





/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import { fetchStudentsData, fetchRequestData } from '../api/fetchStudentsData';

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

const drawerWidth = 240;

type Student = {
  id: string;
  university: string;
  timestamp: any;
};

type Request = {
  id: string;
  timestamp: any;
};

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [requestTimeFilter, setRequestTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [requestData, setRequestData] = useState<Request[]>([]);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [requestCountChart, setRequestCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const students = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(students);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => students.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => students.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => students.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => students.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#A57EFA',
            backgroundColor: 'rgba(165, 126, 250, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchData();
  }, [universityFilter, metricsTimeFilter]);

  useEffect(() => {
    const fetchRequestData = async () => {
      const requests = await fetchRequestData(requestTimeFilter);
      setRequestData(requests);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      if (requestTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => requests.filter(request => new Date(request.timestamp.toDate()).getHours() === hour).length));
      } else if (requestTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => requests.filter(request => new Date(request.timestamp.toDate()).getDay() === i).length));
      } else if (requestTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => requests.filter(request => new Date(request.timestamp.toDate()).getDate() === day).length));
      } else if (requestTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => requests.filter(request => new Date(request.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setRequestCountChart({
        labels,
        datasets: [
          {
            label: 'Number of Requests',
            data: counts,
            borderColor: '#7E57FA',
            backgroundColor: 'rgba(126, 87, 250, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchRequestData();
  }, [requestTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleRequestTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setRequestTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for colored squares 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>

                  {/* New Purple Box for Requests 
                  <Box sx={{ backgroundColor: '#e0e0ff', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#7E57FA', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>150</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+3% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the new "Number of Requests" chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Number of Requests</Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={requestTimeFilter}
                      onChange={handleRequestTimeFilterChange}
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={requestCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* White container for the "Student Signups" chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import { fetchStudentsData } from '../api/fetchStudentsData';

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

const drawerWidth = 240;

type Student = {
  id: string;
  university: string;
  timestamp: any;
};

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(data);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => data.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => data.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => data.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => data.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#A57EFA',
            backgroundColor: 'rgba(165, 126, 250, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchData();
  }, [universityFilter, metricsTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              {/* White container for colored squares 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Statistics Overview</Typography>
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

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Negative feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Positive feedback</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                  </Box>

                  <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                    <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+1% from yesterday</Typography>
                  </Box>
                </Box>
              </Box>

              {/* White container for the chart 
              <Box sx={{ padding: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', mb: 2, position: 'relative', backgroundColor: '#fff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { display: false } }, // Ensure y-axis starts at 0 and increments by 5
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Additional content 
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import { fetchStudentsData } from '../api/fetchStudentsData';

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

const drawerWidth = 240;

type Student = {
  id: string;
  university: string;
  timestamp: any;
};

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(data);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      // Group the data based on time labels (e.g., by hour for today, by day for last week)
      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => data.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => data.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => data.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => data.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#A57EFA',
            backgroundColor: 'rgba(165, 126, 250, 0.2)', // Pastel violet
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchData();
  }, [universityFilter, metricsTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { display: false } }, // Ensure y-axis starts at 0
                    }
                  }} />
                </Box>
              </Box>

              {/* Block with colored squares 
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Box sx={{ backgroundColor: '#ffe0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#ff5c5c', borderRadius: '50%', mr: 1 }}></Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>98</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Missing data</Typography>
                  <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>-2% from yesterday</Typography>
                </Box>

                <Box sx={{ backgroundColor: '#e0ffe0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#66ff66', borderRadius: '50%', mr: 1 }}></Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>700</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Solved</Typography>
                  <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+12% from yesterday</Typography>
                </Box>

                <Box sx={{ backgroundColor: '#fff0e0', padding: 2, borderRadius: 2, textAlign: 'left', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#ffb366', borderRadius: '50%', mr: 1 }}></Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>Nbr Students</Typography>
                  <Typography variant="caption" sx={{ fontWeight: '300', color: '#0000ff' }}>+1% from yesterday</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Additional content 
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/




/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
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
import picture_face from '../photo_greg.png';
import { fetchStudentsData } from '../api/fetchStudentsData';

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

const drawerWidth = 240;

type Student = {
  id: string;
  university: string;
  timestamp: any;
};

type ChartData = {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [studentCountChart, setStudentCountChart] = useState<ChartData>({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(data);

      const labels: (string | number)[] = [];
      const counts: number[] = [];

      // Group the data based on time labels (e.g., by hour for today, by day for last week)
      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => data.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => data.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => data.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => data.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchData();
  }, [universityFilter, metricsTimeFilter]);

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
    setMetricsTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Additional content 
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/



/*
import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
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
import { fetchStudentsData } from '../api/fetchStudentsData';

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


import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('');
  const { logout } = useAuth();
  const theme = useTheme();
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');
  const [universityFilter, setUniversityFilter] = useState('All');
  const [studentData, setStudentData] = useState([]);
  const [studentCountChart, setStudentCountChart] = useState({ labels: [], datasets: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // List of universities to be displayed in the dropdown
  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStudentsData(universityFilter, metricsTimeFilter);
      setStudentData(data);

      const labels = [];
      const counts = [];

      // Group the data based on time labels (e.g., by hour for today, by day for last week)
      if (metricsTimeFilter === 'Today') {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        labels.push(...hours.map(hour => `${hour}:00`));
        counts.push(...hours.map(hour => data.filter(student => new Date(student.timestamp.toDate()).getHours() === hour).length));
      } else if (metricsTimeFilter === 'Last Week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...days);
        counts.push(...days.map((_, i) => data.filter(student => new Date(student.timestamp.toDate()).getDay() === i).length));
      } else if (metricsTimeFilter === 'Last Month') {
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        labels.push(...days);
        counts.push(...days.map(day => data.filter(student => new Date(student.timestamp.toDate()).getDate() === day).length));
      } else if (metricsTimeFilter === 'Last Year') {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        labels.push(...months.map(month => `Month ${month}`));
        counts.push(...months.map(month => data.filter(student => new Date(student.timestamp.toDate()).getMonth() + 1 === month).length));
      }

      setStudentCountChart({
        labels,
        datasets: [
          {
            label: 'Student Signups',
            data: counts,
            borderColor: '#FF7043',
            backgroundColor: 'rgba(255, 112, 67, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    };

    fetchData();
  }, [universityFilter, metricsTimeFilter]);

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

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value as string);
  };

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
          </Box>
          <List style={{ padding: '0 15px' }}>
            <ListItem button onClick={() => navigate('/dashboard/analytics')} style={{ borderRadius: '8px' }}>
              <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: '40px' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Analytics" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value={universityFilter}
                  onChange={handleUniversityFilterChange}
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <Typography variant="h6">Student Signups</Typography>
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
                <Box sx={{ mt: 2, height: '280px', position: 'relative' }}>
                  <Line data={studentCountChart} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { display: false } },
                    }
                  }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Additional content 
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
*/


/*import React, { useState, useEffect } from 'react';
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

const AdminDashboard: React.FC = () => {
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


  // List of universities to be displayed in the dropdown
  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'MIT',
    'Lasell',
    'Oakland',
    'Arizona',
    'Uci',
    'Ucdavis',
    'Cornell',
    'BerkeleyCollege',
    'Brown',
    'Stanford',
    'Berkeley',
    'Miami',
    'Usyd',
    'Columbia',
  ];

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
            <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto' }} />
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
              <ListItemText primary="Feedback" primaryTypographyProps={{ style: { fontWeight: '500', fontSize: '0.875rem' } }} />
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
                <img src={theme.logo} alt="UPenn Logo" style={{ width: '30px', height: 'auto', marginLeft: '10px' }} />
              </>
            )}
            <Typography variant="h6" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <FormControl variant="outlined" size="small">
                <Select
                  value="All"
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
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>45</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Nbr Students</Typography>
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
                  <Typography variant="h6">Student account</Typography>
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

export default AdminDashboard;
*/