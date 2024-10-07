// components/SecurityBlock.tsx
import React from 'react';
import { Box, Typography, Divider, Link, List, ListItem, ListItemIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface SecurityBlockProps {
  title: string;
  items: string[];
  moreCount: number;
  onNavigate: (category: string) => void;  // New prop for navigation
}

const SecurityBlock: React.FC<SecurityBlockProps> = ({ title, items, moreCount, onNavigate }) => {
  return (
    <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px' }}>
      <Box 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => onNavigate(title)}  // Navigate to the controls page when the arrow is clicked
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <ArrowForwardIosIcon fontSize="small" />
      </Box>

      <Divider sx={{ marginY: '10px' }} />

      <List disablePadding>
        {items.map((item, index) => (
          <ListItem key={index} sx={{ paddingLeft: '0px' }}>
            <ListItemIcon sx={{ minWidth: '30px' }}>
              <CheckCircleIcon fontSize="small" sx={{ color: '#25C35E' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: '#555' }}>
              {item}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Link 
        href="#" 
        variant="body2" 
        sx={{ color: '#7C3BEC', marginTop: '10px', display: 'block', cursor: 'pointer' }}
        onClick={() => onNavigate(title)}  // Navigate to the controls page when the "+ more" link is clicked
      >
        + {moreCount} more
      </Link>
    </Box>
  );
};

export default SecurityBlock;