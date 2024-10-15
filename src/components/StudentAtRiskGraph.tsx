import React from 'react';
import { Line } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components and plugins
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  annotationPlugin
);

const StudentAtRiskPerformance = () => {
  // Data points
  const dataValues = [86, 61, 45, 32, 25, 14, 8, 6, 7, 4, 5, 2];

  // Function to get color based on severity level
  const getColorForValue = (value: number) => {
    if (value >= 80) {
      return '#e60000'; // Severe
    } else if (value >= 60) {
      return '#ff751a'; // Moderately Severe
    } else if (value >= 40) {
      return '#ffcc00'; // Moderate
    } else if (value >= 20) {
      return '#99cc00'; // Mild
    } else {
      return '#33cc33'; // None/minimal
    }
  };

  // Generate point colors based on data values
  const pointBackgroundColors = dataValues.map((value) =>
    getColorForValue(value)
  );

  // Chart data
  const data = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Students at Risk',
        data: dataValues,
        borderColor: '#ff5c5c',
        borderWidth: 3,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Severity Level',
          font: {
            size: 14,
          },
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20, // Graduations at intervals of 20
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      annotation: {
        annotations: {
          zone1: {
            type: 'box',
            yMin: 0,
            yMax: 20,
            backgroundColor: 'rgba(51, 204, 51, 0.2)', // None/minimal
            borderWidth: 0,
          },
          zone2: {
            type: 'box',
            yMin: 20,
            yMax: 40,
            backgroundColor: 'rgba(153, 204, 0, 0.2)', // Mild
            borderWidth: 0,
          },
          zone3: {
            type: 'box',
            yMin: 40,
            yMax: 60,
            backgroundColor: 'rgba(255, 204, 0, 0.2)', // Moderate
            borderWidth: 0,
          },
          zone4: {
            type: 'box',
            yMin: 60,
            yMax: 80,
            backgroundColor: 'rgba(255, 117, 26, 0.2)', // Moderately Severe
            borderWidth: 0,
          },
          zone5: {
            type: 'box',
            yMin: 80,
            yMax: 100,
            backgroundColor: 'rgba(230, 0, 0, 0.2)', // Severe
            borderWidth: 0,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Severity levels for legend with better color contrast
  const severityLevels = [
    { label: 'Severe', color: '#e60000' },
    { label: 'Moderately Severe', color: '#ff751a' },
    { label: 'Moderate', color: '#ffcc00' },
    { label: 'Mild', color: '#99cc00' },
    { label: 'None/minimal', color: '#33cc33' },
  ];

  return (
    <div style={{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Title justified to the left */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#0a0a0a',
          fontSize: '1.25rem',
          marginLeft: '0px',
          marginBottom: '10px', // Ajout de la marge en bas
        }}
      >
        Student at Risk Performance
      </Typography>

      {/* Chart Container with fixed height */}
      <div style={{ flexGrow: 1, width: '100%', height: '300px' }}>
        <Line data={data} options={options} />
      </div>

      {/* Severity Levels Legend */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          justifyContent: 'center',
          overflowX: 'auto',
        }}
      >
        {severityLevels.map((level) => (
          <div
            key={level.label}
            style={{
              backgroundColor: level.color,
              padding: '6px 10px',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
              minWidth: '80px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {level.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAtRiskPerformance;