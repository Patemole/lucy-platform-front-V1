import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const uscTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#990000', // Couleur rouge cardinal officielle de USC
    },
    sidebar: '#990000',
    secondary: {
      main: '#FFCC00', // Couleur dorée officielle de USC
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#990000', // Texte en rouge cardinal pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#990000',
    button_sign_in: '#990000',
    hover_button: '#7A0000',
    hover_button_with_button_background: '#FBE4B4',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#990000',
    button: {
      background: '#FFE5B4', // Couleur de fond des boutons en light mode
      text: '#990000', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/usc_logo.png', // Chemin du logo spécifique à USC
  university: 'usc',
  facultyOptions: [
    'Dana and David Dornsife College of Letters, Arts, and Sciences',
    'Marshall School of Business',
    'Viterbi School of Engineering',
    'Roski School of Art and Design',
    'Thornton School of Music',
    'School of Cinematic Arts',
    'Keck School of Medicine',
    'Price School of Public Policy',
    'Annenberg School for Communication and Journalism',
    'Ostrow School of Dentistry',
    'School of Dramatic Arts',
    'Gould School of Law',
    'School of Architecture',
    'Suzanne Dworak-Peck School of Social Work',
  ],
});

const uscDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#990000', // Couleur rouge cardinal officielle de USC
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#FFCC00', // Couleur dorée officielle de USC
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#990000',
    send_button_message: '#990000',
    button_sign_in: '#FFE5B4',
    hover_button: '#F1C14D',
    hover_button_with_button_background: '#FBE4B4',
    button_text_sign_in: '#990000',
    sign_up_link: '#ffffff',
    button: {
      background: '#FFE5B4', // Couleur de fond des boutons en dark mode
      text: '#990000', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/usc_logo.png', // Chemin du logo spécifique à USC
  university: 'usc',
  facultyOptions: [
    'Dana and David Dornsife College of Letters, Arts, and Sciences',
    'Marshall School of Business',
    'Viterbi School of Engineering',
    'Roski School of Art and Design',
    'Thornton School of Music',
    'School of Cinematic Arts',
    'Keck School of Medicine',
    'Price School of Public Policy',
    'Annenberg School for Communication and Journalism',
    'Ostrow School of Dentistry',
    'School of Dramatic Arts',
    'Gould School of Law',
    'School of Architecture',
    'Suzanne Dworak-Peck School of Social Work',
  ],
});

// Export both themes as named exports
export { uscTheme, uscDarkTheme };