import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const brynMawrTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFC72C', // Bryn Mawr Gree007A33
    },
    sidebar: '#FFC72C',
    secondary: {
      main: '#FFC72C', // Bryn Mawr Gold
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
    },
    text: {
      primary: '#333333',
    },
    text_human_message_historic: '#000000',
    send_button_message: '#FFC72C',
    button_sign_in: '#FFC72C',
    hover_button: '#005922',
    hover_button_with_button_background: '#CDE9D9',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#FFC72C',
    button: {
      background: '#E8F6EF',
      text: '#FFC72C',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(0, 122, 51, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(0, 122, 51, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/brynmawr_logo.png',
  university: 'brynmawr',
  facultyOptions: [
    'Undergraduate College',
    'Graduate School of Arts and Sciences',
    'Graduate School of Social Work and Social Research',
    'Postbaccalaureate Premedical Program'
  ],
});

const brynMawrDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007A33', // Bryn Mawr Green
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#FFC72C', // Bryn Mawr Gold
    },
    background: {
      default: '#212121',
      paper: '#1c1c1c',
    },
    text: {
      primary: '#ffffff',
    },
    text_human_message_historic: '#007A33',
    send_button_message: '#007A33',
    button_sign_in: '#E8F6EF',
    hover_button: '#CDE9D9',
    hover_button_with_button_background: '#A6DBC4',
    button_text_sign_in: '#007A33',
    sign_up_link: '#ffffff',
    button: {
      background: '#E8F6EF',
      text: '#007A33',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/brynmawr_logo.png',
  university: 'brynmawr',
  facultyOptions: [
    'Undergraduate College',
    'Graduate School of Arts and Sciences',
    'Graduate School of Social Work and Social Research',
    'Postbaccalaureate Premedical Program'
  ],
});

export { brynMawrTheme, brynMawrDarkTheme };