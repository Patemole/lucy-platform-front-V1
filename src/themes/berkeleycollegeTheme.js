import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const berkeleycollegeTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#003262', // Bleu pour Berkeley College
      },
      secondary: {
        main: '#FDB515', // Doré pour Berkeley College
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
        main: '#003262', // Bleu pour Berkeley College en dark mode
      },
      secondary: {
        main: '#FDB515', // Doré pour Berkeley College en dark mode
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
  // Déclaration des éléments communs pour éviter les erreurs
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Définition des états comme `focus` et `active`
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
  logo: '/logos/berkeleycollege_logo.jpg', // Chemin du logo spécifique à Berkeley College
  university: 'berkeleycollege',
  facultyOptions: [
    'School of Business',
    'School of Professional Studies',
    'School of Health Studies',
    'School of Liberal Arts',
    'School of Legal Studies',
  ],
});

export default berkeleycollegeTheme;




/*
import { createTheme } from '@mui/material/styles';

const berkeleycollegeTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley College
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley College
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeleycollege_logo.jpg', // Chemin du logo spécifique à Berkeley College
  university: 'berkeleycollege',
  facultyOptions: [
    'School of Business',
    'School of Professional Studies',
    'School of Health Studies',
    'School of Liberal Arts',
    'School of Legal Studies',
  ],
});

export default berkeleycollegeTheme;
*/


/*
import { createTheme } from '@mui/material/styles';

const berkeleycollegeTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley College
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley College
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeleycollege_logo.jpg', // Chemin du logo spécifique à Berkeley College
  university: 'berkeleycollege',
});

export default berkeleycollegeTheme;
*/