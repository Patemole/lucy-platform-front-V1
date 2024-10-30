import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Typography, Box } from '@mui/material';

const WidgetSixBenchmark: React.FC = () => {
  // Sample data for benchmark comparison
  const benchmarkData = [
    { name: 'Private Universities', y: 75 },
    { name: 'Upenn', y: 70 },
    { name: 'Ivy League', y: 65 },
    { name: 'State Schools', y: 55 },
    { name: 'Community Colleges', y: 40 },
   
    
  ];

  const options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: benchmarkData.map(data => data.name),
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Enrollment Performance (%)',
        style: { color: '#011F5B', fontWeight: 'bold', fontSize: '14px' },
      },
      labels: {
        style: { color: '#011F5B' },
      },
    },
    tooltip: {
      headerFormat: '<b>{point.key}</b><br>',
      pointFormat: 'Enrollment Performance: {point.y}%',
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        colors: ['#004080', '#FF6E6E', '#0073E6', '#4D94FF', '#80BFFF'], // Colors for each category //#FF6E6E #80BFFF #00509E
        dataLabels: {
          enabled: true,
          format: '{y}%',
          style: { color: '#011F5B', fontSize: '12px' },
        },
      },
    },
    series: [
      {
        name: 'Benchmark Performance',
        data: benchmarkData.map(data => data.y),
        showInLegend: false,
      },
    ],
  };

  return (
    <Box style={{ padding: '10px' }}>
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
        Enrollment Benchmark Performance
      </Typography>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
};

export default WidgetSixBenchmark;