import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const holyFamilyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#002855', // Couleur bleue officielle de Holy Family
    },
    sidebar: '#002855',
    secondary: {
      main: '#A89968', // Couleur dorée de Holy Family
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#002855', // Texte en bleu pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#002855',
    button_sign_in: '#002855',
    hover_button: '#013A79',
    hover_button_with_button_background: '#BFCFDA',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#002855',
    button: {
      background: '#D9E6F2', // Couleur de fond des boutons en light mode
      text: '#002855', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/holy_family_logo.png', // Chemin du logo spécifique à Holy Family
  university: 'holyfamily',
  facultyOptions: [
    'School of Arts and Sciences',
    'School of Business and Professional Studies',
    'School of Education',
    'School of Nursing and Health Sciences',
    'Undecided',
  ],
});

const holyFamilyDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#002855', // Couleur bleue officielle de Holy Family
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#A89968', // Couleur dorée de Holy Family
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#002855',
    send_button_message: '#002855',
    button_sign_in: '#D9E6F2',
    hover_button: '#A8BBD0',
    hover_button_with_button_background: '#C3D5E5',
    button_text_sign_in: '#002855',
    sign_up_link: '#ffffff',
    button: {
      background: '#D9E6F2', // Couleur de fond des boutons en dark mode
      text: '#002855', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/holy_family_logo.png', // Chemin du logo spécifique à Holy Family
  university: 'holyfamily',
  facultyOptions: [
    'School of Arts and Sciences',
    'School of Business and Professional Studies',
    'School of Education',
    'School of Nursing and Health Sciences',
    'Undecided',
  ],
});

// Export both themes as named exports
export { holyFamilyTheme, holyFamilyDarkTheme };