import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import HousingCard from './HousingCard';
import HousingActions from './HousingActions';
import HousingHeader from './HousingHeader';
import HousingResults from './results/HousingResults';
import { useHousingTinder } from './hooks/useHousingTinder';
import { animated, interpolate } from '@react-spring/web';
import { useRankedListDnd } from './results/hooks/useRankedListDnd';
import { CardData } from './results/hooks/useRankedListDnd';

const initialFakeHousingOptions: CardData[] = [
  {
    id: 'quad',
    title: 'Quad',
    imageUrl: '/quad.png',
    label: 'Social',
    subtitle: 'Ware house is perfect fit for you'
  },
  {
    id: 'hill',
    title: 'Hill',
    imageUrl: '/hill.jpg',
    label: 'Social/partial',
    subtitle: 'Good for engineers and have food hall in it'
  },
  {
    id: 'lauder',
    title: 'Lauder',
    imageUrl: '/lauder.jpg',
    label: 'Social',
    subtitle: 'Brand new, suite style appartment'
  },
   {
    id: 'gregory',
    title: 'Gregory',
    imageUrl: '/gregory.jpg',
    label: 'Close community',
    subtitle: 'Perfect for people that like small and close community'
  }
];

interface HousingTinderProps {
  isResultsViewActive: boolean;
  onShowResults: () => void;
  onTopRankedChange: (item: CardData | null) => void; // <-- Assurez-vous que cette ligne est présente
}

const HousingTinder: React.FC<HousingTinderProps> = ({
  isResultsViewActive,
  onShowResults,
  onTopRankedChange, // <-- Et que la prop est récupérée ici
}) => {
  const { cards: tinderCards, props: tinderProps, bind: tinderBind, swipe, goBack, progressPercentage } = useHousingTinder();
  const { items: rankedItems, onDragEnd, topRankedItem } = useRankedListDnd(initialFakeHousingOptions);

  useEffect(() => {
    if (isResultsViewActive) {
      onTopRankedChange(topRankedItem);
    }
  }, [topRankedItem, isResultsViewActive, onTopRankedChange]);

  const handleSeeResults = () => {
    console.log("'See results' button clicked! Calling onShowResults...");
    onShowResults();
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
      overflow: 'hidden',
      cursor: 'grab'
    }}>
      {isResultsViewActive ? (
        <HousingResults rankedCards={rankedItems} onDragEndList={onDragEnd} />
      ) : (
        <React.Fragment>
          <HousingHeader
            title="Housing Matching"
            subtitle="Want to know which housing is for you. If you like it, swipe right. If you don't, swipe left."
            progress={progressPercentage}
            onSeeResults={handleSeeResults}
          />
          <Box sx={{
              width: '90vw',
              maxWidth: '350px',
              height: '500px',
              position: 'relative',
              marginBottom: 4
          }}>
            {tinderProps.map(({ x, y, rot, scale }, i) => (
              <animated.div
                key={tinderCards[i].id}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    willChange: 'transform',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none',
                    transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                }}
              >
                <animated.div
                  {...tinderBind(i)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    transform: interpolate([rot, scale], (r, s) => `perspective(1500px) rotateX(0deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`),
                  }}
                >
                  <HousingCard
                    imageUrl={tinderCards[i].imageUrl}
                    label={tinderCards[i].label}
                    subtitle={tinderCards[i].subtitle}
                    title={tinderCards[i].title}
                  />
                </animated.div>
              </animated.div>
            ))}
          </Box>
          <HousingActions
            onReload={goBack}
            onDislike={() => swipe('left')}
            onLike={() => swipe('right')}
          />
        </React.Fragment>
      )}
    </Box>
  );
};

export default HousingTinder;