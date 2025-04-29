import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Collapse, Chip } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Interface pour une tâche individuelle dans une deadline
interface DeadlineItem {
    id: string;
    text: string;
    isDone?: boolean;
}

// Mise à jour de l'interface Deadline
interface Deadline {
    id: string;
    title: string;
    items: DeadlineItem[];
    isWarning?: boolean;
    day: 'Today' | 'Tomorrow';
}

interface DeadlinesSectionProps {
    deadlines: Deadline[];
    onSelectItem: (itemText: string) => void;
    onTaskToggle: (deadlineId: string, itemId: string) => void;
}

// Helper pour calculer les tâches restantes
const countRemainingTasks = (items: DeadlineItem[]): number => {
    return items.filter(item => !item.isDone).length;
};

const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({ deadlines, onSelectItem, onTaskToggle }) => {
    const initialOpenState = deadlines.length === 1 ? { [deadlines[0]?.id]: true } : {};
    const [openDeadlines, setOpenDeadlines] = useState<{ [key: string]: boolean }>(initialOpenState);

    useEffect(() => {
        const onlyOneDeadline = deadlines.length === 1;
        setOpenDeadlines(prev => {
            const newOpenState: { [key: string]: boolean } = {};
            if (onlyOneDeadline && deadlines[0]) {
                newOpenState[deadlines[0].id] = true; 
            } else {
                deadlines.forEach(d => {
                    newOpenState[d.id] = prev[d.id] ?? false; 
                });
            }
            return newOpenState;
        });
    }, [deadlines.length]);

    const handleDeadlineToggle = (id: string) => {
        setOpenDeadlines(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleItemClick = (deadlineId: string, itemId: string, itemText: string) => {
        onTaskToggle(deadlineId, itemId);
        onSelectItem(itemText);
    };

    const deadlinesToday = deadlines.filter(d => d.day === 'Today');
    const deadlinesTomorrow = deadlines.filter(d => d.day === 'Tomorrow');
    const hasDeadlines = deadlines.length > 0;

    return (
        <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Deadlines</Typography>
            {!hasDeadlines ? (
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E0F8E7', p: 1, borderRadius: '8px' }}>
                    <EmojiEmotionsIcon sx={{ mr: 1, color: '#25C35E' }} />
                    <Typography sx={{ fontStyle: 'italic', color: '#006400' }}>Nothing to do just chill</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, alignSelf: 'stretch' }}>
                        {deadlinesToday.length > 0 && <TodayIcon sx={{ color: 'primary.main', mb: 0.5 }} />}
                        <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'primary.main', opacity: 0.5 }}></Box>
                        {deadlinesTomorrow.length > 0 && <EventNoteIcon sx={{ color: 'primary.main', mt: 0.5 }} />}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        {deadlinesToday.length > 0 && (
                            <Box mb={deadlinesTomorrow.length > 0 ? 2 : 0}>
                                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Today</Typography>
                                {deadlinesToday.map((deadline) => {
                                    const remainingTasks = countRemainingTasks(deadline.items);
                                    const isOpen = openDeadlines[deadline.id] ?? false;
                                    const showExpandIcon = deadline.items && deadline.items.length > 0;
                                    const ExpandCollapseIcon = deadlines.length > 1 ? ArrowForwardIosIcon : (isOpen ? ExpandLessIcon : ExpandMoreIcon);

                                    return (
                                        <Box key={deadline.id} sx={{ mb: 1 }}>
                                            <ListItem
                                                sx={{
                                                    p: 1,
                                                    mb: 0.5,
                                                    bgcolor: '#FFF0F0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                                                    {deadline.isWarning && <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5 }}> <WarningAmberIcon color="warning" sx={{ fontSize: '1.1rem' }} /> </ListItemIcon>}
                                                    <ListItemText primary={deadline.title} sx={{ m: 0 }} primaryTypographyProps={{fontWeight: 'medium'}} />
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                    {remainingTasks > 0 && (
                                                        <Chip label={remainingTasks} color="error" size="small" sx={{ height: '18px', fontSize: '0.7rem', fontWeight: 'bold', mr: showExpandIcon ? 0.5 : 0 }} />
                                                    )}
                                                    {showExpandIcon && (
                                                        <IconButton edge="end" size="small" onClick={() => handleDeadlineToggle(deadline.id)} sx={{ p: 0.2 }}>
                                                            <ExpandCollapseIcon sx={{ fontSize: '1.1rem', transform: (deadlines.length > 1 && !isOpen) ? 'rotate(0deg)' : (deadlines.length > 1 && isOpen) ? 'rotate(90deg)' : 'none' }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </ListItem>
                                            {deadline.items && (
                                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding dense sx={{ pl: 1 }}>
                                                        {deadline.items.map((item) => (
                                                            <ListItem
                                                                key={item.id}
                                                                button
                                                                onClick={() => handleItemClick(deadline.id, item.id, item.text)}
                                                                sx={{ pl: 1 }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                                                    {item.isDone ? <CheckCircleOutlineIcon color="disabled" sx={{ fontSize: '1.1rem' }} /> : <RadioButtonUncheckedIcon color="action" sx={{ fontSize: '1.1rem' }} />}
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={item.text}
                                                                    sx={{ textDecoration: item.isDone ? 'line-through' : 'none', color: item.isDone ? 'text.disabled' : 'text.primary' }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                        {deadlinesTomorrow.length > 0 && (
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Tomorrow</Typography>
                                {deadlinesTomorrow.map((deadline) => {
                                    const remainingTasks = countRemainingTasks(deadline.items);
                                    const isOpen = openDeadlines[deadline.id] ?? false;
                                    const showExpandIcon = deadline.items && deadline.items.length > 0;
                                    const ExpandCollapseIcon = deadlines.length > 1 ? ArrowForwardIosIcon : (isOpen ? ExpandLessIcon : ExpandMoreIcon);

                                    if (remainingTasks === 0 && deadline.items.length === 0 && !deadline.isWarning) {
                                        return (
                                            <Box key={deadline.id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E0F8E7', p: 1, borderRadius: '8px' }}>
                                                <EmojiEmotionsIcon sx={{ mr: 1, color: '#25C35E' }} />
                                                <Typography sx={{ fontStyle: 'italic', color: '#006400' }}>{deadline.title}</Typography>
                                            </Box>
                                        );
                                    }

                                    return (
                                        <Box key={deadline.id} sx={{ mb: 1 }}>
                                            <ListItem
                                                sx={{
                                                    p: 1,
                                                    mb: 0.5,
                                                    bgcolor: '#FFF0F0',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                                                    {deadline.isWarning && <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5 }}> <WarningAmberIcon color="warning" sx={{ fontSize: '1.1rem' }} /> </ListItemIcon>}
                                                    <ListItemText primary={deadline.title} sx={{ m: 0 }} primaryTypographyProps={{fontWeight: 'medium'}} />
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                    {remainingTasks > 0 && (
                                                        <Chip label={remainingTasks} color="error" size="small" sx={{ height: '18px', fontSize: '0.7rem', fontWeight: 'bold', mr: showExpandIcon ? 0.5 : 0 }} />
                                                    )}
                                                    {showExpandIcon && (
                                                        <IconButton edge="end" size="small" onClick={() => handleDeadlineToggle(deadline.id)} sx={{ p: 0.2 }}>
                                                            <ExpandCollapseIcon sx={{ fontSize: '1.1rem', transform: (deadlines.length > 1 && !isOpen) ? 'rotate(0deg)' : (deadlines.length > 1 && isOpen) ? 'rotate(90deg)' : 'none' }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </ListItem>
                                            {deadline.items && (
                                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding dense sx={{ pl: 1 }}>
                                                        {deadline.items.map((item) => (
                                                            <ListItem
                                                                key={item.id}
                                                                button
                                                                onClick={() => handleItemClick(deadline.id, item.id, item.text)}
                                                                sx={{ pl: 1 }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                                                    {item.isDone ? <CheckCircleOutlineIcon color="disabled" sx={{ fontSize: '1.1rem' }} /> : <RadioButtonUncheckedIcon color="action" sx={{ fontSize: '1.1rem' }} />}
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={item.text}
                                                                    sx={{ textDecoration: item.isDone ? 'line-through' : 'none', color: item.isDone ? 'text.disabled' : 'text.primary' }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DeadlinesSection; 