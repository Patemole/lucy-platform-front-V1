import React from 'react';
import { Box } from '@mui/material';
import FocusHeader from './weekly_focus_components/FocusHeader';
import DeadlinesSection from './weekly_focus_components/DeadlinesSection';
import UsefulLinksSection from './weekly_focus_components/UsefulLinksSection';
import TryThisSection from './weekly_focus_components/TryThisSection';

// Interface pour une tâche individuelle (copiée/synchronisée depuis DeadlinesSection)
interface DeadlineItem {
    id: string;
    text: string;
    isDone?: boolean;
}

// Mise à jour de l'interface Deadline pour correspondre à celle attendue par DeadlinesSection
interface Deadline {
    id: string;
    title: string;
    items: DeadlineItem[];
    isWarning?: boolean;
    day: 'Today' | 'Tomorrow';
    // count n'est plus nécessaire ici car calculé dans DeadlinesSection
}

interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}

interface TryThis {
    title: string;
    image?: string; // URL de l'image
}

interface WeeklyFocusProps {
    dateRange: string;
    focusTitle: string;
    deadlines: Deadline[]; // Peut être vide
    usefulLinks: UsefulLink[];
    tryThis: TryThis;
    onSelectItem: (itemText: string) => void;
    onNextWeek: () => void;
    onPreviousWeek: () => void;
    onTaskToggle: (deadlineId: string, itemId: string) => void;
    isFirstWeek: boolean;
    isLastWeek: boolean;
}

const WeeklyFocus: React.FC<WeeklyFocusProps> = ({ 
    dateRange, 
    focusTitle, 
    deadlines, 
    usefulLinks, 
    tryThis, 
    onSelectItem,
    onNextWeek,
    onPreviousWeek,
    onTaskToggle,
    isFirstWeek,
    isLastWeek
}) => {
    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FocusHeader 
                dateRange={dateRange} 
                focusTitle={focusTitle} 
                onNextWeek={onNextWeek}
                onPreviousWeek={onPreviousWeek}
                isFirstWeek={isFirstWeek}
                isLastWeek={isLastWeek}
            />
            <DeadlinesSection 
                deadlines={deadlines} 
                onSelectItem={onSelectItem} 
                onTaskToggle={onTaskToggle}
            />
            <UsefulLinksSection usefulLinks={usefulLinks} />
            <TryThisSection tryThis={tryThis} />
        </Box>
    );
};

export default WeeklyFocus; 