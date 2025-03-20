import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const charteroakTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#011F5B', // Couleur bleue de Upenn
    },
    sidebar: '#011F5B',
    secondary: {
      main: '#990000', // Couleur rouge de Upenn
    },
    background: {
      default: '#ffffff', // Fond pour light mode
      paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#011F5B', // Texte en noir pour light mode
    },
    text_human_message_historic: '#000000',
    send_button_message: '#011F5B',
    button_sign_in: '#011F5B',
    hover_button: '#022A7C',
    hover_button_with_button_background: '#AED6F1',
    button_text_sign_in: '#ffffff',
    sign_up_link: '#011F5B',
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons en light mode
      text: '#011F5B', // Couleur du texte dans les boutons en light mode
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
  logo: '/logos/charteroak_logo.png', // Chemin du logo spécifique à Upenn
  university: 'charteroak',
  facultyOptions: [
    'Business Administration',
    'Child Studies',
    'Criminal Justice',
    'Cyber Security',
    'Early Childhood Education',
    'Health Care Administration',
    'Health Information Management',
    'Human Resources Management',
    'Nursing',
    'Organizational Leadership',
    'Psychology',
    'Public Safety Administration',
    'Social Work',
    'Sociology',
    'Software Development',
    'General Studies',
    'Health Informatics'





  ],
});



const charteroakDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#011F5B', // Couleur bleue de Upenn
    },
    sidebar: '#ffffff',
    secondary: {
      main: '#990000', // Couleur rouge de Upenn
    },
    background: {
      default: '#2e2e2e', // Fond pour dark mode
      paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // Texte en blanc pour dark mode
      //primary: '#011F5B',
    },
    text_human_message_historic: '#011F5B',
    send_button_message: '#011F5B',
    button_sign_in: '#D6EAF8',
    hover_button: '#A9D1F2',
    hover_button_with_button_background: '#89BEE8',
    button_text_sign_in: '#011F5B',
    sign_up_link: '#ffffff',
    button: {
      //background: '#455a64', // Couleur de fond des boutons en dark mode
      background: '#D6EAF8',
      //text: '#ffffff', // Couleur du texte dans les boutons en dark mode
      text: '#011F5B',
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
  logo: '/logos/charteroak_logo.png', // Chemin du logo spécifique à Upenn
  university: 'charteroak',
  facultyOptions: [
    'Business Administration',
    'Child Studies',
    'Criminal Justice',
    'Cyber Security',
    'Early Childhood Education',
    'Health Care Administration',
    'Health Information Management',
    'Human Resources Management',
    'Nursing',
    'Organizational Leadership',
    'Psychology',
    'Public Safety Administration',
    'Social Work',
    'Sociology',
    'Software Development',
    'General Studies',
    'Health Informatics'
  ],
});


// Export both themes as named exports
export { charteroakTheme, charteroakDarkTheme };