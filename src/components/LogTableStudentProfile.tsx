

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

// Interface pour structurer les données des interactions
interface Interaction {
  reason: string;
  type: string;
  department: string;
  date: string;
  staffName: string;
  summary: string;
}

// Exemple de données pour le tableau
const interactionData: Interaction[] = [
  {
    reason: 'Financial Aid Inquiry',
    type: 'Email',
    department: 'Financial Services',
    date: '2024-07-12',
    staffName: 'Ms. Johnson',
    summary: 'The student inquired about additional financial aid options, requesting guidance on eligibility and next steps to ensure continued support.',
  },
  {
    reason: 'Major Degree Audit',
    type: 'In-Person',
    department: 'Academic Advising',
    date: '2024-05-28',
    staffName: 'Mr. Smith',
    summary: 'Reviewed the student’s progress towards degree completion, focusing on upcoming course requirements and potential elective choices.',
  },
  {
    reason: 'Mental Health Check-In',
    type: 'Phone Call',
    department: 'Mental Health Services',
    date: '2024-04-15',
    staffName: 'Dr. Lee',
    summary: 'The student shared feelings of overwhelm and stress, discussing potential coping strategies and scheduling future sessions.',
  },
  {
    reason: 'Scholarship Renewal Question',
    type: 'Email',
    department: 'Financial Services',
    date: '2024-02-20',
    staffName: 'Ms. Perez',
    summary: 'Asked for confirmation regarding eligibility for upcoming scholarship renewal and any necessary documentation requirements.',
  },
  {
    reason: 'Class Registration Help',
    type: 'In-Person',
    department: 'Academic Advising',
    date: '2023-12-10',
    staffName: 'Mr. Smith',
    summary: 'Discussed and finalized course registration for the upcoming term, ensuring alignment with major requirements and career goals.',
  },
];

// Styles pour les différents services avec des couleurs pastels
const DepartmentTag = styled('div')<{ bgColor: string }>(({ bgColor }) => ({
  backgroundColor: bgColor,
  padding: '5px 10px',
  borderRadius: '8px',
  display: 'inline-block',
  color: '#000',
  fontWeight: 'bold',
}));

// Fonction pour retourner la couleur pastel en fonction du département
const getDepartmentColor = (department: string) => {
  switch (department) {
    case 'Financial Services':
      return '#FEEAEA'; // Rose pastel
    case 'Academic Advising':
      return '#D6EAF7'; // Vert pastel
    case 'Mental Health Services':
      return '#EBE2FC'; // Bleu pastel
    default:
      return '#E0E0E0'; // Gris clair si le département est inconnu
  }
};

const InteractionTable: React.FC = () => {
  return (
    <Box sx={{ padding: 2, height: '100%', overflow: 'hidden' }}>
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginBottom: '15px',
        }}
      >
        Last Interactions History
      </Typography>
      <TableContainer component={Paper} elevation={3} style={{ height: 'auto', maxWidth: '100%', overflowY: 'scroll' }}>
        <Table stickyHeader style={{ width: '100%' }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#d3d3d3' }}>
              <TableCell><strong>Reason for Contact</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Staff Name</strong></TableCell>
              <TableCell><strong>AI Interaction Summary</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interactionData.map((row, index) => (
              <TableRow
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#e0f7fa',
                  },
                }}
              >
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <DepartmentTag bgColor={getDepartmentColor(row.department)}>
                    {row.department}
                  </DepartmentTag>
                </TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.staffName}</TableCell>
                <TableCell>{row.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InteractionTable;
