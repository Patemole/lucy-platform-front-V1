// File: DataSelectionPage.tsx

/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataSelectionPage.css'; // Assuming you're using a CSS file for styling

// Define types for the data structure
interface Variable {
  id: string;
  label: string;
}

interface DataCategories {
  [key: string]: Variable[];
}

// Define the data categories and variables
const dataCategories: DataCategories = {
  "Academic Activity": [
    { id: 'canvasLogins', label: 'Canvas Logins' },
    { id: 'assignmentTimeliness', label: 'Assignment Timeliness' },
    { id: 'classAttendance', label: 'Class Attendance' },
    { id: 'gradesOverview', label: 'Grades Overview' },
    { id: 'discussionEngagement', label: 'Discussion Engagement' }
  ],
  "Advisor Interaction": [
    { id: 'advisingMeetings', label: 'Advising Meetings' },
    { id: 'advisorFeedback', label: 'Advisor Feedback' },
    { id: 'advisorFlags', label: 'Advisor Flags' }
  ],
  "Student Profile": [
    { id: 'socioeconomicStatus', label: 'Socioeconomic Status' },
    { id: 'underrepresentedGroup', label: 'Underrepresented Group' }
  ],
  "Health and Wellbeing": [
    { id: 'mentalHealthSupport', label: 'Mental Health Support' },
    { id: 'healthAppointments', label: 'Health Appointments' },
    { id: 'wellnessCheckins', label: 'Wellness Check-ins' },
    { id: 'mentalHealthConcerns', label: 'Mental Health Concerns' },
    { id: 'frequentHealthQueries', label: 'Frequent Health-Related Queries' }
  ],
  "Campus Involvement": [
    { id: 'clubsParticipation', label: 'Clubs Participation' },
    { id: 'sportsParticipation', label: 'Sports Participation' },
    { id: 'eventAttendance', label: 'Event Attendance' },
    { id: 'potentialIsolation', label: 'Potential Isolation' },
    { id: 'disengagementFromCampusLife', label: 'Disengagement from Campus Life' }
  ],
  "Academic and Personal Challenges": [
    { id: 'scholarshipStatus', label: 'Scholarship Status' },
    { id: 'financialAcademicStress', label: 'Financial or Academic Stress' },
    { id: 'workStudyLoad', label: 'Work or Study Load' },
    { id: 'burnoutOverextension', label: 'Burnout or Overextension' }
  ],
  "Academic Load": [
    { id: 'creditsTaken', label: 'Credits Taken' },
    { id: 'courseDropHistory', label: 'Course Drop History' },
    { id: 'academicDifficultyIndecision', label: 'Academic Difficulty or Indecision' }
  ]
};

