// RiskTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';

// Define the Risk interface with a numerical riskScore
interface Risk {
  studentName: string;
  riskCategory: string;
  riskDescription: string;
  lastAdvisorVisit: string;
  riskScore: number; // Numerical Risk Score (0-100)
}

// Sample risk data with numerical riskScore values
const riskData: Risk[] = [
  {
    studentName: 'John Doe',
    riskCategory: 'Mental Health',
    riskDescription:
      'During chat with Lucy, John repeatedly mentioned suicidal thoughts and asked if Lucy could help him “end the pain.”',
    lastAdvisorVisit: '10/05/2024',
    riskScore: 98,
  },
  {
    studentName: 'Sarah Thompson',
    riskCategory: 'Behavioral Issue',
    riskDescription:
      'Used highly aggressive language in chats with Lucy, including threats towards others and expressing violent intentions.',
    lastAdvisorVisit: '09/20/2024',
    riskScore: 97,
  },
  {
    studentName: 'Alex Martinez',
    riskCategory: 'Substance Abuse',
    riskDescription:
      'Discussed drug use multiple times in chats with Lucy, asking for advice on getting “high” and mentioning attending class under the influence.',
    lastAdvisorVisit: '08/15/2024',
    riskScore: 92,
  },
  {
    studentName: 'Emily Johnson',
    riskCategory: 'Severe Anxiety',
    riskDescription:
      'Repeatedly chatted with Lucy about experiencing panic attacks and feeling hopeless, refusing help when Lucy suggested speaking with a counselor.',
    lastAdvisorVisit: '10/12/2024',
    riskScore: 90,
  },
  {
    studentName: 'Michael Green',
    riskCategory: 'Depression',
    riskDescription:
      'Expressed feeling isolated and hopeless multiple times in chats with Lucy.',
    lastAdvisorVisit: '10/10/2024',
    riskScore: 86,
  },
  {
    studentName: 'Rachel Adams',
    riskCategory: 'Substance Abuse',
    riskDescription:
      'Discussed alcohol consumption problems and difficulty focusing in class.',
    lastAdvisorVisit: '09/30/2024',
    riskScore: 78,
  },
  {
    studentName: 'David Lee',
    riskCategory: 'Academic Stress',
    riskDescription:
      'Constantly expressed stress about grades and performance in multiple courses.',
    lastAdvisorVisit: '10/07/2024',
    riskScore: 64,
  },
  {
    studentName: 'Nina Patel',
    riskCategory: 'Anxiety',
    riskDescription:
      'Shared recurring anxiety issues and fears of failure.',
    lastAdvisorVisit: '09/28/2024',
    riskScore: 55,
  },
];

const RiskTable: React.FC = () => {
  // Function to determine the color of the progress bar based on the risk score
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return '#E60000'; // Red for severe
    if (score >= 60) return '#FF751A'; // Orange for moderately severe
    if (score >= 40) return '#FFCC00'; // Yellow for moderate
    if (score >= 20) return '#99CC00'; // Light green for mild
    return '#33CC33'; // Green for none/minimal
  };

  // Function placeholder for a future action on row click
  const handleRowClick = (studentName: string) => {
    console.log(`Clicked row for student: ${studentName}`);
    // Implement navigation or other actions here
  };

  return (
    <Box sx={{ padding: 2, height: '100%', overflow: 'hidden' }}>
      {/* Table Title */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginLeft: '0px',
          marginBottom: '15px',
        }}
      >
        High Risk Students
      </Typography>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        elevation={3}
        style={{ height: '400px', maxWidth: '100%', overflowY: 'scroll' }}
      >
        <Table stickyHeader style={{ width: '100%' }}>
          {/* Table Header */}
          <TableHead>
            <TableRow style={{ backgroundColor: '#d3d3d3' }}>
              <TableCell style={{ width: '15%' }}>
                <strong>Student Name</strong>
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                <strong>Risk Category</strong>
              </TableCell>
              <TableCell style={{ width: '35%' }}>
                <strong>Risk Description</strong>
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                <strong>Last Advisor Visit</strong>
              </TableCell>
              <TableCell style={{ width: '20%' }}>
                <strong>Risk Score</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {riskData.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(row.studentName)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#e0f7fa', // Hover color
                  },
                }}
              >
                <TableCell>{row.studentName}</TableCell>
                <TableCell>{row.riskCategory}</TableCell>
                <TableCell>{row.riskDescription}</TableCell>
                <TableCell>{row.lastAdvisorVisit}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {/* Risk Score Text */}
                    <Typography variant="body2" color="#002D72">
                      {row.riskScore}/100
                    </Typography>

                    {/* Risk Score Progress Bar */}
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.riskScore}
                        sx={{
                          height: '10px',
                          borderRadius: '5px',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getRiskScoreColor(row.riskScore),
                          },
                          backgroundColor: '#e0e0e0',
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Export the RiskTable component as default
export default RiskTable;