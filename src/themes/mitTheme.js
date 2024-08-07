import { createTheme } from '@mui/material/styles';

const mitTheme = createTheme({
  palette: {
    primary: {
      main: '#A31F34', // Couleur rouge de MIT
    },
    secondary: {
      main: '#8A8B8C', // Couleur grise de MIT
    },
    button: {
      background: '#F5D7D9', // Couleur de fond des boutons
      text: '#A31F34', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/mit_logo.png', // Chemin du logo spécifique à MIT
  university: 'mit',
});

export default mitTheme;
