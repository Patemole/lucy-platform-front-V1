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
                backgroundColor: '#f7f7f7',
                padding: 3,
                color: '#333',
            }}
        >
            <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                sx={{ fontSize: '6rem', color: '#ff6f61', fontWeight: 'bold' }}
            >
                404
            </Typography>
            <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 'medium', color: '#555' }}
            >
                Uh-oh! We lost this page.
            </Typography>
            <Typography 
                variant="body1" 
                sx={{ maxWidth: '500px', color: '#777', marginBottom: 3 }}
            >
                It seems this page wandered off. Maybe it’s in the fridge, or it could be hiding under the couch cushions. Either way, let's get you back on track!
            </Typography>
            <Box
                component="img"
                src="https://source.unsplash.com/200x200/?cat" // Funny random cat image from Unsplash as a placeholder
                alt="Lost Cat"
                sx={{
                    borderRadius: '50%',
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                    marginBottom: 3,
                }}
            />
            <Button 
                variant="contained" 
                onClick={goHome}
                sx={{
                    backgroundColor: '#ff6f61',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    paddingX: 3,
                    paddingY: 1,
                    marginTop: 2,
                    '&:hover': {
                        backgroundColor: '#ff3d3d',
                        transform: 'scale(1.05)',
                        transition: 'all 0.3s ease-in-out',
                    },
                }}
            >
                Take Me Home!
            </Button>
            <Typography 
                variant="caption" 
                sx={{ marginTop: 2, color: '#999' }}
            >
                (Or just try the back button, if that's more your style.)
            </Typography>
        </Box>
    );
};

export default NotFound;