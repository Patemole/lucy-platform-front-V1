// Kanban.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format, isValid } from 'date-fns';
import { EventStudentProfile } from '../interfaces/interfaces_eleve';

interface KanbanProps {
  events: EventStudentProfile[];
  onEventClick: (event: EventStudentProfile) => void;
}

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

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Kanban: React.FC<KanbanProps> = ({ events, onEventClick }) => {
  // initialisation des événements groupés pour chaque jour de la semaine
  const groupedEvents: { [day: string]: EventStudentProfile[] } = {};
  weekDays.forEach((day) => {
    groupedEvents[day] = [];
  });

  // regroupement des événements par jour (basé sur la date de début)
  events.forEach((event) => {
    if (!isValid(event.start) || !isValid(event.end)) {
      console.error(`skipping event ${event.id} due to invalid time value`, event);
      return;
    }
    const dayName = format(event.start, 'EEEE');
    if (groupedEvents[dayName]) {
      groupedEvents[dayName].push(event);
    }
  });

  // tri des événements de chaque jour par heure de début
  weekDays.forEach((day) => {
    groupedEvents[day].sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  // configuration de la largeur des colonnes
  const columnWidth = 200;
  const gap = 16; // équivalent à 2*8px
  const totalMinWidth = columnWidth * weekDays.length + gap * (weekDays.length - 1);
  // espace supplémentaire ajouté pour augmenter l'amplitude du scrolling horizontal
  const extraScrollSpace = 300;

  return (
    // conteneur extérieur avec overflow-x et overflow-y activés pour permettre un scroll horizontal et vertical
    <Box sx={{ width: '100vw', overflowX: 'auto', overflowY: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          padding: 2,
          gap: `${gap}px`,
          minWidth: totalMinWidth + extraScrollSpace,
        }}
      >
        {weekDays.map((day) => (
          <Box
            key={day}
            sx={{
              flex: '0 0 auto',
              width: columnWidth,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(245,245,245,0.6)',
              borderRadius: 2,
              overflow: 'hidden', // important pour appliquer le border-radius aux enfants
              height: '100%', // occupe toute la hauteur disponible dans le conteneur parent
            }}
          >
            {/* titre fixe grâce à position sticky avec arrondi en haut */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#f5f5f5',
                padding: 1,
                zIndex: 1,
                borderBottom: '1px solid #ddd',
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                {day}
              </Typography>
            </Box>
            {/* zone scrollable verticalement pour les événements */}
            <Box sx={{ flex: 1, overflowY: 'auto', padding: 1 }}>
              {groupedEvents[day].length === 0 ? (
                <Typography variant="caption" sx={{ textAlign: 'center', marginTop: 2, color: 'grey' }}>
                  no event this day
                </Typography>
              ) : (
                groupedEvents[day].map((event) => {
                  const tag = event.category || 'Default';
                  const color = topicColors[tag] || topicColors['Default'];
                  return (
                    <Paper
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      sx={{
                        marginBottom: 2,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      elevation={3}
                    >
                      {/* bande colorée en haut pour symboliser le tag */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          backgroundColor: color,
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px',
                        }}
                      />
                      <Box sx={{ padding: 1, pt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </Typography>
                        <Box
                          sx={{
                            marginTop: 1,
                            backgroundColor: color,
                            color: 'white',
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                          }}
                        >
                          {tag}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Box>
        ))}
        {/* élément espaceur pour étendre l'amplitude du scroll horizontal */}
        <Box sx={{ flex: '0 0 auto', width: extraScrollSpace }} />
      </Box>
    </Box>
  );
};

export default Kanban;


