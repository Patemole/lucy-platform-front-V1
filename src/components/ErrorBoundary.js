// src/components/ErrorBoundary.js

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI de secours
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Tu peux aussi enregistrer l'erreur dans un service de log ici
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Typography variant="h4" color="error">
            Oups! Quelque chose s'est mal passé.
          </Typography>
          <Typography variant="body1">
            Veuillez rafraîchir la page ou réessayer plus tard.
          </Typography>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;