import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const hofstraTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003A63', // Bleu royal de Hofstra
    },
    sidebar: '#003A63', // Couleur pour la barre latérale
    secondary: {
      main: '#F2A900', // Couleur dorée de Hofstra
    },
    background: {
      default: '#FFFFFF', // Fond pour light mode
      paper: '#F4F4F4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#003A63', // Texte en bleu pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#003A63',
    button_sign_in: '#003A63',
    hover_button: '#004F8C',
    hover_button_with_button_background: '#B3D6F3',
    button_text_sign_in: '#FFFFFF',
    sign_up_link: '#003A63',
    button: {
      background: '#E1F2FB', // Couleur de fond des boutons en light mode
      text: '#003A63', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/hofstra_logo.png', // Chemin du logo spécifique à Hofstra
  university: 'hofstra',
  facultyOptions: [
    'College of Liberal Arts and Sciences',
    'Frank G. Zarb School of Business',
    'Maurice A. Deane School of Law',
    'School of Education',
    'School of Health Professions and Human Services',
    'Hofstra Northwell School of Nursing and Physician Assistant Studies',
    'Donald and Barbara Zucker School of Medicine at Hofstra/Northwell',
    'Lawrence Herbert School of Communication',
    'Fred DeMatteis School of Engineering and Applied Science',
    'School of Humanities, Fine and Performing Arts',
  ],
});

const hofstraDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003A63', // Bleu royal de Hofstra
    },
    sidebar: '#FFFFFF', // Barre latérale blanche en mode sombre
    secondary: {
      main: '#F2A900', // Couleur dorée pour les accents en mode sombre
    },
    background: {
      default: '#1C1C1C', // Fond pour dark mode
      paper: '#2E2E2E', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#FFFFFF', // Texte blanc pour dark mode
    },
    text_human_message_historic: '#003A63',
    send_button_message: '#F2A900',
    button_sign_in: '#E1F2FB',
    hover_button: '#CBA852',
    hover_button_with_button_background: '#F7D58C',
    button_text_sign_in: '#003A63',
    sign_up_link: '#FFFFFF',
    button: {
      background: '#E1F2FB', // Couleur de fond des boutons en dark mode
      text: '#003A63', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/hofstra_logo.png', // Chemin du logo spécifique à Hofstra
  university: 'hofstra',
  facultyOptions: [
    'College of Liberal Arts and Sciences',
    'Frank G. Zarb School of Business',
    'Maurice A. Deane School of Law',
    'School of Education',
    'School of Health Professions and Human Services',
    'Hofstra Northwell School of Nursing and Physician Assistant Studies',
    'Donald and Barbara Zucker School of Medicine at Hofstra/Northwell',
    'Lawrence Herbert School of Communication',
    'Fred DeMatteis School of Engineering and Applied Science',
    'School of Humanities, Fine and Performing Arts',
  ],
});

// Export both themes as named exports
export { hofstraTheme, hofstraDarkTheme };