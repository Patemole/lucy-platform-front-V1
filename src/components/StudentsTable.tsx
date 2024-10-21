import React from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  gpa: number;
  lastMeeting: string;
  riskScore: number;
}

interface StudentsTableProps {
  students: Student[];
}

const StudentsTable: React.FC<StudentsTableProps> = ({ students }) => {
  // Function to determine the color of the progress bar based on the risk score
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return '#E60000'; // Red for severe
    if (score >= 60) return '#FF751A'; // Orange for moderately severe
    if (score >= 40) return '#FFCC00'; // Yellow for moderate
    if (score >= 20) return '#99CC00'; // Light green for mild
    return '#33CC33'; // Green for none/minimal
  };

  return (
    <div style={styles.tableContainer}>
      <div style={styles.scrollableBody}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.tableHeader}>ID</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Major</th>
              <th style={styles.tableHeader}>GPA</th>
              <th style={styles.tableHeader}>Last Meeting Date</th>
              <th style={styles.tableHeader}>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={styles.tableRow}>
                <td style={styles.tableData}>{student.id}</td>
                <td style={styles.tableData}>{student.name}</td>
                <td style={styles.tableData}>{student.email}</td>
                <td style={styles.tableData}>{student.major}</td>
                <td style={styles.tableData}>{student.gpa}</td>
                <td style={styles.tableData}>{student.lastMeeting}</td>
                <td style={styles.tableData}>
                  <div style={styles.riskScoreContainer}>
                    <span>{student.riskScore}/100</span>
                    <div
                      style={{
                        ...styles.progressBar,
                        backgroundColor: getRiskScoreColor(student.riskScore),
                        width: `${student.riskScore}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  tableContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
    maxHeight: '620px', // Limiting the height of the container
    overflow: 'hidden', // Prevent overflow from appearing above the header
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
    tableLayout: 'fixed' as 'fixed', // Fixed layout for consistent column width
  },
  scrollableBody: {
    maxHeight: '600px', // Adjust the height to allow for scrolling
    overflowY: 'auto' as 'auto', // Enable vertical scrolling
  },
  headerRow: {
    backgroundColor: '#f3f3f9',
  },
  tableHeader: {
    padding: '10px 20px',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#002D72',
    textAlign: 'left' as 'left',
    borderBottom: '2px solid #ccc',
    position: 'sticky' as 'sticky', // Make header sticky
    top: 0, // Stick to the top when scrolling
    zIndex: 1, // Ensure the header stays on top
    backgroundColor: '#f3f3f9', // Ensure the background color is applied
  },
  tableRow: {
    backgroundColor: '#ffffff',
  },
  tableData: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#002D72',
    borderBottom: '1px solid #e0e0e0',
  },
  riskScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // Space between text and progress bar
  },
  progressBar: {
    height: '12px', // Height of the progress bar
    borderRadius: '5px',
    backgroundColor: '#e0e0e0',
    width: '100%', // Initial width
  },
};

export default StudentsTable;