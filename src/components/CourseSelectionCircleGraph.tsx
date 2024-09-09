import React from 'react';
import { Box, Typography } from '@mui/material';
import logo_greg from '../student_face.png'; // Adjust the path as necessary

const CourseMap = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '600px', // Define the height for the component
        width: '600px', // Define the width for the component
        backgroundColor: '#FFFFFF', // Optional background color
      }}
    >
      {/* Central Avatar */}
      <Box
        sx={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundImage: `url(${logo_greg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 10,
        }}
      />

      {/* First Circle (inner, smaller and closer) */}
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '280px',
          height: '280px',
          border: '1px dashed #25C35E', // Updated border color
          zIndex: 1,
        }}
      />

      {/* Second Circle (middle) */}
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '420px',
          height: '420px',
          border: '1px dashed #000', // Black dashed border
          zIndex: 0,
        }}
      />

      {/* Third Circle (outer, lighter and bigger) */}
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '620px',
          height: '620px',
          border: '1px dashed #D3D3D3', // Light grey dashed border
          zIndex: 0,
        }}
      />

      {/* First Circle (Courses) */}
      <Box sx={{ position: 'absolute', top: '5%', left: '50%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1230</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '45%', left: '30%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">MATH 2100</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '50%', left: '70%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 2330</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '65%', left: '50%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1010</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '75%', left: '30%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1951</Typography>
        </Box>
      </Box>

      {/* Second Circle Courses */}
      <Box sx={{ position: 'absolute', top: '20%', left: '5%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #1E88E5', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#1E88E5">CIS 1951</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '60%', left: '75%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #1E88E5', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#1E88E5">CIS 2330</Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Validated */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#25C35E', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Validated</Typography>
        </Box>

        {/* Planning */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#1E88E5', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Planning</Typography>
        </Box>

        {/* Recommendation */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#757575', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Recommendation</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseMap;



