import { createTheme } from '@mui/material/styles';

const harvardTheme = createTheme({
  palette: {
    primary: {
      main: '#A41034', // Couleur rouge de Harvard
    },
    secondary: {
      main: '#FBBA00', // Couleur dorée de Harvard
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#A41034', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/harvard_logo.png', // Chemin du logo spécifique à Harvard
  university: 'harvard',
  facultyOptions: [
    'Faculty of Arts and Sciences',
    'Harvard Business School',
    'Harvard Law School',
    'Harvard Medical School',
  ],
});

export default harvardTheme;


/*
import { createTheme } from '@mui/material/styles';

const harvardTheme = createTheme({
  palette: {
    primary: {
      main: '#A51C30', // Couleur primaire de Harvard
    },
    secondary: {
      main: '#808080', // Couleur secondaire (gris)
    },
    text: {
      primary: '#100F32', // Couleur du texte par défaut
    },
    button: {
      background: '#66B2A3', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte dans les boutons
    }
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#100F32', // Couleur du texte par défaut pour les composants Typography
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#EC8F9C', // Couleur de fond du bouton
          color: '#A51C30', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#D87786', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#A51C30', // Couleur des contours pour les boutons outlined
          color: '#A51C30', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#F7E1E4', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },
  logo: '/logos/harvard_logo.png', // Chemin vers le logo de Harvard
  university: 'harvard', // Champ supplémentaire pour l'université
});

export default harvardTheme;
*/