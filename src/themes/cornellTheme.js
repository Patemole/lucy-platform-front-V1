import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const cornellTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#B31B1B', // Rouge de Cornell
      },
      secondary: {
        main: '#E87722', // Orange de Cornell
      },
      background: {
        default: '#ffffff', // Fond blanc pour light mode
        paper: '#F5F5F5', // Fond des éléments "paper" pour light mode
      },
      text: {
        primary: '#000000', // Texte noir pour light mode
      },
      button: {
        background: '#F8D7DA', // Fond des boutons en light mode
        text: '#B31B1B', // Texte rouge dans les boutons en light mode
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
        main: '#B31B1B', // Rouge de Cornell en dark mode
      },
      secondary: {
        main: '#E87722', // Orange de Cornell en dark mode
      },
      background: {
        default: '#2E2E2E', // Fond sombre pour dark mode
        paper: '#1C1C1C', // Fond des éléments "paper" pour dark mode
      },
      text: {
        primary: '#FFFFFF', // Texte blanc pour dark mode
      },
      button: {
        background: '#3E3E3E', // Fond des boutons en dark mode
        text: '#E87722', // Texte orange dans les boutons en dark mode
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
  logo: '/logos/cornell_logo.png', // Chemin du logo spécifique à Cornell
  university: 'cornell',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Art, and Planning',
    'College of Arts and Sciences',
    'Cornell SC Johnson College of Business',
    'College of Engineering',
    'College of Human Ecology',
    'School of Industrial and Labor Relations',
    'College of Veterinary Medicine',
    'Weill Cornell Medical College',
    'Cornell Law School',
  ],
});

export default cornellTheme;




/*
import { createTheme } from '@mui/material/styles';

const cornellTheme = createTheme({
  palette: {
    primary: {
      main: '#B31B1B', // Couleur rouge de Cornell
    },
    secondary: {
      main: '#E87722', // Couleur orange de Cornell
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#B31B1B', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/cornell_logo.png', // Chemin du logo spécifique à Cornell
  university: 'cornell',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Art, and Planning',
    'College of Arts and Sciences',
    'Cornell SC Johnson College of Business',
    'College of Engineering',
    'College of Human Ecology',
    'School of Industrial and Labor Relations',
    'College of Veterinary Medicine',
    'Weill Cornell Medical College',
    'Cornell Law School',
  ],
});

export default cornellTheme;
*/





/*
import { createTheme } from '@mui/material/styles';

const cornellTheme = createTheme({
  palette: {
    primary: {
      main: '#B31B1B', // Couleur rouge de Cornell
    },
    secondary: {
      main: '#E87722', // Couleur orange de Cornell
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#B31B1B', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/cornell_logo.png', // Chemin du logo spécifique à Cornell
  university: 'cornell',
});

export default cornellTheme;
*/
