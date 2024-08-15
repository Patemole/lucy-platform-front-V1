import { createTheme } from '@mui/material/styles';

const stanfordTheme = createTheme({
  palette: {
    primary: {
      main: '#8C1515', // Couleur rouge de Stanford
    },
    secondary: {
      main: '#175E54', // Couleur verte de Stanford
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#8C1515', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/stanford_logo.webp', // Chemin du logo spécifique à Stanford
  university: 'stanford',
  facultyOptions: [
    'School of Humanities and Sciences',
    'School of Engineering',
    'Graduate School of Business',
    'Stanford Law School',
    'School of Medicine',
    'Graduate School of Education',
    'School of Earth, Energy & Environmental Sciences',
  ],
});

export default stanfordTheme;


/*
import { createTheme } from '@mui/material/styles';

const stanfordTheme = createTheme({
  palette: {
    primary: {
      main: '#8C1515', // Couleur rouge de Stanford
    },
    secondary: {
      main: '#175E54', // Couleur verte de Stanford
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#8C1515', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/stanford_logo.webp', // Chemin du logo spécifique à Stanford
  university: 'stanford',
});

export default stanfordTheme;
*/