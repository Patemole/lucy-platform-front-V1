import { create } from 'zustand';
import { db } from '../auth/firebase'; // Adaptez le chemin si nécessaire
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
// Importer le store d'authentification pour accéder aux tâches complétées
import useAuthStore from './useAuthStore'; 

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
    day: string;
    dueDate?: Date | Timestamp | { start: Date | Timestamp; end: Date | Timestamp };
}
interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}
interface FeatureItem {
    title: string;
    category: string;
    imageSrc?: string | null;
}

// Exporter l'interface pour qu'elle puisse être importée ailleurs
export interface WeeklyData {
    id: string; // ID du document Firestore de la semaine
    dateRange: string;
    focusTitle: string;
    startDate: Date; // <-- S'assurer qu'elle est de type Date JS ici
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
        // Récupérer la liste des IDs des tâches déjà complétées par l'utilisateur connecté
        // Il est crucial que useAuthStore soit déjà initialisé et l'utilisateur chargé
        // Cela suppose que fetchWeeklyFocusData est appelé *après* l'authentification réussie
        const completedTaskIds = useAuthStore.getState().user?.completedTaskIds || [];
        console.log("WeeklyFocusStore: Tâches complétées initiales récupérées:", completedTaskIds);

        set({ isLoading: true, error: null });
        try {
            const collectionRef = collection(db, 'weeklyFocusData');
            // Ajouter le tri par startDate
            const q = query(collectionRef, orderBy("startDate")); 
            
            const querySnapshot = await getDocs(q);
            const fetchedWeeks: WeeklyData[] = [];
            console.log(`WeeklyFocusStore: Fetched ${querySnapshot.size} documents.`); // Log du nombre
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // Log et Conversion Timestamp -> Date pour startDate
                console.log(`  Processing doc ${doc.id}: raw startDate=`, data.startDate);
                let startDate = new Date(); 
                if (data.startDate && data.startDate instanceof Timestamp) {
                    startDate = data.startDate.toDate();
                    console.log(`    Converted startDate: ${startDate.toISOString()}`);
                } else {
                    console.warn(`    Document ${doc.id} missing or invalid startDate.`);
                }

                // Traitement des deadlines (inchangé)
                const processedDeadlines = (data.deadlines || []).map((deadline: Deadline) => ({
                    ...deadline,
                    items: (deadline.items || []).map((item: DeadlineItem) => ({
                        ...item,
                        isDone: completedTaskIds.includes(item.id) 
                    }))
                }));

                fetchedWeeks.push({ 
                    id: doc.id, 
                    dateRange: data.dateRange,
                    focusTitle: data.focusTitle,
                    startDate: startDate, 
                    deadlines: processedDeadlines, 
                    usefulLinks: data.usefulLinks,
                    features: data.features,
                    currentMonth: data.currentMonth,
                 } as WeeklyData); // Utiliser l'assertion peut masquer des erreurs, mais ok ici si la structure est connue
            });
            // Log après la boucle pour voir l'ordre final
            console.log("WeeklyFocusStore: Final fetched & processed weeks before setting state:", JSON.stringify(fetchedWeeks.map(w => ({id: w.id, dateRange: w.dateRange, startDate: w.startDate})), null, 2));

            set({ weeks: fetchedWeeks, isLoading: false });
        } catch (err) {
            console.error("Erreur fetch/process weeklyFocusData:", err);
            set({ error: err instanceof Error ? err : new Error('Failed to fetch data'), isLoading: false });
        }
    },

    toggleTask: (weekId, deadlineId, itemId) => {
        let newIsDoneStatus: boolean | undefined = undefined;

        // 1. Mettre à jour l'état local du store
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
                                // Capturer le nouvel état
                                newIsDoneStatus = !item.isDone; 
                                return { ...item, isDone: newIsDoneStatus };
                            })
                        };
                    })
                };
            })
        }));

        // 2. Si le nouvel état a été déterminé, mettre à jour Firestore via useAuthStore
        if (newIsDoneStatus !== undefined) {
            console.log(`WeeklyFocusStore: Appel à updateCompletedTasksInFirestore pour taskId ${itemId}, markAsDone: ${newIsDoneStatus}`);
            useAuthStore.getState().updateCompletedTasksInFirestore(itemId, newIsDoneStatus)
              .catch(error => {
                  console.error("Erreur retournée par updateCompletedTasksInFirestore:", error);
                  // Optionnel: Revenir à l'état précédent dans ce store en cas d'échec de la mise à jour Firestore?
                  // Cela ajouterait de la complexité (rollback).
              });
        } else {
            console.warn(`WeeklyFocusStore: Impossible de déterminer le nouvel état isDone pour ${itemId}, mise à jour Firestore annulée.`);
        }
    },
}));

export default useWeeklyFocusStore; 