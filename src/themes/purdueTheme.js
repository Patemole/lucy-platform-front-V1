import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const purdueTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#B18619', // Couleur dorée de Purdue
    },
    sidebar: '#000000', // Couleur noire pour la barre latérale
    secondary: {
      main: '#FFFFFF', // Couleur blanche de Purdue
    },
    background: {
      default: '#FFFFFF', // Fond pour light mode
      paper: '#F4F4F4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte noir pour light mode
    },
    text_human_message_historic: '#B18619',
    send_button_message: '#000000',
    button_sign_in: '#B18619',
    hover_button: '#D4A33D',
    hover_button_with_button_background: '#F7D58C',
    button_text_sign_in: '#FFFFFF',
    sign_up_link: '#B18619',
    button: {
      background: '#F7E1A1', // Couleur de fond des boutons en light mode
      text: '#000000', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/purdue_logo.png', // Chemin du logo spécifique à Purdue
  university: 'purdue',
  facultyOptions: [
    'College of Agriculture',
    'College of Education',
    'College of Engineering',
    'College of Health and Human Sciences',
    'College of Liberal Arts',
    'Krannert School of Management',
    'College of Pharmacy',
    'College of Science',
    'College of Veterinary Medicine',
    'Purdue Polytechnic Institute',
    'Honors College',
  ],
});

const purdueDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B18619', // Couleur dorée de Purdue
    },
    sidebar: '#FFFFFF', // Barre latérale blanche en mode sombre
    secondary: {
      main: '#000000', // Couleur noire pour le mode sombre
    },
    background: {
      default: '#1C1C1C', // Fond pour dark mode
      paper: '#2E2E2E', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#FFFFFF', // Texte blanc pour dark mode
    },
    text_human_message_historic: '#B18619',
    send_button_message: '#B18619',
    button_sign_in: '#F7E1A1',
    hover_button: '#E3BF67',
    hover_button_with_button_background: '#D4A33D',
    button_text_sign_in: '#000000',
    sign_up_link: '#FFFFFF',
    button: {
      background: '#F7E1A1', // Couleur de fond des boutons en dark mode
      text: '#000000', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/purdue_logo.png', // Chemin du logo spécifique à Purdue
  university: 'purdue',
  facultyOptions: [
    'College of Agriculture',
    'College of Education',
    'College of Engineering',
    'College of Health and Human Sciences',
    'College of Liberal Arts',
    'Krannert School of Management',
    'College of Pharmacy',
    'College of Science',
    'College of Veterinary Medicine',
    'Purdue Polytechnic Institute',
    'Honors College',
  ],
});

// Export both themes as named exports
export { purdueTheme, purdueDarkTheme };