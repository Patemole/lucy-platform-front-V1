import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const uciTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    text_human_message_historic: '#003DA5', // Texte pour l'historique des messages
    button_sign_in: '#003DA5', // Couleur des boutons "Sign In"
    button_text_sign_in: '#ffffff', // Couleur du texte des boutons "Sign In"
    sign_up_link: '#003DA5', // Couleur du lien d'inscription
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons en light mode
      text: '#003DA5', // Couleur du texte des boutons en light mode
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
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
  facultyOptions: [
    'Claire Trevor School of the Arts',
    'School of Biological Sciences',
    'The Paul Merage School of Business',
    'School of Education',
    'Henry Samueli School of Engineering',
    'School of Humanities',
    'Donald Bren School of Information and Computer Sciences',
    'School of Law',
    'School of Medicine',
    'Sue & Bill Gross School of Nursing',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
  ],
});

const uciDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    text_human_message_historic: '#FFD100', // Texte pour l'historique des messages en dark mode
    button_sign_in: '#D6EAF8', // Couleur des boutons "Sign In" en dark mode
    button_text_sign_in: '#003DA5', // Couleur du texte des boutons "Sign In" en dark mode
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
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
  facultyOptions: [
    'Claire Trevor School of the Arts',
    'School of Biological Sciences',
    'The Paul Merage School of Business',
    'School of Education',
    'Henry Samueli School of Engineering',
    'School of Humanities',
    'Donald Bren School of Information and Computer Sciences',
    'School of Law',
    'School of Medicine',
    'Sue & Bill Gross School of Nursing',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
  ],
});

export { uciTheme, uciDarkTheme };



/*


import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const uciTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#003DA5', // Couleur bleue de UCI
      },
      secondary: {
        main: '#FFD100', // Couleur jaune de UCI
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Couleur de fond des boutons en light mode
        text: '#003DA5', // Couleur du texte dans les boutons en light mode
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
        main: '#003DA5', // Couleur bleue de UCI
      },
      secondary: {
        main: '#FFD100', // Couleur jaune de UCI
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
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
  facultyOptions: [
    'Claire Trevor School of the Arts',
    'School of Biological Sciences',
    'The Paul Merage School of Business',
    'School of Education',
    'Henry Samueli School of Engineering',
    'School of Humanities',
    'Donald Bren School of Information and Computer Sciences',
    'School of Law',
    'School of Medicine',
    'Sue & Bill Gross School of Nursing',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
  ],
});

export default uciTheme;
*/

/*
import { createTheme } from '@mui/material/styles';

const uciTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
  facultyOptions: [
    'Claire Trevor School of the Arts',
    'School of Biological Sciences',
    'The Paul Merage School of Business',
    'School of Education',
    'Henry Samueli School of Engineering',
    'School of Humanities',
    'Donald Bren School of Information and Computer Sciences',
    'School of Law',
    'School of Medicine',
    'Sue & Bill Gross School of Nursing',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
  ],
});

export default uciTheme;
*/




/*
import { createTheme } from '@mui/material/styles';

const uciTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
});

export default uciTheme;
*/
