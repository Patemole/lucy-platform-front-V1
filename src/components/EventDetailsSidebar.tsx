// EventDetailsSidebar.tsx
import React from 'react';
import { Drawer, Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import { format } from 'date-fns';
import { EventStudentProfile } from '../interfaces/interfaces_eleve';

const topicColors: { [key: string]: string } = {
  'Financial Aids': '#27ae60',
  Sports: '#e67e22',
  Basketball: '#2980b9',
  Cultural: '#8e44ad',
  Track: '#f39c12',
  Lacrosse: '#27ae60',
  Health: '#d32f2f',
  Default: '#7f8c8d',
};

interface EventDetailsSidebarProps {
  event: EventStudentProfile | null;
  open: boolean;
  onClose: () => void;
}

const EventDetailsSidebar: React.FC<EventDetailsSidebarProps> = ({ event, open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          p: 3,
          backgroundColor: '#fff',
          boxShadow: 'none',
        },
      }}
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        {event ? (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h6" sx={{ pb: 2 }} gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {event.description || 'Aucune description fournie.'}
            </Typography>
            {event.start && event.end && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {`From ${format(event.start, "eee, MMM d, p")} - ${format(event.end, "p")}`}
                </Typography>
              </Box>
            )}
            {event.location && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <iframe
                    title="map"
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '8px' }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB1bax7elnmblu7lQ24Xi20zfIEOUmd1R0&q=${encodeURIComponent(event.location)}`}
                    allowFullScreen
                  ></iframe>
                </Box>
              </>
            )}
            <Typography variant="body2" gutterBottom>
              Category :{' '}
              <span style={{ color: topicColors[event.category || 'Default'] }}>
                {event.category || 'Default'}
              </span>
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  console.log('See more clicked');
                  // future: rediriger vers le lien de l'événement
                }}
              >
                See more
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2">Aucun événement sélectionné.</Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default EventDetailsSidebar;
