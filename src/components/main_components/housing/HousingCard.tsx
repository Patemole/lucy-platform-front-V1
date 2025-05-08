import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';

interface HousingCardProps {
  imageUrl: string;
  label: string;
  subtitle: string;
  labelBgColor?: string; // Optional pastel background color
  title: string;
}

const HousingCard: React.FC<HousingCardProps> = ({ 
  imageUrl, 
  label, 
  subtitle, 
  title,
  labelBgColor = '#FFDAB9' // Default PeachPuff pastel color
}) => {
  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', borderRadius: '16px', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="194"
        image={imageUrl}
        alt="Housing image"
        sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} // Match card radius
      />
      <CardContent sx={{ textAlign: 'left' }}>
        <Typography gutterBottom variant="h5" component="div">
          {/* Placeholder for Title - Can be added as a prop later if needed */} 
          {title}
        </Typography>
        <Chip 
          label={label} 
          sx={{ 
            backgroundColor: labelBgColor, 
            color: '#555', // Darker text for better readability on pastel
            marginBottom: 2, 
            fontWeight: 'bold' 
          }} 
        />
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HousingCard; 