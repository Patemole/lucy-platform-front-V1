import React from 'react';
import { Box, Typography } from '@mui/material';

interface HousingResultsHeaderProps {
  title: string;
  subtitle: string;
}

const HousingResultsHeader: React.FC<HousingResultsHeaderProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ width: '100%', padding: '16px 24px', textAlign: 'left' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', marginBottom: '4px' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
};

export default HousingResultsHeader; 