import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const upennTheme = createTheme({
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
      primary: '#000000', // Texte en noir pour light mode
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
  logo: '/logos/upenn_logo.png', // Chemin du logo spécifique à Upenn
  university: 'upenn',
  facultyOptions: [
    'College of Arts and Sciences',
    'Wharton School',
    'School of Engineering and Applied Science',
    'School of Nursing',
  ],
});


// Export both themes as named exports
export { upennTheme, upennDarkTheme };





/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem
const pxToRem = (size) => `${size / 16}rem`;

const upennTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#011F5B', // Couleur bleue de Upenn
      },
      secondary: {
        main: '#990000', // Couleur rouge de Upenn
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Couleur de fond des boutons en light mode
        text: '#011F5B', // Couleur du texte dans les boutons en light mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  darkMode: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#011F5B', // Couleur bleue de Upenn
      },
      secondary: {
        main: '#990000', // Couleur rouge de Upenn
      },
      background: {
        default: '#2e2e2e', // Fond pour dark mode
        paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#ffffff', // Texte en blanc pour dark mode
      },
      button: {
        background: '#455a64', // Couleur de fond des boutons en dark mode
        text: '#ffffff', // Couleur du texte dans les boutons en dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  // Déclaration des éléments communs pour éviter l'erreur
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true, // Désactivation des effets ripple pour éviter des erreurs d'interaction
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Définition des états comme `focus` et `active` pour éviter les erreurs
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
  ],
});

export default upennTheme;
*/


/*
import { createTheme } from '@mui/material/styles';

// Utilitaire pour pxToRem, car Material-UI utilise souvent cette méthode
const pxToRem = (size) => `${size / 16}rem`;

const upennTheme = createTheme({
  lightMode: {
    palette: {
      mode: 'light',
      primary: {
        main: '#011F5B', // Couleur bleue de Upenn
      },
      secondary: {
        main: '#990000', // Couleur rouge de Upenn
      },
      background: {
        default: '#ffffff', // Fond pour light mode
        paper: '#f4f4f4', // Fond pour les éléments "paper" dans light mode
      },
      text: {
        primary: '#000000', // Texte en noir pour light mode
      },
      button: {
        background: '#D6EAF8', // Couleur de fond des boutons en light mode
        text: '#011F5B', // Couleur du texte dans les boutons en light mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  darkMode: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#011F5B', // Couleur bleue de Upenn
      },
      secondary: {
        main: '#990000', // Couleur rouge de Upenn
      },
      background: {
        default: '#2e2e2e', // Fond pour dark mode
        paper: '#1c1c1c', // Fond pour les éléments "paper" dans dark mode
      },
      text: {
        primary: '#ffffff', // Texte en blanc pour dark mode
      },
      button: {
        background: '#455a64', // Couleur de fond des boutons en dark mode
        text: '#ffffff', // Couleur du texte dans les boutons en dark mode
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      pxToRem,
    },
  },
  logo: '/logos/upenn_logo.png', // Chemin du logo spécifique à Upenn
  university: 'upenn',
  facultyOptions: [
    'College of Arts and Sciences',
    'Wharton School',
    'School of Engineering and Applied Science',
    'School of Nursing',
  ],
});

export default upennTheme;
*/







/*
import { createTheme } from '@mui/material/styles';

const upennTheme = createTheme({
  palette: {
    primary: {
      main: '#011F5B', // Couleur bleue de Upenn
    },
    secondary: {
      main: '#990000', // Couleur rouge de Upenn
    },
    button: {
      background: '#D6EAF8', // Couleur de fond des boutons
      text: '#011F5B', // Couleur du texte dans les boutons
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  logo: '/logos/upenn_logo.png', // Chemin du logo spécifique à Upenn
  university: 'upenn',
  facultyOptions: [
    'College of Arts and Sciences',
    'Wharton School',
    'School of Engineering and Applied Science',
    'School of Nursing',
  ],
});

export default upennTheme;
*/



/*
import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#011F5B', // Couleur primaire de UPenn
    },
    secondary: {
      main: '#808080', // Couleur secondaire (gris)
    },
    text: {
      primary: '#100F32', // Couleur du texte par défaut
    },
    button: {
      background: '#66B2A3', // Couleur de fond des boutons
      text: '#005030', // Couleur du texte dans les boutons
    }
  },


  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#100F32', // Couleur du texte par défaut pour les composants Typography
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#CDE4FE ', // Couleur de fond du bouton   Ancienne couleur#A3C1E8
          color: '#011F5B', // Couleur du texte dans le bouton
          '&:hover': {
            backgroundColor: '#92B1D6', // Couleur de fond du bouton lors du survol
          },
        },
        outlined: {
          borderColor: '#011F5B', // Couleur des contours pour les boutons outlined
          color: '#011F5B', // Couleur du texte pour les boutons outlined
          backgroundColor: '#FFFFFF', // Couleur de fond des boutons outlined
          '&:hover': {
            backgroundColor: '#E5EBF3', // Couleur de fond des boutons outlined lors du survol
          },
        },
      },
    },
  },

  
  logo: '/logos/upenn_logo.png', // Chemin vers le logo de UPenn
  university: 'upenn', // Champ supplémentaire pour l'université
});

export default customTheme;
*/
