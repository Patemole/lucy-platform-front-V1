import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

interface Risk {
  studentName: string;
  riskCategory: string;
  riskDescription: string;
  lastAdvisorVisit: string;
  riskLevel: string;
}

const riskData: Risk[] = [
  {
    studentName: 'John Doe',
    riskCategory: 'Mental Health',
    riskDescription: 'During chat with Lucy, John repeatedly mentioned suicidal thoughts and asked if Lucy could help him “end the pain.”',
    lastAdvisorVisit: '10/05/2024',
    riskLevel: '🔴',
  },
  {
    studentName: 'Sarah Thompson',
    riskCategory: 'Behavioral Issue',
    riskDescription: 'Used highly aggressive language in chats with Lucy, including threats towards others and expressing violent intentions.',
    lastAdvisorVisit: '09/20/2024',
    riskLevel: '🔴',
  },
  {
    studentName: 'Alex Martinez',
    riskCategory: 'Substance Abuse',
    riskDescription: 'Discussed drug use multiple times in chats with Lucy, asking for advice on getting “high” and mentioning attending class under the influence.',
    lastAdvisorVisit: '08/15/2024',
    riskLevel: '🔴',
  },
  {
    studentName: 'Emily Johnson',
    riskCategory: 'Severe Anxiety',
    riskDescription: 'Repeatedly chatted with Lucy about experiencing panic attacks and feeling hopeless, refusing help when Lucy suggested speaking with a counselor.',
    lastAdvisorVisit: '10/12/2024',
    riskLevel: '🔴',
  },
  {
    studentName: 'Michael Green',
    riskCategory: 'Depression',
    riskDescription: 'Expressed feeling isolated and hopeless multiple times in chats with Lucy.',
    lastAdvisorVisit: '10/10/2024',
    riskLevel: '🟠',
  },
  {
    studentName: 'Rachel Adams',
    riskCategory: 'Substance Abuse',
    riskDescription: 'Discussed alcohol consumption problems and difficulty focusing in class.',
    lastAdvisorVisit: '09/30/2024',
    riskLevel: '🟠',
  },
  {
    studentName: 'David Lee',
    riskCategory: 'Academic Stress',
    riskDescription: 'Constantly expressed stress about grades and performance in multiple courses.',
    lastAdvisorVisit: '10/07/2024',
    riskLevel: '🟡',
  },
  {
    studentName: 'Nina Patel',
    riskCategory: 'Anxiety',
    riskDescription: 'Shared recurring anxiety issues and fears of failure.',
    lastAdvisorVisit: '09/28/2024',
    riskLevel: '🟡',
  },
];

const RiskTable: React.FC = () => {
  // Fonction placeholder pour une future action au clic
  const handleRowClick = (studentName: string) => {
    console.log(`Ligne cliquée pour l'étudiant : ${studentName}`);
  };

  return (
    <Box sx={{ padding: 2, height: '100%', overflow: 'hidden' }}>
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
        Top Students at Risk
      </Typography>
      <TableContainer component={Paper} elevation={3} style={{ height: '400px', maxWidth: '100%', overflowY: 'scroll' }}>
        <Table stickyHeader style={{ width: '100%' }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#d3d3d3' }}> {/* Couleur différente pour la ligne des titres */}
              <TableCell style={{ width: '15%' }}><strong>Student Name</strong></TableCell>
              <TableCell style={{ width: '15%' }}><strong>Risk Category</strong></TableCell>
              <TableCell style={{ width: '40%' }}><strong>Risk Description (Flagged via Lucy Chat)</strong></TableCell> {/* Réduction de la largeur */}
              <TableCell style={{ width: '15%' }}><strong>Last Advisor Visit</strong></TableCell>
              <TableCell style={{ width: '15%' }}><strong>Risk Level</strong></TableCell>
            </TableRow>
          </TableHead>
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
                    backgroundColor: '#e0f7fa', // Couleur au survol
                  },
                }}
              >
                <TableCell>{row.studentName}</TableCell>
                <TableCell>{row.riskCategory}</TableCell>
                <TableCell>{row.riskDescription}</TableCell>
                <TableCell>{row.lastAdvisorVisit}</TableCell>
                <TableCell>{row.riskLevel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RiskTable;