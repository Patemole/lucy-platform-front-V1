import { useState, useEffect } from 'react';

// Définition de l'interface pour les données d'une carte de logement
// Cette interface devrait idéalement être partagée depuis un fichier d'interfaces commun
// ou depuis l'endroit où elle est principalement définie (ex: HousingRankedList.tsx ou un store)
export interface CardData {
  id: string;
  imageUrl: string;
  label: string;    // ex: "Social", "Study", "Mixte"
  subtitle: string; // ex: "Quartier Calme, Proche Uni"
  title: string;    // Le nom principal du logement
  // rank?: number; // Optionnel, si vous avez besoin de le récupérer ici
  // price?: string; // Optionnel
}

/**
 * Hook pour déterminer le logement le mieux classé à partir d'une liste.
 * @param rankedHousings - La liste ordonnée des logements.
 * @returns Le premier logement de la liste, ou null si la liste est vide ou non fournie.
 */
export const useTopRankedHousing = (rankedHousings?: CardData[]): CardData | null => {
  const [topHousing, setTopHousing] = useState<CardData | null>(null);

  useEffect(() => {
    if (rankedHousings && rankedHousings.length > 0) {
      setTopHousing(rankedHousings[0]);
    } else {
      setTopHousing(null);
    }
  }, [rankedHousings]); // Se met à jour si la liste des logements classés change

  return topHousing;
}; 