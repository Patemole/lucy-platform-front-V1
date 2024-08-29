import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const columbiaTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#0033A0', // Bleu pour Columbia
      },
      secondary: {
        main: '#C4D8E2', // Couleur secondaire de Columbia
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F5F5F5', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Fond des boutons en light mode
        text: '#0033A0', // Texte bleu dans les boutons en light mode
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
        main: '#0033A0', // Bleu pour Columbia en dark mode
      },
      secondary: {
        main: '#C4D8E2', // Couleur secondaire de Columbia en dark mode
      },
      background: {
        default: '#2E2E2E', // Fond sombre pour dark mode
        paper: '#1C1C1C', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#FFFFFF', // Texte blanc pour dark mode
      },
      button: {
        background: '#3E3E3E', // Fond des boutons en dark mode
        text: '#C4D8E2', // Texte clair dans les boutons en dark mode
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
        disableRipple: true, // Désactivation des effets ripple
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
  logo: '/logos/columbia_logo.png', // Chemin du logo spécifique à Columbia
  university: 'columbia',
  facultyOptions: [
    'Columbia College',
    'School of Engineering and Applied Science',
    'School of General Studies',
    'School of International and Public Affairs',
  ],
});

export default columbiaTheme;




/*
import { createTheme } from '@mui/material/styles';

const columbiaTheme = createTheme({
  palette: {
    primary: {
      main: '#0033A0', // Couleur bleue de Columbia
    },
    secondary: {
      main: '#C4D8E2', // Couleur secondaire de Columbia
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#0033A0', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/columbia_logo.png', // Chemin du logo spécifique à Columbia
  university: 'columbia',
  facultyOptions: [
    'Columbia College',
    'School of Engineering and Applied Science',
    'School of General Studies',
    'School of International and Public Affairs',
  ],
});

export default columbiaTheme;
*/

/*
import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#011F5B', // Couleur primaire de UPenn
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
          backgroundColor: '#CDE4FE ', // Couleur de fond du bouton   Ancienne couleur#A3C1E8
          color: '#011F5B', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#92B1D6', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#011F5B', // Couleur des contours pour les boutons outlined
          color: '#011F5B', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#E5EBF3', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },
  logo: '/logos/upenn_logo.png', // Chemin vers le logo de UPenn
  university: 'upenn', // Champ supplémentaire pour l'université
});

export default customTheme;
*/