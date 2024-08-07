import { createTheme } from '@mui/material/styles';

const berkeleyTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeley_logo.png', // Chemin du logo spécifique à Berkeley
  university: 'berkeley',
});

export default berkeleyTheme;
