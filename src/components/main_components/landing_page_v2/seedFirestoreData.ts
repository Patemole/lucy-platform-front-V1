import { db } from '../../../auth/firebase'; // Adaptez le chemin
import { collection, writeBatch, doc, query, limit, getDocs } from 'firebase/firestore';
import { initialAllWeeksData } from './initialWeeklyData'; // Importe les données

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
    const batch = writeBatch(db);
    try {
        initialAllWeeksData.forEach((weekData) => {
            const docRef = doc(collectionRef); // ID auto-généré par Firestore
            const dataToInsert = { ...weekData }; 
            // Gérer startDate si ajouté: Firestore le convertira en Timestamp
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