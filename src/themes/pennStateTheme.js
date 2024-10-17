import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const pennStateTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003366', // Couleur bleue de PennState
    },
    sidebar: '#003366',
    secondary: {
      main: '#FFFFFF', // Blanc pour le contraste secondaire
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#003366', // Texte en bleu foncé pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#003366',
    button_sign_in: '#003366',
    hover_button: '#004B87',
    hover_button_with_button_background: '#AED6F1',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#003366',
    button: {
      background: '#E1F0FF', // Couleur de fond des boutons en light mode
      text: '#003366', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/pennstate_logo.png', // Chemin du logo spécifique à PennState
  university: 'pennstate',
  facultyOptions: [
    'College of Agricultural Sciences',
    'Smeal College of Business',
    'College of Earth and Mineral Sciences',
    'College of Education',
    'College of Engineering',
    'College of Health and Human Development',
    'College of Information Sciences and Technology',
    'College of the Liberal Arts',
    'Eberly College of Science',
    'Dickinson Law',
    'Penn State Law',
    'College of Medicine',
    'College of Nursing',
  ],
});

const pennStateDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003366', // Couleur bleue de PennState
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#FFFFFF', // Blanc pour le contraste secondaire
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#003366',
    send_button_message: '#003366',
    button_sign_in: '#E1F0FF',
    hover_button: '#A9D1F2',
    hover_button_with_button_background: '#89BEE8',
    button_text_sign_in: '#003366',
    sign_up_link: '#ffffff',
    button: {
      background: '#E1F0FF', // Couleur de fond des boutons en dark mode
      text: '#003366', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/pennstate_logo.png', // Chemin du logo spécifique à PennState
  university: 'pennstate',
  facultyOptions: [
    'College of Agricultural Sciences',
    'Smeal College of Business',
    'College of Earth and Mineral Sciences',
    'College of Education',
    'College of Engineering',
    'College of Health and Human Development',
    'College of Information Sciences and Technology',
    'College of the Liberal Arts',
    'Eberly College of Science',
    'Dickinson Law',
    'Penn State Law',
    'College of Medicine',
    'College of Nursing',
  ],
});

// Export both themes as named exports
export { pennStateTheme, pennStateDarkTheme };