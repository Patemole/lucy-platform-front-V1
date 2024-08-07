import { createTheme } from '@mui/material/styles';

const uciTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
});

export default uciTheme;
