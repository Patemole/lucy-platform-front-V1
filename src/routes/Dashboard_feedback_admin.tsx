import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem, Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from  '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../student_face.png';
import upennLogo from '../logos/upenn_logo.png';
import harvardLogo from '../logos/harvard_logo.png';
import miamiLogo from '../logos/umiami_logo.png';
import uciLogo from '../logos/uci_logo.png';

const drawerWidth = 240;

const universities = [
  { name: 'Upenn', logo: upennLogo },
  { name: 'Harvard', logo: harvardLogo },
  { name: 'Miami', logo: miamiLogo },
  { name: 'Uci', logo: uciLogo },
];

const StudentFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [optionsAnchorEl, setOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [userName, setUserName] = useState('Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter states
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('');

  // Example of fake data
  const results = [
    {
      student: 'John Doe',
      university: 'Upenn',
      universityLogo: upennLogo,
      question: 'What is the course syllabus?',
      answer: 'The syllabus can be found in the course portal.',
      feedback: 'Great explanation!',
      feedbackType: 'positive',
      email: 'john.doe@upenn.edu',
    },
    {
      student: 'Jane Smith',
      university: 'Harvard',
      universityLogo: harvardLogo,
      question: 'How can I access the course materials?',
      answer: 'You can access all materials in the resources tab.',
      feedback: 'Not helpful!',
      feedbackType: 'negative',
      email: 'jane.smith@harvard.edu',
    },
    {
      student: 'Alice Johnson',
      university: 'Miami',
      universityLogo: miamiLogo,
      question: 'Can I submit my assignment late?',
      answer: 'Late submissions are allowed with a penalty.',
      feedback: 'Good to know!',
      feedbackType: 'positive',
      email: 'alice.johnson@miami.edu',
    },
    {
      student: 'Bob Williams',
      university: 'Uci',
      universityLogo: uciLogo,
      question: 'Where can I find the reading list?',
      answer: 'The reading list is posted in the resources section.',
      feedback: 'Very helpful!',
      feedbackType: 'positive',
      email: 'bob.williams@uci.edu',
    },
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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleFeedbackTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackTypeFilter(event.target.value);
  };

  const handleFeedbackCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackCategoryFilter(event.target.value);
  };

  const handleReviewFilterChange = (event: SelectChangeEvent<string>) => {
    setReviewFilter(event.target.value);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedFeedback(index);
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleOptionsClose = () => {
    setOptionsAnchorEl(null);
    setSelectedFeedback(null);
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
            <ListItem button onClick={() => navigate('/dashboard/admin')} style={{ borderRadius: '8px' }}>
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
              Student Feedback
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

          {/* Filter Section */}
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '40px 20px 20px', // More margin added above filters
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={timeFilter} onChange={handleTimeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Timestamp</Typography>
                    </MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={universityFilter} onChange={handleUniversityFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>University</Typography>
                    </MenuItem>
                    {universities.map((uni) => (
                      <MenuItem key={uni.name} value={uni.name}>{uni.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackTypeFilter} onChange={handleFeedbackTypeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Sentiment</Typography>
                    </MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackCategoryFilter} onChange={handleFeedbackCategoryFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Type</Typography>
                    </MenuItem>
                    <MenuItem value="conversation">Conversation</MenuItem>
                    <MenuItem value="about">About</MenuItem>
                    <MenuItem value="course_id">Course ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={reviewFilter} onChange={handleReviewFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Review</Typography>
                    </MenuItem>
                    <MenuItem value="Reviewed">Reviewed</MenuItem>
                    <MenuItem value="Not Reviewed">Not Reviewed Yet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" color="primary" sx={{ height: '100%' }}>Search</Button>
              </Grid>
            </Grid>
          </Box>

          {/* Results Section */}
          <Box sx={{ padding: 2, overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {results.map((result, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      padding: 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: result.feedbackType === 'positive' ? '2px solid #3DD957' : `2px solid ${theme.palette.error.main}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: result.feedbackType === 'positive' ? '#3DD957' : theme.palette.error.main }}>
                        {result.feedback}
                      </Typography>
                      <IconButton onClick={(e) => handleOptionsClick(e, index)}><MoreVertIcon /></IconButton>
                      <Menu
                        anchorEl={optionsAnchorEl}
                        open={selectedFeedback === index && Boolean(optionsAnchorEl)}
                        onClose={handleOptionsClose}
                        PaperProps={{ style: { borderRadius: '12px' } }}
                      >
                        <MenuItem>
                          <ListItemText primary="Reviewed" />
                        </MenuItem>
                        <MenuItem sx={{ color: theme.palette.error.main }}>
                          <ListItemIcon>
                            <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                          </ListItemIcon>
                          <ListItemText primary="Delete" />
                        </MenuItem>
                      </Menu>
                    </Box>

                    <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                    <Typography variant="body2" sx={{ marginBottom: 1, fontStyle: 'italic', color: theme.palette.text.secondary }}>{result.question}</Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1, fontStyle: 'italic', color: theme.palette.text.secondary }}>{result.answer}</Typography>

                    <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src={result.universityLogo} alt={result.university} style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                        <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>{result.student}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>{result.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentFeedbackPage;






/*
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem, Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../student_face.png';
import upennLogo from '../logos/upenn_logo.png';
import harvardLogo from '../logos/harvard_logo.png';
import miamiLogo from '../logos/umiami_logo.png';
import uciLogo from '../logos/uci_logo.png';

const drawerWidth = 240;

const universities = [
  { name: 'Upenn', logo: upennLogo },
  { name: 'Harvard', logo: harvardLogo },
  { name: 'Miami', logo: miamiLogo },
  { name: 'Uci', logo: uciLogo },
];

const StudentFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [optionsAnchorEl, setOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [userName, setUserName] = useState('Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter states
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('');

  // Example of fake data
  const results = [
    {
      student: 'John Doe',
      university: 'Upenn',
      universityLogo: upennLogo,
      question: 'What is the course syllabus?',
      answer: 'The syllabus can be found in the course portal.',
      feedback: 'Great explanation!',
      feedbackType: 'positive',
      email: 'john.doe@upenn.edu',
    },
    {
      student: 'Jane Smith',
      university: 'Harvard',
      universityLogo: harvardLogo,
      question: 'How can I access the course materials?',
      answer: 'You can access all materials in the resources tab.',
      feedback: 'Not helpful!',
      feedbackType: 'negative',
      email: 'jane.smith@harvard.edu',
    },
    {
      student: 'Alice Johnson',
      university: 'Miami',
      universityLogo: miamiLogo,
      question: 'Can I submit my assignment late?',
      answer: 'Late submissions are allowed with a penalty.',
      feedback: 'Good to know!',
      feedbackType: 'positive',
      email: 'alice.johnson@miami.edu',
    },
    {
      student: 'Bob Williams',
      university: 'Uci',
      universityLogo: uciLogo,
      question: 'Where can I find the reading list?',
      answer: 'The reading list is posted in the resources section.',
      feedback: 'Very helpful!',
      feedbackType: 'positive',
      email: 'bob.williams@uci.edu',
    },
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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleFeedbackTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackTypeFilter(event.target.value);
  };

  const handleFeedbackCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackCategoryFilter(event.target.value);
  };

  const handleReviewFilterChange = (event: SelectChangeEvent<string>) => {
    setReviewFilter(event.target.value);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedFeedback(index);
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleOptionsClose = () => {
    setOptionsAnchorEl(null);
    setSelectedFeedback(null);
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
            <ListItem button onClick={() => navigate('/dashboard/admin')} style={{ borderRadius: '8px' }}>
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
              Student Feedback
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

          {/* Filter Section *
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '20px 20px',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={timeFilter} onChange={handleTimeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Timestamp</Typography>
                    </MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={universityFilter} onChange={handleUniversityFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>University</Typography>
                    </MenuItem>
                    {universities.map((uni) => (
                      <MenuItem key={uni.name} value={uni.name}>{uni.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackTypeFilter} onChange={handleFeedbackTypeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Sentiment</Typography>
                    </MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackCategoryFilter} onChange={handleFeedbackCategoryFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Type</Typography>
                    </MenuItem>
                    <MenuItem value="conversation">Conversation</MenuItem>
                    <MenuItem value="about">About</MenuItem>
                    <MenuItem value="course_id">Course ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={reviewFilter} onChange={handleReviewFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Review</Typography>
                    </MenuItem>
                    <MenuItem value="Reviewed">Reviewed</MenuItem>
                    <MenuItem value="Not Reviewed">Not Reviewed Yet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button variant="contained" color="primary">Search</Button>
          </Box>

          {/* Results Section *
          <Grid container spacing={2} sx={{ padding: 2 }}>
            {results.map((result, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    padding: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: result.feedbackType === 'positive' ? '2px solid #3DD957' : '2px solid red',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: result.feedbackType === 'positive' ? '#3DD957' : 'red' }}>
                      {result.feedback}
                    </Typography>
                    <IconButton onClick={(e) => handleOptionsClick(e, index)}><MoreVertIcon /></IconButton>
                    <Menu
                      anchorEl={optionsAnchorEl}
                      open={selectedFeedback === index && Boolean(optionsAnchorEl)}
                      onClose={handleOptionsClose}
                      PaperProps={{ style: { borderRadius: '12px' } }}
                    >
                      <MenuItem>
                        <ListItemText primary="Reviewed" />
                      </MenuItem>
                      <MenuItem sx={{ color: theme.palette.error.main }}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Delete" />
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                  <Typography variant="body2" sx={{ marginBottom: 1, fontStyle: 'italic', color: 'gray' }}>{result.question}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1, fontStyle: 'italic', color: 'gray' }}>{result.answer}</Typography>

                  <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src={result.universityLogo} alt={result.university} style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{result.student}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{result.email}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentFeedbackPage;

*/




/*
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem, Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../student_face.png';

const drawerWidth = 240;

const StudentFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [optionsAnchorEl, setOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [userName, setUserName] = useState('Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter states
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('');

  // Example of fake data
  const results = [
    {
      student: 'John Doe',
      university: 'Upenn',
      question: 'What is the course syllabus?',
      answer: 'The syllabus can be found in the course portal.',
      feedback: 'Great explanation!',
      feedbackType: 'positive',
      email: 'john.doe@upenn.edu',
      type: 'conversation',
    },
    {
      student: 'Jane Smith',
      university: 'Harvard',
      question: 'How can I access the course materials?',
      answer: 'You can access all materials in the resources tab.',
      feedback: 'Not helpful!',
      feedbackType: 'negative',
      email: 'jane.smith@harvard.edu',
      type: 'about',
    },
  ];

  const universities = [
    'Upenn',
    'Harvard',
    'Miami',
    'Uci',
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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleFeedbackTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackTypeFilter(event.target.value);
  };

  const handleFeedbackCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackCategoryFilter(event.target.value);
  };

  const handleReviewFilterChange = (event: SelectChangeEvent<string>) => {
    setReviewFilter(event.target.value);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedFeedback(index);
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleOptionsClose = () => {
    setOptionsAnchorEl(null);
    setSelectedFeedback(null);
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
              Student Feedback
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

          {/* Filter Section *
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '20px 20px',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={timeFilter} onChange={handleTimeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Timestamp</Typography>
                    </MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                    <MenuItem value="All Time">All Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={universityFilter} onChange={handleUniversityFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>University</Typography>
                    </MenuItem>
                    {universities.map((uni) => (
                      <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackTypeFilter} onChange={handleFeedbackTypeFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Sentiment</Typography>
                    </MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackCategoryFilter} onChange={handleFeedbackCategoryFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Type</Typography>
                    </MenuItem>
                    <MenuItem value="conversation">Conversation</MenuItem>
                    <MenuItem value="about">About</MenuItem>
                    <MenuItem value="course_id">Course ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={reviewFilter} onChange={handleReviewFilterChange} displayEmpty>
                    <MenuItem value="" disabled>
                      <Typography style={{ color: 'gray' }}>Review</Typography>
                    </MenuItem>
                    <MenuItem value="Reviewed">Reviewed</MenuItem>
                    <MenuItem value="Not Reviewed">Not Reviewed Yet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button variant="contained" color="primary">Search</Button>
          </Box>

          {/* Results Section *
          <Grid container spacing={2} sx={{ padding: 2 }}>
            {results.map((result, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    padding: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: result.feedbackType === 'positive' ? '2px solid #3DD957' : '2px solid red',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{result.university}</Typography>
                    <Typography variant="body1">{result.student}</Typography>
                    <IconButton onClick={(e) => handleOptionsClick(e, index)}><MoreVertIcon /></IconButton>
                    <Menu
                      anchorEl={optionsAnchorEl}
                      open={selectedFeedback === index && Boolean(optionsAnchorEl)}
                      onClose={handleOptionsClose}
                      PaperProps={{ style: { borderRadius: '12px' } }}
                    >
                      <MenuItem>
                        <ListItemText primary="Reviewed" />
                      </MenuItem>
                      <MenuItem sx={{ color: theme.palette.error.main }}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Delete" />
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.question}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.answer}</Typography>

                  <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                  <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>Feedback: {result.feedback}</Typography>

                  <Divider sx={{ marginY: 1, backgroundColor: 'lightgray' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{result.email}</Typography>
                    <Typography variant="body2">{result.type}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentFeedbackPage;
*/



/*
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem, Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../student_face.png';

const drawerWidth = 240;

const StudentFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter states
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('');

  // Example of fake data
  const results = [
    {
      student: 'John Doe',
      university: 'Upenn',
      question: 'What is the course syllabus?',
      answer: 'The syllabus can be found in the course portal.',
      feedback: 'Great explanation!',
      feedbackType: 'positive',
      email: 'john.doe@upenn.edu',
      type: 'conversation',
    },
    {
      student: 'Jane Smith',
      university: 'Harvard',
      question: 'How can I access the course materials?',
      answer: 'You can access all materials in the resources tab.',
      feedback: 'Not helpful!',
      feedbackType: 'negative',
      email: 'jane.smith@harvard.edu',
      type: 'about',
    },
  ];

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'Miami',
    'Uci',
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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleFeedbackTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackTypeFilter(event.target.value);
  };

  const handleFeedbackCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackCategoryFilter(event.target.value);
  };

  const handleReviewFilterChange = (event: SelectChangeEvent<string>) => {
    setReviewFilter(event.target.value);
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
              Student Feedback
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

          {/* Filter Section *
          <Box
            sx={{
              padding: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '20px 20px',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={timeFilter} onChange={handleTimeFilterChange} displayEmpty>
                    <MenuItem value="">
                      <em>Timestamp</em>
                    </MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                    <MenuItem value="All Time">All Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={universityFilter} onChange={handleUniversityFilterChange} displayEmpty>
                    <MenuItem value="">
                      <em>University</em>
                    </MenuItem>
                    {universities.map((uni) => (
                      <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackTypeFilter} onChange={handleFeedbackTypeFilterChange} displayEmpty>
                    <MenuItem value="">
                      <em>Sentiment</em>
                    </MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackCategoryFilter} onChange={handleFeedbackCategoryFilterChange} displayEmpty>
                    <MenuItem value="">
                      <em>Type</em>
                    </MenuItem>
                    <MenuItem value="conversation">Conversation</MenuItem>
                    <MenuItem value="about">About</MenuItem>
                    <MenuItem value="course_id">Course ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={reviewFilter} onChange={handleReviewFilterChange} displayEmpty>
                    <MenuItem value="">
                      <em>Review</em>
                    </MenuItem>
                    <MenuItem value="Reviewed">Reviewed</MenuItem>
                    <MenuItem value="Not Reviewed">Not Reviewed Yet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button variant="contained" color="primary">Search</Button>
          </Box>

          {/* Results Section *
          <Grid container spacing={2} sx={{ padding: 2 }}>
            {results.map((result, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    padding: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: result.feedbackType === 'positive' ? '2px solid green' : '2px solid red',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{result.student}</Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{result.university}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.question}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.answer}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>Feedback: {result.feedback}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{result.email}</Typography>
                    <Typography variant="body2">{result.type}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentFeedbackPage;
*/





/*
import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Select, FormControl, SelectChangeEvent, Divider, Drawer, List, ListItem, Button, TextField,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import picture_face from '../photo_greg.png';

const drawerWidth = 240;

const StudentFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState<string>('Today');
  const [universityFilter, setUniversityFilter] = useState<string>('All');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('All');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('All');

  // Example of fake data
  const results = [
    {
      student: 'John Doe',
      university: 'Upenn',
      question: 'What is the course syllabus?',
      answer: 'The syllabus can be found in the course portal.',
      feedback: 'Great explanation!',
      feedbackType: 'positive',
      email: 'john.doe@upenn.edu',
      type: 'conversation',
    },
    {
      student: 'Jane Smith',
      university: 'Harvard',
      question: 'How can I access the course materials?',
      answer: 'You can access all materials in the resources tab.',
      feedback: 'Not helpful!',
      feedbackType: 'negative',
      email: 'jane.smith@harvard.edu',
      type: 'about',
    },
  ];

  const universities = [
    'All',
    'Upenn',
    'Harvard',
    'Miami',
    'Uci',
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

  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };

  const handleUniversityFilterChange = (event: SelectChangeEvent<string>) => {
    setUniversityFilter(event.target.value);
  };

  const handleFeedbackTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackTypeFilter(event.target.value);
  };

  const handleFeedbackCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setFeedbackCategoryFilter(event.target.value);
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
              Student Feedback
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

          {/* Filter Section *
          <Box sx={{ padding: 2, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={timeFilter} onChange={handleTimeFilterChange} displayEmpty>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last Week">Last Week</MenuItem>
                    <MenuItem value="Last Month">Last Month</MenuItem>
                    <MenuItem value="Last Year">Last Year</MenuItem>
                    <MenuItem value="All Time">All Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={universityFilter} onChange={handleUniversityFilterChange} displayEmpty>
                    {universities.map((uni) => (
                      <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackTypeFilter} onChange={handleFeedbackTypeFilterChange} displayEmpty>
                    <MenuItem value="All">All Feedback</MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <Select value={feedbackCategoryFilter} onChange={handleFeedbackCategoryFilterChange} displayEmpty>
                    <MenuItem value="conversation">Conversation</MenuItem>
                    <MenuItem value="about">About</MenuItem>
                    <MenuItem value="course_id">Course ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button variant="contained" color="primary">Search</Button>
          </Box>

          {/* Results Section *
          <Grid container spacing={2} sx={{ padding: 2 }}>
            {results.map((result, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Box sx={{
                  padding: 2,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: result.feedbackType === 'positive' ? '2px solid green' : '2px solid red',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{result.student}</Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{result.university}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.question}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>{result.answer}</Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>Feedback: {result.feedback}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{result.email}</Typography>
                    <Typography variant="body2">{result.type}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentFeedbackPage;
*/