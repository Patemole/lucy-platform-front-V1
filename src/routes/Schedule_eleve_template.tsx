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




/* ANCIEN QUI CODE QUI MARCHE TRÈS BIEN AVANT LA SIDE DE SELECTION DE COURS (23/09/224)
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
      {/* Header Component *
      <Header handleNavigateToAcademicAdvisor={handleNavigateToAcademicAdvisor} />

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
                  marginBottom: '16px', // Adds some space between the two sections
                }}
              >
                {/* Include the Calendar Component and pass newCourseSlot as a prop *
                <Calendar newCourseSlot={newCourseSlot} answerCourse={selectedAnswerCourse} />
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
            {/* Chat component and pass handleAddCourseToCalendar as a prop *
            <Chat handleAddCourseToCalendar={handleAddCourseToCalendar} />
            
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;
*/




//NOUVEAU CODE POUR INCLURE LA SIDEBAR POUR SELECTION DES CRENEAU

// src/templates/CourseSelectionEleveTemplate.tsx

// src/templates/CourseSelectionEleveTemplate.tsx

// src/templates/CourseSelectionEleveTemplate.tsx

// src/templates/CourseSelectionEleveTemplate.tsx

import React, { useState, useRef } from 'react';
import { Box, Divider } from '@mui/material';
import Header from '../components/Header';
import LeftSectionHeader from '../components/CourseSelectionCalendarHeader';
import CurriculumProgress from '../components/ScheduleCourseList';
import Chat from '../components/CourseSelectionChat';
import ScheduleMetrics from '../components/ScheduleMetrics';
import Calendar from '../components/NewCalendarCustom';
import PopupCourseEvent from '../components/SlidingCourseEvent'; // Import du composant PopupCourseEvent
import { CourseSlot, AnswerCourse, Event } from '../interfaces/interfaces_eleve';
import { useNavigate } from 'react-router-dom';
import SlidingCoursePanel from '../components/SlidingCoursePanel'; // Import du composant SlidingCoursePanel
import { CalendarHandles } from '../components/NewCalendarCustom'; // Import de l'interface CalendarHandles

