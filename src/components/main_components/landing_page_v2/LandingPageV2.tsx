import React, { useState, useMemo, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import WeeklyFocus from './WeeklyFocus';
import InputArea from './InputArea';
import { Box, CircularProgress, Typography } from '@mui/material';

// Importer les stores
import useWeeklyFocusStore from '../../../stores/useWeeklyFocusStore';
import useAuthStore from '../../../stores/useAuthStore'; // Importer le store d'authentification

// Importer la fonction de seeding
import { seedFirestoreData } from './seedFirestoreData';

// Importer le nouveau hook
import { useInitialWeekIndex } from './hooks/useInitialWeekIndex';

// Interfaces (pourraient être dans un fichier partagé)
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
    day: 'Today' | 'Tomorrow';
}
interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}

// Nouvelle interface pour un élément de feature
interface FeatureItem {
    title: string;
    image?: string;
}

interface WeeklyData {
    dateRange: string;
    focusTitle: string;
    deadlines: Deadline[];
    usefulLinks: UsefulLink[];
    features: FeatureItem[];
    currentMonth: string; // Peut être utile pour la progress bar
}
*/

interface LandingPageV2Props {
    onSend: (message: string) => void;
    userUniversity: string | null | undefined;
}

// Déplacer progressBarData si souhaité, ou le laisser ici
const progressBarData = {
    months: [
        { name: 'March', status: 'valid' as const },
        { name: 'April', status: 'valid' as const },
        { name: 'May', status: 'pending' as const },
        { name: 'June', status: 'invalid' as const },
        { name: 'July', status: 'invalid' as const },
        { name: 'August', status: 'invalid' as const },
        { name: 'September', status: 'invalid' as const },
    ],
};

const LandingPageV2: React.FC<LandingPageV2Props> = ({ onSend, userUniversity }) => {
    // Log ajouté au tout début pour confirmer le rendu initial
    console.log("--- LandingPageV2 Component Start Render ---");
    console.log("--- LandingPageV2 Component Rendering --- NOW WITH EXTRA LOGS ---"); 
    // S'assurer que l'état inputValue est bien déclaré ici
    const [inputValue, setInputValue] = useState('');
    
    const {
        weeks,
        isLoading,
        error,
        fetchWeeklyFocusData,
        toggleTask
    } = useWeeklyFocusStore();

    const onboardingComplete = useAuthStore((state) => state.user?.onboardingComplete);

    // Utiliser le hook personnalisé
    const { currentWeekIndex, setCurrentWeekIndex, isIndexInitialized } = useInitialWeekIndex(
        weeks, 
        isLoading, 
        onboardingComplete
    );

    // --- UseEffect pour charger les données (Conditionné, inchangé) --- 
    useEffect(() => {
        if (onboardingComplete === true && weeks.length === 0 && !isLoading) {
             console.log("Onboarding OK, fetching WeeklyFocus data...");
             fetchWeeklyFocusData();
        } else if (onboardingComplete === false) {
             console.log("Waiting for onboarding to fetch WeeklyFocus data...");
        }
    }, [onboardingComplete, fetchWeeklyFocusData, weeks.length, isLoading]);

    // --- UseEffect pour le Seeding (inchangé) --- 
    useEffect(() => {
        // Décommentez pour insérer les données
        console.log("Seeding Firestore data...");
         seedFirestoreData();
        // Re-commentez après!
    }, []); 


    // --- Fonctions de navigation (utilisent maintenant setCurrentWeekIndex du hook) --- 
    const handleNextWeek = () => {
        setCurrentWeekIndex((prevIndex) => Math.min(prevIndex + 1, weeks.length - 1));
    };
    const handlePreviousWeek = () => {
        setCurrentWeekIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };
    // --- Autres fonctions (inchangées) --- 
     const handleDeadlineItemSelect = (itemText: string) => { setInputValue(itemText); };
     const handleSendFromInput = (message: string) => { onSend(message); setInputValue(''); };
     const handleTaskToggle = (weekId: string, deadlineId: string, itemId: string) => {
        toggleTask(weekId, deadlineId, itemId);
    };

    // --- Calcul ProgressBar (inchangé) --- 
    const monthOrder = progressBarData.months.map(m => m.name); 
    const dynamicMonthsStatus = useMemo(() => {
        if (isLoading || weeks.length === 0) {
             return progressBarData.months;
        }
        const currentViewedMonth = weeks[currentWeekIndex]?.currentMonth;
        const currentViewedMonthIndex = monthOrder.indexOf(currentViewedMonth);
        return progressBarData.months.map((month, index) => {
            const weeksInThisMonth = weeks.filter(week => week.currentMonth === month.name);
            let allTasksDone = true;
            if (weeksInThisMonth.length > 0) {
                 allTasksDone = weeksInThisMonth.every(week => 
                    week.deadlines.every(deadline => 
                        Array.isArray(deadline.items) && deadline.items.every(item => item.isDone)
                    )
                );
            } else { allTasksDone = true; }
            let status: 'valid' | 'pending' | 'invalid' = 'invalid';
             if (index < currentViewedMonthIndex) { status = allTasksDone ? 'valid' : 'invalid'; 
             } else if (index === currentViewedMonthIndex) { status = allTasksDone ? 'valid' : 'pending'; 
             } else { status = 'invalid'; } 
            return { ...month, status };
        });
    }, [weeks, currentWeekIndex, isLoading]); 

    // --- Rendu conditionnel (utilise isIndexInitialized du hook) --- 
    if (onboardingComplete === false) {
         return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>Finalisez votre profil...</Typography></Box>;
    }
    // Afficher chargement si les données chargent OU si l'index initial n'est pas encore prêt
    if (isLoading || !isIndexInitialized) { 
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Box sx={{ p: 2, textAlign: 'center' }}><Typography color="error">Erreur: {error.message}</Typography></Box>;
    }
    if (weeks.length === 0) {
         return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>Aucune donnée trouvée.</Typography></Box>;
    }

    // --- Affichage principal --- 
    const currentWeekData = weeks[currentWeekIndex]; 
    if (!currentWeekData) {
        console.error(`Erreur: currentWeekData est indéfini pour l'index ${currentWeekIndex}`);
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }
    const isFirstWeek = currentWeekIndex === 0;
    const isLastWeek = currentWeekIndex === weeks.length - 1;

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
                    features={currentWeekData.features}
                    onSelectItem={handleDeadlineItemSelect}
                    onNextWeek={handleNextWeek}
                    onPreviousWeek={handlePreviousWeek}
                    // Passer la fonction qui appelle le store avec les bons ID
                    onTaskToggle={(deadlineId, itemId) => handleTaskToggle(currentWeekData.id, deadlineId, itemId)} 
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