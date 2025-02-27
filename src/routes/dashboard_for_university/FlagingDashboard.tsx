import React, { useState, useEffect } from 'react';

import Metrics from '../../components/dashboard_university_components/MetrixDashboard';
import HexbinHeatmap from '../../components/dashboard_university_components/StudentCareHexagone2';
import StudentAtRiskPerformance from '../../components/dashboard_university_components/StudentAtRiskGraph';
import TrendsClustering from '../../components/dashboard_university_components/TrendsClustering';
import RiskTable from '../../components/dashboard_university_components/RiskTable';
import PopupWidgetManager from '../../components/dashboard_university_components/PopupWidgetManager';

const Dashboard: React.FC = () => {
    const [isWidgetManagerOpen, setWidgetManagerOpen] = useState(false);

    // Charge les préférences de visibilité des widgets depuis localStorage ou initialise à tous visibles
    const initialWidgetVisibility = () => {
        const storedWidgets = localStorage.getItem('dashboardWidgets');
        return storedWidgets
            ? JSON.parse(storedWidgets)
            : {
                Metrics: true,
                HexbinHeatmap: true,
                StudentAtRiskPerformance: true,
                RiskTable: true,
                TrendsClustering: true,
            };
    };

    const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(initialWidgetVisibility);

    // Met à jour localStorage chaque fois que visibleWidgets change
    useEffect(() => {
        localStorage.setItem('dashboardWidgets', JSON.stringify(visibleWidgets));
        console.log("Visible Widgets updated in localStorage:", visibleWidgets);
    }, [visibleWidgets]);

    // Basculer l’état de visibilité d’un widget
    const toggleWidgetVisibility = (widgetId: string) => {
        setVisibleWidgets(prev => {
            const newState = { ...prev, [widgetId]: !prev[widgetId] };
            console.log("Toggled widget:", widgetId, "New state:", newState);
            return newState;
        });
    };

    const saveWidgetLayout = () => {
        setWidgetManagerOpen(false); // Fermer la popup après la sauvegarde
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
             
             {/* <Sidebar /> */}

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Passer le déclencheur de modification 
                <HeaderDashboard onModifyDashboard={() => setWidgetManagerOpen(true)} />

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: 'auto auto auto auto',
                        gap: '20px',
                        padding: '20px',
                        height: 'calc(100vh - 10vh)',
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                >
                    {/* Rendu conditionnel des widgets */}
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
                            <Metrics />
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

                    {visibleWidgets.RiskTable && (
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
                            <RiskTable />
                        </div>
                    )}

                    {visibleWidgets.TrendsClustering && (
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
                            <TrendsClustering />
                        </div>
                    )}
                
            </div>
    
           
            <PopupWidgetManager
                open={isWidgetManagerOpen}
                onClose={() => setWidgetManagerOpen(false)}
                widgets={[
                    { id: 'Metrics', name: 'Metrics' },
                    { id: 'HexbinHeatmap', name: 'Students Care Alignments' },
                    { id: 'StudentAtRiskPerformance', name: 'Student At Risk Performance' },
                    { id: 'RiskTable', name: 'Risk Table' },
                    { id: 'TrendsClustering', name: 'Trends Clustering' },
                ]}
                visibleWidgets={visibleWidgets}
                onToggleWidget={toggleWidgetVisibility}
                onSave={saveWidgetLayout}
            />
        </div>
    )
};

export default Dashboard;
