import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#100F32', // Navy blue for the admin theme
    },
    secondary: {
      main: '#7C3BEC', // Purple for the admin theme
    },
    button: {
      background: '#EAE6F2', // A lighter shade for button background
      text: '#100F32', // Navy blue text for buttons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/logo_lucy.png', // Path for admin logo
  university: 'admin',
  facultyOptions: [
    'Administration',
    'IT Support',
    'Human Resources',
    'Compliance',
  ],
});

export default adminTheme;
