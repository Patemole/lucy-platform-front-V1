import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';

const DegreeProgressComponent: React.FC = () => {
  // Dynamic state for the degree progress values
  const [degreeValues] = useState({
    workRequired: 2.9,
    overallQuality: 3.8,
    overallDifficulty: 2.8,
    cuLeft: 5, // Assuming 5 CU is displayed
  });

  const calculateProgress = (key: string, value: number) => {
    // For CU left, we don't calculate progress, we just display it
    if (key === 'cuLeft') {
      return (value / 5) * 100;
    }
    // For other fields, progress out of 5
    return (value / 5) * 100;
  };

  const getLabel = (key: string) => {
    switch (key) {
      case 'workRequired':
        return 'Work required';
      case 'overallQuality':
        return 'Overall quality';
      case 'overallDifficulty':
        return 'Overall difficulty';
      case 'cuLeft':
        return 'CU';
      default:
        return '';
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
      {/* Four CircularProgress elements */}
      {Object.entries(degreeValues).map(([key, value]) => (
        <Box
          key={key}
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginRight: key !== 'cuLeft' ? '32px' : 0, // Add space between the items except for the last one
          }}
        >
          {/* Circular progress for each value */}
          <Box position="relative" display="inline-flex" marginRight={2}>
            {/* Circular progress - Background */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={60}
              thickness={5}
              sx={{ color: '#E8F4FB', position: 'absolute' }} // Light arc in the background
            />
            {/* Circular progress - Foreground */}
            <CircularProgress
              variant="determinate"
              value={calculateProgress(key, value)}
              size={60}
              thickness={5}
              sx={{ color: '#3155CC', zIndex: 2 }} // Foreground arc
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" color="#011F5B" fontWeight="bold">
                {value} {/* Display the value inside the circle */}
              </Typography>
            </Box>
          </Box>
          {/* Text next to the circular progress */}
          <Typography sx={{ color: '#011F5B', fontWeight: '500', fontSize: '0.875rem' }}>
            {getLabel(key)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default DegreeProgressComponent;
