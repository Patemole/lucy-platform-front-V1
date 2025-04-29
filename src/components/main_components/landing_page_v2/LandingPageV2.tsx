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
    console.log('<<< RENDERING LandingPageV2 >>>');
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    
    // Récupérer l'état depuis les stores
    const {
        weeks,
        isLoading,
        error,
        fetchWeeklyFocusData,
        toggleTask
    } = useWeeklyFocusStore();

    // Récupérer l'état d'onboarding depuis le store d'authentification
    const onboardingComplete = useAuthStore((state) => state.user?.onboardingComplete);

    // --- UseEffect pour récupérer les données au montage (conditionné par l'onboarding) --- 
    useEffect(() => {
        // Ne charger que si l'onboarding est terminé ET si les données ne sont pas déjà là ou en cours de chargement
        if (onboardingComplete === true && weeks.length === 0 && !isLoading) {
             console.log("Onboarding terminé, chargement des données WeeklyFocus...");
             fetchWeeklyFocusData();
        } else if (onboardingComplete === false) {
             console.log("Attente de la fin de l'onboarding pour charger WeeklyFocus...");
             // Optionnel: On pourrait vouloir afficher un état spécifique ici
        }
    }, [onboardingComplete, fetchWeeklyFocusData, weeks.length, isLoading]); // Ajouter onboardingComplete aux dépendances

    // --- UseEffect pour l'insertion initiale (Seeding) --- 
    // --- À n'exécuter qu'UNE SEULE FOIS --- 
    useEffect(() => {
        // Décommentez la ligne suivante UNIQUEMENT pour insérer les données initiales
        // seedFirestoreData();
        // Puis RE-COMMENTEZ la ligne après l'exécution réussie !
    }, []); // Le tableau vide assure que cet effet ne s'exécute qu'une fois au montage




    

    // --- Fonctions de navigation et sélection ---
    const handleNextWeek = () => {
        // Utiliser weeks.length du store
        setCurrentWeekIndex((prevIndex) => Math.min(prevIndex + 1, weeks.length - 1));
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

    // --- Mettre à jour handleTaskToggle pour utiliser l'action du store --- 
     const handleTaskToggle = (weekId: string, deadlineId: string, itemId: string) => {
        // Appeler directement l'action du store
        toggleTask(weekId, deadlineId, itemId);
        // La mise à jour de l'état est gérée par Zustand
    };

    // --- Calcul dynamique du statut des mois pour la ProgressBar (utiliser weeks du store) --- 
    const monthOrder = progressBarData.months.map(m => m.name); 

    const dynamicMonthsStatus = useMemo(() => {
        // Vérifier si les données sont chargées
        if (isLoading || weeks.length === 0) {
             // Retourner un état par défaut ou l'état précédent si possible
             // Ici, on retourne l'état initial statique pour l'instant
             return progressBarData.months;
        }
        console.log("Recalculating month statuses..."); 
        // Utiliser weeks du store
        const currentViewedMonth = weeks[currentWeekIndex]?.currentMonth;
        const currentViewedMonthIndex = monthOrder.indexOf(currentViewedMonth);

        return progressBarData.months.map((month, index) => {
            const weeksInThisMonth = weeks.filter(week => week.currentMonth === month.name);
            
            let allTasksDone = true;
            if (weeksInThisMonth.length > 0) {
                 allTasksDone = weeksInThisMonth.every(week => 
                    week.deadlines.every(deadline => 
                        deadline.items.every(item => item.isDone)
                    )
                );
            } else {
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
    }, [weeks, currentWeekIndex, isLoading]); // Ajouter isLoading aux dépendances

    // --- Gestion de l'affichage pendant le chargement ou en cas d'erreur OU si onboarding incomplet --- 
    
    // Si l'onboarding n'est pas encore marqué comme terminé, afficher un message ou rien
    if (onboardingComplete === false) {
         return (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
                 {/* Option 1: Message d'attente */}
                 <Typography>Finalisez votre profil pour accéder au focus hebdomadaire.</Typography>
                 {/* Option 2: Ne rien afficher ou un placeholder différent */}
                 {/* null */}
             </Box>
         );
    }
    
    // Si l'onboarding est terminé (ou indéfini/en chargement initial), on vérifie le chargement des données weekly
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
                <Typography color="error">Erreur lors du chargement des données: {error.message}</Typography>
            </Box>
        );
    }
    
    // Si l'onboarding est terminé mais pas de données (après chargement)
    if (onboardingComplete === true && weeks.length === 0 && !isLoading) {
         return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
                <Typography>Aucune donnée de semaine trouvée pour le moment.</Typography>
            </Box>
        );
    }

    // --- Affichage principal si onboarding terminé et données chargées --- 
    const currentWeekData = weeks[currentWeekIndex]; 
    const isFirstWeek = currentWeekIndex === 0;
    const isLastWeek = currentWeekIndex === weeks.length - 1;

    // Vérification de sécurité, même si l'affichage précédent devrait couvrir ce cas
     if (!currentWeekData) {
         // Peut arriver brièvement si weeks est vidé puis re-rempli?
         return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>; 
     }

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