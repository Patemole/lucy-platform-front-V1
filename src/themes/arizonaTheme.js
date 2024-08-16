import { createTheme } from '@mui/material/styles';

const arizonaTheme = createTheme({
  palette: {
    primary: {
      main: '#CC0033', // Couleur rouge de Arizona
    },
    secondary: {
      main: '#003366', // Couleur bleue de Arizona
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#CC0033', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
  facultyOptions: [
    'College of Agriculture and Life Sciences',
    'College of Architecture, Planning, and Landscape Architecture',
    'College of Education',
    'College of Engineering',
    'College of Fine Arts',
    'James E. Rogers College of Law',
    'College of Medicine - Tucson',
    'College of Medicine - Phoenix',
    'College of Nursing',
    'College of Pharmacy',
    'College of Science',
    'Eller College of Management',
    'College of Social and Behavioral Sciences',
    'Mel and Enid Zuckerman College of Public Health',
  ],
});

export default arizonaTheme;



/*
import { createTheme } from '@mui/material/styles';

const arizonaTheme = createTheme({
  palette: {
    primary: {
      main: '#CC0033', // Couleur rouge de Arizona
    },
    secondary: {
      main: '#003366', // Couleur bleue de Arizona
    },
    button: {
      background: '#F8D7DA', // Couleur de fond des boutons
      text: '#CC0033', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/arizona_logo.png', // Chemin du logo spécifique à Arizona
  university: 'arizona',
});

export default arizonaTheme;
*/