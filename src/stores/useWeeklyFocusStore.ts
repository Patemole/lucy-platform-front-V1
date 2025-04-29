import { create } from 'zustand';
import { db } from '../auth/firebase'; // Adaptez le chemin si nécessaire
import { collection, getDocs, query, orderBy /*, Timestamp*/ } from 'firebase/firestore';

// Réutiliser ou importer l'interface WeeklyData (assurez-vous qu'elle est définie ou importée)
// Si elle est dans LandingPageV2, il serait mieux de la déplacer dans src/interfaces/
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
interface FeatureItem {
    title: string;
    image?: string;
}
interface WeeklyData {
    id: string; // Ajouter l'ID du document Firestore
    dateRange: string;
    focusTitle: string;
    // startDate?: Date; // Si vous l'utilisez, gérer la conversion Timestamp -> Date
    deadlines: Deadline[];
    usefulLinks: UsefulLink[];
    features: FeatureItem[]; 
    currentMonth: string; 
}

interface WeeklyFocusState {
    weeks: WeeklyData[];
    isLoading: boolean;
    error: Error | null;
    fetchWeeklyFocusData: () => Promise<void>;
    toggleTask: (weekId: string, deadlineId: string, itemId: string) => void;
}

const useWeeklyFocusStore = create<WeeklyFocusState>((set, get) => ({
    weeks: [],
    isLoading: false,
    error: null,

    fetchWeeklyFocusData: async () => {
        set({ isLoading: true, error: null });
        try {
            const collectionRef = collection(db, 'weeklyFocusData');
            // Optionnel: Trier les semaines, par ex. par dateRange ou un champ 'order' si ajouté
            // const q = query(collectionRef, orderBy("startDate")); // Exemple si startDate (Timestamp) existe
            const q = query(collectionRef); // Ou sans tri spécifique pour l'instant
            
            const querySnapshot = await getDocs(q);
            const fetchedWeeks: WeeklyData[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Conversion Timestamp -> Date si nécessaire pour startDate
                // const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : undefined;
                
                fetchedWeeks.push({ 
                    id: doc.id, // Stocker l'ID du document
                    ...data,
                    // startDate, // Inclure la date convertie si utilisée
                 } as WeeklyData); // Assertion de type
            });

            // Vous pourriez vouloir trier fetchedWeeks ici côté client si Firestore ne le fait pas comme désiré
            // fetchedWeeks.sort((a, b) => /* logique de tri */);

            set({ weeks: fetchedWeeks, isLoading: false });
        } catch (err) {
            console.error("Erreur lors de la récupération de weeklyFocusData:", err);
            set({ error: err instanceof Error ? err : new Error('Failed to fetch data'), isLoading: false });
        }
    },

    toggleTask: (weekId, deadlineId, itemId) => {
        set(state => ({
            weeks: state.weeks.map(week => {
                if (week.id !== weekId) return week;

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
        }));
        // NOTE: Ceci ne met à jour que l'état local dans le store.
        // Pour persister la modification dans Firestore, il faudrait ajouter
        // une logique ici pour appeler updateDoc sur le document/item concerné.
    },
}));

export default useWeeklyFocusStore; 