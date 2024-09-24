// PopupCourseEvent.tsx
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import './PopupCourse.css';
import { AnswerCourse, CourseSlot } from '../interfaces/interfaces_eleve';

interface PopupCourseEventProps {
  course: AnswerCourse;
  isOpen: boolean;
  onClose: () => void;
  onDeleteCourse: () => void;
  onConfirmSlot: (newSlotIndex: number) => void;  // Fonction pour confirmer le changement de créneau
  currentSlot: CourseSlot; // Le créneau actuel du cours
}

const PopupCourseEvent: React.FC<PopupCourseEventProps> = ({
  course,
  isOpen,
  onClose,
  onDeleteCourse,
  onConfirmSlot,  // Fonction pour confirmer le changement de créneau
  currentSlot, // Le créneau actuel est passé ici
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

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
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="course-modal-title"
      aria-describedby="course-modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: '#FFFFFF',
          border: 'none',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Contenu de la popup */}
        <Box sx={{ paddingTop: '16px', flex: 1 }}>
          {/* Informations sur le cours */}
          <Box
            sx={{
              padding: '0px',
              width: '100%',
              boxSizing: 'border-box',
              marginBottom: '16px',
            }}
          >
            <Typography
              id="course-modal-title"
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ color: '#011F5B', fontWeight: 'bold' }}
            >
              {course.title}
            </Typography>

            {/* Semestre, Crédits, Prérequis */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span className="semester-tag">{course.Semester}</span>
              <span className="credit-tag">{course.Credit}</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="prerequisite-tag">
                  {course.Prerequisites}
                </span>
              </div>
            </Box>

            <Typography
              sx={{
                color: '#011F5B',
                fontSize: '0.875rem',
                wordWrap: 'break-word',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              {course.Description}
            </Typography>

            {/* Cercles de données */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                marginTop: '8px',
              }}
            >
              {/* Travail demandé */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    value={calculateProgress(parseFloat(course.Work))}
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
                      sx={{
                        color: '#011F5B',
                        fontWeight: 'bold',
                        fontSize: '0.675rem',
                      }}
                    >
                      {course.Work}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontWeight: '500',
                    fontSize: '0.675rem',
                    color: '#011F5B',
                    marginLeft: '8px',
                  }}
                >
                  Work
                </Typography>
              </Box>

              {/* Qualité */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    value={calculateProgress(parseFloat(course.CourseQuality))}
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
                      sx={{
                        color: '#011F5B',
                        fontWeight: 'bold',
                        fontSize: '0.675rem',
                      }}
                    >
                      {course.CourseQuality}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontWeight: '500',
                    fontSize: '0.675rem',
                    color: '#011F5B',
                    marginLeft: '8px',
                  }}
                >
                  Quality
                </Typography>
              </Box>

              {/* Difficulté */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    value={calculateProgress(parseFloat(course.Difficulty))}
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
                      sx={{
                        color: '#011F5B',
                        fontWeight: 'bold',
                        fontSize: '0.675rem',
                      }}
                    >
                      {course.Difficulty}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontWeight: '500',
                    fontSize: '0.675rem',
                    color: '#011F5B',
                    marginLeft: '8px',
                  }}
                >
                  Difficulty
                </Typography>
              </Box>
            </Box>

            {/* Liens vers le prospectus et le syllabus */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
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
          </Box>

          {/* Invitation à sélectionner un autre créneau */}
          <Typography
            sx={{
              color: '#011F5B',
              fontWeight: 'bold',
              marginBottom: '8px',
              textAlign: 'left',
            }}
          >
            Voulez-vous sélectionner un autre créneau?
          </Typography>

          {/* Créneaux disponibles */}
          <Box>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, index) => (
                <Box
                  key={index}
                  onClick={() => handleSlotClick(index)}
                  className={`course-slot ${
                    selectedSlotIndex === index ? 'selected' : ''
                  } ${
                    selectedSlotIndex !== null && selectedSlotIndex !== index
                      ? 'disabled'
                      : ''
                  }`}
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
                      <Typography
                        sx={{
                          color: '#011F5B',
                          fontWeight: 'bold',
                        }}
                      >
                        {slot.TeacherName} - {slot.CourseID}
                      </Typography>

                      {/* Horaire */}
                      <Typography
                        sx={{
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          color: '#011F5B',
                          marginTop: '4px',
                        }}
                      >
                        {slot.Days.join(' & ')} {slot.StartTime} - {slot.EndTime}
                      </Typography>
                    </Box>

                    {/* Qualité de l'instructeur */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        marginLeft: '16px',
                      }}
                    >
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
                            sx={{
                              color: '#011F5B',
                              fontWeight: 'bold',
                              fontSize: '0.675rem',
                            }}
                          >
                            {slot.TeacherQuality}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: '500',
                          fontSize: '0.675rem',
                          color: '#011F5B',
                          marginTop: '4px',
                        }}
                      >
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
          mt={0}
          display="flex"
          justifyContent="space-between"
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            padding: '4px 0',
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

        {/* Snackbar pour le feedback utilisateur */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message="Le créneau du cours a été mis à jour"
        />
      </Box>
    </Modal>
  );
};

export default PopupCourseEvent;







