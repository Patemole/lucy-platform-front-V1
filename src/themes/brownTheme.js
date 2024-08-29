import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const brownTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#4E3629', // Brun pour Brown
      },
      secondary: {
        main: '#EE3B3B', // Rouge pour Brown
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F5F5F5', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte noir pour light mode
      },
      button: {
        background: '#F5E5E0', // Fond des boutons en light mode
        text: '#4E3629', // Texte brun dans les boutons en light mode
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
        main: '#4E3629', // Brun pour Brown en dark mode
      },
      secondary: {
        main: '#EE3B3B', // Rouge pour Brown en dark mode
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
        text: '#EE3B3B', // Texte rouge dans les boutons en dark mode
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
  logo: '/logos/brown_logo.png', // Chemin du logo spécifique à Brown
  university: 'brown',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Engineering',
    'Alpert Medical School',
    'School of Public Health',
    'School of Professional Studies',
  ],
});

export default brownTheme;



/*
import { createTheme } from '@mui/material/styles';

const brownTheme = createTheme({
  palette: {
    primary: {
      main: '#4E3629', // Couleur brune de Brown
    },
    secondary: {
      main: '#EE3B3B', // Couleur rouge de Brown
    },
    button: {
      background: '#F5E5E0', // Couleur de fond des boutons
      text: '#4E3629', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/brown_logo.png', // Chemin du logo spécifique à Brown
  university: 'brown',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Engineering',
    'Alpert Medical School',
    'School of Public Health',
    'School of Professional Studies',
  ],
});

export default brownTheme;
*/




/*
import { createTheme } from '@mui/material/styles';

const brownTheme = createTheme({
  palette: {
    primary: {
      main: '#4E3629', // Couleur brune de Brown
    },
    secondary: {
      main: '#EE3B3B', // Couleur rouge de Brown
    },
    button: {
      background: '#F5E5E0', // Couleur de fond des boutons
      text: '#4E3629', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/brown_logo.png', // Chemin du logo spécifique à Brown
  university: 'brown',
});

export default brownTheme;
*/
