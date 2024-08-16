import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../auth/firebase';


export const fetchRequestData = async (universityFilter, timeFilter) => {
    try {
      const usersCollection = collection(db, 'users');
      const now = Timestamp.now();
  
      let startTime;
  
      // Définir le temps de début en fonction du filtre temporel
      switch (timeFilter) {
        case 'Today':
          startTime = Timestamp.fromDate(new Date(now.toDate().setHours(0, 0, 0, 0)));
          break;
        case 'Last Week':
          startTime = Timestamp.fromDate(new Date(now.toDate().setDate(now.toDate().getDate() - 7)));
          break;
        case 'Last Month':
          startTime = Timestamp.fromDate(new Date(now.toDate().setMonth(now.toDate().getMonth() - 1)));
          break;
        case 'Last Year':
          startTime = Timestamp.fromDate(new Date(now.toDate().setFullYear(now.toDate().getFullYear() - 1)));
          break;
        default:
          startTime = Timestamp.fromDate(new Date(now.toDate().setHours(0, 0, 0, 0))); // Par défaut : aujourd'hui
          break;
      }
  
      // Construire la requête avec ou sans filtre d'université
      let q;
      if (universityFilter === 'All') {
        q = query(usersCollection, where('timestamp', '>=', startTime));
      } else {
        q = query(
          usersCollection,
          where('university', '==', universityFilter),
          where('timestamp', '>=', startTime)
        );
      }
  
      // Exécuter la requête et récupérer les données
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
  
      return data;
    } catch (error) {
      console.error("Error fetching request data:", error);
      throw new Error("Failed to fetch request data");
    }
  };