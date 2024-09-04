
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import upennLogo from '../upenn_logo.png';
import PopupSendingEmailStudentListAA from '../components/PopupSendingEmailStudentListAA';

export default function LearningStyleSurvey() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [userId, setUserId] = useState(null);

  const open = Boolean(anchorEl);

  // Get user.id from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObject = JSON.parse(storedUser);
      const storedUserId = userObject.id;
      setUserId(storedUserId);
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError('');
  };

  const handleAddEmail = () => {
    if (validateEmail(email)) {
      if (!emailList.includes(email)) {
        setEmailList([...emailList, email]);
        setEmail('');
      }
    } else {
      setEmailError('Please enter a valid email address.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddEmail();
    }
  };

  const handleMenuOpen = (event, email) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteEmail = () => {
    setEmailList(emailList.filter((email) => email !== selectedEmail));
    handleMenuClose();
  };

  const handleContinue = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handlePopupSubmit = (feedback) => {
    console.log("Feedback submitted:", feedback);
    setOpenPopup(false);
  };

  const getStudentCountText = () => {
    const count = emailList.length;
    return count === 1 ? `You added 1 student` : `You added ${count} students`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, marginBottom: 2 }}>
              Add your students
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
              You can manually enter their email addresses or upload a list of your students.
            </Typography>

            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                id="email-input"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  flexGrow: 1,
                  marginRight: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&::placeholder': {
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    },
                    color: theme.palette.text.primary,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddEmail}
                sx={{
                  height: '56px',
                  backgroundColor: theme.palette.button.background,
                  color: theme.palette.button.text,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.hover_button_with_button_background,
                  },
                }}
              >
                Add
              </Button>
            </Box>

            <Typography
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                marginBottom: 2,
                alignSelf: 'center',
              }}
            >
              Or
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{
                width: '100%',
                backgroundColor: theme.palette.button.background,
                color: theme.palette.button.text,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button_with_button_background,
                },
                padding: 1.5,
              }}
            >
              Upload a file (csv, xls, images, pdf)
              <input type="file" hidden />
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.grey[200],
            padding: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              {emailList.length > 0 ? getStudentCountText() : "Your student list"}
            </Typography>
            <img src={upennLogo} alt="University Logo" style={{ width: 40, height: 'auto' }} />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 550,
              overflowY: 'auto',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              padding: 2,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {emailList.length > 0 ? (
              emailList.map((email, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: theme.palette.button.background,
                    padding: '12px 16px',
                    borderRadius: 2,
                    marginBottom: 1,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.primary, flexGrow: 1, fontSize: '0.875rem' }}>
                    {email}
                  </Typography>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, email)}
                    sx={{ color: theme.palette.grey[500] }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        boxShadow: 'none',
                      },
                    }}
                  >
                    <MenuItem onClick={handleDeleteEmail} sx={{ color: theme.palette.error.main }}>
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: '500', fontSize: '0.875rem' }}>
                  No students added yet.
                </Typography>
              </Box>
            )}
          </Box>

          {emailList.length > 0 && (
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{
                marginTop: 4,
                alignSelf: 'flex-end',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button,
                },
              }}
            >
              Continue
            </Button>
          )}
        </Grid>
      </Grid>

      <PopupSendingEmailStudentListAA 
        open={openPopup} 
        onClose={handleClosePopup} 
        onSubmit={handlePopupSubmit} 
        emailList={emailList} 
        studentCount={emailList.length} 
        userId={userId} 
      />
    </ThemeProvider>
  );
}




