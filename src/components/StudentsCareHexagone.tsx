import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

const StudentsCareAlignment = () => {
  const [dataWithCollision, setDataWithCollision] = useState<{ x: number; y: number }[]>([]);

  // Générer des données structurées pour le graphe avec un intervalle plus large
  const generateStructuredData = () => {
    const data = [];
    const clusterSize = 10; // Nombre de points par cluster

    // Générer des points entre 0 et 100 jours
    for (let days = 0; days <= 100; days += 10) {
      for (let severity = 20; severity <= 100; severity += 20) {
        for (let i = 0; i < clusterSize; i++) {
          const xOffset = Math.random() * 3 - 1.5; // Petite variation pour écarter les points sur x
          const yOffset = Math.random() * 3 - 1.5; // Petite variation pour écarter les points sur y
          data.push({ x: days + xOffset, y: severity + yOffset });
        }
      }
    }
    return data;
  };

  const adjustForCollisions = (data: { x: number; y: number }[]) => {
    const minDistance = 20; // Distance minimale entre les cercles (en pixels)
    const chartBounds = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }; // Limites du graphe

    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        const dx = data[j].x - data[i].x;
        const dy = data[j].y - data[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const overlap = (minDistance - distance) / 2;

          data[i].x -= overlap * Math.cos(angle);
          data[i].y -= overlap * Math.sin(angle);

          data[j].x += overlap * Math.cos(angle);
          data[j].y += overlap * Math.sin(angle);
        }

        // Empêcher les cercles de sortir des limites du graphique
        data[i].x = Math.max(chartBounds.xMin + 5, Math.min(data[i].x, chartBounds.xMax - 5));
        data[i].y = Math.max(chartBounds.yMin + 5, Math.min(data[i].y, chartBounds.yMax - 5));

        data[j].x = Math.max(chartBounds.xMin + 5, Math.min(data[j].x, chartBounds.xMax - 5));
        data[j].y = Math.max(chartBounds.yMin + 5, Math.min(data[j].y, chartBounds.yMax - 5));
      }
    }

    return data;
  };

  useEffect(() => {
    const structuredData = generateStructuredData();
    const adjustedData = adjustForCollisions(structuredData);
    setDataWithCollision(adjustedData);
  }, []);

  const generateColors = (data: { x: number; y: number }[]) => {
    return data.map(point => {
      const severity = point.y;
      if (severity > 80) return '#ff5c5c'; // High (rouge)
      if (severity > 60) return '#ffb366'; // Medium-high (orange)
      if (severity > 40) return '#ffe680'; // Medium (jaune)
      if (severity > 20) return '#ccff99'; // Low-medium (vert clair)
      return '#66ff66'; // Low (vert)
    });
  };

  const colors = generateColors(dataWithCollision);

  const data = {
    datasets: [
      {
        label: 'Students',
        data: dataWithCollision,
        backgroundColor: colors,
        pointRadius: 10,
        hoverBackgroundColor: '#000',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days Since Last Service',
        },
        min: 0,
        max: 100, // Limitation à 100 jours
        grid: {
          display: false, // Enlever le fond des grilles pour l'axe x
        },
      },
      y: {
        title: {
          display: true,
          text: 'Severity',
        },
        min: 0,
        max: 100,
        grid: {
          display: false, // Enlever le fond des grilles pour l'axe y
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Masquer la légende par défaut de Chart.js
      },
      datalabels: {
        color: '#ffffff', // Couleur blanche pour les chiffres dans les cercles
        font: {
          weight: 'bold' as const,
          size: 10,
        },
        formatter: (value: any) => {
          return Math.round(value.y); // Afficher la valeur de la sévérité sur chaque point
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0a0a0a' }}>
        Students Care Alignment
      </h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#66ff66',
              marginRight: '5px',
              borderRadius: '4px',
            }}
          ></div>
          <span>Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#ffe680',
              marginRight: '5px',
              borderRadius: '4px',
            }}
          ></div>
          <span>Medium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#ffb366',
              marginRight: '5px',
              borderRadius: '4px',
            }}
          ></div>
          <span>Medium-high</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#ff5c5c',
              marginRight: '5px',
              borderRadius: '4px',
            }}
          ></div>
          <span>High</span>
        </div>
      </div>

      <Scatter data={data} options={options} />
    </div>
  );
};

export default StudentsCareAlignment;