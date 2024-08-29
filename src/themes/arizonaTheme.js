import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const arizonaTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#CC0033', // Rouge pour Arizona
      },
      secondary: {
        main: '#003366', // Bleu pour Arizona
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F8F8F8', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte noir pour light mode
      },
      button: {
        background: '#F8D7DA', // Fond des boutons en light mode
        text: '#CC0033', // Texte rouge dans les boutons en light mode
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
        main: '#CC0033', // Rouge pour Arizona en dark mode
      },
      secondary: {
        main: '#003366', // Bleu pour Arizona en dark mode
      },
      background: {
        default: '#2E2E2E', // Fond sombre pour dark mode
        paper: '#1C1C1C', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#FFFFFF', // Texte blanc pour dark mode
      },
      button: {
        background: '#552A2C', // Fond des boutons en dark mode
        text: '#FFFFFF', // Texte blanc dans les boutons en dark mode
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
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Planning, and Landscape Architecture',
    'College of Education',
    'College of Engineering',
    'College of Fine Arts',
    'James E. Rogers College of Law',
    'College of Medicine - Tucson',
    'College of Medicine - Phoenix',
    'College of Nursing',
    'College of Pharmacy',
    'College of Science',
    'Eller College of Management',
    'College of Social and Behavioral Sciences',
    'Mel and Enid Zuckerman College of Public Health',
  ],
});

export default arizonaTheme;



/*
import { createTheme } from '@mui/material/styles';

const arizonaTheme = createTheme({
  palette: {
    primary: {
      main: '#CC0033', // Couleur rouge de Arizona
    },
    secondary: {
      main: '#003366', // Couleur bleue de Arizona
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#CC0033', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Planning, and Landscape Architecture',
    'College of Education',
    'College of Engineering',
    'College of Fine Arts',
    'James E. Rogers College of Law',
    'College of Medicine - Tucson',
    'College of Medicine - Phoenix',
    'College of Nursing',
    'College of Pharmacy',
    'College of Science',
    'Eller College of Management',
    'College of Social and Behavioral Sciences',
    'Mel and Enid Zuckerman College of Public Health',
  ],
});

export default arizonaTheme;
*/


/*
import { createTheme } from '@mui/material/styles';

const arizonaTheme = createTheme({
  palette: {
    primary: {
      main: '#CC0033', // Couleur rouge de Arizona
    },
    secondary: {
      main: '#003366', // Couleur bleue de Arizona
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#CC0033', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
});

export default arizonaTheme;
*/