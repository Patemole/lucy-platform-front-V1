import React from 'react';
import studentImage from '../student_profile.png'; // Chemin vers ton image locale

const StudentProfileRightComponent = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '100%', // S'assure que le composant prend toute la largeur de la colonne
                height: '100%', // S'assure que le composant prend toute la hauteur disponible
                maxWidth: '100%', // Limite à la largeur de la colonne parente
                boxSizing: 'border-box', // Pour un calcul précis des marges
            }}
        >
            {/* Image */}
            <img
                src={studentImage} // Utilisation de l'image importée
                alt="Mathieu Perez"
                style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    objectFit: 'cover', // S'assure que l'image garde de bonnes proportions
                }}
            />

            {/* Student Information */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0', fontSize: '20px', color: '#002D72' }}>
                    Mathieu Perez
                </h2>
                <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>
                    ID: JIH129047
                </p>
                <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>
                    09/27/99 (24 years old)
                </p>
                <a
                    href="mailto:m.perez@sas.upenn.edu"
                    style={{
                        textDecoration: 'none',
                        fontSize: '16px',
                        color: '#0056B3',
                        marginBottom: '5px',
                        display: 'block',
                    }}
                >
                    m.perez@sas.upenn.edu
                </a>
                <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>
                    202-555-7777
                </p>
            </div>

            {/* Categories */}
            <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
                <h3
                    style={{
                        margin: '0 0 10px 0',
                        fontSize: '18px',
                        color: '#002D72',
                        fontWeight: 'bold',
                    }}
                >
                    Categories
                </h3>
                <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>
                    First-Generation
                </p>
            </div>

            {/* Financial Aid */}
            <div style={{ textAlign: 'left', width: '100%' }}>
                <h3
                    style={{
                        margin: '0 0 10px 0',
                        fontSize: '18px',
                        color: '#002D72',
                        fontWeight: 'bold',
                    }}
                >
                    Financial Aid
                </h3>
                <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>
                    Pell Eligible
                </p>
                <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>
                    State Eligible
                </p>
            </div>
        </div>
    );
};

export default StudentProfileRightComponent;