import { useState, useEffect } from 'react';
import { DropResult } from 'react-beautiful-dnd';

// Interface partagée (assurez-vous qu'elle correspond)
interface CardData {
  id: string;
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
}

// Fonction utilitaire pour réorganiser la liste
const reorder = (
  list: CardData[],
  startIndex: number,
  endIndex: number
): CardData[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const useRankedListDnd = (initialItems: CardData[]) => {
  const [items, setItems] = useState<CardData[]>(initialItems);

  // Mettre à jour l'état si les éléments initiaux changent
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const onDragEnd = (result: DropResult) => {
    console.log("[useRankedListDnd] onDragEnd triggered!", result);

    // Ne rien faire si l'élément est déposé en dehors de la liste
    if (!result.destination) {
      return;
    }

    // Ne rien faire si la position n'a pas changé
    if (result.destination.index === result.source.index) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
    console.log('New order:', reorderedItems.map(item => item.title)); // Pour le debug
  };

  return {
    items,
    onDragEnd,
  };
}; 