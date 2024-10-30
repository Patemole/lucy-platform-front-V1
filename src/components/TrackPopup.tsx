// src/components/TrackPopup.tsx
import React from 'react';

interface ChartData {
  chartType:
    | "line"
    | "bar"
    | "pie"
    | "column"
    | "doughnut"
    | "scatter"
    | "pyramid"
    | "gauge"
    | "bubble"
    | "treemap"
    | "waterfall";
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  series: {
    seriesName: string;
    data: { label: string; x: number; y: number; z?: number }[];
  }[];
}

interface AnswerCHART {
  answer_chart?: ChartData;
  answer_charts?: ChartData[];
}

interface TrackPopupProps {
  chartData: AnswerCHART[] | null;
  selectedCharts: string[]; // Changed to string[]
  onClose: () => void;
  onConfirm: () => void;
  onChartSelection: (uniqueId: string) => void; // Changed to accept string
}

const TrackPopup: React.FC<TrackPopupProps> = ({
  chartData,
  selectedCharts,
  onClose,
  onConfirm,
  onChartSelection,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Select Charts to Track</h3>
        
        {/* Section pour les options de graphiques */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {chartData && chartData.map((chart, chartIndex) => {
            // Récupère les titres des graphiques, qu'ils soient uniques ou multiples
            const titles = chart.answer_chart
              ? [chart.answer_chart.chartTitle]
              : chart.answer_charts
              ? chart.answer_charts.map(c => c.chartTitle)
              : [];
            
            return titles.map((title, subChartIndex) => {
              const uniqueId = `${chartIndex}-${subChartIndex}`; // Utiliser une chaîne comme identifiant unique
              return (
                <div key={uniqueId} className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.includes(uniqueId)}
                      onChange={() => onChartSelection(uniqueId)}
                      className="mr-2"
                    />
                    <span>{title}</span>
                  </label>
                </div>
              );
            });
          })}
        </div>
        
        {/* Boutons d'action */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Track Selected Charts
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackPopup;