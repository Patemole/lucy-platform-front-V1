import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const harvardTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    sidebar: '#A41034',
    text_human_message_historic: '#A41034', // Texte pour historique des messages
    send_button_message: '#A41034',
    button_sign_in: '#A41034', // Couleur de fond des boutons "Sign In" en light mode
    button_text_sign_in: '#ffffff', // Couleur du texte dans les boutons "Sign In" en light mode
    sign_up_link: '#A41034', // Couleur du lien "Sign Up" en light mode
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons en light mode
      text: '#A41034', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

const harvardDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
    },
    sidebar: '#ffffff',
    text_human_message_historic: '#A41034', // Texte pour historique des messages en dark mode
    send_button_message: '#F8D7DA',
    button_sign_in: '#F8D7DA', // Couleur de fond des boutons "Sign In" en dark mode
    button_text_sign_in: '#A41034', // Couleur du texte dans les boutons "Sign In" en dark mode
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
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

export { harvardTheme, harvardDarkTheme };





/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const harvardTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // Texte en noir pour light mode
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons en light mode
      text: '#A41034', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

const harvardDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
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
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

// Export both themes as named exports
export { harvardTheme, harvardDarkTheme };

*/


/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const harvardTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#A41034', // Couleur rouge de Harvard
      },
      secondary: {
        main: '#FBBA00', // Couleur dorée de Harvard
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#F8D7DA', // Couleur de fond des boutons en light mode
        text: '#A41034', // Couleur du texte dans les boutons en light mode
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
        main: '#A41034', // Couleur rouge de Harvard
      },
      secondary: {
        main: '#FBBA00', // Couleur dorée de Harvard
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
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

export default harvardTheme;
*/



/*
import { createTheme } from '@mui/material/styles';

const harvardTheme = createTheme({
  palette: {
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#A41034', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

export default harvardTheme;
*/


/*
import { createTheme } from '@mui/material/styles';

const harvardTheme = createTheme({
  palette: {
    primary: {
      main: '#A51C30', // Couleur primaire de Harvard
    },
    secondary: {
      main: '#808080', // Couleur secondaire (gris)
    },
    text: {
      primary: '#100F32', // Couleur du texte par défaut
    },
    button: {
      background: '#66B2A3', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte dans les boutons
    }
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#100F32', // Couleur du texte par défaut pour les composants Typography
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#EC8F9C', // Couleur de fond du bouton
          color: '#A51C30', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#D87786', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#A51C30', // Couleur des contours pour les boutons outlined
          color: '#A51C30', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#F7E1E4', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },
  logo: '/logos/harvard_logo.png', // Chemin vers le logo de Harvard
  university: 'harvard', // Champ supplémentaire pour l'université
});

export default harvardTheme;
*/