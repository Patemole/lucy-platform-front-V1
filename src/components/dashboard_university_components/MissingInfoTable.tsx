import React, { useState } from 'react';
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
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Define the Risk interface without studentName and with updated fields
interface Risk {
  AIInsights: string; // Insights on missing information to add
  Category: string;
  missingQuestions: string; // Specific examples of missing questions
  dateRange: string; // Date range for the questions asked
  numberOfQuestions: number; // Number of questions asked on this topic
}

// Initial sample risk data with pastel colors and precise information
const initialRiskData: Risk[] = [
  {
    AIInsights: 'Add information about average class sizes for core courses within specific majors.',
    Category: 'Program Information',
    missingQuestions: 'What is the average class size for core courses in the biology major?',
    dateRange: '09/15/2024 - 10/05/2024',
    numberOfQuestions: 12,
  },
  {
    AIInsights: 'Provide details on specialized advising support for students pursuing double majors or minors.',
    Category: 'Academic Advising',
    missingQuestions: 'Are there specific academic advisors dedicated to helping students navigate double majors?',
    dateRange: '09/01/2024 - 09/20/2024',
    numberOfQuestions: 8,
  },
  {
    AIInsights: 'Provide information on available scholarships and financial plans.',
    Category: 'Financial Aid',
    missingQuestions: 'What scholarships are available? How to apply for financial aid?',
    dateRange: '08/10/2024 - 08/30/2024',
    numberOfQuestions: 15,
  },
  {
    AIInsights: 'Clarify maximum credit limits per semester and associated fees if exceeded.',
    Category: 'Program Information',
    missingQuestions: 'Is there a cap on the number of credits I can take each semester without incurring additional fees?',
    dateRange: '10/01/2024 - 10/12/2024',
    numberOfQuestions: 5,
  },
  {
    AIInsights: 'Highlight partnerships with local businesses for student work opportunities and internships.',
    Category: 'Career Services',
    missingQuestions: 'Does the university have partnerships with local businesses for part-time jobs?',
    dateRange: '09/20/2024 - 10/15/2024',
    numberOfQuestions: 10,
  },
  {
    AIInsights: 'Clarify if early action exist specifically for the M&T program',
    Category: 'Admission Process',
    missingQuestions: 'Are there early action or priority deadlines for prospective students applying to the M&T program?',
    dateRange: '09/25/2024 - 10/20/2024',
    numberOfQuestions: 7,
  },
  {
    AIInsights: 'Outline available support and funding options for undergraduate students interested in research.',
    Category: 'Academic Advising',
    missingQuestions: 'What kind of support is available for students interested in research, and are there funded research positions for undergraduates?',
    dateRange: '10/05/2024 - 10/25/2024',
    numberOfQuestions: 9,
  },
  {
    AIInsights: 'Include details on available co-op programs, including participating industries and companies.',
    Category: ' Career Services',
    missingQuestions: 'Does the university offer co-op programs, and if so, what industries or companies are involved?',
    dateRange: '09/10/2024 - 10/08/2024',
    numberOfQuestions: 11,
  },
];

