// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SidebarDashboard';
import HeaderDashboardEnrollment from '../components/HeaderDashboardEnrollment';
import MetricsEnrollment from '../components/MetricsEnrollment';
import HexbinHeatmap from '../components/StudentCareHexagone2';
import StudentAtRiskPerformance from '../components/StudentAtRiskGraph';
import TrendsClustering from '../components/TrendsClusteringEnrollment';
import TrendsClusteringEnrollmentTopics from '../components/TrendsClusteringEnrollmentTopics';
import MissingInfoTable from '../components/MissingInfoTable';
import PopupWidgetManager from '../components/PopupWidgetManager';
import DemographicInsights from '../components/DemographicInsights';
import LanguagePreferences from '../components/LanguagePreferences';
import DemocraphicInsightsUSA from '../components/DemocraphicInsightsUSA';
import EnrollmentBenchmark from '../components/EnrollmentBenchmark';
import DynamicChartWidget from '../components/DynamicChartWidget'; // Composant pour les graphiques dynamiques

// Interfaces
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
  chartTitle: string; // Titre principal du graphique
  xAxisTitle: string; // Titre de l'axe X
  yAxisTitle: string; // Titre de l'axe Y
  series: {
    seriesName: string; // Nom de la série
    data: { label: string; x: number; y: number; z?: number }[]; // Points de données
  }[]; // Tableau de séries pour supporter des comparaisons
}

interface AnswerCHART {
  answer_chart?: ChartData;
  answer_charts?: ChartData[];
}

