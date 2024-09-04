import 'styled-components';
import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

// Extend the Material-UI interfaces for custom properties
declare module '@mui/material/styles' {
  // Extend Palette with custom properties
  interface Palette {
    sidebar: string;
    text_human_message_historic: string;
    button_sign_in: string;
    sign_up_link: string;
    send_button_message: string;
    hover_button: string;
    hover_button_with_button_background: string,
    button_text_sign_in: string;
    button: {
      background: string;
      text: string;
    };
  }

  // Extend PaletteOptions for custom properties
  interface PaletteOptions {
    sidebar?: string;
    text_human_message_historic?: string
    button_sign_in?: string
    hover_button?: string
    hover_button_with_button_background?: string
    sign_up_link?: string
    send_button_message?: string
    button_text_sign_in?: string
    button?: {
      background?: string;
      text?: string;
    };
  }

  // Extend Theme with custom properties like lightMode and darkMode
  interface Theme extends MuiTheme {
    lightMode: {
      palette: Palette;
      components: any;
      typography: any;
    };
    darkMode: {
      palette: Palette;
      components: any;
      typography: any;
    };
    logo: string;
    university: string;
    facultyOptions: string[];
  }

  // Extend ThemeOptions to include lightMode and darkMode
  interface ThemeOptions extends MuiThemeOptions {
    lightMode?: {
      palette?: PaletteOptions;
      components?: any;
      typography?: any;
    };
    darkMode?: {
      palette?: PaletteOptions;
      components?: any;
      typography?: any;
    };
    logo?: string;
    university?: string;
    facultyOptions?: string[];
  }
}

// Extend styled-components DefaultTheme to recognize Material-UI theme properties
declare module 'styled-components' {
  export interface DefaultTheme extends MuiTheme {}
}




/*
import 'styled-components';
import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

// Étendre les interfaces Material-UI
declare module '@mui/material/styles' {
  // Déclaration des propriétés personnalisées dans la Palette
  interface Palette {
    button: {
      background: string;
      text: string;
    };
  }

  interface PaletteOptions {
    button?: {
      background?: string;
      text?: string;
    };
  }

  // Étendre Theme avec les propriétés lightMode et darkMode
  interface Theme extends MuiTheme {
    lightMode: {
      palette: Palette;
      components: any; // Vous pouvez utiliser un type plus précis ici
      typography: any;
    };
    darkMode: {
      palette: Palette;
      components: any;
      typography: any;
    };
    logo: string;
    university: string;
    facultyOptions: string[];
  }

  // Étendre ThemeOptions pour inclure lightMode et darkMode
  interface ThemeOptions extends MuiThemeOptions {
    lightMode?: {
      palette?: PaletteOptions;
      components?: any; // Vous pouvez utiliser un type plus précis ici
      typography?: any;
    };
    darkMode?: {
      palette?: PaletteOptions;
      components?: any;
      typography?: any;
    };
    logo?: string;
    university?: string;
    facultyOptions?: string[];
  }
}

// Déclaration pour styled-components afin qu'il reconnaisse les types du thème
declare module 'styled-components' {
  export interface DefaultTheme extends MuiTheme {}
}
*/




/*

import 'styled-components';
import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    button: {
      background: string;
      text: string;
    };
  }

  interface PaletteOptions {
    button?: {
      background?: string;
      text?: string;
    };
  }

  interface Theme {
    lightMode: {
      palette: Palette;
      components: any;
      typography: any;
    };
    darkMode: {
      palette: Palette;
      components: any;
      typography: any;
    };
    logo: string;
    university: string;
    facultyOptions: string[];
  }

  interface ThemeOptions {
    lightMode?: {
      palette?: PaletteOptions;
      components?: any;
      typography?: any;
    };
    darkMode?: {
      palette?: PaletteOptions;
      components?: any;
      typography?: any;
    };
    logo?: string;
    university?: string;
    facultyOptions?: string[];
  }
}
*/



/*
// src/customTheme.d.ts
import 'styled-components';
import { Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    button: {
      background: string;
      text: string;
    };
  }
  interface PaletteOptions {
    button?: {
      background?: string;
      text?: string;
    };
  }
  interface Theme {
    logo: string;
  }
  interface ThemeOptions {
    logo?: string;
  }
}
*/



/*
// src/customTheme.d.ts
import 'styled-components';
import { Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    logo: string;
  }
  // Permet d'utiliser 'createTheme' sans problème
  interface ThemeOptions {
    logo?: string;
  }
}
*/