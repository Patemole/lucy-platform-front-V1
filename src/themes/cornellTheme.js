import { createTheme } from '@mui/material/styles';

const cornellTheme = createTheme({
  palette: {
    primary: {
      main: '#B31B1B', // Couleur rouge de Cornell
    },
    secondary: {
      main: '#E87722', // Couleur orange de Cornell
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#B31B1B', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/cornell_logo.png', // Chemin du logo spécifique à Cornell
  university: 'cornell',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Art, and Planning',
    'College of Arts and Sciences',
    'Cornell SC Johnson College of Business',
    'College of Engineering',
    'College of Human Ecology',
    'School of Industrial and Labor Relations',
    'College of Veterinary Medicine',
    'Weill Cornell Medical College',
    'Cornell Law School',
  ],
});

export default cornellTheme;





/*
import { createTheme } from '@mui/material/styles';

const cornellTheme = createTheme({
  palette: {
    primary: {
      main: '#B31B1B', // Couleur rouge de Cornell
    },
    secondary: {
      main: '#E87722', // Couleur orange de Cornell
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#B31B1B', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/cornell_logo.png', // Chemin du logo spécifique à Cornell
  university: 'cornell',
});

export default cornellTheme;
*/
