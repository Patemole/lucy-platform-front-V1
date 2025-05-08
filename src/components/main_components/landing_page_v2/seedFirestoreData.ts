import { db } from '../../../auth/firebase'; // Adaptez le chemin
import { collection, writeBatch, doc, query, limit, getDocs } from 'firebase/firestore';
import weeklyDataJson from './weekly_deadline_data.json'; 
import { WeeklyData, Deadline } from './initialWeeklyData'; // Garder pour l'interface si utile

const COLLECTION_NAME = 'weeklyFocusData';

/**
 * Insère les données initiales de weeklyFocusData dans Firestore.
 * Vérifie d'abord si la collection contient déjà des données pour éviter les doublons.
 * À n'exécuter qu'une seule fois manuellement ou via un script dédié.
 */
export const seedFirestoreData = async () => {
    const collectionRef = collection(db, COLLECTION_NAME);

    // Vérifier si la collection est vide
    const q = query(collectionRef, limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        console.warn(`La collection "${COLLECTION_NAME}" contient déjà des données. Insertion annulée.`);
        // Optionnel: Lancer une erreur ou juste retourner
        // throw new Error("Collection déjà initialisée."); 
        return; 
    }

    console.log(`Début de l'insertion initiale dans la collection : ${COLLECTION_NAME}...`);
    // Log ajouté pour confirmer la source
    console.log('[SEEDING INFO] Tentative d\'insertion depuis weekly_deadline_data.json'); 
    const batch = writeBatch(db);
    try {
        // Utiliser les données JSON importées et les transformer
        weeklyDataJson.forEach((weekJsonItem: any, index: number) => { // Ajouter l'index pour le log
            const docRef = doc(collectionRef);
            
            // Log ajouté pour la première entrée
            if (index === 0) {
                console.log('[SEEDING INFO] Première entrée JSON à insérer (titre): ', weekJsonItem.focusTitle);
            }

            // Convertir startDate et dueDate
            let processedDueDate: Date | { start: Date; end: Date } | undefined = undefined;
            if (weekJsonItem.dueDate) {
                if (typeof weekJsonItem.dueDate === 'string') {
                    processedDueDate = new Date(weekJsonItem.dueDate);
                } else if (typeof weekJsonItem.dueDate === 'object' && weekJsonItem.dueDate.start && weekJsonItem.dueDate.end) {
                    processedDueDate = {
                        start: new Date(weekJsonItem.dueDate.start),
                        end: new Date(weekJsonItem.dueDate.end)
                    };
                }
            }

            const dataToInsert: Omit<WeeklyData, 'deadlines'> & { deadlines: Omit<Deadline, 'dueDate'> & { dueDate?: Date | { start: Date; end: Date } }[] } = {
                ...weekJsonItem,
                startDate: new Date(weekJsonItem.startDate),
                deadlines: weekJsonItem.deadlines.map((deadline: any) => {
                    let deadlineDueDate: Date | { start: Date; end: Date } | undefined = undefined;
                    if (deadline.dueDate) {
                         if (typeof deadline.dueDate === 'string') {
                            deadlineDueDate = new Date(deadline.dueDate);
                        } else if (typeof deadline.dueDate === 'object' && deadline.dueDate.start && deadline.dueDate.end) {
                            deadlineDueDate = {
                                start: new Date(deadline.dueDate.start),
                                end: new Date(deadline.dueDate.end)
                            };
                        }
                    }
                    return {
                        ...deadline,
                        ...(deadlineDueDate && { dueDate: deadlineDueDate }) // Ajoute dueDate seulement s'il existe et a été traité
                    };
                })
            };
            
            // Supprimer explicitement le champ non traité s'il existait au niveau racine (peu probable mais par sécurité)
            // delete (dataToInsert as any).dueDate; 

            batch.set(docRef, dataToInsert);
        });

        await batch.commit(); // Exécute toutes les opérations du batch
        console.log('Insertion initiale dans Firestore terminée avec succès.');

    } catch (error) {
        console.error("Erreur lors de l'insertion initiale par batch : ", error);
        // Relancer l'erreur pour que l'appelant puisse la gérer si besoin
        throw error;
    }
};

// Pour exécuter ce script manuellement (par exemple via un bouton en mode dev):
// 1. Importer la fonction: import { seedFirestoreData } from './path/to/seedFirestoreData';
// 2. Appeler la fonction: <button onClick={async () => await seedFirestoreData()}>Seed Firestore</button> 