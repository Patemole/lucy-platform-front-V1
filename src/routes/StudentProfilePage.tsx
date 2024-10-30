// StudentProfilePage.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/SidebarDashboard'; // Sidebar component
import HeaderDashboard from '../components/HeaderDashboard'; // Header component
import Metrics from '../components/MetrixDashboard'; // First component on the left
import AIDiagnosticStudent from '../components/AIDiagnosticStudent'; // First component on the left
import AtRiskStudentMessages from '../components/AtRiskStudentMessages'; // Component for trends clustering
import LogTableStudentProfile from '../components/LogTableStudentProfile'; // New component for log table
import StudentProfileRightComponent from '../components/StudentProfileRightComponent'; // Right component

interface LocationState {
  name?: string;
}

const StudentProfilePage: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | undefined;
    // Utiliser l'opérateur de coalescence nulle (??) pour définir une valeur par défaut
    const name: string = state?.name ?? "Mathieu Perez";

    const handleModifyDashboard = () => {
        // Logique à exécuter pour la modification du tableau de bord
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <HeaderDashboard onModifyDashboard={handleModifyDashboard} />

                {/* Page content */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '3.5fr 1fr', // Left column takes 3/4 and right column takes 1/4
                        gridTemplateRows: 'auto auto auto', // Three rows for the left part
                        gap: '20px', // Fixed gap between all components
                        padding: '20px',
                        height: 'calc(100vh - 10vh)', // Full height minus header
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                >
                    {/* Left Column - three stacked components */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            <AIDiagnosticStudent />
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                height: '450px', // Fixed height for TrendsClustering
                                overflow: 'auto', // Allow scrolling if content overflows
                            }}
                        >
                            <AtRiskStudentMessages />
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            <LogTableStudentProfile />
                        </div>
                    </div>

                    {/* Right Column - single component taking full height */}
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <StudentProfileRightComponent name={name} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;