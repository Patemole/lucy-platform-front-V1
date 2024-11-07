import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center',
                backgroundColor: '#f0f0f0',
                padding: 3
            }}
        >
            <Typography variant="h1" component="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
                Page not found
            </Typography>
            <Typography variant="body1" gutterBottom>
                Oops! The page you're looking for doesn't exist.
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/auth/sign-up')}
                sx={{ marginTop: 2 }}
            >
                Go back to Home
            </Button>
        </Box>
    );
};

export default NotFound;