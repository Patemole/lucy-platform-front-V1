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
