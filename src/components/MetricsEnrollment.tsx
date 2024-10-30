/*

import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SelectChangeEvent } from '@mui/material/Select'; // Import du type spécifique de Material-UI

const Metrics = () => {
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');

  // Utilisation du type SelectChangeEvent de Material-UI
  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value);
  };

  return (
    <div style={{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header avec le titre à gauche et le menu déroulant à droite *
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 20px', // Moins de padding en haut et en bas
          marginBottom: '15px', // Réduction de la marge inférieure
        }}
      >
        {/* Titre aligné avec les rectangles *
        <Typography
          variant="h6"
          style={{
            fontWeight: 'bold',
            color: '#011F5B',
            fontSize: '1.25rem',
            marginLeft: '0px', // Suppression du décalage inutile
          }}
        >
          Metrics
        </Typography>
        <FormControl variant="outlined" size="small">
          <Select
            value={metricsTimeFilter}
            onChange={handleMetricsTimeFilterChange}
            IconComponent={ArrowDropDownIcon}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            style={{
              border: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
            }}
          >
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Last Week">Last Week</MenuItem>
            <MenuItem value="Last Month">Last Month</MenuItem>
            <MenuItem value="Last Year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Section des métriques avec les 3 rectangles *
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          padding: '0px 20px', // Ajout de padding à gauche et à droite pour aligner avec le titre
          height: '100%',
        }}
      >
        {/* Rectangle Vert (2x large) *
        <div
          style={{
            backgroundColor: '#e0ffe0',
            padding: '20px',
            borderRadius: '8px',
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#66ff66',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              700
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Number of Interactions
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +12% from yesterday
            </Typography>
          </div>
        </div>

        {/* Rectangle Rouge *
        <div
          style={{
            backgroundColor: '#ffe0e0',
            padding: '20px',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ff5c5c',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              24
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Missing information
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +12% from yesterday
            </Typography>
          </div>
        </div>

        {/* Rectangle Jaune *
        <div
          style={{
            backgroundColor: '#fff0e0',
            padding: '20px',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffb366',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              186
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Unique Users
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +1% from yesterday
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
*/




import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SelectChangeEvent } from '@mui/material/Select';

const Metrics = () => {
  const [metricsTimeFilter, setMetricsTimeFilter] = useState('Today');

  // Utilisation du type SelectChangeEvent de Material-UI
  const handleMetricsTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setMetricsTimeFilter(event.target.value);
  };

  return (
    <div style={{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header avec le titre à gauche et le menu déroulant à droite */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 20px',
          marginBottom: '15px',
        }}
      >
        <Typography
          variant="h6"
          style={{
            fontWeight: 'bold',
            color: '#011F5B',
            fontSize: '1.25rem',
            marginLeft: '0px',
          }}
        >
          Metrics
        </Typography>
        <FormControl variant="outlined" size="small">
          <Select
            value={metricsTimeFilter}
            onChange={handleMetricsTimeFilterChange}
            IconComponent={ArrowDropDownIcon}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            style={{
              border: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
            }}
          >
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Last Week">Last Week</MenuItem>
            <MenuItem value="Last Month">Last Month</MenuItem>
            <MenuItem value="Last Year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Section des métriques avec les rectangles */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          padding: '0px 20px',
          height: '100%',
        }}
      >
        {/* Nouveau rectangle pour le temps gagné */}
        <div
          style={{
            backgroundColor: '#e6f7ff',
            padding: '20px',
            borderRadius: '8px',
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#66c2ff',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              72h
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Estimated Time Saved
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +5% from last week
            </Typography>
          </div>
        </div>

        {/* Rectangle Vert pour les interactions */}
        <div
          style={{
            backgroundColor: '#e0ffe0',
            padding: '20px',
            borderRadius: '8px',
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#66ff66',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              2,243
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Number of Interactions
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +12% from last week
            </Typography>
          </div>
        </div>

        {/* Rectangle Rouge pour les informations manquantes */}
        <div
          style={{
            backgroundColor: '#ffe0e0',
            padding: '20px',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ff5c5c',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              24
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Missing information
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +12% from last week
            </Typography>
          </div>
        </div>

        {/* Rectangle Jaune pour les utilisateurs uniques */}
        <div
          style={{
            backgroundColor: '#fff0e0',
            padding: '20px',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffb366',
                marginRight: '10px',
              }}
            ></div>
            <Typography variant="h5" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              574
            </Typography>
          </div>
          <div>
            <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Unique Users
            </Typography>
            <Typography
              variant="caption"
              style={{ fontWeight: '300', fontSize: '0.75rem', color: '#0000ff', marginTop: '5px' }}
            >
              +1% from last week
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;