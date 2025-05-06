import React from 'react';
import { Box } from '@mui/material';
import HousingCard from './HousingCard';
import HousingActions from './HousingActions';
import HousingHeader from './HousingHeader';
import HousingResults from './results/HousingResults';
import { useHousingTinder } from './hooks/useHousingTinder';
import { animated, interpolate } from '@react-spring/web';

// --- Définition des données de logement pour les résultats ---
const fakeHousingOptions = [
  {
    id: 'quad',
    title: 'Quad',
    imageUrl: '/quad.png', // Assurez-vous que ces images existent dans /public
    label: 'Social',
    subtitle: 'Ware house is perfect fit for you' 
  },
  {
    id: 'hill',
    title: 'Hill',
    imageUrl: '/hill.jpg', // Nom d'image hypothétique
    label: 'Social/partcial', // Note: faute de frappe dans l'image originale ?
    subtitle: 'Good for engineers and have food hall in it'
  },
  {
    id: 'lauder',
    title: 'Lauder',
    imageUrl: '/lauder.jpg', // Nom d'image hypothétique
    label: 'Social',
    subtitle: 'Brand new, suite style appartment'
  },
   {
    id: 'gregory',
    title: 'Gregory',
    imageUrl: '/gregory.jpg', // Nom d'image hypothétique
    label: 'Close community',
    subtitle: 'Perfect for people that like small and close community'
  }
  // Ajoutez d'autres logements si nécessaire
];
// --- Fin définition données logement ---

// Interface pour les props de HousingTinder
interface HousingTinderProps {
  isResultsViewActive: boolean;
  onShowResults: () => void;
}

const HousingTinder: React.FC<HousingTinderProps> = ({ isResultsViewActive, onShowResults }) => {
  const { cards, props, bind, swipe, goBack, progressPercentage } = useHousingTinder();

  // La fonction handleSeeResults appelle maintenant la prop onShowResults
  const handleSeeResults = () => {
    console.log("'See results' button clicked! Calling onShowResults...");
    onShowResults(); // Appelle la fonction passée par HousingMain
  };

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
      {/* Utiliser la prop isResultsViewActive pour l'affichage conditionnel */}
      {isResultsViewActive ? (
        <HousingResults rankedCards={fakeHousingOptions} /> 
      ) : (
        <React.Fragment> 
          <HousingHeader 
            title="Housing Matching"
            subtitle="Want to know which housing is for you. If you like it, swipe right. If you don't, swipe left."
            progress={progressPercentage}
            onSeeResults={handleSeeResults} // handleSeeResults appelle maintenant onShowResults
          />
          
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