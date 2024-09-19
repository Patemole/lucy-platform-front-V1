// CourseModal.tsx
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
import './PopupCourse.css'; // Import CSS for custom styles
import { FiCheck } from 'react-icons/fi';
import { AnswerCourse, CourseSlot } from '../interfaces/interfaces_eleve';

interface CourseModalProps {
  course: AnswerCourse;
  isOpen: boolean;
  onAddCourse: (selectedSlot: CourseSlot, courseTitle: string, code: string) => void; // Adjusted function signature
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({
  course,
  isOpen,
  onAddCourse,
  onClose,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  // Allows selecting another slot even if one is already selected
  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
  };

  const handleAddCourse = () => {
    if (selectedSlotIndex !== null) {
      const selectedSlot = course.CoursesSlot[selectedSlotIndex];
      console.log('Adding course:', course.title);
      console.log('Selected slot:', selectedSlot);
      onAddCourse(selectedSlot, course.title, course.code); // Pass selectedSlot, course title, and code
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

  // Function to calculate the percentage for the progress circles
  const calculateProgress = (value: number): number => {
    return (value / 5) * 100;
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose} // Allows closing the popup by clicking outside
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
          bgcolor: '#FFFFFF', // White background
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
        {/* Content with top margin */}
        <Box sx={{ paddingTop: '16px', flex: 1 }}>
          {/* Course information */}
          <Box
            sx={{
              padding: '0px', // Remove padding from the frame
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

            {/* Semester, Credit, Prerequisites */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              {/* Semester */}
              <span className="semester-tag">{course.Semester}</span>

              {/* Credit */}
              <span className="credit-tag">{course.Credit}</span>

              {/* Prerequisites */}
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

            {/* Description */}
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

            {/* Data circles */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                marginTop: '8px',
              }}
            >
              {/* Work */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box position="relative" display="inline-flex">
                  {/* Background circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={40}
                    thickness={5}
                    sx={{ color: '#E8F4FB', position: 'absolute' }}
                  />
                  {/* Progress circle */}
                  <CircularProgress
                    variant="determinate"
                    value={calculateProgress(parseFloat(course.Work))}
                    size={40}
                    thickness={5}
                    sx={{ color: '#3155CC', zIndex: 1 }}
                  />
                  {/* Value in the center */}
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
                {/* Legend */}
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

              {/* Quality */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box position="relative" display="inline-flex">
                  {/* Background circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={40}
                    thickness={5}
                    sx={{ color: '#E8F4FB', position: 'absolute' }}
                  />
                  {/* Progress circle */}
                  <CircularProgress
                    variant="determinate"
                    value={calculateProgress(
                      parseFloat(course.CourseQuality)
                    )}
                    size={40}
                    thickness={5}
                    sx={{ color: '#3155CC', zIndex: 1 }}
                  />
                  {/* Value in the center */}
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
                {/* Legend */}
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

              {/* Difficulty */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box position="relative" display="inline-flex">
                  {/* Background circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={40}
                    thickness={5}
                    sx={{ color: '#E8F4FB', position: 'absolute' }}
                  />
                  {/* Progress circle */}
                  <CircularProgress
                    variant="determinate"
                    value={calculateProgress(parseFloat(course.Difficulty))}
                    size={40}
                    thickness={5}
                    sx={{ color: '#3155CC', zIndex: 1 }}
                  />
                  {/* Value in the center */}
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
                {/* Legend */}
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

            {/* Prospectus and Syllabus links */}
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

          {/* "Select a slot to add it to your schedule" */}
          <Typography
            sx={{
              color: '#011F5B',
              fontWeight: 'bold',
              marginBottom: '8px',
              textAlign: 'left',
            }}
          >
            Select a slot to add it to your schedule
          </Typography>

          {/* Course slots */}
          <Box>
            {course.CoursesSlot.map((slot, index) => (
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
                }}
              >
                {/* Slot content */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {/* Teacher info and schedule */}
                  <Box sx={{ flex: 1 }}>
                    {/* Teacher's name and CourseID */}
                    <Typography
                      sx={{
                        color: '#011F5B',
                        fontWeight: 'bold',
                      }}
                    >
                      {slot.TeacherName} - {slot.CourseID}
                    </Typography>

                    {/* Schedule */}
                    <Typography
                      sx={{
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        color: '#011F5B',
                        marginTop: '4px', // Reduce space above
                      }}
                    >
                      {slot.Days.join(' & ')} {slot.StartTime} - {slot.EndTime}
                    </Typography>
                  </Box>

                  {/* Instructor Quality */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'column',
                      marginLeft: '16px',
                    }}
                  >
                    <Box position="relative" display="inline-flex">
                      {/* Background circle */}
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={30} // Reduced size
                        thickness={5}
                        sx={{ color: '#E8F4FB', position: 'absolute' }}
                      />
                      {/* Progress circle */}
                      <CircularProgress
                        variant="determinate"
                        value={calculateProgress(
                          parseFloat(slot.TeacherQuality)
                        )}
                        size={30} // Reduced size
                        thickness={5}
                        sx={{ color: '#3155CC', zIndex: 1 }}
                      />
                      {/* Value in the center */}
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
                    {/* Legend */}
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
            ))}
          </Box>
        </Box>

        {/* "Add" button always visible at the bottom */}
        <Box
          mt={0}
          display="flex"
          justifyContent="flex-end"
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            padding: '4px 0',
            zIndex: 1,
          }}
        >
          <Button
            onClick={handleAddCourse}
            variant="contained"
            color="primary"
            disabled={selectedSlotIndex === null}
          >
            Add
          </Button>
        </Box>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message="Course added to your calendar"
        />
      </Box>
    </Modal>
  );
};

export default CourseModal;













