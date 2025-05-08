import { useState, useEffect, useCallback } from 'react';
import { Timestamp, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../auth/firebase'; // Corrected path to Firebase config

export interface AmbassadorStat {
  id: string; // Corresponds to the ambassador's own user ID if they are also users, or a unique ID for the ambassador entry
  name: string;
  referralCode: string; // The code this ambassador gives out
  totalSignUps: number; // All-time total sign-ups using this ambassador's referralCode
  weeklySignUps: number; // Sign-ups for the selected week using this ambassador's referralCode
}

export interface UseAmbassadorLeaderboardReturn {
  leaderboardData: AmbassadorStat[];
  isLoading: boolean;
  error: Error | null;
  fetchLeaderboard: (offset?: number) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  weekOffset: number;
  currentWeekDateRange: { startOfWeek: Date; endOfWeek: Date } | null;
}

const getWeekDateRange = (offset: number = 0): { startOfWeek: Date; endOfWeek: Date } => {
    const now = new Date();
    now.setDate(now.getDate() + (offset * 7));
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
};

// This is your static list of known ambassadors.
// In a more dynamic system, this might also come from Firebase, but for now, it's fixed.
const AMBASSADORS_TO_TRACK = [
    { id: 'lavina_c', name: 'Lavina Cartellieri', referralCode: 'lavina' },
    { id: 'matthew_z', name: 'Matthew Zeitz', referralCode: 'matthew' },
    { id: 'upenn_s', name: 'UPENN Shared Link', referralCode: 'ambupenn' }, // Changed name slightly for clarity
    { id: 'hafsa_k', name: 'Hafsa K', referralCode: 'hafsa' },
  ];

const useAmbassadorLeaderboard = (): UseAmbassadorLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<AmbassadorStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [currentWeekDateRange, setCurrentWeekDateRange] = useState<{ startOfWeek: Date; endOfWeek: Date } | null>(null);

  const fetchLeaderboard = useCallback(async (offsetToFetch: number = weekOffset) => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching real leaderboard data for week offset: ${offsetToFetch}...`);

    const { startOfWeek, endOfWeek } = getWeekDateRange(offsetToFetch);
    setCurrentWeekDateRange({ startOfWeek, endOfWeek });
    console.log(`Fetching for week: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`);

    const usersCollectionRef = collection(db, "users");

    try {
      const promises = AMBASSADORS_TO_TRACK.map(async (ambassador) => {
        // 1. Calculate totalSignUps (all-time)
        const totalQuery = query(usersCollectionRef, where("ambassador_referral", "==", ambassador.referralCode));
        const totalSnapshot = await getCountFromServer(totalQuery);
        const totalSignUps = totalSnapshot.data().count;

        // 2. Calculate weeklySignUps (for the selected week)
        const weeklyQuery = query(
          usersCollectionRef,
          where("ambassador_referral", "==", ambassador.referralCode),
          where("createdAt", ">=", Timestamp.fromDate(startOfWeek)),
          where("createdAt", "<=", Timestamp.fromDate(endOfWeek))
        );
        const weeklySnapshot = await getCountFromServer(weeklyQuery);
        const weeklySignUps = weeklySnapshot.data().count;

        return {
          ...ambassador, // id, name, referralCode from AMBASSADORS_TO_TRACK
          totalSignUps,
          weeklySignUps,
        };
      });

      let results = await Promise.all(promises);
      
      // Sort results by weeklySignUps in descending order
      results.sort((a, b) => b.weeklySignUps - a.weeklySignUps);

      setLeaderboardData(results);
      console.log("Real leaderboard data loaded and sorted:", results);

    } catch (err: any) {
      console.error("Error fetching leaderboard data from Firebase:", err);
      setError(err);
      setLeaderboardData([]); // Clear data on error
    }

    setIsLoading(false);
  }, [weekOffset]); // weekOffset is the primary dependency that triggers re-fetch

  const goToPreviousWeek = () => {
    setWeekOffset(prevOffset => prevOffset - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(prevOffset => (prevOffset < 0 ? prevOffset + 1 : 0));
  };

  useEffect(() => {
    fetchLeaderboard(weekOffset);
  }, [weekOffset, fetchLeaderboard]); // fetchLeaderboard is memoized with weekOffset

  return { 
    leaderboardData, 
    isLoading, 
    error, 
    fetchLeaderboard, 
    goToPreviousWeek, 
    goToNextWeek, 
    weekOffset,
    currentWeekDateRange
  };
};

export default useAmbassadorLeaderboard; 