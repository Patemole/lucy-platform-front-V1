import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#011F5B', // Couleur primaire de UPenn
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
          backgroundColor: '#CDE4FE ', // Couleur de fond du bouton   Ancienne couleur#A3C1E8
          color: '#011F5B', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#92B1D6', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#011F5B', // Couleur des contours pour les boutons outlined
          color: '#011F5B', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#E5EBF3', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },


  logo: '/logos/Columbia_University_logo.png', // Chemin vers le logo de Harvard
  university: 'columbia', // Champ supplémentaire pour l'université
});


export default defaultTheme;
