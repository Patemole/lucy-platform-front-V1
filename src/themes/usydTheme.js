import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const usydTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#FFCD00', // Couleur jaune de l'université de Sydney
      },
      secondary: {
        main: '#C8102E', // Couleur rouge de l'université de Sydney
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#FFF4CC', // Couleur de fond des boutons en light mode
        text: '#C8102E', // Couleur du texte dans les boutons en light mode
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
        main: '#FFCD00', // Couleur jaune de l'université de Sydney
      },
      secondary: {
        main: '#C8102E', // Couleur rouge de l'université de Sydney
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
  logo: '/logos/sydney_logo.png', // Chemin du logo spécifique à l'université de Sydney
  university: 'sydney', // Champ supplémentaire pour l'université
  facultyOptions: [
    'Faculty of Arts and Social Sciences',
    'Faculty of Business',
    'Faculty of Engineering',
    'Faculty of Medicine and Health',
    'Faculty of Science',
    'Sydney Law School',
    'Sydney Conservatorium of Music',
    'Sydney School of Architecture, Design and Planning',
  ],
});

export default usydTheme;



/*
import { createTheme } from '@mui/material/styles';

const usydTheme = createTheme({
  palette: {
    primary: {
      main: '#E64626',
    },
    secondary: {
      main: '#808080',
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
          backgroundColor: '#FFD4CB', // Couleur de fond du bouton
          color: '#E64626', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#FFC1B3', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#E64626', // Couleur des contours pour les boutons outlined
          color: '#E64626', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#FFF0EC', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },
  logo: '/logos/usyd_logo.png', // Chemin vers le logo de USyd
  university: 'usyd', // Champ supplémentaire pour l'université
});

export default usydTheme;
*/