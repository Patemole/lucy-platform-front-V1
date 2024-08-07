import { createTheme } from '@mui/material/styles';

const arizonaTheme = createTheme({
  palette: {
    primary: {
      main: '#CC0033', // Couleur rouge de Arizona
    },
    secondary: {
      main: '#003366', // Couleur bleue de Arizona
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#CC0033', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
});

export default arizonaTheme;
