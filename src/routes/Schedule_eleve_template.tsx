import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import Header from '../components/Header'; // Adjust the path as necessary
import LeftSectionHeader from '../components/CourseSelectionHeader'; // Adjust the path as necessary
import CurriculumProgress from '../components/ScheduleCourseList'; // Adjust the path as necessary
import Chat from '../components/CourseSelectionChat'; // Adjust the path as necessary
import ScheduleMetrics from '../components/ScheduleMetrics'; // Import the ScheduleMetrics component
import Calendar from '../components/ScheduleCalendar'; // Import the Calendar component

const CourseSelectionEleveTemplate: React.FC = () => {
  return (
    <Box height="100vh" display="flex" flexDirection="column" sx={{ overflow: 'hidden' }}>
      {/* Header Component */}
      <Header />

      {/* Main Page Content */}
      <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
        {/* Left Section - 70% of the page */}
        <Box flex={7} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Left Section Header */}
          <Box sx={{ flexGrow: 0 }}>
            {/* Full-width LeftSectionHeader without any margins */}
            <LeftSectionHeader />
          </Box>

          {/* Split Left Section into 30% and 70%, taking max height */}
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Left Subsection - 30%, scrollable */}
            <Box
              flex={3.5}
              sx={{
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto', // Enable vertical scrolling
              }}
            >
              {/* Replaced with CurriculumProgress Component */}
              <CurriculumProgress />
            </Box>

            {/* Right Subsection - 70%, split into 2 sections (80% top, 20% bottom) */}
            <Box 
              flex={6.5} 
              sx={{ 
                padding: '16px', 
                backgroundColor: '#FFFFFF',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
              }}
            >
              {/* Top section (80% height) */}
              <Box
                sx={{
                  flex: 8,
                  backgroundColor: '#FFFFFF', // Change to white to match the rest of the design
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px' // Adds some space between the two sections
                }}
              >
                {/* Include the Calendar Component here */}
                <Calendar />
              </Box>

              {/* Bottom section (20% height) */}
              <Box
                sx={{
                  flex: 2,
                  backgroundColor: '#FFFFFF', // Make it white since we're adding a component here
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Replaced with ScheduleMetrics Component */}
                <ScheduleMetrics />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Vertical Divider between Left and Right sections */}
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7'}} />

        {/* Right Section - 30% of the page, no margins for the chat */}
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Chat Component */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Chat />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;



