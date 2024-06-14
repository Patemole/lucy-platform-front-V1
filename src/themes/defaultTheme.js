import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#004080',
    },
    secondary: {
      main: '#808080',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: '#e64626',
        },
      },
    },
  },
  logo: '/logos/harvard_logo.png', // Chemin vers le logo de Harvard
  university: 'harvard', // Champ supplémentaire pour l'université
});


export default defaultTheme;