/*
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import upennLogo from '../upenn_logo.png';
import PopupSendingEmailStudentListAA from '../components/PopupSendingEmailStudentListAA';

export default function LearningStyleSurvey() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]); // Removed type annotation
  const [emailError, setEmailError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null); // Removed type annotation
  const [selectedEmail, setSelectedEmail] = useState(null); // Removed type annotation
  const [openPopup, setOpenPopup] = useState(false); // State to control the popup
  const [userId, setUserId] = useState(null); // State to store user.id

  const open = Boolean(anchorEl);

   // Get user.id from localStorage
   useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("This is the user object from localStorage:");
    console.log(storedUser);
    if (storedUser) {
      const userObject = JSON.parse(storedUser); // Parse the JSON string to an object
      const storedUserId = userObject.id; // Access the id property
      console.log("This is the UID of the academic advisor:");
      console.log(storedUserId);
      setUserId(storedUserId);
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError('');
  };

  const handleAddEmail = () => {
    if (validateEmail(email)) {
      if (!emailList.includes(email)) {
        setEmailList([...emailList, email]);
        setEmail('');
      }
    } else {
      setEmailError('Please enter a valid email address.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddEmail();
    }
  };

  const handleMenuOpen = (event, email) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteEmail = () => {
    setEmailList(emailList.filter((email) => email !== selectedEmail));
    handleMenuClose();
  };

  const handleContinue = () => {
    setOpenPopup(true); // Open the popup when Continue is clicked
  };

  const handleClosePopup = () => {
    setOpenPopup(false); // Close the popup
  };

  const handlePopupSubmit = (feedback) => {
    console.log("Feedback submitted:", feedback);
    setOpenPopup(false);
  };

  const getStudentCountText = () => {
    const count = emailList.length;
    return count === 1 ? `You added 1 student` : `You added ${count} students`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
        {/* Left section with form elements *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper, // White background for the left section
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, marginBottom: 2 }}>
              Add your students
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
              You can manually enter their email addresses or upload a list of your students.
            </Typography>

            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                id="email-input"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  flexGrow: 1,
                  marginRight: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&::placeholder': {
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    },
                    color: theme.palette.text.primary,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddEmail}
                sx={{
                  height: '56px', // Match the height of the TextField
                  backgroundColor: theme.palette.button.background, // Button background color
                  color: theme.palette.button.text, // Button text color
                  textTransform: 'none', // Remove uppercase text
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.hover_button_with_button_background,
                  },
                }}
              >
                Add
              </Button>
            </Box>

            <Typography
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                marginBottom: 2,
                alignSelf: 'center', // Centered "Or"
              }}
            >
              Or
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{
                width: '100%',
                backgroundColor: theme.palette.button.background, // Same style as "Add student" button
                color: theme.palette.button.text, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button_with_button_background,
                },
                padding: 1.5,
              }}
            >
              Upload a file (csv, xls, images, pdf)
              <input type="file" hidden />
            </Button>
          </Box>
        </Grid>

        {/* Right section with logo and added student list *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.grey[200], // Grayed background for the right section
            padding: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}> {/* Smaller and less bold *
              {emailList.length > 0 ? getStudentCountText() : "Your student list"}
            </Typography>
            <img src={upennLogo} alt="University Logo" style={{ width: 40, height: 'auto' }} /> {/* Reduced logo size *
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 550, // Height limit for the email list box
              overflowY: 'auto', // Enables scrolling within the email list box
              backgroundColor: theme.palette.background.paper, // White background for the email list box
              borderRadius: 2,
              padding: 2,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {emailList.length > 0 ? (
              emailList.map((email, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: theme.palette.button.background, // Background color for email blocks
                    padding: '12px 16px', // Reduced padding for smaller height
                    borderRadius: 2,
                    marginBottom: 1,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.primary, flexGrow: 1, fontSize: '0.875rem' }}>
                    {email}
                  </Typography>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, email)}
                    sx={{ color: theme.palette.grey[500] }} // Lighter grey for less visibility
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        boxShadow: 'none', // Remove shadows from the dropdown menu
                      },
                    }}
                  >
                    <MenuItem onClick={handleDeleteEmail} sx={{ color: theme.palette.error.main }}> {/* Delete in red *
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: '500', fontSize: '0.875rem' }}>
                  No students added yet.
                </Typography>
              </Box>
            )}
          </Box>

          {emailList.length > 0 && (
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{
                marginTop: 4,
                alignSelf: 'flex-end',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button,
                },
              }}
            >
              Continue
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Popup for sending email *
      <PopupSendingEmailStudentListAA 
        open={openPopup} 
        onClose={handleClosePopup} 
        selectedFilter={getStudentCountText()} 
        onSubmit={handlePopupSubmit} 
        emailList={emailList} // Pass the email list
        studentCount={emailList.length} // Pass the number of students
        userId={userId} // Pass the user ID from localStorage
      />
    </ThemeProvider>
  );
}
*/



