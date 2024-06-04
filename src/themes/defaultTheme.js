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
});

export default defaultTheme;
