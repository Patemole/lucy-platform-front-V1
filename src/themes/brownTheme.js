import { createTheme } from '@mui/material/styles';

const brownTheme = createTheme({
  palette: {
    primary: {
      main: '#4E3629', // Couleur brune de Brown
    },
    secondary: {
      main: '#EE3B3B', // Couleur rouge de Brown
    },
    button: {
      background: '#F5E5E0', // Couleur de fond des boutons
      text: '#4E3629', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/brown_logo.png', // Chemin du logo spécifique à Brown
  university: 'brown',
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Engineering',
    'Alpert Medical School',
    'School of Public Health',
    'School of Professional Studies',
  ],
});

export default brownTheme;





/*
import { createTheme } from '@mui/material/styles';

const brownTheme = createTheme({
  palette: {
    primary: {
      main: '#4E3629', // Couleur brune de Brown
    },
    secondary: {
      main: '#EE3B3B', // Couleur rouge de Brown
    },
    button: {
      background: '#F5E5E0', // Couleur de fond des boutons
      text: '#4E3629', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/brown_logo.png', // Chemin du logo spécifique à Brown
  university: 'brown',
});

export default brownTheme;
*/
