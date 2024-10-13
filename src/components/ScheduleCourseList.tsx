import React, { useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const CurriculumProgress: React.FC = () => {
  // State to manage the open/closed status of dropdowns
  const [openAI, setOpenAI] = useState(false);
  const [openPhysics, setOpenPhysics] = useState(false);
  const [openPhysicsRequirement, setOpenPhysicsRequirement] = useState(false);

  // Toggle the dropdown status
  const handleToggleAI = () => setOpenAI(!openAI);
  const handleTogglePhysics = () => setOpenPhysics(!openPhysics);
  const handleTogglePhysicsRequirement = () => setOpenPhysicsRequirement(!openPhysicsRequirement);

  // Icons for different statuses with updated colors
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#25C35E' }} />; // Updated green color
      case 'incomplete':
        return <CancelIcon sx={{ color: '#F04261' }} />; // Updated red color
      case 'partial':
        return <RemoveCircleIcon sx={{ color: '#F97315' }} />; // Updated orange color
      default:
        return null;
    }
  };

  return (
    <Box sx={{ padding: '16px' }}>
      {/* Major - Artificial Intelligence */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#011F5B' }}>
        Artificial Intelligence{' '}
        <Typography component="span" variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
          (Major)
        </Typography>
      </Typography>
      
      <List component="nav" disablePadding>
        {/* Computing */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('completed')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Computing
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* Math and Natural Science */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('completed')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Math and Natural Science
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* Artificial Intelligence */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('partial')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Artificial Intelligence
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* Senior Design */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('incomplete')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Senior Design
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* Technical Electives */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('partial')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Technical Electives
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* General Electives */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('partial')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            General Electives
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>

        {/* Free Elective */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('incomplete')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Free Elective
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>
      </List>

      {/* Minor - Quantum Physics */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: '24px', fontSize: '1.05rem', color: '#011F5B' }}>
        Quantum Physics{' '}
        <Typography component="span" variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
          (Minor)
        </Typography>
      </Typography>

      <List component="nav" disablePadding>
        {/* Physics Requirement */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }} onClick={handleTogglePhysicsRequirement}>
          {getStatusIcon('completed')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Physics Requirement
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}>
            {openPhysicsRequirement ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </ListItem>

        <Collapse in={openPhysicsRequirement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* List of Physics Courses */}
            {['PHYS 0150', 'PHYS 0151', 'PHYS 1230', 'PHYS 1250', 'PHYS 2280'].map((course, index) => (
              <ListItem key={index} disableGutters sx={{ display: 'flex', alignItems: 'center', paddingLeft: '32px' }}>
                {getStatusIcon('completed')}
                <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
                  {course} - Course Title {index + 1}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Other Courses */}
        <ListItem disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon('completed')}
          <Typography variant="body1" sx={{ marginLeft: '8px', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Other Courses
          </Typography>
          <IconButton sx={{ marginLeft: '8px' }}><ExpandMore /></IconButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default CurriculumProgress;


