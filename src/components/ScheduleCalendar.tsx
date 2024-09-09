import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Calendar: React.FC = () => {
  // State to manage the dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('Per Week'); // Default filter selected
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option: string) => {
    setSelectedFilter(option); // Update the selected filter
    setAnchorEl(null); // Close the menu
  };

  // Course Data
  const courses = [
    { id: 1, name: 'CIS 4210 320', day: 'Tue', startTime: 10, endTime: 11, color: '#D6EAF7' },
    { id: 2, name: 'LING 0500 311', day: 'Thu', startTime: 11, endTime: 12, color: '#FDEBD0' },
    { id: 3, name: 'CIS 5300 401', day: 'Wed', startTime: 1, endTime: 2, color: '#D6EAF7' },
    { id: 4, name: 'ESE 6190 108', day: 'Wed', startTime: 2, endTime: 3, color: '#D6EAF7' },
    { id: 5, name: 'PHYS 3362 931', day: 'Mon', startTime: 4, endTime: 5, color: '#D7BDE2' },
  ];

  // Function to render courses on the calendar
  const renderCourses = () => {
    return courses.map((course) => {
      return (
        <Box
          key={course.id}
          sx={{
            position: 'absolute',
            top: `${course.startTime * 50}px`,
            height: `${(course.endTime - course.startTime) * 50}px`,
            width: '100%',
            backgroundColor: course.color,
            border: '1px solid #1F77B4',
            borderRadius: '4px',
            color: '#1F77B4',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {course.name}
        </Box>
      );
    });
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ width: '100%', padding: '16px' }}>
      {/* Header with title, arrows, and dropdown filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Your Fall Semester
          </Typography>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Box>
          <Typography
            onClick={handleClick}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}
          >
            {selectedFilter}
            <ExpandMoreIcon />
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleClose(selectedFilter)}
            MenuListProps={{
              'aria-labelledby': 'lock-button',
              role: 'listbox',
            }}
          >
            <MenuItem onClick={() => handleClose('Per Week')}>Per Week</MenuItem>
            <MenuItem onClick={() => handleClose('Per Month')}>Per Month</MenuItem>
            <MenuItem onClick={() => handleClose('Per Semester')}>Per Semester</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Box display="flex" sx={{ width: '100%' }}>
        <Box flex={1} sx={{ paddingTop: '32px', fontWeight: 'bold', color: '#7F7F7F' }}>
          {/* Spaced time intervals */}
          <Typography sx={{ height: '50px' }}>10 AM</Typography>
          <Typography sx={{ height: '50px' }}>11 AM</Typography>
          <Typography sx={{ height: '50px' }}>12 PM</Typography>
          <Typography sx={{ height: '50px' }}>1 PM</Typography>
          <Typography sx={{ height: '50px' }}>2 PM</Typography>
          <Typography sx={{ height: '50px' }}>3 PM</Typography>
          <Typography sx={{ height: '50px' }}>4 PM</Typography>
          <Typography sx={{ height: '50px' }}>5 PM</Typography>
        </Box>

        <Box flex={4} position="relative" sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridAutoRows: '50px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <Box key={day} display="flex" justifyContent="center" alignItems="center" sx={{ fontWeight: 'bold', color: '#7F7F7F' }}>
              <Typography>{day}</Typography>
            </Box>
          ))}

          {/* Adjust grid size to remove extra square */}
          {Array(30)
            .fill(null)
            .map((_, idx) => (
              <Box key={idx} sx={{ border: '1px solid #F0F0F0' }} />
            ))}

          {/* Courses placed on the grid */}
          <Box gridColumn="2 / 3" gridRow="3 / 4" sx={{ position: 'relative' }}>
            {renderCourses()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;

