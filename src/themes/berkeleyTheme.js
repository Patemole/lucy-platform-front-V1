import { createTheme } from '@mui/material/styles';

// utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const berkeleyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003262', // bleu pour berkeley
    },
    secondary: {
      main: '#FDB515', // doré pour berkeley
    },
    background: {
      default: '#ffffff', // fond blanc pour light mode
      paper: '#F8F8F8', // fond pour les éléments "paper" en light mode
    },
    text: {
      primary: '#000000', // texte noir pour light mode
    },
    button: {
      background: '#D6EAF8', // fond des boutons en light mode
      text: '#003262', // texte bleu dans les boutons en light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // désactivation des effets ripple
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)', // gestion du focus
          },
          '&:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.24)', // gestion de l'état actif
          },
        },
      },
    },
  },
  logo: '/logos/berkeley_logo.png', // chemin du logo spécifique à berkeley
  university: 'berkeley',
});

const berkeleyDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003262', // bleu pour berkeley en dark mode
    },
    secondary: {
      main: '#FDB515', // doré pour berkeley en dark mode
    },
    background: {
      default: '#2E2E2E', // fond sombre pour dark mode
      paper: '#1C1C1C', // fond pour les éléments "paper" en dark mode
    },
    text: {
      primary: '#FFFFFF', // texte blanc pour dark mode
    },
    button: {
      background: '#454545', // fond des boutons en dark mode
      text: '#FDB515', // texte doré dans les boutons en dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // désactivation des effets ripple
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // gestion du focus en dark mode
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)', // gestion de l'état actif en dark mode
          },
        },
      },
    },
  },
  logo: '/logos/berkeley_logo.png', // chemin du logo spécifique à berkeley
  university: 'berkeley',
});

export { berkeleyTheme, berkeleyDarkTheme };





/*
import { createTheme } from '@mui/material/styles';

const berkeleyTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeley_logo.png', // Chemin du logo spécifique à Berkeley
  university: 'berkeley',
});

export default berkeleyTheme;
*/

/*
import { createTheme } from '@mui/material/styles';

const berkeleyTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeley_logo.png', // Chemin du logo spécifique à Berkeley
  university: 'berkeley',
});

export default berkeleyTheme;
*/
