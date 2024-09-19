import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { FiCheck } from 'react-icons/fi';

interface CourseRectangleProps {
  title: string;
  semester: string;
  credit: number;
  prerequisites?: string[];
  work: number;
  quality: number;
  difficulty: number;
}

// Composant CourseRectangle
const CourseRectangle: React.FC<CourseRectangleProps> = ({
  title,
  semester,
  credit,
  prerequisites = [],
  work,
  quality,
  difficulty,
}) => {
  // Fonction pour calculer le pourcentage de progression pour chaque critère
  const calculateProgress = (value: number): number => {
    return (value / 5) * 100; // Valeur basée sur 5
  };

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #D3D3D3',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '100%', // Largeur dynamique en fonction du contenu
        display: 'inline-block',
        textAlign: 'left', // Alignement à gauche
        boxSizing: 'border-box',
        position: 'relative',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Titre du cours, limité à une seule ligne */}
      <Typography
        sx={{
          fontWeight: 'bold',
          fontSize: '1rem',
          color: '#011F5B',
          marginBottom: '12px',
          whiteSpace: 'nowrap', // Forcer le texte sur une seule ligne
          overflow: 'hidden', // Masquer le texte en excès
          textOverflow: 'ellipsis', // Ajouter des points de suspension si nécessaire
        }}
      >
        {title}
      </Typography>

      {/* Semestre, crédits et prérequis */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {/* Semestre */}
        <Box
          sx={{
            backgroundColor: '#FFD9BF',
            color: '#F97315',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.675rem',
            textAlign: 'center',
          }}
        >
          {semester}
        </Box>

        {/* Crédit */}
        <Box
          sx={{
            backgroundColor: '#D6EAF7',
            color: '#011F5B',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.675rem',
            textAlign: 'center',
          }}
        >
          {credit} CU
        </Box>

        {/* Prérequis */}
        {prerequisites.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
              sx={{
                backgroundColor: '#FEEAEA',
                color: '#EF4361',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.675rem',
              }}
            >
              {prerequisites.join(', ')}
            </Box>

            {/* Icône de validation */}
            <Box
              sx={{
                width: '15px',
                height: '15px',
                backgroundColor: '#25C35E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiCheck style={{ color: 'white' }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Cercles de données pour Work, Quality et Difficulty */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center', gap: '16px' }}>
        {/* Cercle pour Work */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Alignement horizontal */}
          <Box position="relative" display="inline-flex">
            {/* Cercle de fond */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={40}  
              thickness={5}
              sx={{ color: '#E8F4FB', position: 'absolute' }}
            />
            {/* Cercle de progression */}
            <CircularProgress
              variant="determinate"
              value={calculateProgress(work)}
              size={40}  
              thickness={5}
              sx={{ color: '#3155CC', zIndex: 1 }}
            />
            {/* Valeur au centre */}
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" sx={{ color: '#011F5B', fontWeight: 'bold', fontSize: '0.675rem' }}>
                {work}
              </Typography>
            </Box>
          </Box>
          {/* Légende à droite du cercle */}
          <Typography sx={{ fontWeight: '500', fontSize: '0.675rem', color: '#011F5B', marginLeft: '8px' }}>
            Work
          </Typography>
        </Box>

        {/* Cercle pour Quality */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Alignement horizontal */}
          <Box position="relative" display="inline-flex">
            {/* Cercle de fond */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={40}  
              thickness={5}
              sx={{ color: '#E8F4FB', position: 'absolute' }}
            />
            {/* Cercle de progression */}
            <CircularProgress
              variant="determinate"
              value={calculateProgress(quality)}
              size={40} 
              thickness={5}
              sx={{ color: '#3155CC', zIndex: 1 }}
            />
            {/* Valeur au centre */}
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" sx={{ color: '#011F5B', fontWeight: 'bold', fontSize: '0.675rem' }}>
                {quality}
              </Typography>
            </Box>
          </Box>
          {/* Légende à droite du cercle */}
          <Typography sx={{ fontWeight: '500', fontSize: '0.675rem', color: '#011F5B', marginLeft: '8px' }}>
            Quality
          </Typography>
        </Box>

        {/* Cercle pour Difficulty */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Alignement horizontal */}
          <Box position="relative" display="inline-flex">
            {/* Cercle de fond */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={40}  
              thickness={5}
              sx={{ color: '#E8F4FB', position: 'absolute' }}
            />
            {/* Cercle de progression */}
            <CircularProgress
              variant="determinate"
              value={calculateProgress(difficulty)}
              size={40}  
              thickness={5}
              sx={{ color: '#3155CC', zIndex: 1 }}
            />
            {/* Valeur au centre */}
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" sx={{ color: '#011F5B', fontWeight: 'bold', fontSize: '0.675rem' }}>
                {difficulty}
              </Typography>
            </Box>
          </Box>
          {/* Légende à droite du cercle */}
          <Typography sx={{ fontWeight: '500', fontSize: '0.675rem', color: '#011F5B', marginLeft: '8px' }}>
            Difficulty
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseRectangle;





