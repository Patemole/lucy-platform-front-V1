// src/components/PopupCourseEvent.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import { FiArrowLeft } from 'react-icons/fi'; // Import de l'icône de flèche
import { AnswerCourse, CourseSlot } from '../interfaces/interfaces_eleve';
import './SlidingCourseEvent.css'; // Importation du fichier CSS si nécessaire

interface PopupCourseEventProps {
  course: AnswerCourse;
  isOpen: boolean;
  onClose: () => void;
  onDeleteCourse: () => void;
  onConfirmSlot: (newSlotIndex: number) => void; // Fonction pour confirmer le changement de créneau
  currentSlot: CourseSlot; // Le créneau actuel du cours
}

const PopupCourseEvent: React.FC<PopupCourseEventProps> = ({
  course,
  isOpen,
  onClose,
  onDeleteCourse,
  onConfirmSlot,
  currentSlot,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fonction pour sélectionner un autre créneau
  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
  };

  const handleConfirm = () => {
    if (selectedSlotIndex !== null) {
      onConfirmSlot(selectedSlotIndex);
      setSelectedSlotIndex(null);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Fonction pour calculer le pourcentage pour les cercles de progression
  const calculateProgress = (value: number): number => {
    return (value / 5) * 100;
  };

  // Fonction pour vérifier si un créneau est le créneau actuel
  const isCurrentSlot = (slot: CourseSlot) => {
    return (
      currentSlot.Days.join('') === slot.Days.join('') &&
      currentSlot.StartTime === slot.StartTime &&
      currentSlot.EndTime === slot.EndTime
    );
  };

  // Filtrer les créneaux pour exclure celui qui est déjà sélectionné (currentSlot)
  const availableSlots = course.CoursesSlot.filter(slot => !isCurrentSlot(slot));

  return (
    <>
      {/* Overlay pour couvrir le composant Chat */}
      {isOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
            zIndex: 1000, // Assurer que l'overlay est au-dessus
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Conteneur principal de la popup */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              height: '100%',
              bgcolor: '#FFFFFF',
              overflowY: 'auto',
              position: 'relative',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Header avec le bouton de retour */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={onClose} aria-label="Back to chat">
                <FiArrowLeft size={24} color="#011F5B" />
              </IconButton>
              <Typography variant="h6" sx={{ color: '#011F5B', fontWeight: 'bold' }}>
                Détails du Cours
              </Typography>
            </Box>

            {/* Informations sur le cours */}
            <Box sx={{ flex: 1 }}>
              {/* Titre du cours */}
              <Typography variant="h6" sx={{ color: '#011F5B', fontWeight: 'bold', mb: 2 }}>
                {course.title}
              </Typography>

              {/* Semestre, Crédit, Prérequis */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', mb: 2 }}>
                <span className="tag semester-tag">{course.Semester}</span>
                <span className="tag credit-tag">{course.Credit}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tag prerequisite-tag">{course.Prerequisites}</span>
                </div>
              </Box>

              {/* Description */}
              <Typography sx={{ color: '#011F5B', fontSize: '0.875rem', wordWrap: 'break-word', fontWeight: 500, mb: 2 }}>
                {course.Description}
              </Typography>

              {/* Cercles de données */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {['Work', 'Quality', 'Difficulty'].map((label) => {
                  const value =
                    label === 'Work'
                      ? parseFloat(course.Work)
                      : label === 'Quality'
                      ? parseFloat(course.CourseQuality)
                      : parseFloat(course.Difficulty);
                  return (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box position="relative" display="inline-flex">
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={40}
                          thickness={5}
                          sx={{ color: '#E8F4FB', position: 'absolute' }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={calculateProgress(value)}
                          size={40}
                          thickness={5}
                          sx={{ color: '#3155CC', zIndex: 1 }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ color: '#011F5B', fontWeight: 'bold', fontSize: '0.675rem' }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.675rem', color: '#011F5B', ml: 1 }}>
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Liens vers le Prospectus et le Syllabus */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap', mb: 2 }}>
                <a
                  href={course.Prospectus_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Prospectus
                </a>
                <a
                  href={course.Syllabus_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Syllabus
                </a>
              </Box>

              {/* Invitation à sélectionner un autre créneau */}
              <Typography sx={{ color: '#011F5B', fontWeight: 'bold', mb: 1 }}>
                Voulez-vous sélectionner un autre créneau?
              </Typography>

              {/* Créneaux disponibles */}
              <Box>
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <Box
                      key={index}
                      onClick={() => handleSlotClick(index)}
                      className={`course-slot ${selectedSlotIndex === index ? 'selected' : ''}`}
                      sx={{
                        border: '1px solid #BCBCBC',
                        backgroundColor: '#FCFCFC',
                        color: '#011F5B',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        opacity: selectedSlotIndex === null || selectedSlotIndex === index ? 1 : 0.6,
                      }}
                    >
                      {/* Contenu du créneau */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        {/* Infos sur le professeur et l'horaire */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#011F5B', fontWeight: 'bold' }}>
                            {slot.TeacherName} - {slot.CourseID}
                          </Typography>

                          {/* Horaire */}
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#011F5B', mt: 0.5 }}>
                            {slot.Days.join(' & ')} {slot.StartTime} - {slot.EndTime}
                          </Typography>
                        </Box>

                        {/* Qualité de l'instructeur */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', ml: 2 }}>
                          <Box position="relative" display="inline-flex">
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={30}
                              thickness={5}
                              sx={{ color: '#E8F4FB', position: 'absolute' }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={calculateProgress(parseFloat(slot.TeacherQuality))}
                              size={30}
                              thickness={5}
                              sx={{ color: '#3155CC', zIndex: 1 }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{ color: '#011F5B', fontWeight: 'bold', fontSize: '0.675rem' }}
                              >
                                {slot.TeacherQuality}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.675rem', color: '#011F5B', mt: 0.5 }}>
                            Instructor Quality
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: '#011F5B' }}>
                    Aucun autre créneau disponible.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Boutons de suppression et de confirmation */}
            <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#FFFFFF',
                padding: '8px 0',
                zIndex: 1,
              }}
            >
              <Button
                onClick={onDeleteCourse}
                variant="contained"
                sx={{
                  backgroundColor: '#FEEAEA',
                  color: '#EF4361',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FEEAEA',
                  },
                }}
              >
                Supprimer le cours
              </Button>

              <Button
                onClick={handleConfirm}
                variant="contained"
                sx={{
                  backgroundColor: '#D6EAF7',
                  color: '#011F5B',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#D6EAF7',
                  },
                }}
                disabled={selectedSlotIndex === null}
              >
                Confirmer le créneau
              </Button>
            </Box>

            {/* Notification Snackbar */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              message="Le créneau du cours a été mis à jour"
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default PopupCourseEvent;


