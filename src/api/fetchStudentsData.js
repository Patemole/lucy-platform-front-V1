import { db } from '../auth/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

/**
 * Fonction pour récupérer les utilisateurs créés en fonction d'un filtre temporel
 * @param {string} filter - Filtre temporel: 'Today', 'Last Week', 'Last Month', 'Last Year'
 * @returns {Promise<{count: number, dates: Date[]}>} - Nombre de documents et dates de création
 */
async function fetchUserData(filter) {
    console.log(`Filtre sélectionné : ${filter}`);

    // Définir la date actuelle
    const now = new Date();
    let startDate;

    // Calculer la date de début en fonction du filtre
    switch (filter) {
        case 'Today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            console.log(`Début de la période (Today) : ${startDate}`);
            break;
        case 'Last Week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            console.log(`Début de la période (Last Week) : ${startDate}`);
            break;
        case 'Last Month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            console.log(`Début de la période (Last Month) : ${startDate}`);
            break;
        case 'Last Year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            console.log(`Début de la période (Last Year) : ${startDate}`);
            break;
        default:
            console.error('Filtre invalide sélectionné');
            throw new Error('Invalid filter');
    }

    // Convertir les dates en timestamps
    const startTimestamp = Timestamp.fromDate(startDate);
    const nowTimestamp = Timestamp.fromDate(now);
    console.log(`Période : De ${startTimestamp.toDate()} à ${nowTimestamp.toDate()}`);

    // Créer la requête Firestore pour les utilisateurs créés dans la période sélectionnée
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('createdAt', '>=', startTimestamp), where('createdAt', '<=', nowTimestamp));

    // Exécuter la requête
    try {
        const querySnapshot = await getDocs(q);

        // Récupérer les données
        const count = querySnapshot.size;
        const dates = querySnapshot.docs.map(doc => doc.data().createdAt.toDate());

        console.log(`Nombre d'utilisateurs récupérés : ${count}`);
        console.log('Dates de création des utilisateurs :', dates);

        return { count, dates };
    } catch (error) {
        console.error('Erreur lors de la récupération des données depuis Firestore:', error);
        throw error;
    }
}

export default fetchUserData;







/*
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';

export const fetchStudentsData = async (universityFilter, timeFilter) => {
  const usersCollection = collection(db, 'users');
  const now = Timestamp.now();

  let startTime;

  if (timeFilter === 'Today') {
    startTime = Timestamp.fromDate(new Date(now.toDate().setHours(0, 0, 0, 0)));
  } else if (timeFilter === 'Last Week') {
    const oneWeekAgo = new Date(now.toDate().setDate(now.toDate().getDate() - 7));
    startTime = Timestamp.fromDate(oneWeekAgo);
  } else if (timeFilter === 'Last Month') {
    const oneMonthAgo = new Date(now.toDate().setMonth(now.toDate().getMonth() - 1));
    startTime = Timestamp.fromDate(oneMonthAgo);
  } else if (timeFilter === 'Last Year') {
    const oneYearAgo = new Date(now.toDate().setFullYear(now.toDate().getFullYear() - 1));
    startTime = Timestamp.fromDate(oneYearAgo);
  }

  let q = query(usersCollection, where('timestamp', '>=', startTime));

  if (universityFilter !== 'All') {
    q = query(usersCollection, where('university', '==', universityFilter), where('timestamp', '>=', startTime));
  }

  const querySnapshot = await getDocs(q);
  const data = [];

  querySnapshot.forEach(doc => {
    data.push({ ...doc.data(), id: doc.id });
  });

  return data;
};
*/

