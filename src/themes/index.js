import upennTheme from './upennTheme';
import harvardTheme from './harvardTheme';
import usydTheme from './usydTheme';
import defaultTheme from './defaultTheme';

const getTheme = (subdomain) => {
  switch (subdomain) {
    case 'upenn':
      return upennTheme;
    case 'harvard':
      return harvardTheme;
    case 'usyd':
      return usydTheme;
    default:
      return defaultTheme; // Thème par défaut si nécessaire
  }
};

export default getTheme;
