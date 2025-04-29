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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton size="small" onClick={onPreviousWeek} disabled={isFirstWeek}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography component="span" sx={{ fontWeight: 'bold', mx: 2, fontSize: '2rem' }}>
                    {dateRange}
                </Typography>
                <IconButton size="small" onClick={onNextWeek} disabled={isLastWeek}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            <Typography component="p" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '1.15rem' }}>
                {focusTitle}
            </Typography>
        </Box>
    );
};

export default FocusHeader; 