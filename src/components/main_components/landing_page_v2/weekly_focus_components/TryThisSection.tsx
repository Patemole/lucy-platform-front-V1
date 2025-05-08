import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Renommé depuis TryThis - Idéalement, ce type pourrait être dans un fichier partagé
interface FeatureItem {
    title: string;
    image?: string;
}

// Renommé depuis TryThisSectionProps et ajout de sectionTitle
interface FeatureHighlightCardProps {
    sectionTitle: string; // Nouveau prop pour le titre de la section
    featureItem: FeatureItem; // Renommé depuis tryThis
}

// Renommé depuis TryThisSection
const FeatureHighlightCard: React.FC<FeatureHighlightCardProps> = ({ sectionTitle, featureItem }) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 480, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Utilisation de la nouvelle prop sectionTitle */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, width: '100%', textAlign: 'left' }}>{sectionTitle}</Typography>
            <Paper
                variant="outlined"
                sx={{
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: '100%',
                    height: 200,
                    bgcolor: 'grey.200',
                    textAlign: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Utilisation de featureItem au lieu de tryThis */}
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
                    {/* Utilisation de featureItem au lieu de tryThis */}
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: '500' }}>
                        {featureItem.title}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

// Renommage de l'exportation par défaut
export default FeatureHighlightCard; 