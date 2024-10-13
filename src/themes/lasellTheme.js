
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const lasellTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#003DA5', // Couleur bleue de Lasell
      },
      secondary: {
        main: '#0077C8', // Couleur bleue secondaire de Lasell
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Couleur de fond des boutons en light mode
        text: '#003DA5', // Couleur du texte dans les boutons en light mode
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
        main: '#003DA5', // Couleur bleue de Lasell
      },
      secondary: {
        main: '#0077C8', // Couleur bleue secondaire de Lasell
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
  logo: '/logos/lasell_logo.png', // Chemin du logo spécifique à Lasell
  university: 'lasell',
  facultyOptions: [
    'School of Business',
    'School of Communication and the Arts',
    'School of Health Sciences',
    'School of Fashion',
    'School of Social Sciences, Humanities, and Education',
  ],
});

export default lasellTheme;



/*
import { createTheme } from '@mui/material/styles';

const lasellTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de Lasell
    },
    secondary: {
      main: '#0077C8', // Couleur bleue secondaire de Lasell
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/lasell_logo.png', // Chemin du logo spécifique à Lasell
  university: 'lasell',
  facultyOptions: [
    'School of Business',
    'School of Communication and the Arts',
    'School of Health Sciences',
    'School of Fashion',
    'School of Social Sciences, Humanities, and Education',
  ],
});

export default lasellTheme;

*/



/*
import { createTheme } from '@mui/material/styles';

const lasellTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de Lasell
    },
    secondary: {
      main: '#0077C8', // Couleur bleue secondaire de Lasell
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/lasell_logo.png', // Chemin du logo spécifique à Lasell
  university: 'lasell',
});

export default lasellTheme;
*/
