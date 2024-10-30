import React, { useState, useEffect } from 'react';
import Sidebar from '../components/SidebarDashboard';
import HeaderDashboard from '../components/HeaderDashboard';
import Metrics from '../components/MetrixDashboard';
import HexbinHeatmap from '../components/StudentCareHexagone2';
import StudentAtRiskPerformance from '../components/StudentAtRiskGraph';
import TrendsClustering from '../components/TrendsClustering';
import RiskTable from '../components/RiskTable';
import PopupWidgetManager from '../components/PopupWidgetManager';

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
            <Sidebar />

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Passer le déclencheur de modification */}
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
            </div>

            {/* Popup pour gérer les widgets */}
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
    );
};

export default Dashboard;

/* ANCIEN CODE QUI FONCTIONNE SANS WIDGET 
// Dashboard.tsx
import React from 'react';
import Sidebar from '../components/SidebarDashboard'; // Sidebar component
import HeaderDashboard from '../components/HeaderDashboard'; // Header component
import Metrics from '../components/MetrixDashboard'; // Component for metrics
import HexbinHeatmap from '../components/StudentCareHexagone2'; // New component Students Care Alignment
import StudentAtRiskPerformance from '../components/StudentAtRiskGraph'; // Component for Student at Risk Performance graph
import TrendsClustering from '../components/TrendsClustering'; // Component for trends clustering
import RiskTable from '../components/RiskTable'; // New component for risk table

const Dashboard: React.FC = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
            {/* Sidebar *
            <Sidebar />

            {/* Main content *
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header *
                <HeaderDashboard />

                {/* Page content *
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr', // Two equal columns for left and right
                        gridTemplateRows: 'auto auto auto auto', // Adjusting rows for new components
                        gap: '20px', // Fixed gap between all components
                        padding: '20px',
                        height: 'calc(100vh - 10vh)', // Full height minus header
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                >
                    {/* Metrics component spanning two columns *
                    <div
                        style={{
                            gridColumn: '1 / span 2', // Span across both columns
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Metrics />
                    </div>

                    {/* Students Care Alignments component *
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            alignItems: 'center',
                        }}
                    >
                        <HexbinHeatmap />
                    </div>

                    {/* StudentAtRiskPerformance component *
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            alignItems: 'center',
                        }}
                    >
                        <StudentAtRiskPerformance />
                    </div>

                    {/* New RiskTable component, taking full width *
                    <div
                        style={{
                            gridColumn: '1 / span 2', // Span across both columns
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

                    {/* Trends Clustering component spanning two columns *
                    <div
                        style={{
                            gridColumn: '1 / span 2', // Span across both columns
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
*/