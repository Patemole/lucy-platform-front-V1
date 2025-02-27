import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { Typography, Box } from '@mui/material';
import mapDataUS from '@highcharts/map-collection/countries/us/us-all.geo.json';

// Initialize Highcharts Map module
HighchartsMap(Highcharts);

// Data for user interactions by state with postal codes
const geographicData = [
  { code: 'CA', name: 'California', value: 50 },
  { code: 'TX', name: 'Texas', value: 30 },
  { code: 'NY', name: 'New York', value: 20 },
  { code: 'FL', name: 'Florida', value: 15 },
  { code: 'IL', name: 'Illinois', value: 10 },
];

// Format the data to match Highcharts requirements
const dataForMap = geographicData.map((item) => ({
  'postal-code': item.code,
  value: item.value,
}));

const USMapWidget: React.FC = () => {
  const options = {
    chart: {
      map: mapDataUS,
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
        [0, '#EFEFFF'],
        [0.5, '#4444FF'],
        [1, '#000022'],
      ],
    },
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b>: {point.value} interactions',
    },
    series: [
      {
        type: 'map',
        mapData: mapDataUS,
        name: 'Interactions',
        data: dataForMap,
        joinBy: ['postal-code', 'postal-code'], // Match 'postal-code' from map data with 'postal-code' in your data
        states: {
          hover: {
            color: '#a4edba',
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
        Demographic Behavior by State
      </Typography>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={options}
      />
    </Box>
  );
};

export default USMapWidget;