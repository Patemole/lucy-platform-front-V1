// src/components/DynamicChartWidget.tsx
import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

interface ChartData {
  chartType:
    | 'line'
    | 'bar'
    | 'pie'
    | 'column'
    | 'doughnut'
    | 'scatter'
    | 'pyramid'
    | 'gauge'
    | 'bubble'
    | 'treemap'
    | 'waterfall';
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  series: {
    seriesName: string;
    data: { label: string; x: number; y: number; z?: number }[];
  }[];
}

interface DynamicChartWidgetProps {
  data: { answer_charts: ChartData[] };
}

const DynamicChartWidget: React.FC<DynamicChartWidgetProps> = ({ data}) => {
  // Vérifier si data.answer_charts est défini et non vide
  if (!data || !data.answer_charts || data.answer_charts.length === 0) {
    console.error("DynamicChartWidget - No answer_charts data provided or data is undefined.");
    return <div>No data available for this chart.</div>;
  }

  console.log("DynamicChartWidget - Rendering with data:", data);

  return (
    <div>
      {data.answer_charts.map((chartData, index) => {
        console.log(`DynamicChartWidget - Processing chart ${index}:`, chartData);

        if (!chartData || !chartData.series || chartData.series.length === 0) {
          console.error(`DynamicChartWidget - Series data is missing or empty for chart ${index}`);
          return <div key={index}>No data available for this chart.</div>;
        }

        // Configure xAxis and chart options based on chartData
        const xAxisOptions: Highcharts.XAxisOptions = {
          title: { text: chartData.xAxisTitle },
          categories: chartData.series[0]?.data.map((point) => point.label) || [],
        };
        console.log(`DynamicChartWidget - xAxisOptions for chart ${index}:`, xAxisOptions);

        const options: Highcharts.Options = {
          title: { text: chartData.chartTitle },
          xAxis:
            chartData.chartType !== "pie" &&
            chartData.chartType !== "doughnut" &&
            chartData.chartType !== "pyramid" &&
            chartData.chartType !== "gauge" &&
            chartData.chartType !== "treemap" &&
            chartData.chartType !== "waterfall"
              ? xAxisOptions
              : undefined,
          yAxis: {
            title: { text: chartData.yAxisTitle },
          },
          series: [], // To be filled based on chartType
        };

        // Configure series based on chartType
        switch (chartData.chartType) {
          case "bar":
          case "column":
            options.series = chartData.series.map((serie) => ({
              type: chartData.chartType as any,
              name: serie.seriesName,
              data: serie.data.map((d) => d.y),
            }));
            break;

          case "line":
            options.series = chartData.series.map((serie) => ({
              type: "line",
              name: serie.seriesName,
              data: serie.data.map((d) => d.y),
            }));
            break;

          case "pie":
          case "doughnut":
            options.series = chartData.series.map((serie) => ({
              type: "pie",
              name: serie.seriesName,
              data: serie.data.map((d) => ({
                name: d.label,
                y: d.y,
              })),
            }));
            break;

          case "scatter":
            options.series = chartData.series.map((serie) => ({
              type: "scatter",
              name: serie.seriesName,
              data: serie.data.map((d) => [d.x, d.y]),
            }));
            break;

          case "pyramid":
            options.chart = { type: "pyramid" };
            options.series = chartData.series.map((serie) => ({
              type: "pyramid",
              name: serie.seriesName,
              data: serie.data.map((d) => [d.label, d.y]),
            }));
            delete options.xAxis;
            break;

          case "gauge":
            options.chart = { type: "gauge" };
            options.series = chartData.series.map((serie) => ({
              type: "gauge",
              name: serie.seriesName,
              data: [serie.data[0]?.y || 0],
            }));
            delete options.xAxis;
            break;

          case "bubble":
            options.series = chartData.series.map((serie) => ({
              type: "bubble",
              name: serie.seriesName,
              data: serie.data.map((d) => ({
                x: d.x,
                y: d.y,
                z: d.z || 0,
              })),
            }));
            break;

          case "treemap":
            options.series = chartData.series.map((serie) => ({
              type: "treemap",
              name: serie.seriesName,
              data: serie.data.map((d) => ({
                name: d.label,
                value: d.y,
              })),
            }));
            delete options.xAxis;
            break;

          case "waterfall":
            options.series = chartData.series.map((serie) => ({
              type: "waterfall",
              name: serie.seriesName,
              data: serie.data.map((d) => ({
                name: d.label,
                y: d.y,
              })),
            }));
            break;

          default:
            console.error(`DynamicChartWidget - Unsupported chart type: ${chartData.chartType}`);
            return <div key={index}>Unsupported chart type: {chartData.chartType}</div>;
        }

        console.log(`DynamicChartWidget - Configured chart options for chart ${index}:`, options);

        return (
          <div key={index} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        );
      })}
      {/* Bouton de suppression du widget *
      <button onClick={onRemove} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
        Supprimer ce graphique
      </button>
      */}
    </div>
    
  );
};

export default DynamicChartWidget;