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
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                Your focus of
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton size="small" onClick={onPreviousWeek} disabled={isFirstWeek}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', mx: 2 }}>
                    {dateRange}
                </Typography>
                <IconButton size="small" onClick={onNextWeek} disabled={isLastWeek}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {focusTitle}
            </Typography>
        </Box>
    );
};

export default FocusHeader; 