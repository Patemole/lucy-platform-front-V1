// Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from '../components/SidebarDashboard'; // Sidebar component
import HeaderDashboard from '../components/HeaderDashboard'; // Header component
import HeaderAlStudents from '../components/HeaderDashboardAllStudents'; // Header for all students page
import SearchBar from '../components/SearchBar'; // Search bar component
import StudentsTable from '../components/StudentsTable'; // Students table component

interface Student {
    id: string;
    name: string;
    major: string;
    gpa: number;
    email: string;
    lastMeeting: string; // Utilisation de 'lastMeetingDate' au lieu de 'lastMeeting'
    riskScore: number;   // Risk score as a percentage (0-100)
}

const Dashboard: React.FC = () => {
    // Sample data for the table
    const [students, setStudents] = useState<Student[]>([
        { id: 'A1B2C3D4E5', name: 'John Doe', major: 'Computer Science', gpa: 3.8, email: 'john.doe@upenn.edu', lastMeeting: '2024-01-10', riskScore: 87 },
        { id: 'F6G7H8I9J0', name: 'Jane Smith', major: 'Mathematics', gpa: 3.9, email: 'jane.smith@upenn.edu', lastMeeting: '2024-01-12', riskScore: 10 },
        { id: 'K1L2M3N4O5', name: 'Michael Brown', major: 'Physics', gpa: 3.5, email: 'michael.brown@upenn.edu', lastMeeting: '2024-01-15', riskScore: 32 },
        { id: 'P6Q7R8S9T0', name: 'Sarah Johnson', major: 'Biology', gpa: 3.7, email: 'sarah.johnson@upenn.edu', lastMeeting: '2024-01-20', riskScore: 78 },
        { id: 'U1V2W3X4Y5', name: 'William Lee', major: 'Chemistry', gpa: 3.6, email: 'william.lee@upenn.edu', lastMeeting: '2024-01-18', riskScore: 76 },
        { id: 'Z6A7B8C9D0', name: 'Emily Davis', major: 'Philosophy', gpa: 3.4, email: 'emily.davis@upenn.edu', lastMeeting: '2024-01-16', riskScore: 20 },
        { id: 'E1F2G3H4I5', name: 'Matthew Garcia', major: 'History', gpa: 3.2, email: 'matthew.garcia@upenn.edu', lastMeeting: '2024-01-21', riskScore: 64 },
        { id: 'J6K7L8M9N0', name: 'Olivia Wilson', major: 'Sociology', gpa: 3.9, email: 'olivia.wilson@upenn.edu', lastMeeting: '2024-01-25', riskScore: 84 },
        { id: 'O1P2Q3R4S5', name: 'David Anderson', major: 'Economics', gpa: 3.8, email: 'david.anderson@upenn.edu', lastMeeting: '2024-01-22', riskScore: 79 },
        { id: 'T6U7V8W9X0', name: 'Sophia Martinez', major: 'Political Science', gpa: 3.5, email: 'sophia.martinez@upenn.edu', lastMeeting: '2024-01-14', riskScore: 70 },
        { id: 'Y1Z2A3B4C5', name: 'James Thomas', major: 'Mechanical Engineering', gpa: 3.3, email: 'james.thomas@upenn.edu', lastMeeting: '2024-01-13', riskScore: 9 },
        { id: 'D6E7F8G9H0', name: 'Ava Hernandez', major: 'Electrical Engineering', gpa: 3.7, email: 'ava.hernandez@upenn.edu', lastMeeting: '2024-01-19', riskScore: 72 },
        { id: 'I1J2K3L4M5', name: 'Christopher Moore', major: 'Psychology', gpa: 3.6, email: 'christopher.moore@upenn.edu', lastMeeting: '2024-01-23', riskScore: 81 },
        { id: 'N6O7P8Q9R0', name: 'Mia Martin', major: 'Civil Engineering', gpa: 3.5, email: 'mia.martin@upenn.edu', lastMeeting: '2024-01-17', riskScore: 18 },
        { id: 'S1T2U3V4W5', name: 'Alexander White', major: 'Environmental Science', gpa: 3.4, email: 'alexander.white@upenn.edu', lastMeeting: '2024-01-24', riskScore: 77 },
        { id: 'X6Y7Z8A9B0', name: 'Isabella Taylor', major: 'Fine Arts', gpa: 3.8, email: 'isabella.taylor@upenn.edu', lastMeeting: '2024-01-11', riskScore: 85 },
        { id: 'C1D2E3F4G5', name: 'Daniel Harris', major: 'Music', gpa: 3.2, email: 'daniel.harris@upenn.edu', lastMeeting: '2024-01-10', riskScore: 60 },
        { id: 'H6I7J8K9L0', name: 'Emma King', major: 'Nursing', gpa: 3.9, email: 'emma.king@upenn.edu', lastMeeting: '2024-01-26', riskScore: 89 },
        { id: 'M1N2O3P4Q5', name: 'Benjamin Lewis', major: 'Statistics', gpa: 3.6, email: 'benjamin.lewis@upenn.edu', lastMeeting: '2024-01-29', riskScore: 30 },
        { id: 'R6S7T8U9V0', name: 'Amelia Scott', major: 'Anthropology', gpa: 3.5, email: 'amelia.scott@upenn.edu', lastMeeting: '2024-01-27', riskScore: 68 },
        { id: 'W1X2Y3Z4A5', name: 'Henry Young', major: 'Mathematics', gpa: 3.7, email: 'henry.young@upenn.edu', lastMeeting: '2024-01-15', riskScore: 75 },
        { id: 'B6C7D8E9F0', name: 'Evelyn Walker', major: 'Physics', gpa: 3.8, email: 'evelyn.walker@upenn.edu', lastMeeting: '2024-01-18', riskScore: 84 },
        { id: 'G1H2I3J4K5', name: 'Jackson Hall', major: 'Linguistics', gpa: 3.5, email: 'jackson.hall@upenn.edu', lastMeeting: '2024-01-28', riskScore: 45 },
        { id: 'L6M7N8O9P0', name: 'Abigail Allen', major: 'Marketing', gpa: 3.6, email: 'abigail.allen@upenn.edu', lastMeeting: '2024-01-13', riskScore: 77 },
        { id: 'Q1R2S3T4U5', name: 'Liam Wright', major: 'Finance', gpa: 3.9, email: 'liam.wright@upenn.edu', lastMeeting: '2024-01-12', riskScore: 88 },
        { id: 'V6W7X8Y9Z0', name: 'Emily Green', major: 'Business Administration', gpa: 3.4, email: 'emily.green@upenn.edu', lastMeeting: '2024-01-30', riskScore: 70 },
        { id: 'A1B2C3D4E6', name: 'Oliver Adams', major: 'Graphic Design', gpa: 3.3, email: 'oliver.adams@upenn.edu', lastMeeting: '2024-01-20', riskScore: 64 },
        { id: 'F6G7H8I9J1', name: 'Charlotte Nelson', major: 'Public Health', gpa: 3.7, email: 'charlotte.nelson@upenn.edu', lastMeeting: '2024-01-17', riskScore: 82 },
        { id: 'K1L2M3N4O6', name: 'Elijah Baker', major: 'Architecture', gpa: 3.8, email: 'elijah.baker@upenn.edu', lastMeeting: '2024-01-22', riskScore: 34 },
        { id: 'P6Q7R8S9T1', name: 'Harper Carter', major: 'International Relations', gpa: 3.6, email: 'harper.carter@upenn.edu', lastMeeting: '2024-01-19', riskScore: 80 },
        { id: 'U1V2W3X4Y6', name: 'Lucas Hill', major: 'Psychology', gpa: 3.5, email: 'lucas.hill@upenn.edu', lastMeeting: '2024-01-25', riskScore: 74 },
        { id: 'Z6A7B8C9D1', name: 'Sophie Collins', major: 'Biology', gpa: 3.8, email: 'sophie.collins@upenn.edu', lastMeeting: '2024-01-11', riskScore: 2 },
        { id: 'E1F2G3H4I6', name: 'Aiden Rivera', major: 'Anthropology', gpa: 3.9, email: 'aiden.rivera@upenn.edu', lastMeeting: '2024-01-29', riskScore: 89 },
        { id: 'J6K7L8M9N1', name: 'Aubrey Cox', major: 'Sociology', gpa: 3.7, email: 'aubrey.cox@upenn.edu', lastMeeting: '2024-01-27', riskScore: 78 },
        { id: 'O1P2Q3R4S6', name: 'Ella Evans', major: 'Biochemistry', gpa: 3.6, email: 'ella.evans@upenn.edu', lastMeeting: '2024-01-30', riskScore: 77 },
        { id: 'T6U7V8W9X1', name: 'Caleb Turner', major: 'Physics', gpa: 3.4, email: 'caleb.turner@upenn.edu', lastMeeting: '2024-01-26', riskScore: 70 },
        { id: 'Y1Z2A3B4C6', name: 'Grace Parker', major: 'History', gpa: 3.8, email: 'grace.parker@upenn.edu', lastMeeting: '2024-01-16', riskScore: 84 },
        { id: 'D6E7F8G9H1', name: 'Logan Morris', major: 'Economics', gpa: 3.5, email: 'logan.morris@upenn.edu', lastMeeting: '2024-01-15', riskScore: 75 },
        { id: 'I1J2K3L4M6', name: 'Zoe Reed', major: 'Political Science', gpa: 3.6, email: 'zoe.reed@upenn.edu', lastMeeting: '2024-01-14', riskScore: 78 },
        { id: 'N6O7P8Q9R1', name: 'Sebastian Wood', major: 'Chemistry', gpa: 3.7, email: 'sebastian.wood@upenn.edu', lastMeeting: '2024-01-12', riskScore: 16 },
        { id: 'S1T2U3V4W6', name: 'Hannah Jenkins', major: 'Mechanical Engineering', gpa: 3.4, email: 'hannah.jenkins@upenn.edu', lastMeeting: '2024-01-13', riskScore: 28 },
        { id: 'X6Y7Z8A9B1', name: 'Nathan Wright', major: 'Philosophy', gpa: 3.8, email: 'nathan.wright@upenn.edu', lastMeeting: '2024-01-20', riskScore: 85 },
        { id: 'C1D2E3F4G6', name: 'Lily Brooks', major: 'Psychology', gpa: 3.7, email: 'lily.brooks@upenn.edu', lastMeeting: '2024-01-23', riskScore: 79 },
        { id: 'H6I7J8K9L1', name: 'Isaac Bennett', major: 'Economics', gpa: 3.6, email: 'isaac.bennett@upenn.edu', lastMeeting: '2024-01-17', riskScore: 74 },
        { id: 'M1N2O3P4Q6', name: 'Madison Howard', major: 'Sociology', gpa: 3.9, email: 'madison.howard@upenn.edu', lastMeeting: '2024-01-22', riskScore: 47 },
        { id: 'R6S7T8U9V1', name: 'Samuel Gray', major: 'Business Administration', gpa: 3.5, email: 'samuel.gray@upenn.edu', lastMeeting: '2024-01-25', riskScore: 71 },
        { id: 'W1X2Y3Z4A6', name: 'Victoria Russell', major: 'Nursing', gpa: 3.8, email: 'victoria.russell@upenn.edu', lastMeeting: '2024-01-29', riskScore: 80 },
        { id: 'B6C7D8E9F1', name: 'Noah Campbell', major: 'Political Science', gpa: 3.7, email: 'noah.campbell@upenn.edu', lastMeeting: '2024-01-18', riskScore: 79 },
        { id: 'G1H2I3J4K6', name: 'Scarlett Foster', major: 'Mathematics', gpa: 3.9, email: 'scarlett.foster@upenn.edu', lastMeeting: '2024-01-14', riskScore: 58 },
        { id: 'L6M7N8O9P1', name: 'Jack Edwards', major: 'Environmental Science', gpa: 3.5, email: 'jack.edwards@upenn.edu', lastMeeting: '2024-01-28', riskScore: 70 },
    ]); 

    const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

    // Handle search input to filter students by name
    const handleSearch = (query: string) => {
        const filtered = students.filter((student) =>
            student.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredStudents(filtered);
    };

    return (
        
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <HeaderAlStudents />

                {/* Main content: Search Bar and Students Table */}
                <div style={styles.content}>
                    <SearchBar onSearch={handleSearch} />  {/* Search bar at the top */}
                    <StudentsTable students={filteredStudents} />  {/* Students table below */}
                </div>
            </div>
        </div>
    );
};

// Inline styles for the main content
const styles = {
    content: {
        padding: '20px',
        //backgroundColor: '#fff',  // White background for content
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Box shadow for the content
        margin: '20px',
        flexGrow: 1,
        boxSizing: 'border-box' as 'border-box',
    },
};

export default Dashboard;