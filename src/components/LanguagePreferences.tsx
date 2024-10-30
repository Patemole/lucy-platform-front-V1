import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import variablePie from 'highcharts/modules/variable-pie';
import { Typography, Box } from '@mui/material';

// Initialize the variable pie module
if (typeof Highcharts === 'object') {
  variablePie(Highcharts);
}

// Data for preferred languages by number of interactions
const languageData = [
  { name: 'English', y: 50, z: 80 },
  { name: 'Spanish', y: 20, z: 70 },
  { name: 'French', y: 15, z: 60 },
  { name: 'German', y: 18, z: 35 },
  { name: 'Mandarin', y: 5, z: 25 },
];

const WidgetFour: React.FC = () => {
  const options = {
    chart: {
      type: 'variablepie',
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b>: {point.y} interactions',
    },
    series: [
      {
        name: 'Languages',
        minPointSize: 10,
        innerSize: '40%',
        zMin: 0,
        data: languageData,
        colors: ['#004080', '#00509E', '#0073E6', '#4D94FF', '#80BFFF'], // Adapted color scheme
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: {
            fontSize: '12px',
            color: '#011F5B', // Text color matching your application style
          },
        },
      },
    ],
  };

  return (
    <Box style={{ padding: '20px' }}>
      {/* Title for the widget */}
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
        Languages Preferences
      </Typography>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
};

export default WidgetFour;