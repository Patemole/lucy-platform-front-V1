import React from 'react';
import Sidebar from '../components/SidebarDashboard'; // Sidebar component
import HeaderDashboard from '../components/HeaderDashboard'; // Header component
import Component1 from '../components/MetrixDashboard'; // Premier composant à gauche
import TrendsClustering from '../components/TrendsClustering'; // Component for trends clustering
import RiskTable from '../components/RiskTable'; // Nouveau composant pour le tableau des risques
import ComponentRight from '../components/StudentProfileRightComponent'; // Composant à droite

const StudentProfile = () => {
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
                        gridTemplateColumns: '3fr 1fr', // La colonne de gauche fait 2/3 et la colonne de droite fait 1/3
                        gridTemplateRows: 'auto auto auto', // Trois lignes pour la partie gauche
                        gap: '20px', // Espace fixe entre tous les composants
                        padding: '20px',
                        height: 'calc(100vh - 10vh)', // Hauteur totale moins la hauteur du header
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                >
                    {/* Colonne de gauche - trois composants empilés */}
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
                            <Component1 />
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            <TrendsClustering />
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            <RiskTable />
                        </div>
                    </div>

                    {/* Colonne de droite - un composant en pleine hauteur */}
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
                        <ComponentRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;