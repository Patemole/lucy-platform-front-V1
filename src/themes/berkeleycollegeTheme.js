import { createTheme } from '@mui/material/styles';

const berkeleycollegeTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley College
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley College
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeleycollege_logo.jpg', // Chemin du logo spécifique à Berkeley College
  university: 'berkeleycollege',
  facultyOptions: [
    'School of Business',
    'School of Professional Studies',
    'School of Health Studies',
    'School of Liberal Arts',
    'School of Legal Studies',
  ],
});

export default berkeleycollegeTheme;



/*
import { createTheme } from '@mui/material/styles';

const berkeleycollegeTheme = createTheme({
  palette: {
    primary: {
      main: '#003262', // Couleur bleue de Berkeley College
    },
    secondary: {
      main: '#FDB515', // Couleur dorée de Berkeley College
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003262', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/berkeleycollege_logo.jpg', // Chemin du logo spécifique à Berkeley College
  university: 'berkeleycollege',
});

export default berkeleycollegeTheme;
*/