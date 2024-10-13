

import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // Import necessary hooks

const LeftSectionHeader: React.FC = () => {
  const navigate = useNavigate(); // React Router hook for navigation
  const location = useLocation(); // React Router hook to access location (to get state)
  const { uid } = useParams<{ uid: string }>(); // Getting uid from the URL params

  // Get activeView from location state, or default to 'Degree Planning'
  const [activeView, setActiveView] = useState<string>(location.state?.activeView || 'Degree Planning');

  // Function to change the active view and navigate to the correct page
  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === 'My Schedule') {
      navigate(`/dashboard/student/schedule/${uid}`, { state: { activeView: 'My Schedule' } }); // Pass activeView to the new route
    } else if (view === 'All Courses') {
      navigate(`/dashboard/student/courses/${uid}`, { state: { activeView: 'All Courses' } });
    } else {
      navigate(`/dashboard/student/course_selection/${uid}`, { state: { activeView: 'Degree Planning' } });
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
      {/* Left section buttons */}
      <Box display="flex" gap={2}>
        <Button
          onClick={() => handleViewChange('Degree Planning')}
          sx={{
            backgroundColor: activeView === 'Degree Planning' ? '#D6EAF7' : 'transparent',
            color: '#011F5B',
            textTransform: 'none',
            padding: '8px 16px',
            borderRadius: '15px',
          }}
        >
          Degree Planning
        </Button>
        <Button
          onClick={() => handleViewChange('My Schedule')}
          sx={{
            backgroundColor: activeView === 'My Schedule' ? '#D6EAF7' : 'transparent',
            color: '#011F5B',
            textTransform: 'none',
            padding: '8px 16px',
            borderRadius: '15px',
          }}
        >
          My Schedule
        </Button>
        <Button
          onClick={() => handleViewChange('All Courses')}
          sx={{
            backgroundColor: activeView === 'All Courses' ? '#D6EAF7' : 'transparent',
            color: '#011F5B',
            textTransform: 'none',
            padding: '8px 16px',
            borderRadius: '15px',
          }}
        >
          All Courses
        </Button>
      </Box>
    </Box>
  );
};

export default LeftSectionHeader;
