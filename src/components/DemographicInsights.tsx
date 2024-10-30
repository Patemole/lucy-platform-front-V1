import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { Typography, Box } from '@mui/material';
import mapDataWorld from '@highcharts/map-collection/custom/world.geo.json';

// Initialize Highcharts Map module
HighchartsMap(Highcharts);

// Data for user interactions by country with ISO A3 codes
const geographicData = [
  { code: 'USA', name: 'United States', value: 50 },
  { code: 'CAN', name: 'Canada', value: 20 },
  { code: 'DEU', name: 'Germany', value: 15 },
  { code: 'BRA', name: 'Brasil', value: 15 },
  { code: 'RUS', name: 'Russia', value: 25 },
  { code: 'GBR', name: 'United Kingdom', value: 10 },
  { code: 'AUS', name: 'Australia', value: 5 },
  { code: 'ETH', name: 'Ethiopia', value: 5},
];

// Format the data to match Highcharts requirements
const dataForMap = geographicData.map((item) => ({
  'iso-a3': item.code,
  value: item.value,
}));

const WidgetThree: React.FC = () => {
  const options = {
    chart: {
      map: mapDataWorld,
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    mapNavigation: {
      enabled: true,
      enableMouseWheelZoom: true,
    },
    colorAxis: {
      min: 0,
      stops: [
        [0, '#80BFFF'],   // Light blue for low values
        [0.5, '#00509E'], // Medium blue for mid-range values
        [1, '#004080'],   // Darker blue for high values
      ],
    },
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b>: {point.value} interactions',
    },
    series: [
      {
        type: 'map',
        mapData: mapDataWorld,
        name: 'Interactions',
        data: dataForMap,
        joinBy: ['iso-a3', 'iso-a3'],
        states: {
          hover: {
            color: '#a4edba', // Soft green for hover effect
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    ],
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginLeft: '0px',
          paddingBottom: '15px',
        }}
      >
        Demographic Behavior
      </Typography>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={options}
      />
    </Box>
  );
};

export default WidgetThree;