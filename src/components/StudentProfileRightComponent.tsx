// StudentProfileRightComponent.tsx


/*
import React from 'react';
import studentImage from '../student_profile.png'; // Path to your local image

interface StudentProfileRightComponentProps {
    name: string;
}

const StudentProfileRightComponent: React.FC<StudentProfileRightComponentProps> = ({ name }) => {
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
                width: '100%', // Ensures the component takes the full width of the column
                height: '100%', // Ensures the component takes the full height available
                maxWidth: '100%', // Limits to the width of the parent column
                boxSizing: 'border-box', // For precise margin calculations
            }}
        >
            {/* Image *
            <img
                src={studentImage} // Use the imported image
                alt={name}
                style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    objectFit: 'cover', // Ensures the image maintains good proportions
                }}
            />

            {/* Student Information *
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0', fontSize: '20px', color: '#002D72' }}>
                    {name}
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

            {/* Categories *
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

            {/* Financial Aid *
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

*/


import React from 'react';
import studentImage from '../student_profile.png'; // Path to your local image
import advisor1 from '../advisor1.jpg'; // Path to your local image
import advisor2 from '../advisor2.jpg'; // Path to your local image
import advisor3 from '../advisor3.jpg'; // Path to your local image

interface StudentProfileRightComponentProps {
  name: string;
}

const StudentProfileRightComponent: React.FC<StudentProfileRightComponentProps> = ({ name }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Image */}
      <img
        src={studentImage}
        alt={name}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          marginBottom: '20px',
          objectFit: 'cover',
        }}
      />

      {/* Student Information */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            color: '#002D72',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {name}
        </h3>
        <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>ID: JIH129047</p>
        <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>Birth: 09/27/99 (24)</p>
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
        <p style={{ margin: '5px 0', fontSize: '16px', color: '#002D72' }}>202-555-7777</p>
      </div>

      {/* Advisors Section - Icons centered with names and titles */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            color: '#002D72',
            fontWeight: 'bold',
            textAlign: 'left',
          }}
        >
          Advisors and Contacts
        </h3>

        {/* Container for advisor icons and info */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ textAlign: 'center', flexDirection: 'column' }}>
            <img
              src={advisor1}
              alt="Beth Allen"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '10px',
              }}
            />
            <p style={{ margin: '0', fontSize: '13px', color: '#002D72' }}>Beth Allen</p>
            <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Advisor</p>
          </div>

          <div style={{ textAlign: 'center', flexDirection: 'column' }}>
            <img
              src={advisor2}
              alt="Eve Temple"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '10px',
              }}
            />
            <p style={{ margin: '0', fontSize: '13px', color: '#002D72' }}>Eve Temple</p>
            <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Coach</p>
          </div>

          <div style={{ textAlign: 'center', flexDirection: 'column' }}>
            <img
              src={advisor3}
              alt="Tom Benett"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '10px',
              }}
            />
            <p style={{ margin: '0', fontSize: '13px', color: '#002D72' }}>Tom Benett</p>
            <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Tutor</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#002D72', fontWeight: 'bold' }}>Categories</h3>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'inline-block',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>First-Generation</p>
        </div>
      </div>

      {/* Tags */}
      <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#002D72', fontWeight: 'bold' }}>Tags</h3>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'inline-block',
            marginBottom: '5px',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Men's soccer team</p>
        </div>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'inline-block',
            marginBottom: '5px',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>North Hall</p>
        </div>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'inline-block',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Interested in internships</p>
        </div>
      </div>

      {/* Goals & Interests */}
      <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#002D72', fontWeight: 'bold' }}>Goals & Interests</h3>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Post Degree Goal:</strong></p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Start my career</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Favorite Majors:</strong></p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Biology, Psychology</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Career Priorities:</strong></p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>1. High Salary</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Favorite Subjects:</strong></p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Health, Computers</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Favorite Activities:</strong></p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Helping people, Managing & Organizing</p>
      </div>

      {/* Financial Aid */}
      <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#002D72', fontWeight: 'bold' }}>Financial Aid</h3>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>Pell Eligible</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}>State Eligible</p>
      </div>

      {/* Academic Performance */}
      <div style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#002D72', fontWeight: 'bold' }}>Academic Performance</h3>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>GPA Trend:</strong> 2.85</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Credits Accumulated:</strong> 27</p>
        <p style={{ margin: '0', fontSize: '16px', color: '#002D72' }}><strong>Predicted Concern:</strong> High</p>
      </div>
    </div>
  );
};

export default StudentProfileRightComponent;