// Define the RiskTable component
const RiskTable: React.FC = () => {
  // State to manage the risk data
  const [riskData, setRiskData] = useState<Risk[]>(initialRiskData);

  // State to manage the selected row for the popup
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // Function to determine the pastel color of the category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Admission Process':
        return '#E0E0E0'; // Pastel Yellow
      case 'Program Information':
        return '#E0E0E0'; // Pastel Orange
      case 'Financial Aid':
        return '#E0E0E0'; // Pastel Red
      case 'Campus Life':
        return '#E0E0E0'; // Pastel Green
      case 'Academic Advising':
        return '#E0E0E0'; // Pastel Blue
      case 'Career Services':
        return '#E0E0E0'; // Pastel Violet
      case 'Housing Services':
        return '#E0E0E0'; // Pastel Pink
      case 'International Students':
        return '#E0E0E0'; // Pastel Turquoise
      default:
        return '#E0E0E0'; // Light Gray for others
    }
  };

  // Function to determine the color of the progress bar based on the number of questions
  const getProgressBarColor = (count: number) => {
    if (count >= 15) return '#FF6E6E'; // Light Red for high volume
    if (count >= 10) return '#FFA726'; // Light Orange for medium-high volume
    if (count >= 5) return '#FFD54F'; // Light Yellow for medium volume
    return '#AED581'; // Light Green for low volume
  };

  // Function to handle row click and open the popup
  const handleRowClick = (risk: Risk) => {
    setSelectedRisk(risk);
  };

  // Function to handle closing the popup
  const handleClose = () => {
    setSelectedRisk(null);
  };

  // Function to mark a risk as resolved and remove it from the table
  const handleMarkAsResolved = () => {
    if (selectedRisk) {
      setRiskData((prevData) =>
        prevData.filter((risk) => risk !== selectedRisk)
      );
      handleClose();
    }
  };

  // Sort the data by numberOfQuestions in descending order
  const sortedRiskData = [...riskData].sort(
    (a, b) => b.numberOfQuestions - a.numberOfQuestions
  );

  // Calculate the height needed for 4 rows plus header
  // Assuming each row is approximately 53px high (default MUI table row height)
  const rowHeight = 80;
  const headerHeight = 56; // Default MUI table header height
  const visibleRows = 4;
  const tableHeight = headerHeight + rowHeight * visibleRows;

  return (
    <Box sx={{ padding: 2, height: '100%', overflow: 'hidden' }}>
      {/* Title Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        {/* Table Title */}
        <Typography
          variant="h6"
          style={{
            fontWeight: 'bold',
            color: '#011F5B',
            fontSize: '1.25rem',
            marginLeft: '0px',
          }}
        >
          Top Missing Information
        </Typography>

        {/* Notification Bell Icon with Badge */}
        <IconButton>
          <Badge
            badgeContent={riskData.length}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '1rem',
                height: '20px',
                minWidth: '20px',
                backgroundColor: '#E60000',
              },
            }}
          >
            <NotificationsIcon sx={{ color: '#011F5B', fontSize: '1.8rem' }} />
          </Badge>
        </IconButton>
      </Box>

      {/* Table Container with fixed height for 4 visible rows */}
      <TableContainer
        component={Paper}
        elevation={3}
        style={{
          maxWidth: '100%',
          height: `${tableHeight}px`,
          overflowY: 'auto',
        }}
      >
        <Table stickyHeader style={{ width: '100%' }}>
          {/* Table Header */}
          <TableHead>
            <TableRow style={{ backgroundColor: '#d3d3d3', height: `${headerHeight}px` }}>
              <TableCell style={{ width: '20%' }}>
                <strong>AI Insights</strong>
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                <strong>Category</strong>
              </TableCell>
              <TableCell style={{ width: '35%' }}>
                <strong>Missing Questions</strong>
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                <strong>Date Range</strong>
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                <strong>Number of Questions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {sortedRiskData.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(row)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  height: `${rowHeight}px`,
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#e0f7fa', // Hover color
                  },
                }}
              >
                {/* AI Insights */}
                <TableCell>{row.AIInsights}</TableCell>

                {/* Category with Pastel Tag */}
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      backgroundColor: getCategoryColor(row.Category),
                      color: '#000',
                      fontWeight: 'bold',
                    }}
                  >
                    {row.Category}
                  </Box>
                </TableCell>

                {/* Missing Questions */}
                <TableCell>{row.missingQuestions}</TableCell>

                {/* Date Range */}
                <TableCell>{row.dateRange}</TableCell>

                {/* Number of Questions with Progress Bar */}
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {/* Number of Questions Text */}
                    <Typography variant="body2" color="#002D72">
                      {row.numberOfQuestions}
                    </Typography>

                    {/* Progress Bar */}
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={(row.numberOfQuestions / 20) * 100} // Assuming 20 as the maximum for scaling
                        sx={{
                          height: '10px',
                          borderRadius: '5px',
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProgressBarColor(row.numberOfQuestions),
                          },
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

      {/* Enhanced Popup Dialog */}
      <Dialog open={Boolean(selectedRisk)} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Missing Information</DialogTitle>
        <DialogContent>
          {selectedRisk && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* AI Insights */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    AI Insights:
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedRisk.AIInsights}
                  </Typography>
                </Grid>

                <Divider />

                {/* Category */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Category:
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      backgroundColor: getCategoryColor(selectedRisk.Category),
                      color: '#000',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                    }}
                  >
                    {selectedRisk.Category}
                  </Box>
                </Grid>

                <Divider />

                {/* Missing Questions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Missing Questions:
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedRisk.missingQuestions}
                  </Typography>
                </Grid>

                <Divider />

                {/* Date Range */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Date Range:
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedRisk.dateRange}
                  </Typography>
                </Grid>

                <Divider />

                {/* Number of Questions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Number of Questions:
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedRisk.numberOfQuestions}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {/* Mark as Resolved Button */}
          <Button
            onClick={handleMarkAsResolved}
            style={{ backgroundColor: '#66ff6', color: '#FFFFFF' }} // Custom green
            variant="contained"
          >
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export the RiskTable component as default
export default RiskTable;