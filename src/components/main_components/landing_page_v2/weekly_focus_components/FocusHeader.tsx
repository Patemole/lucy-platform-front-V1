import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FocusHeaderProps {
    dateRange: string;
    focusTitle: string;
    onNextWeek: () => void;
    onPreviousWeek: () => void;
    isFirstWeek: boolean;
    isLastWeek: boolean;
}

const FocusHeader: React.FC<FocusHeaderProps> = ({ 
    dateRange, 
    focusTitle, 
    onNextWeek, 
    onPreviousWeek, 
    isFirstWeek, 
    isLastWeek 
}) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Typography component="h2" sx={{ mb: 0.5, textAlign: 'center', fontSize: '1.1rem' }}>
                Your focus of
            </Typography>
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '320px',
                mb: 1,
            }}>
                <Box sx={{ width: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton 
                        size="small" 
                        onClick={onPreviousWeek} 
                        disabled={isFirstWeek} 
                        sx={{ p: '4px' }}
                    >
                        <ChevronLeftIcon sx={{ color: '#011F5B' }} />
                    </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: 'center' }}>
                    <Typography 
                        component="span" 
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: '2rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.2,
                        }}
                    >
                        {dateRange}
                    </Typography>
                </Box>
                <Box sx={{ width: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton 
                        size="small" 
                        onClick={onNextWeek} 
                        disabled={isLastWeek} 
                        sx={{ p: '4px' }}
                    >
                        <ChevronRightIcon sx={{ color: '#011F5B' }} />
                    </IconButton>
                </Box>
            </Box>
            <Typography component="p" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '1.15rem' }}>
                {focusTitle}
            </Typography>
        </Box>
    );
};

export default FocusHeader; 