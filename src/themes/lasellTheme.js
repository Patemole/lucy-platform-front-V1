import { createTheme } from '@mui/material/styles';

const lasellTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de Lasell
    },
    secondary: {
      main: '#0077C8', // Couleur bleue secondaire de Lasell
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/lasell_logo.png', // Chemin du logo spécifique à Lasell
  university: 'lasell',
});

export default lasellTheme;
