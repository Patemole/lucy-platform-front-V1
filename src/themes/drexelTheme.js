import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const drexelTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005EB8', // Couleur bleue de Drexel
    },
    secondary: {
      main: '#FEC20E', // Couleur jaune de Drexel
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    sidebar: '#005EB8',
    text_human_message_historic: '#005EB8', // Texte pour historique des messages
    send_button_message: '#005EB8',
    button_sign_in: '#005EB8', // Couleur de fond des boutons "Sign In" en light mode
    button_text_sign_in: '#ffffff', // Couleur du texte dans les boutons "Sign In" en light mode
    sign_up_link: '#005EB8', // Couleur du lien "Sign Up" en light mode
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons en light mode
      text: '#005EB8', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/drexel_logo.png', // Chemin du logo spécifique à Drexel
  university: 'drexel',
  facultyOptions: [
    'College of Arts and Sciences',
    'College of Engineering',
    'Drexel University College of Medicine',
    'LeBow College of Business',
    'School of Education',
    'Kline School of Law',
    'College of Computing & Informatics',
    'Antoinette Westphal College of Media Arts & Design',
  ],
});

const drexelDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#005EB8', // Couleur bleue de Drexel
    },
    secondary: {
      main: '#FEC20E', // Couleur jaune de Drexel
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    sidebar: '#ffffff',
    text_human_message_historic: '#005EB8', // Texte pour historique des messages en dark mode
    send_button_message: '#F8D7DA',
    button_sign_in: '#F8D7DA', // Couleur de fond des boutons "Sign In" en dark mode
    button_text_sign_in: '#005EB8', // Couleur du texte dans les boutons "Sign In" en dark mode
    sign_up_link: '#ffffff', // Couleur du lien "Sign Up" en dark mode
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons en dark mode
      text: '#ffffff', // Couleur du texte dans les boutons en dark mode
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
  logo: '/logos/drexel_logo.png', // Chemin du logo spécifique à Drexel
  university: 'drexel',
  facultyOptions: [
    'College of Arts and Sciences',
    'College of Engineering',
    'Drexel University College of Medicine',
    'LeBow College of Business',
    'School of Education',
    'Kline School of Law',
    'College of Computing & Informatics',
    'Antoinette Westphal College of Media Arts & Design',
  ],
});

export { drexelTheme, drexelDarkTheme };