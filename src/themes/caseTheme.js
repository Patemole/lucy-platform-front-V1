import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const caseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#041E42', // Couleur bleue de CWRU
    },
    sidebar: '#041E42',
    secondary: {
      main: '#A5C8E1', // Couleur bleu clair de CWRU
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#041E42', // Texte en bleu pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#041E42',
    button_sign_in: '#041E42',
    hover_button: '#063C6D',
    hover_button_with_button_background: '#C3E4F5',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#041E42',
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons en light mode
      text: '#041E42', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/cwru_logo.png', // Chemin du logo spécifique à CWRU
  university: 'case',
  facultyOptions: [
    'College of Arts and Sciences',
    'Case School of Engineering',
    'School of Medicine',
    'Frances Payne Bolton School of Nursing',
    'Weatherhead School of Management',
    'School of Dental Medicine',
    'Jack, Joseph and Morton Mandel School of Applied Social Sciences',
    'School of Law',
    'School of Graduate Studies',
  ],
});

const caseDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#041E42', // Couleur bleue de CWRU
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#A5C8E1', // Couleur bleu clair de CWRU
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#041E42',
    send_button_message: '#041E42',
    button_sign_in: '#C3E4F5',
    hover_button: '#89BEE8',
    hover_button_with_button_background: '#A5C8E1',
    button_text_sign_in: '#041E42',
    sign_up_link: '#ffffff',
    button: {
      background: '#C3E4F5', // Couleur de fond des boutons en dark mode
      text: '#041E42', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/cwru_logo.png', // Chemin du logo spécifique à CWRU
  university: 'case',
  facultyOptions: [
    'College of Arts and Sciences',
    'Case School of Engineering',
    'School of Medicine',
    'Frances Payne Bolton School of Nursing',
    'Weatherhead School of Management',
    'School of Dental Medicine',
    'Jack, Joseph and Morton Mandel School of Applied Social Sciences',
    'School of Law',
    'School of Graduate Studies',
  ],
});

// Export both themes as named exports
export { caseTheme, caseDarkTheme };