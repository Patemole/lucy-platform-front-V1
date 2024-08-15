import { createTheme } from '@mui/material/styles';

const uciTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
  facultyOptions: [
    'Claire Trevor School of the Arts',
    'School of Biological Sciences',
    'The Paul Merage School of Business',
    'School of Education',
    'Henry Samueli School of Engineering',
    'School of Humanities',
    'Donald Bren School of Information and Computer Sciences',
    'School of Law',
    'School of Medicine',
    'Sue & Bill Gross School of Nursing',
    'School of Physical Sciences',
    'School of Social Ecology',
    'School of Social Sciences',
  ],
});

export default uciTheme;




/*
import { createTheme } from '@mui/material/styles';

const uciTheme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Couleur bleue de UCI
    },
    secondary: {
      main: '#FFD100', // Couleur jaune de UCI
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#003DA5', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/uci_logo.png', // Chemin du logo spécifique à UCI
  university: 'uci',
});

export default uciTheme;
*/
