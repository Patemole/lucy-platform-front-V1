// TrendsClustering.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

// URL statique du graphique intégré
const graphURL_academic_advisor = "http://localhost:5001/static/academic_advisor/cluster_with_fake_yc_data.html";

const TrendsClustering = () => {
  return (
    <div style={{ padding: '20px', width: '100%', height: '100%' }}>
      {/* Titre */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginLeft: '0px',
        }}
      >
        Topics Clustering
      </Typography>

      {/* Conteneur pour le graphique intégré */}
      <Box
        sx={{
          height: '100%', // Adjust to occupy full available height
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {graphURL_academic_advisor ? (
          <iframe
            src={graphURL_academic_advisor}
            width="100%"
            height="100%"
            title="Trends Clustering Graph"
            style={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: '300px', // Optional minimum height to prevent shrinking too small
            }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Loading graph...
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default TrendsClustering;