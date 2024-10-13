
import React, { useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import Header from '../components/Header'; // Adjust the path as necessary
import LeftSectionHeader from '../components/CourseSelectionHeader'; // Adjust the path as necessary
import LeftSubsectionContent from '../components/CourseSelectionDegreePlanningLeftParameter'; // Adjust the path as necessary
import Chat from '../components/CourseSelectionChat'; // Adjust the path as necessary
import CourseMap from '../components/CourseSelectionCircleGraph'; // Import the CourseMap component
import CurriculumProgress from '../components/ScheduleCourseList'; // Adjust the path as necessary
import { CourseSlot, AnswerCourse } from '../interfaces/interfaces_eleve';
import { useNavigate } from 'react-router-dom';

const CourseSelectionEleveTemplate: React.FC = () => {
  const navigate = useNavigate();

  // State for selected course and Drawer visibility
  const [selectedCourse, setSelectedCourse] = useState<AnswerCourse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State for storing the course slot
  const [newCourseSlot, setNewCourseSlot] = useState<{ slot: CourseSlot; title: string; code: string; } | null>(null);
  const [selectedAnswerCourse, setSelectedAnswerCourse] = useState<AnswerCourse | null>(null); // Ajouter cet état

  // Fonction pour gérer l'ajout d'un créneau de cours au calendrier
  const handleAddCourseToCalendar = (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
    const { title, code } = answerCourse; // Extraire title et code de answerCourse
    setNewCourseSlot({ slot: selectedSlot, title, code });
    setSelectedAnswerCourse(answerCourse); // Ajouter l'AnswerCourse ici
      // Afficher une notification après l'ajout
  };

  // Handlers for Drawer
  const handleOpenDrawer = (course: AnswerCourse) => {
    setSelectedCourse(course);
    setDrawerOpen(true);
  };

  // Fonction pour gérer la redirection vers "Academic Advisor"
  const handleNavigateToAcademicAdvisor = () => {
    // Enregistrer le chat_id actuel dans LastCourseSelectionChat_id
    const currentChatId = localStorage.getItem('chat_id');
    if (currentChatId) {
      localStorage.setItem('LastCourseSelectionChat_id', currentChatId); // Stocker le chat_id actuel
    }
    // Récupérer le dernier chat_id de l'Academic Advisor
    const lastAcademicAdvisorChatId = localStorage.getItem('lastAcademicAdvisorChat_id');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Si le chat_id de l'Academic Advisor existe, le remplacer dans le localStorage
    if (lastAcademicAdvisorChatId) {
      localStorage.setItem('chat_id', lastAcademicAdvisorChatId); // Remplacer le chat_id par lastAcademicAdvisorChat_id
    }

    // Récupérer l'uid de l'utilisateur et rediriger vers la page de l'étudiant
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column" sx={{ overflow: 'hidden' }}>
      {/* Header Component */}
      <Header handleNavigateToAcademicAdvisor={handleNavigateToAcademicAdvisor} />

      {/* Main Page Content */}
      <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
        {/* Left Section - 70% of the page */}
        <Box flex={7} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Left Section Header */}
          <Box sx={{ flexGrow: 0 }}>
            {/* Full-width LeftSectionHeader without any margins */}
            <LeftSectionHeader />
          </Box>

          {/* Split Left Section into 30% and 70%, taking max height */}
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Left Subsection - 30%, scrollable */}
            <Box
              flex={2.5}
              sx={{
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto', // Enable vertical scrolling
              }}
            >
              {/* Left Subsection Content Component */}
              < CurriculumProgress/>  {/*LeftSubsectionContent*/}
            </Box>

            {/* Right Subsection - 70% */}
            <Box 
              flex={7.5} 
              sx={{ 
                padding: '16px', 
                backgroundColor: '#FFFFFF', // Remove blue background and make it white
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
              }}
            >
              {/* Include CourseMap here */}
              <CourseMap />
            </Box>
          </Box>
        </Box>

        {/* Vertical Divider between Left and Right sections */}
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7'}} />

        {/* Right Section - 30% of the page, no margins for the chat */}
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Chat Component */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Chat 
            handleAddCourseToCalendar={handleAddCourseToCalendar}
            handleOpenDrawer={handleOpenDrawer} 
             />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;


















/* MAQUETTE POUR LE COURSE SELECTION
import React from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../components/Header'; // Adjust the path as necessary

const CourseSelectionEleveTemplate: React.FC = () => {
  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header Component *
      <Header />

      {/* Main Page Content *
      <Box display="flex" flexDirection="row" flex={1}>
        {/* Left Section - 70% of the page *
        <Box flex={7} sx={{ backgroundColor: '#E0F7FA', display: 'flex', flexDirection: 'column' }}>
          
          {/* Left Section Header with reduced height *
          <Box sx={{ padding: '8px', backgroundColor: '#BBDEFB' }}>
            <Typography variant="h6" gutterBottom>
              Left Section Header
            </Typography>
            <Typography>
              This is the header for the left section. It will be placed above the subsections.
            </Typography>
          </Box>

          {/* Split Left Section into 25% and 75%, taking max height *
          <Box display="flex" flexDirection="row" flex={1}>
            {/* Left Subsection - 25% *
            <Box flex={1} sx={{ padding: '16px', backgroundColor: '#D1C4E9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Left Subsection - 25%
              </Typography>
              <Typography>
                This is the left subsection that takes 25% of the left section.
              </Typography>
            </Box>

            {/* Right Subsection - 75% *
            <Box flex={3} sx={{ padding: '16px', backgroundColor: '#C5CAE9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Right Subsection - 75%
              </Typography>
              <Typography>
                This is the right subsection that takes 75% of the left section.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section - 30% of the page, taking max height *
        <Box flex={3} sx={{ backgroundColor: '#FCE4EC', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Right Section
            </Typography>
            <Typography>
              This is the right section that takes 30% of the entire page.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;
*/














