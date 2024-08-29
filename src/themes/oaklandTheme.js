import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const oaklandTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#004B8D', // Couleur bleue de Oakland
      },
      secondary: {
        main: '#FFD100', // Couleur jaune de Oakland
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
        text: '#004B8D', // Couleur du texte dans les boutons en light mode
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
        main: '#004B8D', // Couleur bleue de Oakland
      },
      secondary: {
        main: '#FFD100', // Couleur jaune de Oakland
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
  logo: '/logos/oakland_logo.webp', // Chemin du logo spécifique à Oakland
  university: 'oakland',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business Administration',
    'School of Education and Human Services',
    'School of Engineering and Computer Science',
    'School of Health Sciences',
    'School of Nursing',
    'Oakland University William Beaumont School of Medicine',
  ],
});

export default oaklandTheme;




/*

import { createTheme } from '@mui/material/styles';

const oaklandTheme = createTheme({
  palette: {
    primary: {
      main: '#004B8D', // Couleur bleue de Oakland
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de Oakland
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#004B8D', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/oakland_logo.webp', // Chemin du logo spécifique à Oakland
  university: 'oakland',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business Administration',
    'School of Education and Human Services',
    'School of Engineering and Computer Science',
    'School of Health Sciences',
    'School of Nursing',
    'Oakland University William Beaumont School of Medicine',
  ],
});

export default oaklandTheme;

*/

/*
import { createTheme } from '@mui/material/styles';

const oacklandTheme = createTheme({
  palette: {
    primary: {
      main: '#004B8D', // Couleur bleue de Oackland
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de Oackland
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#004B8D', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/oackland_logo.webp', // Chemin du logo spécifique à Oackland
  university: 'oackland',
});

export default oacklandTheme;
*/