// Main component for data selection page
const DataSelectionPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  // Handle checkbox change with proper typing
  const handleCheckboxChange = (category: string, id: string) => {
    setSelectedData({
      ...selectedData,
      [id]: !selectedData[id]
    });
  };

  // Render checkboxes for each data category
  const renderCheckboxes = (categoryName: string, variables: Variable[]) => {
    return (
      <div key={categoryName} className="category-block">
        <h3 className="category-title">{categoryName}</h3>
        <div className="checkbox-group">
          {variables.map((variable) => (
            <div key={variable.id} className="checkbox-item">
              <input
                type="checkbox"
                id={variable.id}
                checked={selectedData[variable.id] || false}
                onChange={() => handleCheckboxChange(categoryName, variable.id)}
                className="checkbox-input"
              />
              <label htmlFor={variable.id} className="checkbox-label">{variable.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle form submission to apply selected variables to the algorithm
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Selected Data:", selectedData);
    // Send selectedData to the algorithm or server
  };

  // Navigate to the next page
  const goToNextPage = () => {
    // Implement the navigation logic here
    navigate('/next-page');
  };

  return (
    <div className="data-selection-page">
      <h1 className="page-title">Select Data to Include in Severity Algorithm</h1>
      <form onSubmit={handleSubmit} className="data-selection-form">
        {Object.keys(dataCategories).map((categoryName) =>
          renderCheckboxes(categoryName, dataCategories[categoryName])
        )}
        <button type="submit" className="apply-button">Apply Selected Data</button>
      </form>

      {/* Button to navigate to the next page *
      <button onClick={goToNextPage} className="next-page-button">
        Go to Next Page
      </button>
    </div>
  );
};

export default DataSelectionPage;
*/


// File: DataSelectionPage.tsx
/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataSelectionPage.css'; // Assuming you're using a CSS file for styling
import Header from '../components/HeaderDashboard'; // Importing Header component

// Define types for the data structure
interface Variable {
  id: string;
  label: string;
}

interface DataCategories {
  [key: string]: Variable[];
}

// Define the data categories and variables
const dataCategories: DataCategories = {
  "Academic Activity": [
    { id: 'canvasLogins', label: 'Canvas Logins' },
    { id: 'assignmentTimeliness', label: 'Assignment Timeliness' },
    { id: 'classAttendance', label: 'Class Attendance' },
    { id: 'gradesOverview', label: 'Grades Overview' },
    { id: 'discussionEngagement', label: 'Discussion Engagement' }
  ],
  "Advisor Interaction": [
    { id: 'advisingMeetings', label: 'Advising Meetings' },
    { id: 'advisorFeedback', label: 'Advisor Feedback' },
    { id: 'advisorFlags', label: 'Advisor Flags' }
  ],
  "Student Profile": [
    { id: 'socioeconomicStatus', label: 'Socioeconomic Status' },
    { id: 'underrepresentedGroup', label: 'Underrepresented Group' }
  ],
  "Health and Wellbeing": [
    { id: 'mentalHealthSupport', label: 'Mental Health Support' },
    { id: 'healthAppointments', label: 'Health Appointments' },
    { id: 'wellnessCheckins', label: 'Wellness Check-ins' },
    { id: 'mentalHealthConcerns', label: 'Mental Health Concerns' },
    { id: 'frequentHealthQueries', label: 'Frequent Health-Related Queries' }
  ],
  "Campus Involvement": [
    { id: 'clubsParticipation', label: 'Clubs Participation' },
    { id: 'sportsParticipation', label: 'Sports Participation' },
    { id: 'eventAttendance', label: 'Event Attendance' },
    { id: 'potentialIsolation', label: 'Potential Isolation' },
    { id: 'disengagementFromCampusLife', label: 'Disengagement from Campus Life' }
  ],
  "Academic and Personal Challenges": [
    { id: 'scholarshipStatus', label: 'Scholarship Status' },
    { id: 'financialAcademicStress', label: 'Financial or Academic Stress' },
    { id: 'workStudyLoad', label: 'Work or Study Load' },
    { id: 'burnoutOverextension', label: 'Burnout or Overextension' }
  ],
  "Academic Load": [
    { id: 'creditsTaken', label: 'Credits Taken' },
    { id: 'courseDropHistory', label: 'Course Drop History' },
    { id: 'academicDifficultyIndecision', label: 'Academic Difficulty or Indecision' }
  ]
};

// Main component for data selection page
const DataSelectionPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  // Handle checkbox change with proper typing
  const handleCheckboxChange = (category: string, id: string) => {
    setSelectedData({
      ...selectedData,
      [id]: !selectedData[id]
    });
  };

  // Render checkboxes for each data category
  const renderCheckboxes = (categoryName: string, variables: Variable[]) => {
    return (
      <div key={categoryName} className="category-block">
        <h3 className="category-title">{categoryName}</h3>
        <div className="checkbox-group grid-layout">
          {variables.map((variable) => (
            <div key={variable.id} className="checkbox-item">
              <input
                type="checkbox"
                id={variable.id}
                checked={selectedData[variable.id] || false}
                onChange={() => handleCheckboxChange(categoryName, variable.id)}
                className="checkbox-input"
              />
              <label htmlFor={variable.id} className="checkbox-label">{variable.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle form submission to apply selected variables to the algorithm
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Selected Data:", selectedData);
    // Send selectedData to the algorithm or server
    // Navigate to the dashboard after submission
    navigate('/dashboard');
  };

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header *
        <Header />

      {/* Main Content *
      <div className="data-selection-page" style={{ padding: '20px', overflowY: 'auto' }}>
        <h1 className="page-title">Select Data to Include in Severity Algorithm</h1>
        <form onSubmit={handleSubmit} className="data-selection-form">
          {Object.keys(dataCategories).map((categoryName) =>
            renderCheckboxes(categoryName, dataCategories[categoryName])
          )}
          {/* Single button to validate and build the dashboard *
          <button type="submit" className="submit-button">Validate and Build Dashboard</button>
        </form>
      </div>
    </div>
  );
};

export default DataSelectionPage;
*/


/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataSelectionPage.css'; // Assuming you're using a CSS file for styling
import Header from '../components/HeaderDashboard'; // Importing Header component

// Define types for the data structure
interface Variable {
  id: string;
  label: string;
}

interface DataCategories {
  [key: string]: Variable[];
}

// Define the data categories and variables
const dataCategories: DataCategories = {
  "Academic Activity": [
    { id: 'canvasLogins', label: 'Canvas Logins' },
    { id: 'assignmentTimeliness', label: 'Assignment Timeliness' },
    { id: 'classAttendance', label: 'Class Attendance' },
    { id: 'gradesOverview', label: 'Grades Overview' },
    { id: 'discussionEngagement', label: 'Discussion Engagement' }
  ],
  "Advisor Interaction": [
    { id: 'advisingMeetings', label: 'Advising Meetings' },
    { id: 'advisorFeedback', label: 'Advisor Feedback' },
    { id: 'advisorFlags', label: 'Advisor Flags' }
  ],
  "Student Profile": [
    { id: 'socioeconomicStatus', label: 'Socioeconomic Status' },
    { id: 'underrepresentedGroup', label: 'Underrepresented Group' }
  ],
  "Health and Wellbeing": [
    { id: 'mentalHealthSupport', label: 'Mental Health Support' },
    { id: 'healthAppointments', label: 'Health Appointments' },
    { id: 'wellnessCheckins', label: 'Wellness Check-ins' },
    { id: 'mentalHealthConcerns', label: 'Mental Health Concerns' },
    { id: 'frequentHealthQueries', label: 'Frequent Health-Related Queries' }
  ],
  "Campus Involvement": [
    { id: 'clubsParticipation', label: 'Clubs Participation' },
    { id: 'sportsParticipation', label: 'Sports Participation' },
    { id: 'eventAttendance', label: 'Event Attendance' },
    { id: 'potentialIsolation', label: 'Potential Isolation' },
    { id: 'disengagementFromCampusLife', label: 'Disengagement from Campus Life' }
  ],
  "Academic and Personal Challenges": [
    { id: 'scholarshipStatus', label: 'Scholarship Status' },
    { id: 'financialAcademicStress', label: 'Financial or Academic Stress' },
    { id: 'workStudyLoad', label: 'Work or Study Load' },
    { id: 'burnoutOverextension', label: 'Burnout or Overextension' }
  ],
  "Academic Load": [
    { id: 'creditsTaken', label: 'Credits Taken' },
    { id: 'courseDropHistory', label: 'Course Drop History' },
    { id: 'academicDifficultyIndecision', label: 'Academic Difficulty or Indecision' }
  ]
};

// Main component for data selection page
const DataSelectionPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  // Handle checkbox change with proper typing
  const handleCheckboxChange = (category: string, id: string) => {
    setSelectedData({
      ...selectedData,
      [id]: !selectedData[id]
    });
  };

  // Render checkboxes for each data category
  const renderCheckboxes = (categoryName: string, variables: Variable[]) => {
    return (
      <div key={categoryName} className="category-block">
        <h3 className="category-title">{categoryName}</h3>
        <div className="checkbox-group">
          {variables.map((variable) => (
            <div key={variable.id} className="checkbox-item">
              <input
                type="checkbox"
                id={variable.id}
                checked={selectedData[variable.id] || false}
                onChange={() => handleCheckboxChange(categoryName, variable.id)}
                className="checkbox-input"
              />
              <label htmlFor={variable.id} className="checkbox-label">{variable.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle form submission to apply selected variables to the algorithm
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Selected Data:", selectedData);
    // Send selectedData to the algorithm or server
    // Navigate to the dashboard after submission
    const userID = localStorage.getItem('userID') || 'default_userID';
    navigate(`/dashboard/academic-advisor/${userID}`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header *
      <Header />

      {/* Main Content *
      <div className="data-selection-page" style={{ padding: '20px', overflowY: 'auto' }}>
        <h1 className="page-title">Select Data to Include in Severity Algorithm</h1>

        {/* Grid Layout for Data Categories *
        <div className="category-grid">
          {Object.keys(dataCategories).map((categoryName, index) =>
            renderCheckboxes(categoryName, dataCategories[categoryName])
          )}
        </div>

        {/* Single button to validate and build the dashboard *
        <button type="submit" onClick={handleSubmit} className="submit-button">
          Validate and Build Dashboard
        </button>
      </div>
    </div>
  );
};

export default DataSelectionPage;
*/


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataSelectionPage.css'; // Assuming you're using a CSS file for styling
import Header from '../components/HeaderDashboard'; // Importing Header component

// Define types for the data structure
interface Variable {
  id: string;
  label: string;
}

interface DataCategories {
  [key: string]: Variable[];
}

// Define the data categories and variables
const dataCategories: DataCategories = {
  "Academic Activity": [
    { id: 'canvasLogins', label: 'Canvas Logins' },
    { id: 'assignmentTimeliness', label: 'Assignment Timeliness' },
    { id: 'classAttendance', label: 'Class Attendance' },
    { id: 'gradesOverview', label: 'Grades Overview' },
    { id: 'discussionEngagement', label: 'Discussion Engagement' }
  ],
  "Advisor Interaction": [
    { id: 'advisingMeetings', label: 'Advising Meetings' },
    { id: 'advisorFeedback', label: 'Advisor Feedback' },
    { id: 'advisorFlags', label: 'Advisor Flags' }
  ],
  "Student Profile": [
    { id: 'socioeconomicStatus', label: 'Socioeconomic Status' },
    { id: 'underrepresentedGroup', label: 'Underrepresented Group' }
  ],
  "Health and Wellbeing": [
    { id: 'mentalHealthSupport', label: 'Mental Health Support' },
    { id: 'healthAppointments', label: 'Health Appointments' },
    { id: 'wellnessCheckins', label: 'Wellness Check-ins' },
    { id: 'mentalHealthConcerns', label: 'Mental Health Concerns' },
    { id: 'frequentHealthQueries', label: 'Frequent Health-Related Queries' }
  ],
  "Campus Involvement": [
    { id: 'clubsParticipation', label: 'Clubs Participation' },
    { id: 'sportsParticipation', label: 'Sports Participation' },
    { id: 'eventAttendance', label: 'Event Attendance' },
    { id: 'potentialIsolation', label: 'Potential Isolation' },
    { id: 'disengagementFromCampusLife', label: 'Disengagement from Campus Life' }
  ],
  "Academic and Personal Challenges": [
    { id: 'scholarshipStatus', label: 'Scholarship Status' },
    { id: 'financialAcademicStress', label: 'Financial or Academic Stress' },
    { id: 'workStudyLoad', label: 'Work or Study Load' },
    { id: 'burnoutOverextension', label: 'Burnout or Overextension' }
  ],
  "Academic Load": [
    { id: 'creditsTaken', label: 'Credits Taken' },
    { id: 'courseDropHistory', label: 'Course Drop History' },
    { id: 'academicDifficultyIndecision', label: 'Academic Difficulty or Indecision' }
  ]
};

// Preselected variables that are already checked on page load
const preselectedVariables = ['canvasLogins', 'advisorFeedback', 'socioeconomicStatus', 'mentalHealthSupport', 'eventAttendance'];

// Main component for data selection page
const DataSelectionPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: boolean }>({});
  const [isChanged, setIsChanged] = useState(false); // State to track if changes have been made
  const navigate = useNavigate();

  // Effect to set initial preselected variables on page load
  useEffect(() => {
    const initialSelectedData: { [key: string]: boolean } = {};
    preselectedVariables.forEach(variable => {
      initialSelectedData[variable] = true;
    });
    setSelectedData(initialSelectedData);
  }, []);

  // Effect to track changes and determine if the button should be enabled
  useEffect(() => {
    const currentSelectedKeys = Object.keys(selectedData).filter(key => selectedData[key]);
    const initialSelectedKeys = preselectedVariables;

    const changesMade = currentSelectedKeys.length !== initialSelectedKeys.length ||
                        currentSelectedKeys.some(key => !initialSelectedKeys.includes(key));

    setIsChanged(changesMade);
  }, [selectedData]);

  // Handle checkbox change with proper typing
  const handleCheckboxChange = (category: string, id: string) => {
    setSelectedData({
      ...selectedData,
      [id]: !selectedData[id]
    });
  };

  const handleModifyDashboard = () => {
    // Logique ou fonction à exécuter lors de la modification du tableau de bord
};

  // Render checkboxes for each data category
  const renderCheckboxes = (categoryName: string, variables: Variable[]) => {
    return (
      <div key={categoryName} className="category-block">
        <h3 className="category-title">{categoryName}</h3>
        <div className="checkbox-group">
          {variables.map((variable) => (
            <div key={variable.id} className="checkbox-item">
              <input
                type="checkbox"
                id={variable.id}
                checked={selectedData[variable.id] || false}
                onChange={() => handleCheckboxChange(categoryName, variable.id)}
                className="checkbox-input"
              />
              <label htmlFor={variable.id} className="checkbox-label">{variable.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle form submission to apply selected variables to the algorithm
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Selected Data:", selectedData);
    const userID = localStorage.getItem('userID') || 'default_userID';
    navigate(`/dashboard/academic-advisor/${userID}`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {/* Passez la fonction onModifyDashboard */}
      <Header onModifyDashboard={handleModifyDashboard} />

      {/* Main Content */}
      <div className="data-selection-page" style={{ padding: '20px', overflowY: 'auto' }}>
        <h1 className="page-title">Select Data to Include in Severity Algorithm</h1>

        {/* Grid Layout for Data Categories */}
        <div className="category-grid">
          {Object.keys(dataCategories).map((categoryName) =>
            renderCheckboxes(categoryName, dataCategories[categoryName])
          )}
        </div>

        {/* Single button to validate and build the dashboard */}
        <button 
          type="submit" 
          onClick={handleSubmit} 
          className="submit-button"
          disabled={!isChanged} // Disable the button if no changes have been made
          style={{
            backgroundColor: isChanged ? '#4CAF50' : '#e0e0e0', // Green if enabled, grey if disabled
            cursor: isChanged ? 'pointer' : 'not-allowed',
            color: isChanged ? '#fff' : '#9e9e9e'
          }}
        >
          Confirm change and build new risk score
        </button>
      </div>
    </div>
  );
};

export default DataSelectionPage;