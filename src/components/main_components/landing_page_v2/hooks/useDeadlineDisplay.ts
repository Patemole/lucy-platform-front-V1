import { Deadline } from '../initialWeeklyData'; // Ajustez le chemin si nécessaire
import { useMemo } from 'react';

// --- Helpers (internes ou exportés si utiles ailleurs) ---
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isTomorrow = (date1: Date, date2: Date): boolean => {
  const tomorrow = new Date(date2);
  tomorrow.setDate(date2.getDate() + 1);
  return isSameDay(date1, tomorrow);
};

const isDateInRange = (dateToCheck: Date, startDate: Date, endDate: Date): boolean => {
    const checkTimestamp = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()).getTime();
    const startTimestamp = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const endTimestamp = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
    return checkTimestamp >= startTimestamp && checkTimestamp <= endTimestamp;
};

// --- Fonction Logique Pure (Exportée pour utilisation hors-hook comme le filtrage) ---
export const calculateDeadlineDisplayDate = (
    deadline: Deadline,
    referenceDate: Date = new Date()
): string => {
    const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (!deadline.dueDate) {
        return deadline.day;
    }

    try {
        if (deadline.dueDate instanceof Date) {
            const dueDateOnly = new Date(deadline.dueDate.getFullYear(), deadline.dueDate.getMonth(), deadline.dueDate.getDate());
            if (isSameDay(dueDateOnly, today)) return 'Today';
            if (isSameDay(dueDateOnly, tomorrow)) return 'Tomorrow';
        } else if (typeof deadline.dueDate === 'object' && deadline.dueDate.start instanceof Date && deadline.dueDate.end instanceof Date) {
            const { start, end } = deadline.dueDate;
            if (isDateInRange(today, start, end)) return 'Today';
            if (isDateInRange(tomorrow, start, end)) return 'Tomorrow';
        }
    } catch (error) {
        console.error("Erreur lors du traitement de dueDate:", error, deadline);
        return deadline.day;
    }

    return deadline.day;
};

// --- Le Hook React --- 
/**
 * Hook pour déterminer la chaîne de caractères à afficher pour une deadline.
 * @param deadline L'objet Deadline.
 * @param referenceDate Date de référence optionnelle (par défaut: maintenant).
 * @returns "Today", "Tomorrow", ou la valeur de `deadline.day`.
 */
export const useDeadlineDisplay = (
    deadline: Deadline | undefined | null,
    referenceDate: Date = new Date()
): string => {
    // Utilise useMemo pour ne recalculer que si la deadline ou la date de référence change.
    // Bien que la fonction soit rapide, c'est une bonne pratique.
    const displayDate = useMemo(() => {
        if (!deadline) return ''; // Gérer le cas où deadline est null/undefined
        return calculateDeadlineDisplayDate(deadline, referenceDate);
    }, [deadline, referenceDate]);

    return displayDate;
}; 