interface DynamicWidget {
  id: string;
  name: string;
  data: { answer_charts: ChartData[] };
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isWidgetManagerOpen, setWidgetManagerOpen] = useState(false);

  // Référence pour éviter le traitement multiple de trackedCharts
  const hasProcessedTrackedCharts = useRef(false);

  // État pour les widgets dynamiques
  const [dynamicWidgets, setDynamicWidgets] = useState<DynamicWidget[]>(() => {
    const savedDynamicWidgets = localStorage.getItem('dynamicWidgets');
    if (savedDynamicWidgets) {
      try {
        const parsedWidgets: DynamicWidget[] = JSON.parse(savedDynamicWidgets);
        if (Array.isArray(parsedWidgets)) {
          return parsedWidgets
            .filter((widget) => widget && widget.id && widget.data && Array.isArray(widget.data.answer_charts))
            .map((widget, index) => ({
              id: widget.id || `dynamic-saved-${index}`,
              name: widget.name || (widget.data.answer_charts[0]?.chartTitle || `Dynamic Widget ${index + 1}`),
              data: widget.data, // { answer_charts: ChartData[] }
            }));
        }
      } catch (error) {
        console.error('Erreur lors du parsing de dynamicWidgets depuis localStorage:', error);
      }
    }
    return [];
  });

  // État pour la visibilité des widgets
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
    const storedWidgets = localStorage.getItem('dashboardWidgets');
    let initialVisibility: Record<string, boolean> = {
      Metrics: true,
      HexbinHeatmap: true,
      StudentAtRiskPerformance: true,
      MissingInfoTable: true,
      TrendsClustering: true,
      TrendsClusteringEnrollment: true,
      DemographicInsights: true,
      LanguagePreferences: true,
      USMapInsights: true,
      BenchmarkComparison: true,
    };

    if (storedWidgets) {
      try {
        const parsedVisibility = JSON.parse(storedWidgets);
        initialVisibility = { ...initialVisibility, ...parsedVisibility };
      } catch (error) {
        console.error('Erreur lors du parsing de dashboardWidgets depuis localStorage:', error);
      }
    }

    // Inclure les widgets dynamiques dans les préférences de visibilité
    dynamicWidgets.forEach((widget) => {
      if (!(widget.id in initialVisibility)) {
        initialVisibility[widget.id] = true; // Visibilité par défaut à true
      }
    });

    return initialVisibility;
  });

  // Sauvegarder les préférences de visibilité dans localStorage
  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(visibleWidgets));
  }, [visibleWidgets]);

  // Sauvegarder les widgets dynamiques dans localStorage
  useEffect(() => {
    localStorage.setItem('dynamicWidgets', JSON.stringify(dynamicWidgets));
    console.log('Dynamic widgets updated in localStorage:', dynamicWidgets);
  }, [dynamicWidgets]);

  // Gérer les nouveaux widgets dynamiques provenant de location.state
  useEffect(() => {
    if (hasProcessedTrackedCharts.current) {
      return; // Ne pas traiter à nouveau
    }

    const trackedCharts: AnswerCHART[] = location.state?.trackedCharts || [];
    if (Array.isArray(trackedCharts) && trackedCharts.length > 0) {
      console.log('Tracked charts received in Dashboard:', trackedCharts);
      setDynamicWidgets((prevWidgets) => {
        const newWidgets = trackedCharts
          .filter((chart: AnswerCHART) => chart && (chart.answer_chart || chart.answer_charts))
          .map((chart: AnswerCHART, index: number) => {
            const name = chart.answer_chart
              ? chart.answer_chart.chartTitle
              : chart.answer_charts && chart.answer_charts.length > 0
              ? chart.answer_charts[0].chartTitle
              : `Dynamic Widget ${prevWidgets.length + index + 1}`;

            // Vérifier si un widget avec ce nom existe déjà
            if (prevWidgets.some((w) => w.name === name)) {
              console.log(`Widget avec le nom "${name}" existe déjà. Ignoré.`);
              return null;
            }

            return {
              id: `dynamic-${Date.now()}-${index}`,
              name,
              data: chart.answer_chart
                ? { answer_charts: [chart.answer_chart] }
                : { answer_charts: chart.answer_charts || [] },
            };
          })
          .filter(Boolean) as DynamicWidget[];

        if (newWidgets.length === 0) {
          console.log("Aucun nouveau widget à ajouter.");
          return prevWidgets;
        }

        // Mettre à jour les préférences de visibilité pour les nouveaux widgets
        setVisibleWidgets((prev) => {
          const updated = { ...prev };
          newWidgets.forEach((widget) => {
            if (!(widget.id in updated)) {
              updated[widget.id] = true;
            }
          });
          return updated;
        });

        return [...prevWidgets, ...newWidgets];
      });

      // Marquer comme traité
      hasProcessedTrackedCharts.current = true;

      // Effacer l'état de localisation pour éviter le traitement répété
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      console.warn('No tracked charts received in Dashboard via location.state.');
    }
  }, [location.state, navigate, dynamicWidgets]);

  // Fonction pour basculer la visibilité d'un widget
  const toggleWidgetVisibility = (widgetId: string) => {
    setVisibleWidgets((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
  };

  // Fonction pour sauvegarder la disposition des widgets et fermer le gestionnaire
  const saveWidgetLayout = () => setWidgetManagerOpen(false);

  // Fonction pour supprimer un widget dynamique
  const handleRemoveWidget = (widgetId: string) => {
    setDynamicWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== widgetId));
    setVisibleWidgets((prev) => {
      const updated = { ...prev };
      delete updated[widgetId];
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Sidebar */}
      <Sidebar />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <HeaderDashboardEnrollment onModifyDashboard={() => setWidgetManagerOpen(true)} />

        {/* Conteneur principal des widgets */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto',
            gap: '20px',
            padding: '20px',
            height: 'calc(100vh - 10vh)',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {/* Widgets statiques */}
          {visibleWidgets.Metrics && (
            <div
              style={{
                gridColumn: '1 / span 2',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <MetricsEnrollment />
            </div>
          )}

          {visibleWidgets.HexbinHeatmap && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <HexbinHeatmap />
            </div>
          )}

          {visibleWidgets.StudentAtRiskPerformance && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <StudentAtRiskPerformance />
            </div>
          )}

          {visibleWidgets.DemographicInsights && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <DemographicInsights />
            </div>
          )}

          {visibleWidgets.LanguagePreferences && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <LanguagePreferences />
            </div>
          )}

          {visibleWidgets.USMapInsights && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <DemocraphicInsightsUSA />
            </div>
          )}

          {visibleWidgets.BenchmarkComparison && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <EnrollmentBenchmark />
            </div>
          )}

          {visibleWidgets.TrendsClustering && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <TrendsClusteringEnrollmentTopics />
            </div>
          )}

          {visibleWidgets.MissingInfoTable && (
            <div
              style={{
                gridColumn: '1 / span 2',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MissingInfoTable />
            </div>
          )}

          {visibleWidgets.TrendsClusteringEnrollment && (
            <div
              style={{
                gridColumn: '1 / span 2',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <TrendsClusteringEnrollmentTopics />
            </div>
          )}

          {/* Widgets dynamiques */}
          {dynamicWidgets.map((widget) =>
            widget && widget.id && visibleWidgets[widget.id] ? (
              <div
                key={widget.id}
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                <DynamicChartWidget data={widget.data} />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Popup pour gérer les widgets */}
      <PopupWidgetManager
        open={isWidgetManagerOpen}
        onClose={() => setWidgetManagerOpen(false)}
        widgets={[
          { id: 'Metrics', name: 'Metrics' },
          { id: 'HexbinHeatmap', name: 'Students Care Alignments' },
          { id: 'StudentAtRiskPerformance', name: 'Student At Risk Performance' },
          { id: 'MissingInfoTable', name: 'Missing Info Table' },
          { id: 'TrendsClustering', name: 'Topics Clustering' },
          { id: 'TrendsClusteringEnrollment', name: 'Enrollment Clustering' },
          { id: 'DemographicInsights', name: 'Demographic Insights' },
          { id: 'LanguagePreferences', name: 'Language Preferences' },
          { id: 'USMapInsights', name: 'US Map Insights' },
          { id: 'BenchmarkComparison', name: 'Enrollment Benchmark Comparison' },
          // Inclure les widgets dynamiques
          ...dynamicWidgets.map((widget) => ({
            id: widget.id,
            name: widget.name,
          })),
        ]}
        visibleWidgets={visibleWidgets}
        onToggleWidget={toggleWidgetVisibility}
        onSave={saveWidgetLayout}
      />
    </div>
  );
};

export default Dashboard;