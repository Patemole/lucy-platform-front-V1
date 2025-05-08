import React from 'react';
import { Box, Typography } from '@mui/material';
import FocusHeader from './weekly_focus_components/FocusHeader';
import DeadlinesSection from './weekly_focus_components/DeadlinesSection';
import UsefulLinksSection from './weekly_focus_components/UsefulLinksSection';
import FeatureHighlightCard from './weekly_focus_components/FeatureHighlightCard';

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
    day: string;
    // count n'est plus nécessaire ici car calculé dans DeadlinesSection
}

interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}

// --- Interface pour une Feature (reçue de LandingPageV2) --- 
interface FeatureItemProp {
    title: string;
    category: string;
    imageSrc?: string | null;
}

// Mettre à jour WeeklyFocusProps pour accepter features[]
interface WeeklyFocusProps {
    dateRange: string;
    focusTitle: string;
    deadlines: Deadline[]; 
    usefulLinks: UsefulLink[];
    features: FeatureItemProp[]; // Utiliser l'interface définie ci-dessus
    currentVisualizedWeekStartDate: Date; // Renommé
    actualCurrentSystemWeekStartDate: Date | null; // Nouvelle prop, peut être null
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
    features, 
    currentVisualizedWeekStartDate, // Récupérer la prop renommée
    actualCurrentSystemWeekStartDate, // Récupérer la nouvelle prop
    onSelectItem,
    onNextWeek,
    onPreviousWeek,
    onTaskToggle,
    isFirstWeek,
    isLastWeek
}) => {
    const hasFeatures = features && features.length > 0;
    const displayFeaturesInline = features && features.length > 1;

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
                currentVisualizedWeekStartDate={currentVisualizedWeekStartDate} // Passer la prop renommée
                actualCurrentSystemWeekStartDate={actualCurrentSystemWeekStartDate} // Passer la nouvelle prop
            />
            <UsefulLinksSection usefulLinks={usefulLinks} />
            
            {/* --- Section Features --- */}
            {hasFeatures && (
                <Box sx={{ width: '100%', maxWidth: 480, mb: 4 }}>
                    {/* Titre fixe pour la section */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, width: '100%', textAlign: 'left' }}>
                        Try this
                    </Typography>
                    
                    {/* Conteneur pour les cartes, gère l'affichage en ligne/colonne */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: displayFeaturesInline ? 'row' : 'column',
                        gap: displayFeaturesInline ? 2 : 0, // Espace entre les cartes si en ligne
                        justifyContent: 'center', // Centre les cartes si elles sont moins larges
                        alignItems: 'stretch' // Étire les cartes en hauteur
                    }}>
                        {features.map((feature) => (
                            <Box 
                                key={feature.title} 
                                sx={{ 
                                    // Chaque carte prend 50% de la largeur moins l'espacement si en ligne, sinon 100%
                                    width: displayFeaturesInline ? 'calc(50% - 8px)' : '100%',
                                    // Appliquer flex pour que FeatureHighlightCard s'étende bien
                                    display: 'flex' 
                                }}
                            >
                                <FeatureHighlightCard 
                                    featureItem={feature} // Passe directement l'objet feature
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default WeeklyFocus; 