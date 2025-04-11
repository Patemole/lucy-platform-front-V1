import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Les imports de AuthProvider et ChatProvider ne sont plus nécessaires
// import { AuthProvider } from './auth/context/AuthContext'; 
// import { ChatProvider } from './auth/context/ChatContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Le rendu simplifié sans les anciens Providers
root.render(
  <React.StrictMode> {/* Optionnel mais recommandé */}
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
