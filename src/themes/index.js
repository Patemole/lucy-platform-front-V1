import {upennTheme, upennDarkTheme } from './upennTheme';
import {harvardTheme, harvardDarkTheme } from './harvardTheme';
import {usydTheme, usydDarkTheme } from './usydTheme';
import {defaultTheme, defaultDarkTheme } from './defaultTheme';
import {columbiaTheme, columbiaDarkTheme } from './columbiaTheme';
import {mitTheme,  mitDarkTheme } from './mitTheme';
import {lasellTheme,  lasellDarkTheme } from './lasellTheme';
import {oaklandTheme,  oaklandDarkTheme } from './oaklandTheme';
import {arizonaTheme,  arizonaDarkTheme } from './arizonaTheme';
import {uciTheme,  uciDarkTheme } from './uciTheme';
import {ucdavisTheme,  ucdavisDarkTheme } from './ucdavisTheme';
import {cornellTheme,  cornellDarkTheme } from './cornellTheme';
import {berkeleycollegeTheme,  berkeleycollegeDarkTheme } from './berkeleycollegeTheme';
import {brownTheme,  brownDarkTheme } from './brownTheme';
import {stanfordTheme,  stanfordDarkTheme } from './stanfordTheme';
import {berkeleyTheme,  berkeleyDarkTheme } from './berkeleyTheme';
import {purdueTheme,  purdueDarkTheme } from './purdueTheme';
import {umiamiTheme,  umiamiDarkTheme } from './umiamiTheme';
import {lehighTheme,  lehighDarkTheme } from './lehighTheme';
import {cwruTheme,  cwruDarkTheme } from './cwruTheme';
import {uscTheme,  uscDarkTheme } from './uscTheme';
import {holyFamilyTheme,  holyFamilyDarkTheme } from './holyFamilyTheme';
import {drexelTheme,  drexelDarkTheme } from './drexelTheme';
import {templeTheme,  templeDarkTheme } from './templeTheme';
import {pennStateTheme,  pennStateDarkTheme } from './pennStateTheme';
import {ccpTheme,  ccpDarkTheme } from './ccpTheme';
import {adminTheme,  adminDarkTheme } from './adminTheme';

// Function to get the theme based on subdomain and selected mode
const getTheme = (subdomain, themeMode) => {
  const mode = localStorage.getItem('themeMode') || 'light'; // Default to light mode

  switch (subdomain) {
    case 'upenn':
      return themeMode === 'dark' ? upennDarkTheme : upennTheme;

    case 'harvard':
      return themeMode === 'dark' ? harvardDarkTheme : harvardTheme;

    case 'uci':
      return themeMode === 'dark' ? uciDarkTheme : uciTheme;

    case 'miami':
      return themeMode === 'dark' ? umiamiDarkTheme : umiamiTheme;

    case 'drexel':
      return themeMode === 'dark' ? drexelDarkTheme : drexelTheme;

    case 'temple':
      return themeMode == 'dark' ? templeDarkTheme : templeTheme;

    case 'psu':
      return themeMode == 'dark' ? pennStateDarkTheme : pennStateTheme;

    case 'ccp':
      return themeMode == 'dark' ? ccpDarkTheme : ccpTheme;

    case 'holyfamily':
      return themeMode == 'dark' ? holyFamilyDarkTheme : holyFamilyTheme;

    case 'cwru':
      return themeMode == 'dark' ? cwruDarkTheme : cwruTheme;

    case 'lehigh':
        return themeMode == 'dark' ? lehighDarkTheme : lehighTheme;

    case 'purdue':
        return themeMode == 'dark' ? purdueDarkTheme : purdueTheme;

    case 'usc':
          return themeMode == 'dark' ? uscDarkTheme : uscTheme;

    case 'admin':
      return themeMode === 'dark' ? adminDarkTheme : adminTheme;

    case 'trust':
      return themeMode === 'dark' ? adminDarkTheme : adminTheme;

    default:
      return themeMode === 'dark' ? defaultDarkTheme : defaultTheme;
      
    /* 
    case 'harvard':
      return mode === 'dark' ? harvardDarkTheme : harvardTheme;
    case 'usyd':
      return mode === 'dark' ? usydDarkTheme : usydTheme;
    case 'columbia':
      return mode === 'dark' ? columbiaDarkTheme : columbiaTheme;
    case 'umiami':
      return mode === 'dark' ? umiamiDarkTheme : umiamiTheme;
    case 'mit':
      return mode === 'dark' ? mitDarkTheme : mitTheme;
    case 'lasell':
      return mode === 'dark' ? lasellDarkTheme : lasellTheme;
    case 'oakland':
      return mode === 'dark' ? oaklandDarkTheme : oaklandTheme;
    case 'arizona':
      return mode === 'dark' ? arizonaDarkTheme : arizonaTheme;
    case 'uci':
      return mode === 'dark' ? uciDarkTheme : uciTheme;
    case 'ucdavis':
      return mode === 'dark' ? ucdavisDarkTheme : ucdavisTheme;
    case 'cornell':
      return mode === 'dark' ? cornellDarkTheme : cornellTheme;
    case 'berkeleycollege':
      return mode === 'dark' ? berkeleycollegeDarkTheme : berkeleycollegeTheme;
    case 'brown':
      return mode === 'dark' ? brownDarkTheme : brownTheme;
    case 'stanford':
      return mode === 'dark' ? stanfordDarkTheme : stanfordTheme;
    case 'berkeley':
      return mode === 'dark' ? berkeleyDarkTheme : berkeleyTheme;
    case 'admin':
      return mode === 'dark' ? adminDarkTheme : adminTheme;
    default:
      return mode === 'dark' ? defaultDarkTheme : defaultTheme; // Default theme with dark mode fallback
      */
  }
};

export const toggleThemeMode = () => {
  const currentMode = localStorage.getItem('themeMode') || 'light';
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  localStorage.setItem('themeMode', newMode);
  window.location.reload(); // Reload to apply the new theme across the app
};

export default getTheme;






/* CODE D'ORIGINE
import upennTheme from './upennTheme';
import harvardTheme from './harvardTheme';
import usydTheme from './usydTheme';
import defaultTheme from './defaultTheme';
import columbiaTheme from './columbiaTheme';
import mitTheme from './mitTheme';
import lasellTheme from './lasellTheme';
import oaklandTheme from './oaklandTheme';
import arizonaTheme from './arizonaTheme';
import uciTheme from './uciTheme';
import ucdavisTheme from './ucdavisTheme';
import cornellTheme from './cornellTheme';
import berkeleycollegeTheme from './berkeleycollegeTheme';
import brownTheme from './brownTheme';
import stanfordTheme from './stanfordTheme';
import berkeleyTheme from './berkeleyTheme';
import umiamiTheme from './umiamiTheme';
import adminTheme from './adminTheme';

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
    case 'oakland':
      return oaklandTheme;
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
    case 'admin':
      return adminTheme;
    default:
      return defaultTheme; // Thème par défaut si nécessaire
  }
};

export default getTheme;
*/



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
