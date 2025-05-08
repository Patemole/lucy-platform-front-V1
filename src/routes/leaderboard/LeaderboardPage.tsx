import React from 'react';
import useAmbassadorLeaderboard, { UseAmbassadorLeaderboardReturn, AmbassadorStat } from './useAmbassadorLeaderboard';
import {
    CircularProgress,
    Alert,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Box,
    Stack,
    Avatar // For potential icons or ranking display
} from '@mui/material';
import { StarBorder } from '@mui/icons-material'; // Example icon for top performer

// Helper to format date range
const formatDateRange = (range: UseAmbassadorLeaderboardReturn['currentWeekDateRange']) => {
    if (!range) return 'Loading week...'; // Changed placeholder text
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${range.startOfWeek.toLocaleDateString(undefined, options)} - ${range.endOfWeek.toLocaleDateString(undefined, options)}`;
};

const LeaderboardPage: React.FC = () => {
    const {
        leaderboardData,
        isLoading,
        error,
        goToPreviousWeek,
        goToNextWeek,
        weekOffset,
        currentWeekDateRange
    } = useAmbassadorLeaderboard();

    // Determine the top performer for the current week (if data is available and not loading)
    const topPerformerId = (!isLoading && leaderboardData.length > 0) ? leaderboardData[0].id : null;

    if (isLoading && !currentWeekDateRange) {
        return (
            <Paper 
                sx={{
                    textAlign: 'center',
                    padding: (theme: Theme) => theme.spacing(5),
                    margin: (theme: Theme) => theme.spacing(2),
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <CircularProgress />
                <Typography variant="h6" sx={{ marginTop: (theme: Theme) => theme.spacing(2)}}>Loading Ambassador Leaderboard...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ margin: (theme: Theme) => theme.spacing(2), padding: (theme: Theme) => theme.spacing(3) }}>
                <Alert severity="error" sx={{ fontSize: '1.1rem' }}>
                    <strong>Error loading leaderboard:</strong> {error.message}
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper sx={{ margin: (theme: Theme) => theme.spacing(2, 'auto'), padding: (theme: Theme) => theme.spacing(3), maxWidth: '1000px' }}>
            <Box sx={{ textAlign: 'center', marginBottom: (theme: Theme) => theme.spacing(3) }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ fontWeight: 'bold'}}
                >
                    Ambassador Leaderboard
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ marginTop: (theme: Theme) => theme.spacing(2)}}>
                    <Button onClick={goToPreviousWeek} variant="outlined" disabled={isLoading} size="large">
                        Previous Week
                    </Button>
                    <Typography variant="h6" component="div" sx={{ minWidth: '320px', textAlign: 'center', color: 'text.secondary' }}>
                        {formatDateRange(currentWeekDateRange)}
                    </Typography>
                    <Button onClick={goToNextWeek} variant="outlined" disabled={weekOffset === 0 || isLoading} size="large">
                        Next Week
                    </Button>
                </Stack>
            </Box>
            
            {isLoading && (
                <Box sx={{ textAlign: 'center', paddingY: (theme: Theme) => theme.spacing(4)}}>
                     <CircularProgress /> 
                     <Typography variant="subtitle1" display="block" sx={{marginTop: 2, color: 'text.secondary'}}>Updating week...</Typography>
                </Box>
            )}
            
            {!isLoading && leaderboardData.length === 0 ? (
                <Box sx={{ textAlign: 'center', marginY: (theme: Theme) => theme.spacing(5), padding: (theme: Theme) => theme.spacing(3) }}>
                    <Typography variant="h5" color="text.secondary">No sign-ups recorded for this week.</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ marginTop: (theme: Theme) => theme.spacing(1) }}>
                    <Table sx={{ minWidth: 650 }} aria-label="ambassador leaderboard">
                        <TableHead sx={{ backgroundColor: (theme: Theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800] }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', paddingLeft: '24px' }}>Rank</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Ambassador Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Referral Code</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Sign-ups</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem', paddingRight: '24px' }}>Sign-ups (Selected Week)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboardData.map((ambassador: AmbassadorStat, index: number) => (
                                <TableRow
                                    key={ambassador.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        opacity: isLoading ? 0.6 : 1,
                                        transition: 'opacity 0.3s ease-in-out',
                                        backgroundColor: ambassador.id === topPerformerId && ambassador.weeklySignUps > 0 ? (theme: Theme) => theme.palette.action.hover : 'inherit'
                                    }}
                                >
                                    <TableCell sx={{ paddingLeft: '24px', width: '80px' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{index + 1}</Typography>
                                            {ambassador.id === topPerformerId && ambassador.weeklySignUps > 0 && <StarBorder color="warning" />}
                                        </Stack>
                                    </TableCell>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', fontSize: '1rem' }}>
                                        {ambassador.name}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: '0.95rem' }}>{ambassador.referralCode}</TableCell>
                                    <TableCell align="right" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>{ambassador.totalSignUps}</TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', paddingRight: '24px' }}>{ambassador.weeklySignUps}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default LeaderboardPage; 