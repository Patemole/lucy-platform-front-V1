
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

