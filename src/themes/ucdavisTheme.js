import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const ucdavisTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#002855', // Couleur bleue de UCDavis
      },
      secondary: {
        main: '#B9975B', // Couleur dorée de UCDavis
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
        text: '#002855', // Couleur du texte dans les boutons en light mode
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
        main: '#002855', // Couleur bleue de UCDavis
      },
      secondary: {
        main: '#B9975B', // Couleur dorée de UCDavis
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
  logo: '/logos/ucdavis_logo.png', // Chemin du logo spécifique à UC Davis
  university: 'ucdavis',
  facultyOptions: [
    'College of Agricultural and Environmental Sciences',
    'College of Biological Sciences',
    'College of Engineering',
    'College of Letters and Science',
    'Graduate School of Management',
    'School of Education',
    'School of Law',
    'School of Medicine',
    'School of Nursing',
    'School of Veterinary Medicine',
  ],
});

export default ucdavisTheme;


/*
import { createTheme } from '@mui/material/styles';

const ucdavisTheme = createTheme({
  palette: {
    primary: {
      main: '#002855', // Couleur bleue de UCDavis
    },
    secondary: {
      main: '#B9975B', // Couleur dorée de UCDavis
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#002855', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/ucdavis_logo.png', // Chemin du logo spécifique à UCDavis
  university: 'ucdavis',
  facultyOptions: [
    'College of Agricultural and Environmental Sciences',
    'College of Biological Sciences',
    'College of Engineering',
    'College of Letters and Science',
    'Graduate School of Management',
    'School of Education',
    'School of Law',
    'School of Medicine',
    'School of Nursing',
    'School of Veterinary Medicine',
  ],
});

export default ucdavisTheme;
*/


/*
import { createTheme } from '@mui/material/styles';

const ucdavisTheme = createTheme({
  palette: {
    primary: {
      main: '#002855', // Couleur bleue de UCDavis
    },
    secondary: {
      main: '#B9975B', // Couleur dorée de UCDavis
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#002855', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/ucdavis_logo.png', // Chemin du logo spécifique à UCDavis
  university: 'ucdavis',
});

export default ucdavisTheme;
*/
