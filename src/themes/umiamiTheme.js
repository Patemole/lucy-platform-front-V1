
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const umiamiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    sidebar: '#005030', // Couleur de la sidebar en light mode
    text_human_message_historic: '#005030', // Texte pour l'historique des messages en light mode
    send_button_message: '#005030', // Couleur des boutons d'envoi de message en light mode
    button_sign_in: '#005030', // Couleur des boutons "Sign In" en light mode
    button_text_sign_in: '#ffffff', // Couleur du texte des boutons "Sign In" en light mode
    sign_up_link: '#005030', // Couleur du lien d'inscription en light mode
    button: {
      background: '#DCFCE5', // Couleur de fond des boutons en light mode
      text: '#005030', // Couleur du texte des boutons en light mode
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
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à l'université de Miami
  university: 'miami',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

const umiamiDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    sidebar: '#ffffff', // Couleur de la sidebar en dark mode
    text_human_message_historic: '#DCFCE5', // Texte pour l'historique des messages en dark mode
    send_button_message: '#DCFCE5', // Couleur des boutons d'envoi de message en dark mode
    button_sign_in: '#DCFCE5', // Couleur des boutons "Sign In" en dark mode
    button_text_sign_in: '#005030', // Couleur du texte des boutons "Sign In" en dark mode
    sign_up_link: '#ffffff', // Couleur du lien d'inscription en dark mode
    button: {
      background: '#455a64', // Couleur de fond des boutons en dark mode
      text: '#ffffff', // Couleur du texte des boutons en dark mode
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
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à l'université de Miami
  university: 'miami',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

export { umiamiTheme, umiamiDarkTheme };




/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const umiamiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    text_human_message_historic: '#005030', // Texte pour l'historique des messages en light mode
    button_sign_in: '#005030', // Couleur des boutons "Sign In" en light mode
    button_text_sign_in: '#ffffff', // Couleur du texte des boutons "Sign In" en light mode
    sign_up_link: '#005030', // Couleur du lien d'inscription en light mode
    button: {
      background: '#DCFCE5', // Couleur de fond des boutons en light mode
      text: '#005030', // Couleur du texte des boutons en light mode
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
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à l'université de Miami
  university: 'miami',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

const umiamiDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#F47321', // Texte pour l'historique des messages en dark mode
    button_sign_in: '#DCFCE5', // Couleur des boutons "Sign In" en dark mode
    button_text_sign_in: '#005030', // Couleur du texte des boutons "Sign In" en dark mode
    sign_up_link: '#ffffff', // Couleur du lien d'inscription en dark mode
    button: {
      background: '#455a64', // Couleur de fond des boutons en dark mode
      text: '#ffffff', // Couleur du texte des boutons en dark mode
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
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à l'université de Miami
  university: 'miami',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

export { umiamiTheme, umiamiDarkTheme };
*/



/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const umiamiTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#005030', // Couleur verte de l'université de Miami
      },
      secondary: {
        main: '#F47321', // Couleur orange de l'université de Miami
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#DCFCE5', // Couleur de fond des boutons en light mode
        text: '#005030', // Couleur du texte dans les boutons en light mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  darkMode: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#005030', // Couleur verte de l'université de Miami
      },
      secondary: {
        main: '#F47321', // Couleur orange de l'université de Miami
      },
      background: {
        default: '#2e2e2e', // Fond pour dark mode
        paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#ffffff', // Texte en blanc pour dark mode
      },
      button: {
        background: '#455a64', // Couleur de fond des boutons en dark mode
        text: '#ffffff', // Couleur du texte dans les boutons en dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
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
          // Définition des états comme `focus` et `active` pour éviter les erreurs
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
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à l'université de Miami
  university: 'miami', // Champ supplémentaire pour l'université
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

export default umiamiTheme;
*/



/*
import { createTheme } from '@mui/material/styles';

const umiamiTheme = createTheme({
  palette: {
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    button: {
      background: '#DCFCE5', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Police de caractère courante, ajustez selon vos besoins
  },
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à Umiami
  university: 'miami', // Champ supplémentaire pour l'université
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

export default umiamiTheme;

*/
