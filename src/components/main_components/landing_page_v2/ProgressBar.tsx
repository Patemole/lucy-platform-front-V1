import React from 'react';
import { Box, Typography, LinearProgress, Grid, SvgIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Icône personnalisée pour l'état 'pending'
const PendingIcon = (props: any) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#FFA500" /> {/* Cercle orange - couleur à ajuster si besoin */}
        <rect x="6" y="11" width="12" height="2" fill="#FFFFFF" rx="1" /> {/* Tiret blanc */}
    </SvgIcon>
);

interface ProgressBarProps {
    months: { name: string; status: 'valid' | 'pending' | 'invalid' }[];
}

const getIconByStatus = (status: 'valid' | 'pending' | 'invalid') => {
    switch (status) {
        case 'valid':
            return <CheckCircleIcon sx={{ fontSize: 18, color: '#25C35E' }} />;
        case 'pending':
            // Utilisation de l'icône personnalisée
            return <PendingIcon sx={{ fontSize: 18 }} />;
        case 'invalid':
            return <CancelIcon sx={{ fontSize: 18, color: '#F04261' }} />;
        default:
            return null;
    }
};

const ProgressBar: React.FC<ProgressBarProps> = ({ months }) => {
    const totalSteps = months.length;
    // Calcule la progression basée sur le premier mois 'pending' ou le dernier 'valid'
    let activeStepIndex = months.findIndex(month => month.status === 'pending');
    if (activeStepIndex === -1) { // Si aucun pending, trouve le dernier valid
        // Remplacement de findLastIndex par une boucle inversée
        let lastValidIndex = -1;
        for (let i = months.length - 1; i >= 0; i--) {
            if (months[i].status === 'valid') {
                lastValidIndex = i;
                break; // On a trouvé le dernier, on arrête
            }
        }
        activeStepIndex = lastValidIndex; 
    }
     // Si toujours -1 (tout invalid?), on met 0 ou -1 ? Mettons -1 pour pas de barre.
    const progressPercent = totalSteps > 0 && activeStepIndex >= 0 ? ((activeStepIndex + 0.5) / totalSteps) * 100 : 0;


    return (
        <Box sx={{ width: '100%', px: { xs: 1, sm: 3 }, py: 2 }}>
            {/* Conteneur pour les mois et les icônes */}
            <Grid container spacing={1} sx={{ mb: 1.5 }} justifyContent="space-between">
                {months.map((month, index) => (
                    <Grid item key={month.name} xs>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    // Mettre en gras le mois actif (pending ou dernier valid)
                                    fontWeight: index === activeStepIndex ? 'bold' : 'normal', 
                                    color: month.status !== 'invalid' ? 'text.primary' : 'text.secondary',
                                    mr: 0.5,
                                    textAlign: 'center' 
                                }}
                            >
                                {month.name}
                            </Typography>
                            {getIconByStatus(month.status)}
                        </Box>
                    </Grid>
                ))}
            </Grid>
            
            {/* Barre de progression linéaire */}
            <LinearProgress 
                variant="determinate" 
                value={progressPercent} 
                sx={{
                    height: 8, // Hauteur de la barre
                    borderRadius: 4, // Bords arrondis
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: '#3155CC', // Nouvelle couleur bleue
                    },
                    backgroundColor: '#D6DDF5', // Nouvelle couleur de fond
                }}
            />
        </Box>
    );
};

export default ProgressBar; 