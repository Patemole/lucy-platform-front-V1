import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// L'interface FeatureItem ne contient plus sectionTitle
interface FeatureItem {
    title: string;
    image?: string;
}

// FeatureHighlightCardProps ne contient plus sectionTitle
interface FeatureHighlightCardProps {
    featureItem: FeatureItem;
    // On pourrait ajouter une prop optionnelle pour la largeur si besoin
    // sx?: object;
}

// Le composant ne reçoit plus sectionTitle
const FeatureHighlightCard: React.FC<FeatureHighlightCardProps> = ({ featureItem/*, sx*/ }) => {
    return (
        // La Box externe pourrait recevoir des styles (sx) du parent pour gérer la largeur
        <Box sx={{ width: '100%', /*maxWidth: 480,*/ mb: 4 /*, ...sx*/ }}> 
            {/* Suppression du Typography pour sectionTitle */}
            {/* <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, width: '100%', textAlign: 'left' }}>{sectionTitle}</Typography> */}
            <Paper
                variant="outlined"
                sx={{
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: '100%', // Prendra la largeur de la Box parente
                    height: 200, // Hauteur fixe pour l'instant
                    bgcolor: 'grey.200',
                    textAlign: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {featureItem.image && (
                    <Box
                        component="img"
                        src={featureItem.image}
                        alt={featureItem.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1,
                        }}
                    />
                )}
                <Box sx={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    p: 1,
                    mt: 'auto'
                }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: '500' }}>
                        {featureItem.title}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default FeatureHighlightCard; 