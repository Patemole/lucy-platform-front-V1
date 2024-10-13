import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const stanfordTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#8C1515', // Couleur rouge de Stanford
      },
      secondary: {
        main: '#175E54', // Couleur verte de Stanford
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
        text: '#8C1515', // Couleur du texte dans les boutons en light mode
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
        main: '#8C1515', // Couleur rouge de Stanford
      },
      secondary: {
        main: '#175E54', // Couleur verte de Stanford
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
  logo: '/logos/stanford_logo.webp', // Chemin du logo spécifique à Stanford
  university: 'stanford',
  facultyOptions: [
    'School of Humanities and Sciences',
    'School of Engineering',
    'Graduate School of Business',
    'Stanford Law School',
    'School of Medicine',
    'Graduate School of Education',
    'School of Earth, Energy & Environmental Sciences',
  ],
});

export default stanfordTheme;


/*
import { createTheme } from '@mui/material/styles';

const stanfordTheme = createTheme({
  palette: {
    primary: {
      main: '#8C1515', // Couleur rouge de Stanford
    },
    secondary: {
      main: '#175E54', // Couleur verte de Stanford
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#8C1515', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/stanford_logo.webp', // Chemin du logo spécifique à Stanford
  university: 'stanford',
  facultyOptions: [
    'School of Humanities and Sciences',
    'School of Engineering',
    'Graduate School of Business',
    'Stanford Law School',
    'School of Medicine',
    'Graduate School of Education',
    'School of Earth, Energy & Environmental Sciences',
  ],
});

export default stanfordTheme;
*/

/*
import { createTheme } from '@mui/material/styles';

const stanfordTheme = createTheme({
  palette: {
    primary: {
      main: '#8C1515', // Couleur rouge de Stanford
    },
    secondary: {
      main: '#175E54', // Couleur verte de Stanford
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#8C1515', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/stanford_logo.webp', // Chemin du logo spécifique à Stanford
  university: 'stanford',
});

export default stanfordTheme;
*/