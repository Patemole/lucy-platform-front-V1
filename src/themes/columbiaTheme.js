import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const columbiaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066CC', // Bleu Columbia
    },
    sidebar: '#0066CC', // Couleur pour la barre latérale
    secondary: {
      main: '#FFFFFF', // Couleur blanche pour les accents
    },
    background: {
      default: '#FFFFFF', // Fond pour light mode
      paper: '#F4F4F4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#003366', // Texte en bleu foncé pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#0066CC',
    button_sign_in: '#0066CC',
    hover_button: '#004C99',
    hover_button_with_button_background: '#A7C7E7',
    button_text_sign_in: '#FFFFFF',
    sign_up_link: '#0066CC',
    button: {
      background: '#D9EAF8', // Couleur de fond des boutons en light mode
      text: '#003366', // Couleur du texte dans les boutons en light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/columbia_logo.png', // Chemin du logo spécifique à Columbia
  university: 'columbia',
  facultyOptions: [
    'Columbia College',
    'School of Engineering and Applied Science',
    'School of General Studies',
    'Graduate School of Arts and Sciences',
    'Columbia Business School',
    'Columbia Law School',
    'College of Dental Medicine',
    'Vagelos College of Physicians and Surgeons',
    'Mailman School of Public Health',
    'School of International and Public Affairs',
    'School of Journalism',
    'School of Social Work',
    'School of Professional Studies',
    'School of the Arts',
  ],
});

const columbiaDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0066CC', // Bleu Columbia
    },
    sidebar: '#FFFFFF', // Barre latérale blanche en mode sombre
    secondary: {
      main: '#003366', // Couleur bleu foncé pour les accents en mode sombre
    },
    background: {
      default: '#1C1C1C', // Fond pour dark mode
      paper: '#2E2E2E', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#FFFFFF', // Texte blanc pour dark mode
    },
    text_human_message_historic: '#0066CC',
    send_button_message: '#0066CC',
    button_sign_in: '#D9EAF8',
    hover_button: '#89BEE8',
    hover_button_with_button_background: '#A7C7E7',
    button_text_sign_in: '#003366',
    sign_up_link: '#FFFFFF',
    button: {
      background: '#D9EAF8', // Couleur de fond des boutons en dark mode
      text: '#003366', // Couleur du texte dans les boutons en dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)',
          },
        },
      },
    },
  },
  logo: '/logos/columbia_logo.png', // Chemin du logo spécifique à Columbia
  university: 'columbia',
  facultyOptions: [
    'Columbia College',
    'School of Engineering and Applied Science',
    'School of General Studies',
    'Graduate School of Arts and Sciences',
    'Columbia Business School',
    'Columbia Law School',
    'College of Dental Medicine',
    'Vagelos College of Physicians and Surgeons',
    'Mailman School of Public Health',
    'School of International and Public Affairs',
    'School of Journalism',
    'School of Social Work',
    'School of Professional Studies',
    'School of the Arts',
  ],
});

// Export both themes as named exports
export { columbiaTheme, columbiaDarkTheme };