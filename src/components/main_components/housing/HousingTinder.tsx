import React, { useState } from 'react';
import { Box } from '@mui/material';
import HousingCard from './HousingCard';
import HousingActions from './HousingActions';
import HousingHeader from './HousingHeader';
import HousingResults from './results/HousingResults';
// import TinderCard from 'react-tinder-card'; // Supprimer l'ancien import
import { useHousingTinder } from './hooks/useHousingTinder';
import { animated } from '@react-spring/web'; // Importer animated
import { interpolate } from '@react-spring/web'; // Importer interpolate

const HousingTinder: React.FC = () => {
  // Utiliser le hook mis à jour
  const { cards, props, bind, swipe, goBack, progressPercentage } = useHousingTinder();

  // <<< Etat pour afficher les résultats >>>
  const [showResultsView, setShowResultsView] = useState(false);

  // Modifier cette fonction pour afficher les résultats
  const handleSeeResults = () => {
    console.log("'See results' button clicked! Showing results...");
    setShowResultsView(true);
  };

  // TODO: Ajouter une logique pour obtenir le classement réel
  // Pour l'instant, on utilise juste l'ordre initial des cartes
  const fakeRankedCards = cards; 

  return (
    <Box sx={{
      flexGrow: 1, 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '1px 0px',
      position: 'relative',
      overflow: 'hidden', // Très important pour contenir les cartes animées
      cursor: 'grab' // Indiquer qu'on peut saisir
    }}>
      {/* <<< Ajouter le Header ici >>> */}
      <HousingHeader 
        title="Housing Matching"
        subtitle="Want to know which housing is for you. If you like it, swipe right. If you don't, swipe left."
        progress={progressPercentage}
        onSeeResults={handleSeeResults}
      />

      {/* Affichage conditionnel : Deck OU Résultats */}
      {showResultsView ? (
        <HousingResults rankedCards={fakeRankedCards} />
      ) : (
        <React.Fragment> {/* Utiliser Fragment pour grouper le deck et les actions */}
          {/* Conteneur pour le deck de cartes */}
          <Box sx={{ 
              width: '90vw', 
              maxWidth: '350px',
              height: '500px',
              position: 'relative',
              marginBottom: 4
          }}> 
            {props.map(({ x, y, rot, scale }, i) => (
              <animated.div
                key={cards[i].id}
                style={{ 
                    position: 'absolute', // Empiler les cartes
                    width: '100%', // Prendre toute la largeur du conteneur du deck
                    height: '100%', // Prendre toute la hauteur
                    willChange: 'transform', // Optimisation pour l'animation
                    display: 'flex', // Centrer la carte à l'intérieur de l'animated.div
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none', // Important pour @use-gesture
                    // Appliquer les transformations animées
                    transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                }}
              >
                {/* Appliquer le geste de drag et la rotation à l'intérieur */}
                <animated.div
                  {...bind(i)} // Appliquer le gestionnaire de geste ici
                  style={{
                    width: '100%',
                    height: 'auto', // Laisser la hauteur s'ajuster à la carte
                    transform: interpolate([rot, scale], (r, s) => `perspective(1500px) rotateX(0deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`),
                  }}
                >
                  <HousingCard 
                    imageUrl={cards[i].imageUrl}
                    label={cards[i].label}
                    subtitle={cards[i].subtitle}
                    title={cards[i].title}
                  />
                </animated.div>
              </animated.div>
            ))}
          </Box>

          {/* Les actions ne sont visibles que si les résultats ne sont pas affichés */}
          <HousingActions 
            onReload={goBack} 
            onDislike={() => swipe('left')} 
            onLike={() => swipe('right')} 
          />
        </React.Fragment>
      )}
      
      {/* Le message de fin peut rester si vous gardez la logique de reset */}
      {/* {cards.length === 0 && ... } */}

    </Box>
  );
};

// Supprimer l'ancien style CSS car géré par react-spring maintenant
// const style = document.createElement('style');
// style.innerHTML = `
//   .swipe {
//     position: absolute;
//   }
// `;
// document.head.appendChild(style);

export default HousingTinder; 