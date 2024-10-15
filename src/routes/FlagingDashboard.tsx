import React from 'react';
import Sidebar from '../components/SidebarDashboard'; // Sidebar component
import HeaderDashboard from '../components/HeaderDashboard'; // Header component
import Metrics from '../components/MetrixDashboard'; // Component for metrics
import HexbinHeatmap from '../components/StudentCareHexagone2'; // New component Students Care Alignment
import StudentAtRiskPerformance from '../components/StudentAtRiskGraph'; // Component for Student at Risk Performance graph
import TrendsClustering from '../components/TrendsClustering'; // Component for trends clustering

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <HeaderDashboard />

                {/* Page content */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr', // Two equal columns for left and right
                        gridTemplateRows: 'auto auto auto', // Auto-adjusting rows
                        gap: '20px', // Fixed gap between all components
                        padding: '20px',
                        height: 'calc(100vh - 10vh)', // Full height minus header
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                >
                    {/* Metrics component spanning two columns */}
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

                    {/* Students Care Alignments component */}
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <HexbinHeatmap />
                    </div>

                    {/* StudentAtRiskPerformance component */}
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <StudentAtRiskPerformance />
                    </div>

                    {/* Trends Clustering component spanning two columns */}
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