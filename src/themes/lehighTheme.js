import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const lehighTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#653819', // Couleur marron de Lehigh
    },
    sidebar: '#653819',
    secondary: {
      main: '#85754D', // Couleur dorée de Lehigh
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#653819', // Texte en marron pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#653819',
    button_sign_in: '#653819',
    hover_button: '#4B2814',
    hover_button_with_button_background: '#C2B090',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#653819',
    button: {
      background: '#EDE4D4', // Couleur de fond des boutons en light mode
      text: '#653819', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/lehigh_logo.png', // Chemin du logo spécifique à Lehigh
  university: 'lehigh',
  facultyOptions: [
    'College of Arts and Sciences',
    'P.C. Rossin College of Engineering and Applied Science',
    'College of Business',
    'College of Education',
    'Graduate College of Education',
  ],
});

const lehighDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#653819', // Couleur marron de Lehigh
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#85754D', // Couleur dorée de Lehigh
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#653819',
    send_button_message: '#653819',
    button_sign_in: '#EDE4D4',
    hover_button: '#A3946B',
    hover_button_with_button_background: '#C2B090',
    button_text_sign_in: '#653819',
    sign_up_link: '#ffffff',
    button: {
      background: '#EDE4D4', // Couleur de fond des boutons en dark mode
      text: '#653819', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/lehigh_logo.png',
  university: 'lehigh',
  facultyOptions: [
    'College of Arts and Sciences',
    'P.C. Rossin College of Engineering and Applied Science',
    'College of Business',
    'College of Education',
    'Graduate College of Education',
  ],
});

// Export both themes as named exports
export { lehighTheme, lehighDarkTheme };