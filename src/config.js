/*
// src/config.js
const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
  };

const config = {
    node_env: process.env.REACT_APP_NODE_ENV || 'development',
    server_host: process.env.REACT_APP_SERVER_HOST || 'http://localhost',
    server_port: process.env.REACT_APP_SERVER_PORT || 8000,
    subdomain: getSubdomain()
};

export default config;
*/



// src/config.js
// Récupère le sous-domaine de l'URL actuelle
/*
const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
};
*/


/*
// Détermine l'URL du serveur en fonction de l'environnement
const getServerUrl = () => {
    if (process.env.REACT_APP_NODE_ENV !== 'production') {
        return 'http://localhost:5001'; // URL pour le développement
    } else {
        return 'https://3anuaekhsu.eu-west-3.awsapprunner.com'; // URL pour la production
        
        
    }
};
*/

//NOUVELLE VERSION QUI RÉCUPÈRE LE NOM DE L'ÉCOLE QUE L'ON SOIT EN ENVIRONNEMENT DE PROD OU PAS (DEV.UPENN... ETC)
// Récupère le sous-domaine spécifique de l'URL actuelle
const getSubdomain = () => {
    const hostname = window.location.hostname; // ex: dev.upenn.my-lucy.com ou upenn.my-lucy.com
    const subdomainParts = hostname.split('.');

    // Si le hostname contient au moins trois parties, retourne la deuxième partie
    // Si le hostname contient exactement deux parties, retourne la première partie
    if (subdomainParts.length > 2) {
        return subdomainParts.slice(0, -2).join('.').split('.').pop();
    } else if (subdomainParts.length === 2) {
        return subdomainParts[0];
    } else {
        throw new Error('Invalid subdomain structure');
    }
};


// Détermine l'URL du serveur en fonction de l'environnement
const getServerUrl = () => {
    const env = process.env.REACT_APP_NODE_ENV;

    if (env === 'development') {
        return 'http://localhost:5001'; // URL pour le développement

    } else if (env === 'preprod') {
        return 'https://3anuaekhsu.eu-west-3.awsapprunner.com'; // URL pour la pré-production

    } else if (env === 'production') {
        return 'https://prod-backend.example.com'; // URL pour la production (A MODIFIER)

    } else {
        throw new Error(`Unknown environment: ${env}`);
    }
};


// Configuration de l'application
const config = {
    node_env: process.env.REACT_APP_NODE_ENV || 'development',
    server_url: getServerUrl(),
    subdomain: getSubdomain()
};

export default config;

