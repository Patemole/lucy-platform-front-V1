import React, { useState } from 'react';
import { Box, Typography, Checkbox, Grid, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';

const LeftSubsectionContent: React.FC = () => {
  // Dynamic state for the degree progress values
  const [degreeValues] = useState({
    workRequired: 2.9,
    overallQuality: 3.8,
    overallDifficulty: 2.8,
    cuLeft: 9, // Current remaining CU left
    cuTotal: 37, // Total CU value for 100%
  });

  const calculateProgress = (key: string, value: number) => {
    if (key === 'cuLeft') {
      // Calculate progress based on the validated CU (cuTotal - cuLeft)
      const validatedCU = degreeValues.cuTotal - degreeValues.cuLeft;
      return (validatedCU / degreeValues.cuTotal) * 100;
    }
    // For other fields, progress out of 5
    return (value / 5) * 100;
  };

  return (
    <Box p={2} sx={{ backgroundColor: '#FFFFFF', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Degree Section */}
      <Typography variant="h6" gutterBottom sx={{ color: '#011F5B', fontSize: '1rem' }}>
        Your Degree
      </Typography>
      <Grid container spacing={2} mb={4}>
        {/* Four blocks for Degree Progress */}
        {Object.entries(degreeValues).filter(([key]) => key !== 'cuTotal').map(([key, value]) => (
          <Grid item xs={12} sm={6} md={6} key={key} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #BCBCBC',
                borderRadius: '8px',
                backgroundColor: '#FBFBFB',
                flexGrow: 1,
              }}
            >
              <Box position="relative" display="inline-flex" mb={1}>
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
                  <Typography variant="h5" component="div" color="#011F5B" fontWeight="bold">
                    {key === 'cuLeft' ? value : value} {/* Display remaining CU inside the circle */}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#011F5B', fontWeight: '500', fontSize: '0.875rem', textAlign: 'center' }}>
                {key.replace(/([A-Z])/g, ' $1')}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Recommendations Section */}
      <Typography variant="h6" gutterBottom sx={{ color: '#011F5B', fontSize: '1rem' }}>
        Recommendations
      </Typography>
      <Box mb={4} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['CIS 5800 - Machine Perception', 'CIS 5300 - Natural Language Process', 'ESE 6190 - Model Predictive Control', 'BE 5210 - Brain Computer Interface'].map((recommendation) => (
          <Box
            key={recommendation}
            sx={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#FBFBFB',
              border: '1px solid #BCBCBC',
              flexGrow: 1,
            }}
          >
            <Typography sx={{ color: '#011F5B', fontWeight: '500', fontSize: '0.875rem', textAlign: 'left' }}>
              {recommendation}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* View Section */}
      <Typography variant="h6" gutterBottom sx={{ color: '#011F5B', fontSize: '1rem' }}>
        View
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} sx={{ width: '100%' }}>
        {/* View text blocks */}
        <Box display="flex" gap={1} flexGrow={1}>
          {['Fall24', 'Spring25', 'Fall25'].map((view) => (
            <Box
              key={view}
              sx={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #BCBCBC',
                backgroundColor: '#FBFBFB',
                flexGrow: 1,
              }}
            >
              <Typography sx={{ color: '#011F5B', fontWeight: '500', fontSize: '0.875rem', textAlign: 'center' }}>{view}</Typography>
            </Box>
          ))}
        </Box>
        {/* Add button */}
        <IconButton>
          <AddIcon sx={{ color: '#1E88E5' }} />
        </IconButton>
      </Box>

      {/* Checkbox for See Prerequisites */}
      <Box display="flex" alignItems="center" sx={{ width: '100%', justifyContent: 'flex-start' }}>
        <Checkbox
          defaultChecked
          sx={{
            color: '#0275FF',
            '&.Mui-checked': {
              color: '#0275FF',
            },
          }}
        />
        <Typography variant="body1" sx={{ color: '#011F5B', fontWeight: '500', fontSize: '0.875rem' }}>
          See Prerequisites
        </Typography>
      </Box>
    </Box>
  );
};

export default LeftSubsectionContent;








