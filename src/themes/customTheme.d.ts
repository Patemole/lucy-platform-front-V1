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