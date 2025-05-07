import { useState, useEffect } from 'react';
import { DropResult } from 'react-beautiful-dnd';

// Interface partagée (assurez-vous qu'elle correspond)
export interface CardData {
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
  const [topRankedItem, setTopRankedItem] = useState<CardData | null>(null);

  // Mettre à jour l'état et le topRankedItem si les éléments initiaux changent
  useEffect(() => {
    setItems(initialItems);
    if (initialItems && initialItems.length > 0) {
      setTopRankedItem(initialItems[0]);
    } else {
      setTopRankedItem(null);
    }
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
    // Mettre à jour le topRankedItem après le réarrangement
    if (reorderedItems && reorderedItems.length > 0) {
      setTopRankedItem(reorderedItems[0]);
    } else {
      setTopRankedItem(null);
    }
    console.log('New order:', reorderedItems.map(item => item.title)); // Pour le debug
    console.log('Top ranked item after DND:', reorderedItems.length > 0 ? reorderedItems[0].title : 'None');
  };

  return {
    items,
    onDragEnd,
    topRankedItem, // Retourner l'élément le mieux classé
  };
}; 