const CourseSelectionEleveTemplate: React.FC = () => {
  const navigate = useNavigate();

  // États pour le panneau de cours (SlidingCoursePanel)
  const [selectedCourse, setSelectedCourse] = useState<AnswerCourse | null>(null);
  const [isCoursePanelOpen, setIsCoursePanelOpen] = useState(false);

  // États pour le panneau d'événement de calendrier (PopupCourseEvent)
  const [popupEvent, setPopupEvent] = useState<Event | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Ref pour accéder aux fonctions du Calendar
  const calendarRef = useRef<CalendarHandles>(null);

  // Fonction pour gérer l'ajout d'un cours au calendrier
  const handleAddCourseToCalendar = (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
    if (calendarRef.current) {
      calendarRef.current.addCourse(selectedSlot, answerCourse);
    }
    // Optionnel : afficher une notification après l'ajout
  };

  // Fonction pour gérer la navigation vers le conseiller académique
  const handleNavigateToAcademicAdvisor = () => {
    // Sauvegarder le chat_id actuel dans LastCourseSelectionChat_id
    const currentChatId = localStorage.getItem('chat_id');
    if (currentChatId) {
      localStorage.setItem('LastCourseSelectionChat_id', currentChatId);
    }
    // Récupérer le dernier chat_id du conseiller académique
    const lastAcademicAdvisorChatId = localStorage.getItem('lastAcademicAdvisorChat_id');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Si le chat_id du conseiller académique existe, le remplacer dans localStorage
    if (lastAcademicAdvisorChatId) {
      localStorage.setItem('chat_id', lastAcademicAdvisorChatId);
    }

    // Récupérer l'uid de l'utilisateur et naviguer vers la page de l'étudiant
    const uid = user.id;
    navigate(`/dashboard/student/${uid}`);
  };

  // Fonction pour ouvrir le panneau de cours (SlidingCoursePanel)
  const handleOpenCoursePanel = (course: AnswerCourse) => {
    setSelectedCourse(course);
    setIsCoursePanelOpen(true);
    // Fermer le panneau d'événement de calendrier si ouvert
    if (isPopupOpen) {
      setIsPopupOpen(false);
      setPopupEvent(null);
    }
  };

  // Fonction pour fermer le panneau de cours
  const handleCloseCoursePanel = () => {
    setIsCoursePanelOpen(false);
    setSelectedCourse(null);
  };

  // Fonction pour ouvrir le panneau d'événement de calendrier (PopupCourseEvent)
  const handleOpenCalendarEventPanel = (event: Event) => {
    setPopupEvent(event);
    setIsPopupOpen(true);
    // Fermer le panneau de cours si ouvert
    if (isCoursePanelOpen) {
      setIsCoursePanelOpen(false);
      setSelectedCourse(null);
    }
  };

  // Fonction pour fermer le panneau d'événement de calendrier
  const handleCloseCalendarEventPanel = () => {
    setIsPopupOpen(false);
    setPopupEvent(null);
  };

  // Fonction pour supprimer un cours via Calendar ref
  const handleDeleteCourse = (courseCode: string) => {
    if (calendarRef.current) {
      calendarRef.current.deleteCourse(courseCode);
    }
    handleCloseCalendarEventPanel();
  };

  // Fonction pour confirmer un changement de créneau via Calendar ref
  const handleConfirmSlot = (courseCode: string, newSlotIndex: number) => {
    if (calendarRef.current) {
      calendarRef.current.confirmSlot(courseCode, newSlotIndex);
    }
    handleCloseCalendarEventPanel();
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column" sx={{ overflow: 'hidden' }}>
      {/* Composant Header */}
      <Header handleNavigateToAcademicAdvisor={handleNavigateToAcademicAdvisor} />

      {/* Contenu principal de la page */}
      <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
        {/* Section gauche - 70% de la page */}
        <Box flex={7} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* En-tête de la section gauche */}
          <Box sx={{ flexGrow: 0 }}>
            <LeftSectionHeader />
          </Box>

          {/* Diviser la section gauche en deux sous-sections */}
          <Box display="flex" flexDirection="row" flex={1} sx={{ overflow: 'hidden' }}>
            {/* Sous-section gauche - 25%, défilante */}
            <Box
              flex={2.5}  
              sx={{
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto',
              }}
            >
              <CurriculumProgress />
            </Box>

            {/* Sous-section droite - 75%, divisée en deux parties */}
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
              {/* Partie supérieure (80% hauteur) */}
              <Box
                sx={{
                  flex: 8,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Calendar 
                  ref={calendarRef} // Passer le ref
                  onEventClick={handleOpenCalendarEventPanel} // Passer le gestionnaire d'événement
                />
              </Box>

              {/* Partie inférieure (20% hauteur) */}
              <Box
                sx={{
                  flex: 2,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ScheduleMetrics />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Diviseur vertical entre les sections gauche et droite */}
        <Divider orientation="vertical" flexItem style={{ backgroundColor: '#F7F7F7' }} />

        {/* Section droite - 30% de la page */}
        <Box flex={3} sx={{ backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Composant Chat, SlidingCoursePanel ou PopupCourseEvent */}
          {!isCoursePanelOpen && !isPopupOpen ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <Chat 
                handleAddCourseToCalendar={handleAddCourseToCalendar} 
                handleOpenDrawer={handleOpenCoursePanel} // Renommé pour ouvrir le panneau intégré
              />
            </Box>
          ) : isCoursePanelOpen ? (
            <SlidingCoursePanel 
              course={selectedCourse!} // Non-null assertion car isCoursePanelOpen est true
              onClose={handleCloseCoursePanel}
              handleAddCourseToCalendar={handleAddCourseToCalendar}
            />
          ) : isPopupOpen && popupEvent ? (
            <PopupCourseEvent
              course={popupEvent.answerCourse}
              isOpen={isPopupOpen}
              onClose={handleCloseCalendarEventPanel}
              onDeleteCourse={() => handleDeleteCourse(popupEvent.category)}
              onConfirmSlot={(newSlotIndex: number) => handleConfirmSlot(popupEvent.category, newSlotIndex)}
              currentSlot={popupEvent.answerCourse.CoursesSlot.find(slot => slot.CourseID === popupEvent.id.split('-').pop()) || popupEvent.answerCourse.CoursesSlot[0]}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default CourseSelectionEleveTemplate;




