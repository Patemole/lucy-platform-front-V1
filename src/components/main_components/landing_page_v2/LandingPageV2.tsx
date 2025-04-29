import React, { useState, useMemo } from 'react';
import ProgressBar from './ProgressBar';
import WeeklyFocus from './WeeklyFocus';
import InputArea from './InputArea';
import { Box } from '@mui/material';

// Interfaces (pourraient être dans un fichier partagé)
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
    day: 'Today' | 'Tomorrow';
}
interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}
interface TryThis {
    title: string;
    image?: string;
}
interface WeeklyData {
    dateRange: string;
    focusTitle: string;
    deadlines: Deadline[];
    usefulLinks: UsefulLink[];
    tryThis: TryThis;
    currentMonth: string; // Peut être utile pour la progress bar
}

interface LandingPageV2Props {
    onSend: (message: string) => void;
    userUniversity: string | null | undefined;
}

// --- Fake Data pour plusieurs semaines ---
// On utilise ceci comme état initial, il sera mis à jour
const initialAllWeeksData: WeeklyData[] = [
    { // Semaine 1: April 15-21
        currentMonth: 'April',
        dateRange: 'April 15-21',
        focusTitle: 'Relax and be aware of your next move',
        deadlines: [], 
        usefulLinks: [
            { text: 'Penn Housing:', linkText: 'Link to Penn Housing', description: "It\'ll be your next focus" },
            { text: 'Financials Aids:', linkText: 'Link to Financials Aids', description: 'Get a head start' },
        ],
        tryThis: {
            title: 'Harry Potter Style Housing',
            image: '/Castle-min.png',
        },
    },
    { // Semaine 2: May 19-25
        currentMonth: 'May',
        dateRange: 'May 19-25',
        focusTitle: 'Housing selection & roomate matching',
        deadlines: [
            {
                id: 'housing-today-may',
                title: 'Housing Selection',
                day: 'Today',
                isWarning: true,
                items: [
                    { id: 'h1-may', text: 'Give me all different housing that I can get as a freshman', isDone: false },
                    { id: 'h2-may', text: 'Can I switch roomate after classes start?', isDone: true },
                    { id: 'h3-may', text: "What\'s the difference in price between Gregory and Ware", isDone: false },
                ]
            }
        ],
        usefulLinks: [], 
        tryThis: {
            title: 'Harry Potter Style Housing Selection', 
            image: '/Castle-min.png', 
        },
    },
    { // Semaine 3: June 5-12
        currentMonth: 'June',
        dateRange: 'June 5-12',
        focusTitle: 'Choosing and register for you classes',
        deadlines: [
            {
                id: 'classes-today-june',
                title: 'Class registration',
                day: 'Today',
                isWarning: true,
                items: [ 
                    { id: 'cr1', text: 'Register for Calculus I', isDone: false },
                    { id: 'cr2', text: 'Select Writing Seminar', isDone: false },
                    { id: 'cr3', text: 'Check required courses for major', isDone: false },
                    { id: 'cr4', text: 'Review class schedule', isDone: false },
                ]
            },
            {
                id: 'chill-tomorrow-june',
                title: 'Nothing to do just chill', 
                day: 'Tomorrow',
                isWarning: false,
                items: [] 
            }
        ],
        usefulLinks: [], 
        tryThis: {
            title: '4 Year Planning - coming soon',
            image: '/Castle-min.png', 
        },
    },
     { // Semaine 4: June 13-19 (Ajout d'une semaine avec 3 deadlines)
        currentMonth: 'June', // Toujours Juin
        dateRange: 'June 13-19',
        focusTitle: 'Finalize schedule and check prerequisites',
        deadlines: [
            {
                id: 'prereq-today-june2',
                title: 'Check Prerequisites',
                day: 'Today',
                isWarning: true,
                items: [ 
                    { id: 'pr1', text: 'Verify Math prerequisite', isDone: false },
                    { id: 'pr2', text: 'Confirm language requirement', isDone: false },
                ]
            },
            {
                id: 'advisor-today-june2',
                title: 'Meet Advisor',
                day: 'Today',
                isWarning: false, // Pas d'alerte pour celle-ci
                items: [
                    { id: 'adv1', text: 'Prepare questions for advisor', isDone: false },
                ]
            },
             {
                id: 'books-tomorrow-june2',
                title: 'Order Books',
                day: 'Tomorrow',
                isWarning: false,
                items: [
                     { id: 'bk1', text: 'Check bookstore for required texts', isDone: false },
                     { id: 'bk2', text: 'Compare prices online', isDone: false },
                ]
            }
        ],
        usefulLinks: [], 
        tryThis: {
            title: 'Explore study abroad options',
            image: '/Castle-min.png', 
        },
    },
];

