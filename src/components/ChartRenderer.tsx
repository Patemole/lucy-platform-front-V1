import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ChartData {
  chartType: 'line' | 'bar' | 'pie';
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  data: { label: string; x: number; y: number }[];
}

const ChartRenderer: React.FC<{ chartData: ChartData[] | undefined }> = ({ chartData }) => {
  // Logs pour vérifier le contenu de chartData
  useEffect(() => {
    console.log("ChartData reçu:", chartData);
  }, [chartData]);

  // Vérification de la présence et de la validité des données
  if (!chartData || chartData.length === 0) {
    console.error("Erreur : Aucune donnée de graphique disponible dans chartData.");
    return null;
  }

  return (
    <div>
      {chartData.map((data, index) => {
        // Vérifier si `data` est bien défini pour éviter les erreurs
        if (!data) {
          console.error(`Erreur : data manquant pour l'index ${index}`);
          return null;
        }

        console.log(`Affichage du graphique ${index + 1}`);
        console.log("Données du graphique:", data);

        // Vérifier que data.data est défini
        if (!data.data || data.data.length === 0) {
          console.error(`Erreur : data.data manquant ou vide pour le graphique ${index + 1}`);
          return null;
        }

        const options: Highcharts.Options = {
          title: { text: data.chartTitle },
          xAxis: {
            title: { text: data.xAxisTitle },
            categories: data.data.map((d) => {
              console.log("Label de l'axe X:", d.label);
              return d.label;
            }),
          },
          yAxis: {
            title: { text: data.yAxisTitle },
          },
          series: [
            {
              type: data.chartType as any,
              name: data.chartTitle,
              data:
                data.chartType === "pie"
                  ? data.data.map((d) => ({
                      name: d.label,
                      y: d.y,
                    }))
                  : data.data.map((d) => [d.x, d.y]),
            },
          ],
        };

        console.log(`Options pour Highcharts (graphe ${index + 1}):`, options);

        return (
          <div key={index} className="chart-container mt-4 ml-8">
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        );
      })}
    </div>
  );
};

export default ChartRenderer;