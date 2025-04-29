import { useState, useEffect } from 'react';
// Importer l'interface WeeklyData (chemin corrigé)
import { WeeklyData } from '../../../../stores/useWeeklyFocusStore'; // Chemin ajusté

// --- Fonction Helper pour trouver l'index (interne au hook) --- 
const findCurrentWeekIndex = (weeks: WeeklyData[]): number => {
    if (!weeks || weeks.length === 0) return 0; 
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    let bestIndex = 0; 
    for (let i = 0; i < weeks.length; i++) {
        const weekStartDate = new Date(weeks[i].startDate);
        weekStartDate.setHours(0, 0, 0, 0); 
        console.log(`  [Hook] Comparing: now=${now.toISOString()} vs week[${i}](${weeks[i].dateRange}).startDate=${weekStartDate.toISOString()}`);
        if (weekStartDate <= now) {
            bestIndex = i;
            console.log(`    [Hook] Match found or passed, bestIndex is now: ${bestIndex}`);
        } else {
            console.log(`    [Hook] Week starts after now, breaking loop.`);
            break;
        }
    }
    console.log(`[Hook] findCurrentWeekIndex FINAL: Date: ${now.toISOString()}, Index: ${bestIndex}`);
    return bestIndex;
};

/**
 * Hook personnalisé pour déterminer et gérer l'index de la semaine courante.
 * @param weeks Tableau des données des semaines.
 * @param isLoading État de chargement des données des semaines.
 * @param onboardingComplete État d'onboarding de l'utilisateur.
 * @returns Un objet contenant { currentWeekIndex, setCurrentWeekIndex, isIndexInitialized }
 */
export const useInitialWeekIndex = (weeks: WeeklyData[], isLoading: boolean, onboardingComplete: boolean | undefined) => {
    // État pour l'index courant
    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
    // État pour savoir si le calcul initial a été fait
    const [isIndexInitialized, setIsIndexInitialized] = useState(false);

    useEffect(() => {
        // Conditions pour calculer l'index initial
        if (!isLoading && weeks.length > 0 && onboardingComplete === true && !isIndexInitialized) {
            console.log("[Hook] Conditions met for initial index calculation.");
            const initialIndex = findCurrentWeekIndex(weeks);
            console.log("[Hook] Setting initial week index to:", initialIndex);
            setCurrentWeekIndex(initialIndex);
            setIsIndexInitialized(true); // Marquer comme initialisé
        } else if (isLoading || onboardingComplete !== true) {
            // Si on recharge ou si l'onboarding change, réinitialiser le flag
            // pour permettre un nouveau calcul si les conditions sont à nouveau remplies.
            // console.log("[Hook] Resetting isIndexInitialized due to loading or onboarding state.");
            // setIsIndexInitialized(false); // Attention: ceci peut causer des boucles si mal géré
        }
    }, [weeks, isLoading, onboardingComplete, isIndexInitialized]); // Dépendances

    // Retourner l'index, la fonction pour le modifier, et le statut d'initialisation
    return { currentWeekIndex, setCurrentWeekIndex, isIndexInitialized };
}; 