/*
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import upennLogo from '../upenn_logo.png';
import PopupSendingEmailStudentListAA from '../components/PopupSendingEmailStudentListAA';

export default function LearningStyleSurvey() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [openPopup, setOpenPopup] = useState(false); // State to control the popup

  const open = Boolean(anchorEl);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError('');
  };

  const handleAddEmail = () => {
    if (validateEmail(email)) {
      if (!emailList.includes(email)) {
        setEmailList([...emailList, email]);
        setEmail('');
      }
    } else {
      setEmailError('Please enter a valid email address.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddEmail();
    }
  };

  const handleMenuOpen = (event, email) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteEmail = () => {
    setEmailList(emailList.filter((email) => email !== selectedEmail));
    handleMenuClose();
  };

  const handleContinue = () => {
    setOpenPopup(true); // Open the popup when Continue is clicked
  };

  const handleClosePopup = () => {
    setOpenPopup(false); // Close the popup
  };

  const handlePopupSubmit = (feedback) => {
    console.log("Feedback submitted:", feedback);
    setOpenPopup(false);
  };

  const getStudentCountText = () => {
    const count = emailList.length;
    if (count === 1) {
      return `You added 1 student`;
    } else {
      return `You added ${count} students`;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
        {/* Left section with form elements *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper, // White background for the left section
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, marginBottom: 2 }}>
              Add your students
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
              You can manually enter their email addresses or upload a list of your students.
            </Typography>

            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                id="email-input"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  flexGrow: 1,
                  marginRight: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&::placeholder': {
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    },
                    color: theme.palette.text.primary,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddEmail}
                sx={{
                  height: '56px', // Match the height of the TextField
                  backgroundColor: theme.palette.button.background, // Button background color
                  color: theme.palette.button.text, // Button text color
                  textTransform: 'none', // Remove uppercase text
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.hover_button_with_button_background,
                  },
                }}
              >
                Add
              </Button>
            </Box>

            <Typography
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                marginBottom: 2,
                alignSelf: 'center', // Centered "Or"
              }}
            >
              Or
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{
                width: '100%',
                backgroundColor: theme.palette.button.background, // Same style as "Add student" button
                color: theme.palette.button.text, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button_with_button_background,
                },
                padding: 1.5,
              }}
            >
              Upload a file (csv, xls, images, pdf)
              <input type="file" hidden />
            </Button>
          </Box>
        </Grid>

        {/* Right section with logo and added student list *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.grey[200], // Grayed background for the right section
            padding: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}> {/* Smaller and less bold *
              {emailList.length > 0 ? getStudentCountText() : "Your student list"}
            </Typography>
            <img src={upennLogo} alt="University Logo" style={{ width: 40, height: 'auto' }} /> {/* Reduced logo size *
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 550, // Height limit for the email list box
              overflowY: 'auto', // Enables scrolling within the email list box
              backgroundColor: theme.palette.background.paper, // White background for the email list box
              borderRadius: 2,
              padding: 2,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {emailList.length > 0 ? (
              emailList.map((email, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: theme.palette.button.background, // Background color for email blocks
                    padding: '12px 16px', // Reduced padding for smaller height
                    borderRadius: 2,
                    marginBottom: 1,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.primary, flexGrow: 1, fontSize: '0.875rem' }}>
                    {email}
                  </Typography>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, email)}
                    sx={{ color: theme.palette.grey[500] }} // Lighter grey for less visibility
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        boxShadow: 'none', // Remove shadows from the dropdown menu
                      },
                    }}
                  >
                    <MenuItem onClick={handleDeleteEmail} sx={{ color: theme.palette.error.main }}> {/* Delete in red *
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: '500', fontSize: '0.875rem' }}>
                  No students added yet.
                </Typography>
              </Box>
            )}
          </Box>

          {emailList.length > 0 && (
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{
                marginTop: 4,
                alignSelf: 'flex-end',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button,
                },
              }}
            >
              Continue
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Popup for sending email *
      <PopupSendingEmailStudentListAA 
        open={openPopup} 
        onClose={handleClosePopup} 
        selectedFilter={getStudentCountText()} 
        onSubmit={handlePopupSubmit} 
      />
    </ThemeProvider>
  );
}
*/






