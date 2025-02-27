// Kanban.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format} from 'date-fns';
import { EventStudentProfile } from '../../interfaces/interfaces_eleve';

interface KanbanProps {
  events: EventStudentProfile[];
  onEventClick: (event: EventStudentProfile) => void;
}

const topicColors: { [key: string]: string } = {
  'Financial Aids': '#27ae60',
  athletics: '#2980b9', //
  academic: '#e67e22',
  'campus life': '#f39c12',
  'art & culture': '#8e44ad',
  esports: '#27ae60',
  'campus ministry': '#d32f2f',
  'holidays': '#7f8c8d',
};

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Kanban: React.FC<KanbanProps> = ({ events, onEventClick }) => {
  // initialisation des événements groupés pour chaque jour de la semaine
  const groupedEvents: { [day: string]: EventStudentProfile[] } = {};
  weekDays.forEach((day) => {
    groupedEvents[day] = [];
  });

  
  // regroupement des événements par jour (basé sur la date de début)
  // Regroupement des événements par jour (basé sur la date de début)
  /*
events.forEach((event) => {
  const eventDate = event.start instanceof Date && !isNaN(event.start.getTime()) ? event.start : null;
  
  if (!eventDate) {
      console.warn(`Skipping event ${event.id} due to invalid or missing start date`, event);
      return;
  }

  const dayName = format(eventDate, 'EEEE');
  if (groupedEvents[dayName]) {
      groupedEvents[dayName].push(event);
  }
});
*/

events.forEach((event) => {
  let dayName: string | null = null;

  // 🔹 Si `start` est une date valide, on utilise son jour de la semaine
  if (event.start instanceof Date && !isNaN(event.start.getTime())) {
    dayName = format(event.start, 'EEEE');
  }
  // 🔹 Sinon, si `event.day` existe et est un nombre valide, on le convertit en nom du jour
  else if (event.day) {
    const dayNumber = parseInt(event.day);
    if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
      const tempDate = new Date();
      tempDate.setDate(dayNumber);
      dayName = format(tempDate, 'EEEE');
    }
  }

  if (dayName && groupedEvents[dayName]) {
    groupedEvents[dayName].push(event);
  }
});


console.log("Grouped Events:", groupedEvents);


// Tri des événements de chaque jour par heure de début
weekDays.forEach((day) => {
  groupedEvents[day].sort((a, b) => {
      const timeA = a.start instanceof Date && !isNaN(a.start.getTime()) ? a.start.getTime() : Number.MAX_VALUE;
      const timeB = b.start instanceof Date && !isNaN(b.start.getTime()) ? b.start.getTime() : Number.MAX_VALUE;
      return timeA - timeB;
  });
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
            {/* Titre fixe grâce à position sticky avec arrondi en haut */}
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
            {/* Zone scrollable verticalement pour les événements */}
            <Box sx={{ flex: 1, overflowY: 'auto', padding: 1 }}>
              {groupedEvents[day].length === 0 ? (
                <Typography variant="caption" sx={{ textAlign: 'center', marginTop: 2, color: 'grey' }}>
                  no event this day
                </Typography>
              ) : (
                groupedEvents[day].map((event) => {
                  // le tag affiché provient de sub_category et la couleur est déterminée par category
                  const tag = event.sub_category || 'Default';
                  const color = topicColors[event.category || 'Default'] || topicColors['Default'];
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
                      {/* Bande colorée en haut pour symboliser la category */}
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
                          {event.start || event.end ? (
                            <>
                              {event.start ? format(event.start, 'HH:mm') : 'Unknown time'} - 
                              {event.end ? format(event.end, 'HH:mm') : 'Unknown time'}
                            </>
                          ) : event.day ? (
                            `Day ${event.day} - Unknown slot`
                          ) : (
                            'Unknown slot'
                          )}
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
        {/* Élément espaceur pour étendre l'amplitude du scroll horizontal */}
        <Box sx={{ flex: '0 0 auto', width: extraScrollSpace }} />
      </Box>
    </Box>
  );
};

export default Kanban;
