import { createTheme } from '@mui/material/styles';

const ucdavisTheme = createTheme({
  palette: {
    primary: {
      main: '#002855', // Couleur bleue de UCDavis
    },
    secondary: {
      main: '#B9975B', // Couleur dorée de UCDavis
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#002855', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/ucdavis_logo.png', // Chemin du logo spécifique à UCDavis
  university: 'ucdavis',
  facultyOptions: [
    'College of Agricultural and Environmental Sciences',
    'College of Biological Sciences',
    'College of Engineering',
    'College of Letters and Science',
    'Graduate School of Management',
    'School of Education',
    'School of Law',
    'School of Medicine',
    'School of Nursing',
    'School of Veterinary Medicine',
  ],
});

export default ucdavisTheme;



/*
import { createTheme } from '@mui/material/styles';

const ucdavisTheme = createTheme({
  palette: {
    primary: {
      main: '#002855', // Couleur bleue de UCDavis
    },
    secondary: {
      main: '#B9975B', // Couleur dorée de UCDavis
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#002855', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/ucdavis_logo.png', // Chemin du logo spécifique à UCDavis
  university: 'ucdavis',
});

export default ucdavisTheme;
*/
