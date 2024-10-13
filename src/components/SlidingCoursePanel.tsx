// src/components/SlidingCoursePanel.tsx

import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { AnswerCourse, CourseSlot } from '../interfaces/interfaces_eleve';
import './SlidingCoursePanel.css'; // Importation du fichier CSS

interface SlidingCoursePanelProps {
  course: AnswerCourse;
  onClose: () => void;
  handleAddCourseToCalendar: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => void;
}

const SlidingCoursePanel: React.FC<SlidingCoursePanelProps> = ({
  course,
  onClose,
  handleAddCourseToCalendar,
}) => {
  const theme = useTheme();
  const [selectedSlotIndex, setSelectedSlotIndex] = React.useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Fonction pour calculer le pourcentage de progression
  const calculateProgress = (value: number): number => {
    return (value / 5) * 100;
  };

  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
  };

  const handleAddCourse = () => {
    if (selectedSlotIndex !== null) {
      const selectedSlot = course.CoursesSlot[selectedSlotIndex];
      handleAddCourseToCalendar(selectedSlot, course);
      setSelectedSlotIndex(null);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Fonction pour générer les styles dynamiques pour les tags
  const getTagStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    color: textColor,
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        overflowY: 'auto',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Retour au Chat */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <button onClick={onClose} style={{ color: '#011F5B', fontSize: '0.875rem', fontWeight: 500}}>
            {'<'}
          </button>
        <Typography sx={{color: '#011F5B', fontSize: '0.875rem', fontWeight: 500 }}>
          Back to chat
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
          <span className="tag" style={getTagStyle('#FFD9BF', '#F97315')}>
            {course.Semester}
          </span>
          <span className="tag" style={getTagStyle('#D6EAF7', '#011F5B')}>
            {course.Credit}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="tag" style={getTagStyle('#FEEAEA', '#EF4361')}>
              {course.Prerequisites}
            </span>
            <div className="iconCircle">
              <FiCheck style={{ color: 'white' }} />
            </div>
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

        {/* Sélection d'un créneau */}
        <Typography sx={{ color: '#011F5B', fontWeight: 'bold', mb: 1 }}>
        Select a slot to add it to your schedule
        </Typography>

        {/* Créneaux du cours */}
        <Box>
          {course.CoursesSlot.map((slot, index) => (
            <Box
              key={index}
              onClick={() => handleSlotClick(index)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#FCFCFC',
                border: '1px solid #BCBCBC',
                padding: '16px',
                marginBottom: index === course.CoursesSlot.length - 1 ? '16px' : '8px',
                borderRadius: '8px',
                width: '100%',
                boxSizing: 'border-box',
                opacity: selectedSlotIndex !== null && selectedSlotIndex !== index ? 0.5 : 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Informations sur l'enseignant et l'horaire */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#011F5B', fontWeight: 'bold' }}>
                    {slot.TeacherName} - {slot.CourseID}
                  </Typography>
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
          ))}
        </Box>
      </Box>

      {/* Bouton d'ajout */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
        <Button
          onClick={handleAddCourse}
          variant="contained"
          color="primary"
          disabled={selectedSlotIndex === null}
          startIcon={selectedSlotIndex !== null ? <FiCheck /> : null}
        >
          Add to schedule
        </Button>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Cours ajouté à votre calendrier"
      />
    </Box>
  );
};

// Exportation du composant
export default SlidingCoursePanel;



