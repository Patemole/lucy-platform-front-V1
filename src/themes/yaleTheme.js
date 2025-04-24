import { createTheme } from '@mui/material/styles';

// utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const yaleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00356B', // yale blue
    },
    secondary: {
      main: '#286DC0', // high-intensity yale blue
    },
    background: {
      default: '#ffffff', // fond pour light mode
      paper: '#f4f4f4', // fond pour les éléments "paper" dans light mode
    },
    text: {
      primary: '#000000', // texte en noir pour light mode
    },
    sidebar: '#00356B',
    text_human_message_historic: '#00356B',
    send_button_message: '#00356B',
    button_sign_in: '#00356B', // couleur de fond des boutons "sign in" en light mode
    button_text_sign_in: '#ffffff', // couleur du texte dans les boutons "sign in" en light mode
    sign_up_link: '#00356B', // couleur du lien "sign up" en light mode
    button: {
      background: '#D0E2FF', // couleur de fond des boutons en light mode
      text: '#00356B', // couleur du texte dans les boutons en light mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // désactivation des effets ripple pour éviter des erreurs d'interaction
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
  logo: '/logos/yale_logo.png', // chemin du logo spécifique à yale
  university: 'yale',
  facultyOptions: [
    'Yale College',
    'Yale School of Management',
    'Yale Law School',
    'Yale School of Medicine',
  ],
});

const yaleDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00356B', // yale blue
    },
    secondary: {
      main: '#286DC0', // high-intensity yale blue
    },
    background: {
      default: '#2e2e2e', // fond pour dark mode
      paper: '#1c1c1c', // fond pour les éléments "paper" dans dark mode
    },
    text: {
      primary: '#ffffff', // texte en blanc pour dark mode
    },
    sidebar: '#ffffff',
    text_human_message_historic: '#00356B', // texte pour historique des messages en dark mode
    send_button_message: '#D0E2FF',
    button_sign_in: '#D0E2FF', // couleur de fond des boutons "sign in" en dark mode
    button_text_sign_in: '#00356B', // couleur du texte dans les boutons "sign in" en dark mode
    sign_up_link: '#ffffff', // couleur du lien "sign up" en dark mode
    button: {
      background: '#D0E2FF', // couleur de fond des boutons en dark mode
      text: '#00356B', // couleur du texte dans les boutons en dark mode
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    pxToRem,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // désactivation des effets ripple pour éviter des erreurs d'interaction
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
  logo: '/logos/yale_logo.png', // chemin du logo spécifique à yale
  university: 'yale',
  facultyOptions: [
    'Yale College',
    'Yale School of Management',
    'Yale Law School',
    'Yale School of Medicine',
  ],
});

export { yaleTheme, yaleDarkTheme };