// Données pour la progress bar (base statique pour les noms)
const progressBarData = {
    months: [
        { name: 'March', status: 'valid' as const }, // Statut sera écrasé dynamiquement
        { name: 'April', status: 'valid' as const },
        { name: 'May', status: 'pending' as const },
        { name: 'June', status: 'invalid' as const },
        { name: 'July', status: 'invalid' as const },
        { name: 'August', status: 'invalid' as const },
        { name: 'September', status: 'invalid' as const },
    ],
};
// --- Fin Fake Data ---

const LandingPageV2: React.FC<LandingPageV2Props> = ({ onSend, userUniversity }) => {
    console.log('<<< RENDERING LandingPageV2 >>>');
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    // Gérer l'état de toutes les données, y compris l'état 'isDone' des tâches
    const [weeksData, setWeeksData] = useState<WeeklyData[]>(initialAllWeeksData); 

    // --- Fonctions de navigation et sélection ---
    const handleNextWeek = () => {
        setCurrentWeekIndex((prevIndex) => Math.min(prevIndex + 1, weeksData.length - 1));
    };
    const handlePreviousWeek = () => {
        setCurrentWeekIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };
     const handleDeadlineItemSelect = (itemText: string) => {
        console.log("Item sélectionné pour input:", itemText);
        setInputValue(itemText); 
    };
     const handleSendFromInput = (message: string) => {
        onSend(message); 
        setInputValue(''); 
    };

    // --- Fonction pour mettre à jour l'état d'une tâche ---
     const handleTaskToggle = (weekIndex: number, deadlineId: string, itemId: string) => {
        setWeeksData(currentWeeksData => 
            currentWeeksData.map((week, wIndex) => {
                if (wIndex !== weekIndex) return week; 

                return {
                    ...week,
                    deadlines: week.deadlines.map(deadline => {
                        if (deadline.id !== deadlineId) return deadline;

                        return {
                            ...deadline,
                            items: deadline.items.map(item => {
                                if (item.id !== itemId) return item;
                                return { ...item, isDone: !item.isDone }; 
                            })
                        };
                    })
                };
            })
        );
    };


    // --- Calcul dynamique du statut des mois pour la ProgressBar ---
    const monthOrder = progressBarData.months.map(m => m.name); 

    const dynamicMonthsStatus = useMemo(() => {
        console.log("Recalculating month statuses..."); 
        const currentViewedMonth = weeksData[currentWeekIndex]?.currentMonth;
        const currentViewedMonthIndex = monthOrder.indexOf(currentViewedMonth);

        return progressBarData.months.map((month, index) => {
            const weeksInThisMonth = weeksData.filter(week => week.currentMonth === month.name);
            
            let allTasksDone = true;
            if (weeksInThisMonth.length > 0) {
                 allTasksDone = weeksInThisMonth.every(week => 
                    week.deadlines.every(deadline => 
                        deadline.items.every(item => item.isDone)
                    )
                );
            } else {
                 // Pour les mois sans semaine définie (ex: Mars), on considère ok.
                 allTasksDone = true; 
            }

            let status: 'valid' | 'pending' | 'invalid' = 'invalid';

             if (index < currentViewedMonthIndex) { 
                 status = allTasksDone ? 'valid' : 'invalid'; 
             } else if (index === currentViewedMonthIndex) { 
                 status = allTasksDone ? 'valid' : 'pending'; 
             } else { 
                 status = 'invalid'; 
             }

            return { ...month, status };
        });
    }, [weeksData, currentWeekIndex]); 


    // Données de la semaine courante (maintenant depuis l'état)
    const currentWeekData = weeksData[currentWeekIndex];
    const isFirstWeek = currentWeekIndex === 0;
    const isLastWeek = currentWeekIndex === weeksData.length - 1;

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflow: 'hidden',
        }}>
            <Box sx={{ flexShrink: 0 }}>
                <ProgressBar
                    months={dynamicMonthsStatus} // Utiliser les statuts calculés
                />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <WeeklyFocus
                    dateRange={currentWeekData.dateRange}
                    focusTitle={currentWeekData.focusTitle}
                    deadlines={currentWeekData.deadlines} 
                    usefulLinks={currentWeekData.usefulLinks}
                    tryThis={currentWeekData.tryThis}
                    onSelectItem={handleDeadlineItemSelect}
                    onNextWeek={handleNextWeek}
                    onPreviousWeek={handlePreviousWeek}
                    onTaskToggle={(deadlineId, itemId) => handleTaskToggle(currentWeekIndex, deadlineId, itemId)} // Nouvelle prop
                    isFirstWeek={isFirstWeek}
                    isLastWeek={isLastWeek}
                />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
                <InputArea
                    onSend={handleSendFromInput} 
                    value={inputValue} 
                    onChangeValue={setInputValue} 
                    handlePrivacyChange={(isPublic) => console.log('Privacy changed:', isPublic)}
                />
            </Box>
        </Box>
    );
};

export default LandingPageV2; 