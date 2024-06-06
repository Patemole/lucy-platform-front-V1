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
const getSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomain;
};

// Détermine l'URL du serveur en fonction de l'environnement
const getServerUrl = () => {
    if (process.env.REACT_APP_NODE_ENV !== 'production') {
        return 'http://localhost:5001'; // URL pour le développement
    } else {
        return 'https://lucy-platform-back-ed6ea84d8a6a.herokuapp.com'; // URL pour la production
    }
};

// Configuration de l'application
const config = {
    node_env: process.env.REACT_APP_NODE_ENV || 'development',
    server_url: getServerUrl(),
    subdomain: getSubdomain()
};

export default config;

