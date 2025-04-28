import { createTheme } from '@mui/material/styles';

// utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

// kedge business school — palette issuée du brand book 2023
const primaryKedge = '#cf0d61'; // magenta signature
const secondaryKedge = '#1d2557'; // navy accent
const supportivePink = '#f39daa'; // clair
const supportiveBlue = '#66b2e4'; // bleu clair

const kedgeTheme = createTheme({
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
  logo: '/logos/kedge_logo.png',
  university: 'kedge',
  facultyOptions: [
    'Programme Grande École',
    'International MBA',
    'Kedge Wine School',
    'Kedge Arts School',
  ],
});

const kedgeDarkTheme = createTheme({
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
      logo: '/logos/upenn_logo.png', // Chemin du logo spécifique à Upenn
      university: 'upenn',
      facultyOptions: [
        'College of Arts and Sciences',
        'Wharton School',
        'School of Engineering and Applied Science',
        'School of Nursing',
        'Annenberg School for Communication',
        'School of Dental Medicine',
        'Graduate School of Education',
        'Law School (Penn Carey Law)',
        'Perelman School of Medicine',
        'School of Social Policy & Practice',
        'Stuart Weitzman School of Design',
        'School of Veterinary Medicine',
    
    
    
    
    
      ],
    });
    
    
    
    const upennDarkTheme = createTheme({
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
  logo: '/logos/kedge_logo.png',
  university: 'kedge',
  facultyOptions: [
    'Programme Grande École',
    'International MBA',
    'Kedge Wine School',
    'Kedge Arts School',
  ],
});

export { kedgeTheme, kedgeDarkTheme };
