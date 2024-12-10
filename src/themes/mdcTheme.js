import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const mdcTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005BAC', // Bleu Miami Dade College
    },
    sidebar: '#005BAC',
    secondary: {
      main: '#E06A2C', // Orange pour accentuer certaines sections
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#005BAC', // Texte bleu pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#005BAC',
    button_sign_in: '#005BAC',
    hover_button: '#0073CC',
    hover_button_with_button_background: '#B3D9F2',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#005BAC',
    button: {
      background: '#E3F2FD', // Couleur de fond des boutons en light mode
      text: '#005BAC', // Couleur du texte dans les boutons en light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/mdc_logo.png', // Chemin du logo spécifique à Miami Dade College
  university: 'mdc',
  facultyOptions: [
    'School of Business',
    'School of Engineering and Technology',
    'School of Education',
    'School of Health Sciences',
    'School of Humanities and Social Sciences',
    'School of Justice',
    'School of Science',
    'School of Continuing Education and Professional Development',
    'Honors College',
  ],
});

const mdcDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#005BAC', // Bleu Miami Dade College
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#E06A2C', // Orange pour accentuer certaines sections
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#005BAC',
    send_button_message: '#005BAC',
    button_sign_in: '#B3D9F2',
    hover_button: '#66A6E3',
    hover_button_with_button_background: '#A3CFF5',
    button_text_sign_in: '#005BAC',
    sign_up_link: '#ffffff',
    button: {
      background: '#E3F2FD', // Couleur de fond des boutons en dark mode
      text: '#005BAC', // Couleur du texte dans les boutons en dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
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
  logo: '/logos/mdc_logo.png', // Chemin du logo spécifique à Miami Dade College
  university: 'mdc',
  facultyOptions: [
    'School of Business',
    'School of Engineering and Technology',
    'School of Education',
    'School of Health Sciences',
    'School of Humanities and Social Sciences',
    'School of Justice',
    'School of Science',
    'School of Continuing Education and Professional Development',
    'Honors College',
  ],
});

// Export both themes as named exports
export { mdcTheme, mdcDarkTheme };