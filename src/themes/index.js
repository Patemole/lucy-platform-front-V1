import upennTheme from './upennTheme';
import harvardTheme from './harvardTheme';
import usydTheme from './usydTheme';
import defaultTheme from './defaultTheme';
import columbiaTheme from './columbiaTheme';
import mitTheme from './mitTheme';
import lasellTheme from './lasellTheme';
import oacklandTheme from './oacklandTheme';
import arizonaTheme from './arizonaTheme';
import uciTheme from './uciTheme';
import ucdavisTheme from './ucdavisTheme';
import cornellTheme from './cornellTheme';
import berkeleycollegeTheme from './berkeleycollegeTheme';
import brownTheme from './brownTheme';
import stanfordTheme from './stanfordTheme';
import berkeleyTheme from './berkeleyTheme';
import umiamiTheme from './umiamiTheme';

// Fonction pour obtenir le thème en fonction du sous-domaine
const getTheme = (subdomain) => {
  switch (subdomain) {
    case 'upenn':
      return upennTheme;
    case 'harvard':
      return harvardTheme;
    case 'usyd':
      return usydTheme;
    case 'columbia':
      return columbiaTheme;
    case 'umiami':
      return umiamiTheme;
    case 'mit':
      return mitTheme;
    case 'lasell':
      return lasellTheme;
    case 'oackland':
      return oacklandTheme;
    case 'arizona':
      return arizonaTheme;
    case 'uci':
      return uciTheme;
    case 'ucdavis':
      return ucdavisTheme;
    case 'cornell':
      return cornellTheme;
    case 'berkeleycollege':
      return berkeleycollegeTheme;
    case 'brown':
      return brownTheme;
    case 'stanford':
      return stanfordTheme;
    case 'berkeley':
      return berkeleyTheme;
    case 'miami':
      return umiamiTheme;
    default:
      return defaultTheme; // Thème par défaut si nécessaire
  }
};

export default getTheme;




/*
import upennTheme from './upennTheme';
import harvardTheme from './harvardTheme';
import usydTheme from './usydTheme';
import defaultTheme from './defaultTheme';
import columbiaTheme from './defaultTheme';

const getTheme = (subdomain) => {
  switch (subdomain) {
    case 'upenn':
      return upennTheme;
    case 'harvard':
      return harvardTheme;
    case 'usyd':
      return usydTheme;
    case 'columbia':
      return columbiaTheme;
    default:
      return defaultTheme; // Thème par défaut si nécessaire
  }
};

export default getTheme;
*/
