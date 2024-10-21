import React from 'react';
import { FaHome, FaComments, FaUserCircle, FaUsers } from 'react-icons/fa'; // Added FaUsers for the students page
import { useNavigate, useLocation } from 'react-router-dom'; // Used for navigation
import { useTheme } from '@mui/material/styles';

import logo_greg from '../student_face.png'; // Student profile image

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // To know which page is active
    const theme = useTheme();

    // Check if the current page is active
    const isActive = (path: string) => location.pathname === path;

    // Get the uid from localStorage
    const userID = localStorage.getItem('userID');

    return (
        <div
            style={{
                width: '75px', // Adjusted width
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 0',
                height: '100vh',
                borderRight: '2px solid #e0e0e0', // Vertical divider added
            }}
        >
            {/* University Logo */}
            <div style={{ marginBottom: '20px' }}>
                <img
                    src={theme.logo} // Ensure this logo is correctly imported
                    alt="University Logo"
                    style={{ width: '60px', height: 'auto', objectFit: 'contain' }} // Correct size and fit
                />
            </div>

            {/* Navigation Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Home Icon */}
                <div
                    style={{
                        ...styles.iconContainer,
                        backgroundColor: isActive('/dashboard') ? '#EBE2FC' : '#f3f3f9', // Violet background for active page
                    }}
                    onClick={() => navigate(`/dashboard/academic-advisor/${userID}`)} // Navigate to user profile
                >
                    <FaHome style={styles.iconStyle} />
                </div>

                {/* Chat Icon */}
                <div
                    style={{
                        ...styles.iconContainer,
                        backgroundColor: isActive(`/dashboard/student/${userID}`) ? '#EBE2FC' : '#f3f3f9', // Violet background if active
                    }}
                    onClick={() => navigate(`/dashboard/academic-advisor/chat/${userID}`)} // Navigate to student dashboard
                >
                    <FaComments style={styles.iconStyle} />
                </div>

                {/* Students Icon */}
                <div
                    style={{
                        ...styles.iconContainer,
                        backgroundColor: isActive('/students') ? '#EBE2FC' : '#f3f3f9', // Violet background for active page
                    }}
                    onClick={() => navigate(`/dashboard/academic-advisor/all_profile/${userID}`)} // Navigate to all profiles
                >
                    <FaUsers style={styles.iconStyle} />
                </div>
            </div>

            {/* Student Icon at the bottom */}
            <div
                style={{ marginTop: 'auto', paddingBottom: '20px' }}
                onClick={() => navigate(`/dashboard/academic-advisor/${userID}`)} // Navigate to user profile when clicking the profile image
            >
                <img
                    src={logo_greg}
                    alt="Student Profile"
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover', // Ensure image fills the container properly
                        cursor: 'pointer',
                    }}
                />
            </div>
        </div>
    );
};

// Inline styles for icon and container
const styles = {
    iconContainer: {
        margin: '15px 0',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50px', // Reduced size
        height: '50px', // Reduced size
        borderRadius: '12px',
    },
    iconStyle: {
        fontSize: '20px', // Reduced icon size
        color: '#0a0a0a',
    },
};

export default Sidebar;