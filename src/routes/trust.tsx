// pages/SecurityDashboard.tsx



/*
import React from 'react';
import { Box, Typography, Grid, Link, Divider } from '@mui/material';
import DocumentBlock from '../components/DocumentBlock';  // Import du composant pour les documents
import SecurityBlock from '../components/SecurityBlock';  // Import du composant pour les contrôles
import { useTheme } from '@mui/material/styles';  // Pour accéder au thème
import { useNavigate } from 'react-router-dom';  // Pour naviguer entre les routes
import CircleIcon from '@mui/icons-material/Circle';

const SecurityDashboard: React.FC = () => {
  const theme = useTheme(); // Accéder au thème pour obtenir le logo
  const navigate = useNavigate(); // Utilisation du hook pour la navigation

  const documents = [
    'Incidence Response Plan (Coming soon)',
    'Risk Assessment Policy',
    'Data Protection Policy (Coming soon)',
    'Data Retention Policy',
    'Business Continuity Plan (Coming soon)',
    'Vendor Management Policy',
    'Security Awareness and Training Policy (Coming soon)',
    'Access Control Policy (Coming soon)',
    'Encryption Policy (Coming soon)',
  ];

  const controls = [
    {
      category: 'Infrastructure security',
      items: [
        'Unique production database authentication enforced',
        'Encryption key access restricted',
        'Unique account authentication enforced',
      ],
      moreCount: 18,
    },
    {
      category: 'Organizational security',
      items: [
        'Asset disposal procedures utilized',
        'Production inventory maintained',
        'Portable media encrypted',
      ],
      moreCount: 11,
    },
    {
      category: 'Product security',
      items: [
        'Data encryption utilized',
        'Control self-assessments conducted',
        'Penetration testing performed',
      ],
      moreCount: 2,
    },
    {
      category: 'Internal security procedures',
      items: [
        'Continuity and Disaster Recovery plans established',
        'Continuity and disaster recovery plans tested',
        'Cybersecurity insurance maintained',
      ],
      moreCount: 34,
    },
    {
      category: 'Data and privacy',
      items: [
        'Data retention procedures established',
        'Customer data deleted upon leaving',
        'Data classification policy established',
      ],
      moreCount: 0,
    }
  ];

  // Function to navigate to the controls page with the category as a query parameter
  const handleNavigateToControls = (category: string) => {
    navigate(`/controls?category=${encodeURIComponent(category)}`);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Header avec le logo et le nom de la société *
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <img src={theme.logo} alt="Lucy Logo" style={{ height: '40px', marginRight: '10px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Lucy</Typography>
      </Box>

      {/* Barre de navigation *
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '10px' }}>
        {/* Texte cliquable pour Overview *
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'bold', 
            marginRight: '20px', 
            borderBottom: '2px solid purple', 
            cursor: 'pointer', // Indiquer que c'est cliquable
            '&:hover': {
              color: 'purple'
            } 
          }}
          onClick={() => navigate('/overview')}  // Redirection vers la page Overview
        >
          Overview
        </Typography>

        {/*
        {/* Texte cliquable pour Resources *
        <Typography 
          variant="body1" 
          sx={{ 
            marginRight: '20px', 
            color: 'gray', 
            cursor: 'pointer', // Indiquer que c'est cliquable
            '&:hover': {
              color: 'purple'
            } 
          }}
          onClick={() => navigate('/resources')}  // Redirection vers la page Resources
        >
          Resources
        </Typography>
        *

        {/* Texte cliquable pour Controls *
        <Typography 
          variant="body1" 
          sx={{ 
            marginRight: '20px', 
            color: 'gray', 
            cursor: 'pointer', // Indiquer que c'est cliquable
            '&:hover': {
              color: 'purple'
            } 
          }}
          onClick={() => navigate('/controls')}  // Redirection vers la page Controls
        >
          Controls
        </Typography>
      </Box>

      <Divider sx={{ marginY: '20px' }} />

      {/* Contenu principal avec deux colonnes *
      <Grid container spacing={3}>
        {/* Colonne gauche : Titre "Resources" et DocumentBlock *
        <Grid item xs={12} md={4}>
          {/* Titre "Resources" et lien *
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Resources</Typography>
            <Link href="#" variant="body2" sx={{ color: '#7C3BEC' }}>View all 9 resources</Link>
          </Box>
          <DocumentBlock documents={documents} /> {/* Utilisation du composant DocumentBlock *
        </Grid>

        {/* Colonne droite : Titre "Controls" et SecurityBlock *
        <Grid item xs={12} md={8}>
          {/* Titre "Controls" et informations de mise à jour *
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controls</Typography>

            {/* Rectangle pour les informations de mise à jour *
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircleIcon sx={{ fontSize: '8px', color: '#25C35E', marginRight: '8px' }} />
              <Typography variant="body2" sx={{ color: '#888', marginRight: '20px' }}>
                Updated 3 days ago
              </Typography>
              <Link href="#" variant="body2" sx={{ color: '#7C3BEC' }}>View all 80 controls</Link>
            </Box>
          </Box>

          {/* Grid des blocs de sécurité *
          <Grid container spacing={3}>
            {controls.map((control, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <SecurityBlock 
                  title={control.category}
                  items={control.items}
                  moreCount={control.moreCount}
                  onNavigate={handleNavigateToControls}  // Navigate with the category
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: '30px' }} />

      {/* Pied de page *
      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="body2" sx={{ color: '#888' }}>
          My Lucy Corp
        </Typography>
      </Box>
    </Box>
  );
};

export default SecurityDashboard;
*/



