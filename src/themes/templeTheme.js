import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

// Thème clair pour Temple
const templeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A50A2D', // Couleur rouge de Temple
    },
    secondary: {
      main: '#F5A623', // Couleur orange de Temple
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
      text: '#A50A2D', // Couleur du texte dans les boutons en light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
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
  logo: '/logos/temple_logo.png', // Chemin du logo spécifique à Temple
  university: 'temple',
  facultyOptions: [
    'College of Liberal Arts',
    'Temple University Beasley School of Law',
    'College of Education and Human Development',
    'College of Public Health',
    'Fox School of Business',
    'Klein College of Media and Communication',
    'College of Science and Technology',
    'School of Theater, Film and Media Arts',
  ],
});

// Thème sombre pour Temple
const templeDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A50A2D', // Couleur rouge de Temple
    },
    secondary: {
      main: '#F5A623', // Couleur orange de Temple
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
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/temple_logo.png', // Chemin du logo spécifique à Temple
  university: 'temple',
  facultyOptions: [
    'College of Liberal Arts',
    'Temple University Beasley School of Law',
    'College of Education and Human Development',
    'College of Public Health',
    'Fox School of Business',
    'Klein College of Media and Communication',
    'College of Science and Technology',
    'School of Theater, Film and Media Arts',
  ],
});

export { templeTheme, templeDarkTheme };