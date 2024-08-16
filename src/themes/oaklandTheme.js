import { createTheme } from '@mui/material/styles';

const oaklandTheme = createTheme({
  palette: {
    primary: {
      main: '#004B8D', // Couleur bleue de Oakland
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de Oakland
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#004B8D', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/oakland_logo.webp', // Chemin du logo spécifique à Oakland
  university: 'oakland',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business Administration',
    'School of Education and Human Services',
    'School of Engineering and Computer Science',
    'School of Health Sciences',
    'School of Nursing',
    'Oakland University William Beaumont School of Medicine',
  ],
});

export default oaklandTheme;



/*
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
*/