// pages/SecurityDashboard.tsx
import React from 'react';
import { Box, Typography, Grid, Link, Divider } from '@mui/material';
import DocumentBlock from '../components/DocumentBlock';  // Import du composant pour les documents
import SecurityBlock from '../components/SecurityBlock';  // Import du composant pour les contrôles
import { useTheme } from '@mui/material/styles';  // Pour accéder au thème
import { useNavigate } from 'react-router-dom';  // Pour naviguer entre les routes
import CircleIcon from '@mui/icons-material/Circle';

const SecurityDashboard: React.FC = () => {
  const theme = useTheme(); // Accéder au thème pour obtenir le logo
  const navigate = useNavigate(); // Utilisation du hook pour la navigation

  const documents = [
    'Incidence Response Plan',
    'Risk Assessment Policy',
    'Information Security Policy', // need to add the s3
    'Third-Party Management Policy', // need to add the s3
    'Privileged Access Review Policy', // need to add the s3
    'Quality Assurance (QA) Program', // need to add the s3
    'Systems Development Life Cycle (SDLC)', // need to add the s3
    'Change Management Policy', // need to add the s3
    'Data Protection Policy',
    'Data Retention Policy',
    'Business Continuity Plan',
    'Vendor Management Policy',
    //'Security Awareness and Training Policy',
    'Access Control Policy',
    'Encryption Policy',
    'Privacy Policy',
    'Online Subscription Agreement',
  ];

  const controls = [
    {
      category: 'Infrastructure security',
      items: [
        'Unique production database authentication enforced',
        'Encryption key access restricted',
        'Unique account authentication enforced',
      ],
      moreCount: 18,
    },
    {
      category: 'Organizational security',
      items: [
        'Asset disposal procedures utilized',
        'Production inventory maintained',
        'Portable media encrypted',
      ],
      moreCount: 11,
    },
    {
      category: 'Product security',
      items: [
        'Data encryption utilized',
        'Control self-assessments conducted',
        'Penetration testing performed',
      ],
      moreCount: 2,
    },
    {
      category: 'Internal security procedures',
      items: [
        'Continuity and Disaster Recovery plans established',
        'Continuity and disaster recovery plans tested',
        'Cybersecurity insurance maintained',
      ],
      moreCount: 34,
    },
    {
      category: 'Data and privacy',
      items: [
        'Data retention procedures established',
        'Customer data deleted upon leaving',
        'Data classification policy established',
      ],
      moreCount: 0,
    }
  ];

  // Function to navigate to the controls page with the category as a query parameter
  const handleNavigateToControls = (category: string) => {
    navigate(`/controls?category=${encodeURIComponent(category)}`);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Header avec le logo et le nom de la société */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <img src={theme.logo} alt="Lucy Logo" style={{ height: '40px', marginRight: '10px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Lucy</Typography>
      </Box>

      {/* Barre de navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '10px' }}>
        {/* Texte cliquable pour Overview */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'bold', 
            marginRight: '20px', 
            borderBottom: '2px solid purple', 
            cursor: 'pointer', // Indiquer que c'est cliquable
            '&:hover': {
              color: 'purple'
            } 
          }}
          onClick={() => navigate('/overview')}  // Redirection vers la page Overview
        >
          Overview
        </Typography>

        {/* Texte cliquable pour Controls */}
        <Typography 
          variant="body1" 
          sx={{ 
            marginRight: '20px', 
            color: 'gray', 
            cursor: 'pointer', // Indiquer que c'est cliquable
            '&:hover': {
              color: 'purple'
            } 
          }}
          onClick={() => navigate('/controls')}  // Redirection vers la page Controls
        >
          Controls
        </Typography>
      </Box>

      <Divider sx={{ marginY: '20px' }} />

      {/* Contenu principal avec deux colonnes */}
      <Grid container spacing={3}>
        {/* Colonne gauche : Titre "Resources" et DocumentBlock */}
        <Grid item xs={12} md={4}>
          {/* Titre "Resources" et lien */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Resources</Typography>
            <Link href="#" variant="body2" sx={{ color: '#7C3BEC' }}>View all 8 resources</Link>
          </Box>
          <DocumentBlock documents={documents} /> {/* Utilisation du composant DocumentBlock */}
        </Grid>

        {/* Colonne droite : Titre "Controls" et SecurityBlock */}
        <Grid item xs={12} md={8}>
          {/* Titre "Controls" et informations de mise à jour */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controls</Typography>

            {/* Rectangle pour les informations de mise à jour */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircleIcon sx={{ fontSize: '8px', color: '#25C35E', marginRight: '8px' }} />
              <Typography variant="body2" sx={{ color: '#888', marginRight: '20px' }}>
                Updated 8 days ago
              </Typography>
              <Link href="#" variant="body2" sx={{ color: '#7C3BEC' }}>View all 80 controls</Link>
            </Box>
          </Box>

          {/* Grid des blocs de sécurité */}
          <Grid container spacing={3}>
            {controls.map((control, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <SecurityBlock 
                  title={control.category}
                  items={control.items}
                  moreCount={control.moreCount}
                  onNavigate={handleNavigateToControls}  // Navigate with the category
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: '30px' }} />

      {/* Pied de page */}
      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="body2" sx={{ color: '#888' }}>
          My Lucy Corp
        </Typography>
      </Box>
    </Box>
  );
};

export default SecurityDashboard;


