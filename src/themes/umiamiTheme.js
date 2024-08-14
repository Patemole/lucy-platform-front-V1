import { createTheme } from '@mui/material/styles';

const umiamiTheme = createTheme({
  palette: {
    primary: {
      main: '#005030', // Couleur verte de l'université de Miami
    },
    secondary: {
      main: '#F47321', // Couleur orange de l'université de Miami
    },
    button: {
      background: '#DCFCE5', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Police de caractère courante, ajustez selon vos besoins
  },
  logo: '/logos/umiami_logo.png', // Chemin du logo spécifique à Umiami
  university: 'miami', // Champ supplémentaire pour l'université
  facultyOptions: [
    'College of Arts and Sciences',
    'School of Business',
    'School of Engineering',
    'School of Nursing',
  ],
});

export default umiamiTheme;
