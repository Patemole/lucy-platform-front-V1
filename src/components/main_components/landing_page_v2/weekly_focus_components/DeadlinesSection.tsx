import React, { useState, useEffect } from 'react';
import {
    Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Collapse, Chip, Divider
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Importer les interfaces depuis le fichier central
import { Deadline, DeadlineItem } from '../initialWeeklyData'; 
// Importer la fonction de calcul depuis le hook (même si on n'utilise pas le hook lui-même ici)
import { calculateDeadlineDisplayDate } from '../hooks/useDeadlineDisplay';

// Supprimer les définitions locales des interfaces Deadline et DeadlineItem
/*
interface DeadlineItem {
    id: string;
    text: string;
    isDone?: boolean;
}
interface Deadline {
    id: string;
    title: string;
    items: DeadlineItem[];
    isWarning?: boolean;
    day: 'Today' | 'Tomorrow'; // <- Cette ancienne définition est supprimée
}
*/

interface DeadlinesSectionProps {
    deadlines: Deadline[]; // Utilise l'interface importée
    onSelectItem: (itemText: string) => void;
    onTaskToggle: (deadlineId: string, itemId: string) => void;
}

// Helper pour calculer les tâches restantes (inchangé)
const countRemainingTasks = (items: DeadlineItem[] | undefined): number => {
    return Array.isArray(items) ? items.filter(item => !item.isDone).length : 0;
};

// Helper pour vérifier si toutes les tâches d'une deadline sont complètes (inchangé)
const isDeadlineComplete = (deadline: Deadline): boolean => {
    return Array.isArray(deadline.items) && deadline.items.length > 0 && deadline.items.every(item => item.isDone);
};

const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({ deadlines, onSelectItem, onTaskToggle }) => {
    const initialOpenState = deadlines.length === 1 ? { [deadlines[0]?.id]: true } : {};
    const [openDeadlines, setOpenDeadlines] = useState<{ [key: string]: boolean }>(initialOpenState);

    useEffect(() => {
        // Logique pour gérer l'état ouvert (peut être simplifiée mais laissée telle quelle pour l'instant)
        const onlyOneDeadline = deadlines.length === 1;
        setOpenDeadlines(prev => {
            const newOpenState: { [key: string]: boolean } = {};
            if (onlyOneDeadline && deadlines[0]) {
                newOpenState[deadlines[0].id] = true; 
            } else {
                deadlines.forEach(d => {
                    newOpenState[d.id] = prev[d.id] ?? false; // Par défaut non ouvert si plusieurs
                });
            }
            // Si aucune n'est ouverte et qu'il y en a, ouvrir la première?
            // if (Object.values(newOpenState).every(v => !v) && deadlines.length > 0) {
            //     newOpenState[deadlines[0].id] = true;
            // }
            return newOpenState;
        });
    }, [deadlines]);

    const handleDeadlineToggle = (id: string) => {
        setOpenDeadlines(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleItemClick = (deadlineId: string, itemId: string, itemText: string) => {
        onTaskToggle(deadlineId, itemId);
        onSelectItem(itemText); // Sélectionner l'item cliqué
    };

    // Filtrer les deadlines en utilisant la nouvelle fonction
    const now = new Date(); // Utiliser la date actuelle comme référence
    const deadlinesToday = deadlines.filter(d => calculateDeadlineDisplayDate(d, now) === 'Today');
    const deadlinesTomorrow = deadlines.filter(d => calculateDeadlineDisplayDate(d, now) === 'Tomorrow');
    const deadlinesOther = deadlines.filter(d => 
        calculateDeadlineDisplayDate(d, now) !== 'Today' && calculateDeadlineDisplayDate(d, now) !== 'Tomorrow'
    );

    const hasToday = deadlinesToday.length > 0;
    const hasTomorrow = deadlinesTomorrow.length > 0;
    const hasOther = deadlinesOther.length > 0;
    const hasAnyDeadlines = deadlines.length > 0;

    // --- Déterminer les groupes visibles et leur ordre --- 
    const visibleGroupOrder: ('Today' | 'Other' | 'Tomorrow')[] = [];
    if (hasToday) visibleGroupOrder.push('Today');
    if (hasOther) visibleGroupOrder.push('Other');
    if (hasTomorrow) visibleGroupOrder.push('Tomorrow');

    const firstVisibleGroup = visibleGroupOrder[0];
    const lastVisibleGroup = visibleGroupOrder[visibleGroupOrder.length - 1];
    const numberOfVisibleGroups = visibleGroupOrder.length;
    const otherIsIntermediate = hasToday && hasOther && hasTomorrow;

    // --- Fonction pour rendre une Deadline (style liste - inchangée) --- 
    const renderDeadlineItem = (deadline: Deadline, isFirstOfGroup: boolean = false) => {
        const remainingTasks = countRemainingTasks(deadline.items);
        const isComplete = isDeadlineComplete(deadline);
        const isOpen = openDeadlines[deadline.id] ?? false;
        const showExpandIcon = Array.isArray(deadline.items) && deadline.items.length > 0;
        const ExpandCollapseIcon = deadlines.length > 1 ? ArrowForwardIosIcon : (isOpen ? ExpandLessIcon : ExpandMoreIcon);

        // Gestion spécifique pour les items vides "chill" (adapté de l'ancien code)
        if (!isComplete && remainingTasks === 0 && deadline.items?.length === 0 && !deadline.isWarning && deadline.day === 'Tomorrow') {
            return (
                <Box key={deadline.id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E0F8E7', p: 1, borderRadius: '8px', mb:1 }}>
                    <EmojiEmotionsIcon sx={{ mr: 1, color: '#25C35E' }} />
                    <Typography sx={{ fontStyle: 'italic', color: '#006400' }}>{deadline.title}</Typography>
                </Box>
            );
        }

        return (
            <Box key={deadline.id} sx={{ mt: isFirstOfGroup ? 0 : 1 }}> {/* Ajoute de l'espace sauf pour le premier item du groupe */} 
                <ListItem
                    button
                    onClick={() => showExpandIcon ? handleDeadlineToggle(deadline.id) : undefined}
                    sx={{
                        p: 1,
                        mb: 0.5,
                        bgcolor: isComplete ? '#E6F4EA' : deadline.isWarning ? '#FFF8E1' : '#FFF0F0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: showExpandIcon ? 'pointer' : 'default',
                        '&:hover': {
                            bgcolor: showExpandIcon ? (isComplete ? '#D9EDE2' : deadline.isWarning ? '#FFF3CD' : '#FEE8E8') : undefined
                        }
                    }}
                >
                     <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5 }}>
                            {isComplete ? 
                                <CheckCircleIcon sx={{ fontSize: '1.1rem', color: '#25C35E' }} /> 
                                : deadline.isWarning ? 
                                <WarningAmberIcon color="warning" sx={{ fontSize: '1.1rem' }} /> 
                                : <Box sx={{ width: '1.1rem' }} />
                            }
                        </ListItemIcon>
                        <ListItemText primary={deadline.title} sx={{ m: 0 }} primaryTypographyProps={{fontWeight: 'medium'}} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {!isComplete && remainingTasks > 0 && (
                            <Chip label={remainingTasks} color="error" size="small" sx={{ height: '18px', fontSize: '0.7rem', fontWeight: 'bold', mr: showExpandIcon ? 0.5 : 0 }} />
                        )}
                        {showExpandIcon && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeadlineToggle(deadline.id); }} sx={{ p: 0, ml: 0.5 }}>
                                <ExpandCollapseIcon sx={{ fontSize: '1.1rem', transform: (deadlines.length > 1 && !isOpen) ? 'rotate(0deg)' : (deadlines.length > 1 && isOpen) ? 'rotate(90deg)' : 'none' }} />
                            </IconButton>
                        )}
                    </Box>
                </ListItem>
                {Array.isArray(deadline.items) && deadline.items.length > 0 && (
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
                                        {item.isDone ? <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1.1rem' }} /> : <RadioButtonUncheckedIcon color="action" sx={{ fontSize: '1.1rem' }} />}
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
    }

    // --- Rendu Principal --- 
    return (
        <Box sx={{ width: '100%', maxWidth: 480, mb: 4 }}> 
            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                Deadlines
            </Typography>

            {!hasAnyDeadlines ? (
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E0F8E7', p: 1, borderRadius: '8px', mt: 1 }}>
                    <EmojiEmotionsIcon sx={{ mr: 1, color: '#25C35E' }} />
                    <Typography sx={{ fontStyle: 'italic', color: '#006400' }}>Nothing to do just chill</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex' }}>
                    {/* Colonne Icônes/Points/Ligne (logique mise à jour) */} 
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, mt: 0.5 }}>
                       {/* Icône du Haut (basée sur firstVisibleGroup) */} 
                       {firstVisibleGroup === 'Today' && <TodayIcon sx={{ color: 'primary.main' }} />} 
                       {firstVisibleGroup === 'Other' && <FiberManualRecordIcon sx={{ color: 'grey.500', fontSize: 'small' }}/>} 
                       {firstVisibleGroup === 'Tomorrow' && <EventNoteIcon sx={{ color: 'primary.main' }} />} 
                       
                       {/* Ligne et points intermédiaires (si plus d'un groupe) */} 
                       {numberOfVisibleGroups > 1 && (
                           <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'primary.light', my: 0.5, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                               {/* Point intermédiaire seulement si Other est entre Today et Tomorrow */} 
                               {otherIsIntermediate && ( 
                                   <FiberManualRecordIcon sx={{ color: 'grey.500', fontSize: 'small', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', borderRadius: '50%' }}/>
                               )}
                               {/* Ligne elle-même */} 
                           </Box>
                       )}

                       {/* Icône du Bas (basée sur lastVisibleGroup, si > 1 groupe) */} 
                       {numberOfVisibleGroups > 1 && (
                           <> {/* Fragment pour conditionner l'affichage */} 
                              {lastVisibleGroup === 'Today' && <TodayIcon sx={{ color: 'primary.main' }} />} 
                              {lastVisibleGroup === 'Other' && <FiberManualRecordIcon sx={{ color: 'grey.500', fontSize: 'small' }}/>} 
                              {lastVisibleGroup === 'Tomorrow' && <EventNoteIcon sx={{ color: 'primary.main' }} />} 
                           </>
                       )}
                    </Box>

                    {/* Colonne Contenu (logique mise à jour) */} 
                    <Box sx={{ flexGrow: 1 }}>
                        {/* Section Today */} 
                        {hasToday && (
                             <Box mb={visibleGroupOrder.indexOf('Today') < numberOfVisibleGroups - 1 ? 2 : 0}> {/* Espace si ce n'est pas le dernier groupe */} 
                                 {/* Titre Harcodé Supprimé */}
                                 {deadlinesToday.map((deadline, index) => renderDeadlineItem(deadline, index === 0))}
                             </Box>
                         )}
                         
                         {/* Section Other */} 
                         {hasOther && (
                             <Box mb={visibleGroupOrder.indexOf('Other') < numberOfVisibleGroups - 1 ? 2 : 0}> {/* Espace si ce n'est pas le dernier groupe */} 
                                 {/* Afficher chaque groupe 'Other' avec son titre */} 
                                 {deadlinesOther.map((deadline, index) => (
                                     // Utiliser une clé unique pour le Box de chaque groupe de date 'Other'
                                     <Box key={`other-group-${deadline.day}-${index}`} mt={index > 0 || (index === 0 && hasToday) ? 2 : 0}> 
                                         <Typography sx={{ fontWeight: 'bold', mb: 1 }}>{deadline.day}</Typography>
                                         {/* Correction : Appeler renderDeadlineItem directement */} 
                                         {renderDeadlineItem(deadline, true)} 
                                     </Box>
                                 ))}
                             </Box>
                         )}

                        {/* Section Tomorrow */} 
                        {hasTomorrow && (
                             <Box> {/* Pas d'espace en bas car c'est potentiellement le dernier */} 
                                  {/* Titre Harcodé Supprimé */}
                                 {deadlinesTomorrow.map((deadline, index) => renderDeadlineItem(deadline, index === 0))}
                             </Box>
                         )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DeadlinesSection; 