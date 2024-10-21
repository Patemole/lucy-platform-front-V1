import React, { useState } from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';

const AIDiagnostic: React.FC = () => {
  // Dynamic state for the diagnostic values
  const [diagnosticValues] = useState({
    severity: 4.5,
    gpa: 2.9,
    canvasLogins: 2,
    missedAssignments: 3,
    campusParticipation: 0,
    lucyInteractions: 3,
  });

  // GPA calculation based on a max of 4
  const calculateGPAProgress = (value: number) => (value / 4) * 100;

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '5px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginBottom: '10px',
        }}
      >
        AI Diagnostic
      </Typography>

      {/* Diagnostic text */}
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#002D72' }}>
        His grades have <strong>dropped by 15%</strong>, and he has 
        <strong> missed three assignments</strong>. He hasn't participated in 
        <strong> any campus activities for the last 60 days</strong>. Although Mathieu was previously a strong and engaged student, 
        he hasn't met with his advisor or any staff member over the past year. It might be helpful for the Academic Advisor to 
        check in with him to understand what's going on.
      </p>

      {/* Diagnostic summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly', // Distribute space evenly between elements
          gap: '22px', // Add gap to ensure space is maintained between components
        }}
      >
        {/* Severity Level Progress */}
        <div
          style={{
            flex: 'none',  // Ensure the width is not stretched
            textAlign: 'center',
            marginTop: '10px',
            width: '120px',  // Adjusted width to reduce spacing
          }}
        >
          {/* Linear Progress bar */}
          <LinearProgress
            variant="determinate"
            value={(diagnosticValues.severity / 5) * 100}
            style={{
              height: '20px', // Increased height of the progress bar
              borderRadius: '5px',
              width: '100px',  // Adjusted width for better distribution
              backgroundColor: 'rgba(240, 66, 97, 0.53)', // Background color at 53% transparency
            }}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#EF4361', // Foreground bar color
              },
            }}
          />
          <Typography
            style={{
              fontSize: '14px',
              color: '#002D72',
              marginTop: '10px', // Add space between progress bar and text
              textAlign: 'left',
            }}
          >
            Risk Score 98/100
          </Typography>
        </div>

        {/* GPA Circular Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <Box
            position="relative"
            display="inline-flex"
            marginRight={2}
            style={{ textAlign: 'left' }}
          >
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
              value={calculateGPAProgress(diagnosticValues.gpa)}
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
                {diagnosticValues.gpa} {/* Display the GPA inside the circle */}
              </Typography>
            </Box>
          </Box>
          <Typography
            style={{
              fontSize: '14px',
              color: '#002D72',
              textAlign: 'left', // Align text to the left of the circle
            }}
          >
            GPA
          </Typography>
        </div>

        {/* Canvas logins */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography
            style={{
              fontSize: '32px',
              color: '#011F5B',
              fontWeight: 'bold',
            }}
          >
            {diagnosticValues.canvasLogins}
          </Typography>
          <div
            style={{
              fontSize: '14px',
              color: '#002D72',
              textAlign: 'left',
            }}
          >
            Canvas logins <br /> in the past 2 weeks
          </div>
        </div>

        {/* Missed assignments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography
            style={{
              fontSize: '32px',
              color: '#011F5B', //#002D72
              fontWeight: 'bold',
            }}
          >
            {diagnosticValues.missedAssignments}
          </Typography>
          <div
            style={{
              fontSize: '14px',
              color: '#002D72',
              textAlign: 'left',
            }}
          >
            Missed <br /> assignments
          </div>
        </div>

        {/* Campus participation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography
            style={{
              fontSize: '32px',
              color: '#011F5B',
              fontWeight: 'bold',
            }}
          >
            {diagnosticValues.campusParticipation}
          </Typography>
          <div
            style={{
              fontSize: '14px',
              color: '#002D72',
              textAlign: 'left',
            }}
          >
            Campus events <br /> participation
          </div>
        </div>

        {/* Lucy's interactions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography
            style={{
              fontSize: '32px',
              color: '#011F5B',
              fontWeight: 'bold',
            }}
          >
            {diagnosticValues.lucyInteractions}+
          </Typography>
          <div
            style={{
              fontSize: '14px',
              color: '#002D72',
              textAlign: 'left',
            }}
          >
            Lucy’s interactions with <br /> overwhelming feelings
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnostic;