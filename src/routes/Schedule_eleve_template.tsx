/*
import React from 'react';
import { Box, Divider } from '@mui/material';
import Header from '../components/Header'; 
import LeftSectionHeader from '../components/CourseSelectionHeader'; 
import CurriculumProgress from '../components/ScheduleCourseList'; 
import Chat from '../components/CourseSelectionChat'; 
import ScheduleMetrics from '../components/ScheduleMetrics'; 
import Calendar from '../components/ScheduleCalendar'; 

const CourseSelectionEleveTemplate: React.FC = () => {
  return (
    <Box height="100vh" display="flex" flexDirection="column" sx={{ overflow: 'hidden' }}>
      {/* Header Component *
      <Header />

      {/* Main Page Content *
      <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
        {/* Left Section - 70% of the page *
        <Box flex={7} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Left Section Header *
          <Box sx={{ flexGrow: 0 }}>
            <LeftSectionHeader />
          </Box>

          {/* Split Left Section into 25% and 75%, taking max height *
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Left Subsection - 25%, scrollable *
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
              {/* CurriculumProgress Component *
              <CurriculumProgress />
            </Box>

            {/* Right Subsection - 75%, split into 2 sections (fixed height for calendar and flexible bottom section) *
            <Box 
              flex={7.5}  
              sx={{ 
                padding: '16px', 
                backgroundColor: '#FFFFFF',
                display: 'flex', 
                flexDirection: 'column',
              }}
            >
              {/* Top section - Calendar (fixed height) *
              <Box
                sx={{
                  height: '450px', // Fixed height for the calendar
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px', // Space between the calendar and the metrics section
                }}
              >
                <Calendar />
              </Box>

              {/* Bottom section - ScheduleMetrics (flexible height) *
              <Box
                sx={{
                  flexGrow: 1, // This will take the remaining space below the calendar
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScheduleMetrics />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Vertical Divider between Left and Right sections *
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7'}} />

        {/* Right Section - 30% of the page *
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Chat Component *
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Chat />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;
*/










/* code qui marche bien et affiche correctement les informations à l'écran 
*/

/*
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import Header from '../components/Header'; // Adjust the path as necessary
import LeftSectionHeader from '../components/CourseSelectionHeader'; // Adjust the path as necessary
import CurriculumProgress from '../components/ScheduleCourseList'; // Adjust the path as necessary
import Chat from '../components/CourseSelectionChat'; // Adjust the path as necessary
import ScheduleMetrics from '../components/ScheduleMetrics'; // Import the ScheduleMetrics component
//import Calendar from '../components/ScheduleCalendar'; // Import the Calendar component
import Calendar from '../components/NewCalendarCustom'; // Import the Calendar component

const CourseSelectionEleveTemplate: React.FC = () => {
  return (
    <Box height="100vh" display="flex" flexDirection="column" sx={{ overflow: 'hidden' }}>
      {/* Header Component *
      <Header />

      {/* Main Page Content *
      <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
        {/* Left Section - 70% of the page *
        <Box flex={7} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Left Section Header *
          <Box sx={{ flexGrow: 0 }}>
            {/* Full-width LeftSectionHeader without any margins *
            <LeftSectionHeader />
          </Box>

          {/* Split Left Section into 25% and 75%, taking max height *
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Left Subsection - 25%, scrollable *
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
              {/* Replaced with CurriculumProgress Component *
              <CurriculumProgress />
            </Box>

            {/* Right Subsection - 75%, split into 2 sections (80% top, 20% bottom) *
            <Box 
              flex={7.5}  
              sx={{ 
                padding: '16px', 
                backgroundColor: '#FFFFFF',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
              }}
            >
              {/* Top section (80% height) *
              <Box
                sx={{
                  flex: 8,
                  backgroundColor: '#FFFFFF', // Change to white to match the rest of the design
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px' // Adds some space between the two sections
                }}
              >
                {/* Include the Calendar Component here *
                <Calendar />
              </Box>

              {/* Bottom section (20% height) *
              <Box
                sx={{
                  flex: 2,
                  backgroundColor: '#FFFFFF', // Make it white since we're adding a component here
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Replaced with ScheduleMetrics Component *
                <ScheduleMetrics />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Vertical Divider between Left and Right sections *
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7'}} />

        {/* Right Section - 30% of the page, no margins for the chat *
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Chat Component *
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Chat />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;

*/


import React, { useState } from 'react';
import { Box, Divider } from '@mui/material';
import Header from '../components/Header'; // Adjust the path as necessary
import LeftSectionHeader from '../components/CourseSelectionCalendarHeader'; // Adjust the path as necessary
import CurriculumProgress from '../components/ScheduleCourseList'; // Adjust the path as necessary
import Chat from '../components/CourseSelectionChat'; // Adjust the path as necessary
import ScheduleMetrics from '../components/ScheduleMetrics'; // Import the ScheduleMetrics component
import Calendar from '../components/NewCalendarCustom'; // Import the Calendar component
import { CourseSlot, AnswerCourse } from '../interfaces/interfaces_eleve';
import { useNavigate } from 'react-router-dom';

const CourseSelectionEleveTemplate: React.FC = () => {
  const navigate = useNavigate();
  // État pour stocker le créneau de cours sélectionné
  const [newCourseSlot, setNewCourseSlot] = useState<{ slot: CourseSlot; title: string; code: string; } | null>(null);
  // État pour stocker les informations du cours sélectionné (AnswerCourse)
  const [selectedAnswerCourse, setSelectedAnswerCourse] = useState<AnswerCourse | null>(null); // Ajouter cet état


  // Fonction pour gérer l'ajout d'un créneau de cours au calendrier
  const handleAddCourseToCalendar = (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
    const { title, code } = answerCourse; // Extraire title et code de answerCourse
    setNewCourseSlot({ slot: selectedSlot, title, code });
    setSelectedAnswerCourse(answerCourse); // Ajouter l'AnswerCourse ici
      // Afficher une notification après l'ajout
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

          {/* Split Left Section into 25% and 75%, taking max height */}
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Left Subsection - 25%, scrollable */}
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
              {/* Replaced with CurriculumProgress Component */}
              <CurriculumProgress />
            </Box>

            {/* Right Subsection - 75%, split into 2 sections (80% top, 20% bottom) */}
            <Box 
              flex={7.5}  
              sx={{ 
                padding: '16px', 
                backgroundColor: '#FFFFFF',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
              }}
            >
              {/* Top section (80% height) */}
              <Box
                sx={{
                  flex: 8,
                  backgroundColor: '#FFFFFF', // Change to white to match the rest of the design
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px', // Adds some space between the two sections
                }}
              >
                {/* Include the Calendar Component and pass newCourseSlot as a prop */}
                <Calendar newCourseSlot={newCourseSlot} answerCourse={selectedAnswerCourse} />
              </Box>

              {/* Bottom section (20% height) */}
              <Box
                sx={{
                  flex: 2,
                  backgroundColor: '#FFFFFF', // Make it white since we're adding a component here
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Replaced with ScheduleMetrics Component */}
                <ScheduleMetrics />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Vertical Divider between Left and Right sections */}
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7'}} />

        {/* Right Section - 30% of the page, no margins for the chat */}
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Chat Component */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            {/* Chat component and pass handleAddCourseToCalendar as a prop */}
            <Chat handleAddCourseToCalendar={handleAddCourseToCalendar} />
            
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;

