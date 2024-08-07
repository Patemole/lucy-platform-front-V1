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
