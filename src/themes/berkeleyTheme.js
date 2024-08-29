import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const berkeleyTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#003262', // Bleu pour Berkeley
      },
      secondary: {
        main: '#FDB515', // Doré pour Berkeley
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F8F8F8', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Fond des boutons en light mode
        text: '#003262', // Texte bleu dans les boutons en light mode
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
        main: '#003262', // Bleu pour Berkeley en dark mode
      },
      secondary: {
        main: '#FDB515', // Doré pour Berkeley en dark mode
      },
      background: {
        default: '#2E2E2E', // Fond sombre pour dark mode
        paper: '#1C1C1C', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#FFFFFF', // Texte blanc pour dark mode
      },
      button: {
        background: '#454545', // Fond des boutons en dark mode
        text: '#FDB515', // Texte doré dans les boutons en dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  // Composants communs pour éviter les erreurs
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Gestion des états `focus` et `active`
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
  logo: '/logos/berkeley_logo.png', // Chemin du logo spécifique à Berkeley
  university: 'berkeley',
});

export default berkeleyTheme;





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
