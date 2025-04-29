import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Copié depuis WeeklyFocus.tsx - Idéalement, ce type pourrait être dans un fichier partagé
interface TryThis {
    title: string;
    image?: string;
}

interface TryThisSectionProps {
    tryThis: TryThis;
}

const TryThisSection: React.FC<TryThisSectionProps> = ({ tryThis }) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, width: '100%', maxWidth: { xs: '85%', sm: 250 }, textAlign: 'left' }}>Try this</Typography>
            <Paper
                variant="outlined"
                sx={{
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: { xs: '85%', sm: 250 },
                    height: 200,
                    bgcolor: 'grey.200',
                    textAlign: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {tryThis.image && (
                    <Box
                        component="img"
                        src={tryThis.image}
                        alt={tryThis.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1,
                        }}
                    />
                )}
                <Box sx={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    p: 1,
                    mt: 'auto'
                }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: '500' }}>
                        {tryThis.title}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default TryThisSection; 