/* code qui fonctionne mais on va ajouter la pop-up pour envoyer par mail 
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import upennLogo from '../upenn_logo.png';
import PopupSendingEmailStudentListAA from '../components/PopupSendingEmailStudentListAA';

export default function LearningStyleSurvey() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const open = Boolean(anchorEl);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError('');
  };

  const handleAddEmail = () => {
    if (validateEmail(email)) {
      if (!emailList.includes(email)) {
        setEmailList([...emailList, email]);
        setEmail('');
      }
    } else {
      setEmailError('Please enter a valid email address.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddEmail();
    }
  };

  const handleContinue = () => {
    navigate('/next-step');
  };

  const handleMenuOpen = (event, email) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteEmail = () => {
    setEmailList(emailList.filter((email) => email !== selectedEmail));
    handleMenuClose();
  };

  const getStudentCountText = () => {
    const count = emailList.length;
    if (count === 1) {
      return `You added 1 student`;
    } else {
      return `You added ${count} students`;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
        {/* Left section with form elements *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper, // White background for the left section
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, marginBottom: 2 }}>
              Add your students
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
              You can manually enter their email addresses or upload a list of your students.
            </Typography>

            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                id="email-input"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  flexGrow: 1,
                  marginRight: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailError ? theme.palette.error.main : theme.palette.sign_up_link,
                    },
                    '&::placeholder': {
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    },
                    color: theme.palette.text.primary,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddEmail}
                sx={{
                  height: '56px', // Match the height of the TextField
                  backgroundColor: theme.palette.button.background, // Button background color
                  color: theme.palette.button.text, // Button text color
                  textTransform: 'none', // Remove uppercase text
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.hover_button_with_button_background,
                  },
                }}
              >
                Add
              </Button>
            </Box>

            <Typography
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                marginBottom: 2,
                alignSelf: 'center', // Centered "Or"
              }}
            >
              Or
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{
                width: '100%',
                backgroundColor: theme.palette.button.background, // Same style as "Add student" button
                color: theme.palette.button.text, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button_with_button_background,
                },
                padding: 1.5,
              }}
            >
              Upload a file (csv, xls, images, pdf)
              <input type="file" hidden />
            </Button>
          </Box>
        </Grid>

        {/* Right section with logo and added student list *
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.grey[200], // Grayed background for the right section
            padding: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}> {/* Smaller and less bold *
              {emailList.length > 0 ? getStudentCountText() : "Your student list"}
            </Typography>
            <img src={upennLogo} alt="University Logo" style={{ width: 40, height: 'auto' }} /> {/* Reduced logo size *
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: 550, // Height limit for the email list box
              overflowY: 'auto', // Enables scrolling within the email list box
              backgroundColor: theme.palette.background.paper, // White background for the email list box
              borderRadius: 2,
              padding: 2,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {emailList.length > 0 ? (
              emailList.map((email, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: theme.palette.button.background, // Background color for email blocks
                    padding: '12px 16px', // Reduced padding for smaller height
                    borderRadius: 2,
                    marginBottom: 1,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.primary, flexGrow: 1, fontSize: '0.875rem' }}>
                    {email}
                  </Typography>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, email)}
                    sx={{ color: theme.palette.grey[500] }} // Lighter grey for less visibility
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiPaper-root': {
                        boxShadow: 'none', // Remove shadows from the dropdown menu
                      },
                    }}
                  >
                    <MenuItem onClick={handleDeleteEmail} sx={{ color: theme.palette.error.main }}> {/* Delete in red *
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: '500', fontSize: '0.875rem' }}>
                  No students added yet.
                </Typography>
              </Box>
            )}
          </Box>

          {emailList.length > 0 && (
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{
                marginTop: 4,
                alignSelf: 'flex-end',
                backgroundColor: theme.palette.button_sign_in,
                color: theme.palette.button_text_sign_in, // Button text color
                textTransform: 'none', // Remove uppercase text
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.hover_button,
                },
              }}
            >
              Continue
            </Button>
          )}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
*/

