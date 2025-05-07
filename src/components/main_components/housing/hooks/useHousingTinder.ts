import React, { useState } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web'; 
import { useDrag } from '@use-gesture/react';
import initialCardsDataFromFile from './swiping_cards.json'; // Importation du JSON

// Définir l'interface CardData ici
interface CardData {
  id: string; 
  imageUrl: string;
  label: string;
  subtitle: string;
  title: string;
}

// S'assurer que initialCardsData est typé et non vide pour l'inférence
// Utiliser les données importées
const initialCardsData: CardData[] = initialCardsDataFromFile;

const initialCount = initialCardsData.length;

const to = (i: number) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

export const useHousingTinder = () => {
  // Garder une trace des cartes qui ont été "jetées" (swipées)
  const [gone, setGone] = useState(() => new Set<number>());

  // L'état des cartes affichées
  const [cards, setCards] = useState<CardData[]>(initialCardsData);
  const progressPercentage = initialCount > 0 ? Math.round((gone.size / initialCount) * 100) : 0;

  // --- Correction de useSprings --- 
  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  })); 

  // --- Définition de bind --- 
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2; 
    const dir = xDir < 0 ? -1 : 1; 
    
    // Déterminer si la carte est en train d'être swipée HORS de l'écran MAINTENANT
    const cardIsBeingSwipedOff = !active && trigger;
    
    let potentialGoneSize = gone.size; // Taille actuelle

    // Mettre à jour l'état si la carte est swipée hors écran (si elle n'est pas déjà partie)
    if (cardIsBeingSwipedOff && !gone.has(index)) {
        setGone(prevGone => new Set(prevGone).add(index)); 
        potentialGoneSize++; // Incrémenter la taille potentielle pour la vérification de reset
    }

    api.start(i => {
      if (index !== i) return; // On affecte seulement la carte en cours de drag
      
      // La carte est considérée partie si elle est dans `gone` OU si elle est en train d'être swipée maintenant
      const isEffectivelyGone = gone.has(index) || cardIsBeingSwipedOff;
      
      // Si la carte est partie (ou en train de partir), on l'anime hors de l'écran, sinon on la suit ou la ramène
      const x = isEffectivelyGone ? (200 + window.innerWidth) * dir : active ? mx : 0; 
      const rot = mx / 100 + (isEffectivelyGone ? dir * 10 * vx : 0); 
      const scale = active ? 1.1 : 1; 
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isEffectivelyGone ? 200 : 500 }, // Ajuster la tension
      };
    });

    // Si toutes les cartes sont parties (en tenant compte de celle qui vient de partir)
    if (cardIsBeingSwipedOff && potentialGoneSize === cards.length) {
      console.log("All cards swiped via drag, resetting...");
       setTimeout(() => {
         setGone(() => new Set<number>()); // Utiliser setGone pour vider
         api.start(i => to(i));
         // Optionnel: recharger les cartes initiales ou de nouvelles cartes
         // setCards(initialCardsData);
       }, 600);
     }
  });

  // --- Définition de swipe --- 
  const swipe = (dir: 'left' | 'right') => {
    const remainingIndices = Array.from({ length: cards.length }, (_, i) => i).filter(i => !gone.has(i));
    if (remainingIndices.length === 0) return; 
    const topmostIndex = Math.max(...remainingIndices);
    setGone(prevGone => new Set(prevGone).add(topmostIndex));
    const x = (200 + window.innerWidth) * (dir === 'left' ? -1 : 1);
    const rot = (dir === 'left' ? -1 : 1) * 10 * 5; 
    api.start(i => {
      if (topmostIndex !== i) return;
      return { x, rot, delay: undefined, config: { friction: 50, tension: 200 } }
    });
    if (gone.size === cards.length) {
      setTimeout(() => {
        gone.clear();
        api.start(i => to(i));
      }, 600);
    }
  }

  // --- Définition de goBack --- 
  const goBack = () => {
      // Trouver l'index le plus élevé dans le set `gone` (la dernière carte swipée)
      const lastGoneIndex = Math.max(...Array.from(gone));

      // Vérifier s'il y a une carte à restaurer
      if (lastGoneIndex !== -Infinity && lastGoneIndex >= 0) {
          console.log(`[useHousingTinder] Attempting to go back. Restoring card index: ${lastGoneIndex}`);
          // Retirer l'index du set `gone`
          setGone(prevGone => {
              const newGone = new Set(prevGone);
              newGone.delete(lastGoneIndex);
              return newGone;
          });

          // Animer la carte pour la faire revenir à sa position initiale
          api.start(i => {
              if (lastGoneIndex === i) {
                  // Ramener à la position définie par `to`
                  return { ...to(i), immediate: false }; 
              }
              // Les autres cartes ne bougent pas
              return undefined; 
          });
      } else {
          console.log("[useHousingTinder] No card to go back to.");
      }
  }

  // --- Correction de l'objet retourné --- 
  return {
    cards, 
    props, 
    bind,  
    swipe, 
    goBack,
    progressPercentage
  };
}; 