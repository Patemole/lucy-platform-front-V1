
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

// Default light mode theme
const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#011F5B', // Couleur primaire de UPenn
    },
    secondary: {
      main: '#808080', // Couleur secondaire (gris)
    },
    background: {
      default: '#ffffff', // Fond blanc pour light mode
      paper: '#F5F5F5', // Fond pour les éléments "paper"
    },
    text: {
      primary: '#100F32', // Couleur du texte par défaut
    },
    button: {
      background: '#66B2A3', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte des boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#100F32', // Couleur par défaut du texte dans Typography
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#CDE4FE', // Couleur de fond du bouton
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
  logo: '/logos/Columbia_University_logo.png', // Chemin vers le logo
  university: 'columbia', // Nom de l'université pour ce thème
});

// Default dark mode theme
const defaultDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#011F5B', // Couleur primaire pour dark mode
    },
    secondary: {
      main: '#808080', // Couleur secondaire (gris) en dark mode
    },
    background: {
      default: '#2e2e2e', // Fond sombre pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper"
    },
    text: {
      primary: '#ffffff', // Texte blanc pour dark mode
    },
    button: {
      background: '#3E3E3E', // Couleur de fond des boutons en dark mode
      text: '#66B2A3', // Couleur du texte dans les boutons en dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#ffffff', // Couleur par défaut du texte dans Typography en dark mode
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#455A64', // Couleur de fond du bouton pour dark mode
          color: '#66B2A3', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#546E7A', // Couleur de fond du bouton lors du survol en dark mode
          },
        },
        outlined: {
          borderColor: '#66B2A3', // Couleur des contours pour les boutons outlined
          color: '#66B2A3', // Couleur du texte pour les boutons outlined
          backgroundColor: '#1c1c1c', // Couleur de fond des boutons outlined en dark mode
          '&:hover': {
            backgroundColor: '#3E3E3E', // Couleur de fond des boutons outlined lors du survol en dark mode
          },
        },
      },
    },
  },
  logo: '/logos/Columbia_University_logo.png', // Chemin vers le logo
  university: 'columbia', // Nom de l'université pour ce thème
});

export { defaultTheme, defaultDarkTheme };




/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const defaultTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#011F5B', // Couleur primaire de UPenn
      },
      secondary: {
        main: '#808080', // Couleur secondaire (gris)
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F5F5F5', // Fond pour les éléments "paper"
      },
      text: {
        primary: '#100F32', // Couleur du texte par défaut
      },
      button: {
        background: '#66B2A3', // Couleur de fond des boutons
        text: '#005030', // Couleur du texte des boutons
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
        main: '#011F5B', // Couleur primaire pour dark mode
      },
      secondary: {
        main: '#808080', // Couleur secondaire (gris) en dark mode
      },
      background: {
        default: '#2e2e2e', // Fond sombre pour dark mode
        paper: '#1c1c1c', // Fond pour les éléments "paper"
      },
      text: {
        primary: '#ffffff', // Texte blanc pour dark mode
      },
      button: {
        background: '#3E3E3E', // Couleur de fond des boutons en dark mode
        text: '#66B2A3', // Couleur du texte dans les boutons en dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#100F32', // Couleur par défaut du texte dans Typography
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#CDE4FE', // Couleur de fond du bouton
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
  logo: '/logos/Columbia_University_logo.png', // Chemin vers le logo
  university: 'columbia', // Nom de l'université pour ce thème
});

export default defaultTheme;
*/



/*
import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
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


  logo: '/logos/Columbia_University_logo.png', // Chemin vers le logo de Harvard
  university: 'columbia', // Champ supplémentaire pour l'université
});


export default defaultTheme;
*/