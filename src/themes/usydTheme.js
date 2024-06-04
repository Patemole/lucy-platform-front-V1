
import { createTheme } from '@mui/material/styles';

const usydTheme = createTheme({
  palette: {
    primary: {
      main: '#E64626',
    },
    secondary: {
      main: '#808080',
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
          backgroundColor: '#FFD4CB', // Couleur de fond du bouton
          color: '#E64626', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#FFC1B3', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#E64626', // Couleur des contours pour les boutons outlined
          color: '#E64626', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#FFF0EC', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },
  logo: '/logos/usyd_logo.png', // Chemin vers le logo de USyd
  university: 'usyd', // Champ supplémentaire pour l'université
});

export default usydTheme;
