import { createTheme } from '@mui/material/styles';

// Utility for pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const adminTheme = createTheme({
  palette: {
    mode: 'light', // Light mode by default
    primary: {
      main: '#100F32', // Navy blue for the admin theme
    },
    sidebar: '#100F32', // Sidebar background color for admin theme
    secondary: {
      main: '#7C3BEC', // Purple for the admin theme
    },
    background: {
      default: '#ffffff', // White background for light mode
      paper: '#F8F8F8', // Lighter background for elements in light mode
    },
    text: {
      primary: '#100F32', // Navy blue text for light mode
    },
    text_human_message_historic: '#100F32', // Text color for human message history in light mode
    send_button_message: '#100F32', // Send button color for messages in light mode
    button_sign_in: '#100F32', // Sign-in button color in light mode
    hover_button: '#7C3BEC', // Hover color for buttons in light mode
    button_text_sign_in: '#ffffff', // Text color for sign-in button in light mode
    sign_up_link: '#100F32', // Link color for sign-up in light mode
    button: {
      background: '#EAE6F2', // Light mode button background
      text: '#100F32', // Text color for buttons in light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem, // Utility function for converting px to rem
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Disable ripple effect on buttons
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)', // Focus state for icon buttons in light mode
          },
          '&:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.24)', // Active state for icon buttons in light mode
          },
        },
      },
    },
  },
  logo: '/logos/logo_lucy.png', // Path for the admin logo
  university: 'admin', // Identifier for the university
  facultyOptions: [
    'Administration',
    'IT Support',
    'Human Resources',
    'Compliance',
  ],
});

const adminDarkTheme = createTheme({
  palette: {
    mode: 'dark', // Dark mode
    primary: {
      main: '#100F32', // Navy blue for admin dark mode
    },
    sidebar: '#ffffff', // Sidebar background color for dark mode
    secondary: {
      main: '#7C3BEC', // Purple for the admin theme in dark mode
    },
    background: {
      default: '#2C2C2C', // Dark background for dark mode
      paper: '#1C1C1C', // Darker background for elements in dark mode
    },
    text: {
      primary: '#EAEAEA', // Light gray text for dark mode
    },
    text_human_message_historic: '#EAEAEA', // Text color for human message history in dark mode
    send_button_message: '#100F32', // Send button color for messages in dark mode
    button_sign_in: '#EAE6F2', // Sign-in button color in dark mode
    hover_button: '#7C3BEC', // Hover color for buttons in dark mode
    button_text_sign_in: '#100F32', // Text color for sign-in button in dark mode
    sign_up_link: '#ffffff', // Link color for sign-up in dark mode
    button: {
      background: '#3C3C3C', // Darker button background for dark mode
      text: '#EAEAEA', // Light text color for buttons in dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem, // Utility function for converting px to rem
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Disable ripple effect on buttons in dark mode
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // Focus state for icon buttons in dark mode
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)', // Active state for icon buttons in dark mode
          },
        },
      },
    },
  },
  logo: '/logos/logo_lucy.png', // Path for the admin logo
  university: 'admin', // Identifier for the university
  facultyOptions: [
    'Administration',
    'IT Support',
    'Human Resources',
    'Compliance',
  ],
});

// Export both themes
export { adminTheme, adminDarkTheme };




/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const adminTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#100F32', // Navy blue for the admin theme
      },
      secondary: {
        main: '#7C3BEC', // Purple for the admin theme
      },
      background: {
        default: '#ffffff', // White background for light mode
        paper: '#F8F8F8', // Lighter background for elements in light mode
      },
      text: {
        primary: '#100F32', // Navy blue text for light mode
      },
      button: {
        background: '#EAE6F2', // Lighter shade for button background in light mode
        text: '#100F32', // Navy blue text for buttons in light mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  darkMode: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#100F32', // Navy blue for dark mode
      },
      secondary: {
        main: '#7C3BEC', // Purple for dark mode
      },
      background: {
        default: '#2C2C2C', // Dark background for dark mode
        paper: '#1C1C1C', // Darker background for elements in dark mode
      },
      text: {
        primary: '#EAEAEA', // Light gray text for dark mode
      },
      button: {
        background: '#3C3C3C', // Darker shade for button background in dark mode
        text: '#EAEAEA', // Light gray text for buttons in dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  // Déclaration des éléments communs pour éviter les erreurs
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Disable ripple effects
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // Light focus effect
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)', // Active state effect
          },
        },
      },
    },
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

*/



/*
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
*/