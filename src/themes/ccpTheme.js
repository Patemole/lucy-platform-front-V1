import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const ccpTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#004B87', // Couleur bleue de CCP
    },
    sidebar: '#004B87', // Couleur bleue pour la barre latérale
    secondary: {
      main: '#FFD100', // Couleur jaune de CCP
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#004B87', // Texte en bleu pour light mode
    },
    text_human_message_historic: '#000000', // Historique des messages humains
    send_button_message: '#004B87', // Couleur du bouton d'envoi de message
    button_sign_in: '#004B87', // Couleur du bouton de connexion
    hover_button: '#0061A8', // Couleur au survol des boutons
    hover_button_with_button_background: '#FFD100', // Couleur au survol avec arrière-plan
    button_text_sign_in: '#ffffff', // Couleur du texte dans le bouton de connexion
    sign_up_link: '#004B87', // Couleur des liens d'inscription
    button: {
      background: '#E3F2FD', // Couleur de fond des boutons en light mode
      text: '#004B87', // Couleur du texte des boutons
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
  logo: '/logos/ccp_logo.png', // Chemin du logo spécifique à CCP
  university: 'ccp',
  facultyOptions: [
    'Business and Technology',
    'Health Sciences',
    'Liberal Arts',
    'Mathematics, Science and Health Careers',
    'Visual, Performing, and Media Arts',
    'Social and Behavioral Sciences',
    'English and Humanities',
    'Center for Law and Society',
    'Education, Behavioral Health and Human Services',
  ],
});

const ccpDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#004B87', // Couleur bleue de CCP
    },
    sidebar: '#ffffff', // Couleur blanche pour la barre latérale en dark mode
    secondary: {
      main: '#FFD100', // Couleur jaune de CCP
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#004B87', // Historique des messages humains
    send_button_message: '#004B87', // Couleur du bouton d'envoi de message
    button_sign_in: '#FFD100', // Couleur du bouton de connexion en dark mode
    hover_button: '#FFE066', // Couleur au survol des boutons en dark mode
    hover_button_with_button_background: '#FFD100', // Couleur au survol avec arrière-plan
    button_text_sign_in: '#004B87', // Couleur du texte dans le bouton de connexion
    sign_up_link: '#ffffff', // Couleur des liens d'inscription
    button: {
      background: '#FFD100', // Couleur de fond des boutons en dark mode
      text: '#004B87', // Couleur du texte dans les boutons
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
  logo: '/logos/ccp_logo.png', // Chemin du logo spécifique à CCP
  university: 'ccp',
  facultyOptions: [
    'Business and Technology',
    'Health Sciences',
    'Liberal Arts',
    'Mathematics, Science and Health Careers',
    'Visual, Performing, and Media Arts',
    'Social and Behavioral Sciences',
    'English and Humanities',
    'Center for Law and Society',
    'Education, Behavioral Health and Human Services',
  ],
});

// Export both themes as named exports
export { ccpTheme, ccpDarkTheme };