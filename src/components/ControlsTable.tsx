// components/ControlsTable.tsx
import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ControlItem {
  title: string;
  description: string;
}

interface ControlsTableProps {
  controls: ControlItem[];
}

const ControlsTable: React.FC<ControlsTableProps> = ({ controls }) => {
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: 'none' }}>
      <Table aria-label="controls table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                CONTROL
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                STATUS
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {controls.map((control, index) => (
            <TableRow key={index} sx={{ borderBottom: '1px solid #E0E0E0' }}>
              <TableCell component="th" scope="row" sx={{ padding: '16px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {control.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  {control.description}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ padding: '16px' }}>
                <CheckCircleIcon sx={{ color: '#25C35E' }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ControlsTable;