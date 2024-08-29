import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const mitTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#A31F34', // Couleur rouge de MIT
      },
      secondary: {
        main: '#8A8B8C', // Couleur grise de MIT
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#F5D7D9', // Couleur de fond des boutons en light mode
        text: '#A31F34', // Couleur du texte dans les boutons en light mode
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
        main: '#A31F34', // Couleur rouge de MIT
      },
      secondary: {
        main: '#8A8B8C', // Couleur grise de MIT
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
  logo: '/logos/mit_logo.png', // Chemin du logo spécifique à MIT
  university: 'mit',
  facultyOptions: [
    'School of Architecture and Planning',
    'School of Engineering',
    'School of Humanities, Arts, and Social Sciences',
    'Sloan School of Management',
    'School of Science',
    'MIT Schwarzman College of Computing',
  ],
});

export default mitTheme;


/*
import { createTheme } from '@mui/material/styles';

const mitTheme = createTheme({
  palette: {
    primary: {
      main: '#A31F34', // Couleur rouge de MIT
    },
    secondary: {
      main: '#8A8B8C', // Couleur grise de MIT
    },
    button: {
      background: '#F5D7D9', // Couleur de fond des boutons
      text: '#A31F34', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/mit_logo.png', // Chemin du logo spécifique à MIT
  university: 'mit',
  facultyOptions: [
    'School of Architecture and Planning',
    'School of Engineering',
    'School of Humanities, Arts, and Social Sciences',
    'Sloan School of Management',
    'School of Science',
    'MIT Schwarzman College of Computing',
  ],
});

export default mitTheme;
*/



/*
import { createTheme } from '@mui/material/styles';

const mitTheme = createTheme({
  palette: {
    primary: {
      main: '#A31F34', // Couleur rouge de MIT
    },
    secondary: {
      main: '#8A8B8C', // Couleur grise de MIT
    },
    button: {
      background: '#F5D7D9', // Couleur de fond des boutons
      text: '#A31F34', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/mit_logo.png', // Chemin du logo spécifique à MIT
  university: 'mit',
});

export default mitTheme;
*/
