// pages/SecurityControlsPage.tsx
import React from 'react';
import { Box, Typography, Grid, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ControlsTable from '../components/ControlsTable'; // Import du composant de tableau des contrôles

const SecurityControlsPage: React.FC = () => {
  const theme = useTheme(); // Accéder au thème pour obtenir le logo
  const navigate = useNavigate(); // Hook pour la navigation

  // Liste des catégories de contrôles à afficher dans la colonne gauche
  const controlCategories = [
    'Infrastructure security',
    'Organizational security',
    'Product security',
    'Internal security procedures',
    'Data and privacy'
  ];

  // Données des contrôles par catégorie à afficher dans la colonne droite
  const controls = {
    'Infrastructure security': [
      { title: 'Unique production database authentication enforced', description: 'The company requires authentication to production datastores to use authorized secure authentication mechanisms, such as unique SSH key.' },
      { title: 'Encryption key access restricted', description: 'The company restricts privileged access to encryption keys to authorized users with a business need.' },
      { title: 'Unique account authentication enforced', description: 'The company requires authentication to systems and applications to use unique username and password or authorized Secure Socket Shell (SSH) keys.' },
      { title: 'Production application access restricted', description: 'System access restricted to authorized access only.' },
      { title: 'Access control procedures established', description: 'The company’s access control policy documents the requirements for the following access control functions: adding new users; modifying users; and removing an existing user’s access.' },
      { title: 'Production database access restricted', description: 'The company restricts privileged access to databases to authorized users with a business need.' },
      { title: 'Firewall access restricted', description: 'The company restricts privileged access to the firewall to authorized users with a business need.' },
      { title: 'Production OS access restricted', description: 'The company restricts privileged access to the operating system to authorized users with a business need.' },
      { title: 'Production network access restricted', description: 'The company restricts privileged access to the production network to authorized users with a business need.' },
      { title: 'Access revoked upon termination', description: 'The company completes termination checklists to ensure that access is revoked for terminated employees within SLAs.' },
      { title: 'Unique network system authentication enforced', description: 'The company requires authentication to the "production network" to use unique usernames and passwords or authorized Secure Socket Shell (SSH) keys.' },
      { title: 'Remote access MFA enforced', description: 'The company’s production systems can only be remotely accessed by authorized employees possessing a valid multi-factor authentication (MFA) method.' },
      { title: 'Remote access encrypted enforced', description: 'The company’s production systems can only be remotely accessed by authorized employees via an approved encrypted connection.' },
      { title: 'Intrusion detection system utilized', description: 'The company uses an intrusion detection system to provide continuous monitoring of the company’s network and early detection of potential security breaches.' },
      { title: 'Log management utilized', description: 'The company utilizes a log management tool to identify events that may have a potential impact on the company’s ability to achieve its security objectives.' },
      { title: 'Infrastructure performance monitored', description: 'An infrastructure monitoring tool is utilized to monitor systems, infrastructure, and performance and generates alerts when specific predefined thresholds are met.' },
      { title: 'Network segmentation implemented', description: 'The company’s network is segmented to prevent unauthorized access to customer data.' },
      { title: 'Network firewalls reviewed', description: 'The company reviews its firewall rulesets at least annually. Required changes are tracked to completion.' },
      { title: 'Network firewalls utilized', description: 'The company uses firewalls and configures them to prevent unauthorized access.' },
      { title: 'Network and system hardening standards maintained', description: 'The company’s network and system hardening standards are documented, based on industry best practices, and reviewed at least annually.' },
      { title: 'Service infrastructure maintained', description: 'The company has infrastructure supporting the service patched as a part of routine maintenance and as a result of identified vulnerabilities to help ensure that servers supporting the service are hardened against security threats.' }
    ],
    'Organizational security': [
      { title: 'Asset disposal procedures utilized', description: 'The company has electronic media containing confidential information purged or destroyed in accordance with best practices, and certificates of destruction are issued for each device destroyed.' },
      { title: 'Production inventory maintained', description: 'The company maintains a formal inventory of production system assets.' },
      { title: 'Portable media encrypted', description: 'The company encrypts portable and removable media devices when used.' },
      { title: 'Anti-malware technology utilized', description: 'The company deploys anti-malware technology to environments commonly susceptible to malicious attacks and configures this to be updated routinely, logged, and installed on all relevant systems.' },
      { title: 'Employee background checks performed', description: 'The company performs background checks on new employees.' },
      { title: 'Code of Conduct acknowledged by employees and enforced', description: 'The company requires employees to acknowledge a code of conduct at the time of hire. Employees who violate the code of conduct are subject to disciplinary actions in accordance with a disciplinary policy.' },
      { title: 'Confidentiality Agreement acknowledged by contractors', description: 'The company requires contractors to sign a confidentiality agreement at the time of engagement.' },
      { title: 'Confidentiality Agreement acknowledged by employees', description: 'The company requires employees to sign a confidentiality agreement during onboarding.' },
      { title: 'Performance evaluations conducted', description: 'The company managers are required to complete performance evaluations for direct reports at least annually.' },
      { title: 'Password policy enforced', description: 'The company requires passwords for in-scope system components to be configured according to the company’s policy.' },
      { title: 'MDM system utilized', description: 'The company has a mobile device management (MDM) system in place to centrally manage mobile devices supporting the service.' },
      { title: 'Visitor procedures enforced', description: 'The company requires visitors to sign-in, wear a visitor badge, and be escorted by an authorized employee when accessing the data center or secure areas.' },
      { title: 'Security awareness training implemented', description: 'The company requires employees to complete security awareness training within thirty days of hire and at least annually thereafter.' }
    ],
    'Product security': [
      { title: 'Data encryption utilized', description: 'The company’s datastores housing sensitive customer data are encrypted at rest.' },
      { title: 'Control self-assessments conducted', description: 'The company performs control self-assessments at least annually to gain assurance that controls are in place and operating effectively.' },
      { title: 'Penetration testing performed', description: 'The company’s penetration testing is performed at least annually. A remediation plan is developed and changes are implemented to remediate vulnerabilities in accordance with SLAs.' },
      { title: 'Data transmission encrypted', description: 'The company uses secure data transmission protocols to encrypt confidential and sensitive data when transmitted over public networks.' },
      { title: 'Vulnerability and system monitoring procedures established', description: 'The company’s formal policies outline the requirements for the following functions related to IT / Engineering: vulnerability management and system monitoring.' }
    ],
    'Internal security procedures': [
      { title: 'Continuity and Disaster Recovery plans established', description: 'The company has Business Continuity and Disaster Recovery Plans in place that outline communication plans in order to maintain information security continuity in the event of the unavailability of key personnel.' },
      { title: 'Continuity and disaster recovery plans tested', description: 'The company has a documented business continuity/disaster recovery (BC/DR) plan and tests it at least annually.' },
      { title: 'Cybersecurity insurance maintained', description: 'The company maintains cybersecurity insurance to mitigate the financial impact of business disruptions.' },
      { title: 'Configuration management system established', description: 'The company has a configuration management procedure in place to ensure that system configurations are deployed consistently throughout the environment.' },
      { title: 'Change management procedures enforced', description: 'The company requires changes to software and infrastructure components of the service to be authorized, formally documented, tested, reviewed, and approved prior to being implemented in the production environment.' },
      { title: 'Production deployment access restricted', description: 'The company restricts access to migrate changes to production to authorized personnel.' },
      { title: 'Development lifecycle established', description: 'The company has a formal systems development life cycle (SDLC) methodology in place that governs the development, acquisition, implementation, changes (including emergency changes), and maintenance of information systems and related technology requirements.' },
      { title: 'Whistleblower policy established', description: 'The company has established a formalized whistleblower policy, and an anonymous communication channel is in place for users to report potential issues or fraud concerns.' }
    ],
    'Data and privacy': [
      { title: 'Data retention procedures established', description: 'The company has formal retention and disposal procedures in place to guide the secure retention and disposal of company and customer data.' },
      { title: 'Customer data deleted upon leaving', description: 'The company purges or removes customer data containing confidential information from the application environment, in accordance with best practices, when customers leave the service.' },
      { title: 'Data classification policy established', description: 'The company has a data classification policy in place to help ensure that confidential data is properly secured and restricted to authorized personnel.' },
    ],

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
        <Typography 
          variant="body1" 
          sx={{ marginRight: '20px', cursor: 'pointer', color: 'gray', '&:hover': { color: 'purple' }}}
          onClick={() => navigate('/')}  // Redirection vers la page Overview
        >
          Overview
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ marginRight: '20px', color: 'gray', cursor: 'pointer', '&:hover': { color: 'purple' }}}
          onClick={() => navigate('/resources')}  // Redirection vers la page Resources
        >
          Resources
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ fontWeight: 'bold', marginRight: '20px', cursor: 'pointer', color: 'black', borderBottom: '2px solid purple' }}
          onClick={() => navigate('/controls')}  // Redirection vers la page Controls
        >
          Controls
        </Typography>
      </Box>

      <Divider sx={{ marginY: '20px' }} />

      {/* Contenu principal avec deux colonnes */}
      <Grid container spacing={3}>
        {/* Colonne gauche : Liste des catégories de contrôles */}
        <Grid item xs={12} md={3}> {/* 30% */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Control Categories</Typography>
          <List>
            {controlCategories.map((category, index) => (
              <ListItem 
                key={index} 
                sx={{ paddingY: '8px', cursor: 'pointer', '&:hover': { color: 'purple' } }}  // Style de survol
                onClick={() => navigate(`/controls/${category}`)}  // Naviguer vers les détails de la catégorie
              >
                <ListItemText primary={category} />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Colonne droite : Liste des contrôles pour chaque catégorie */}
        <Grid item xs={12} md={9}> {/* 70% */}
          {Object.entries(controls).map(([category, controlItems], index) => (
            <Box key={index} sx={{ marginBottom: '20px' }}>
              {/* Titre de la catégorie */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                {category}
              </Typography>

              {/* Tableau des contrôles */}
              <ControlsTable controls={controlItems} />
            </Box>
          ))}
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

export default SecurityControlsPage;