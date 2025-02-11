import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CourseEvent from './CourseEvent';
import { EventStudentProfile } from '../interfaces/interfaces_eleve';
import { format, isValid } from 'date-fns';
import { Box, Typography, Paper } from '@mui/material';

export interface CalendarHandles {
  addCourse: (selectedSlot: any, answerCourse: any) => void;
  deleteCourse: (courseCode: string) => void;
  confirmSlot: (courseCode: string, newSlotIndex: number) => void;
}

interface CalendarProps {
  onEventClick: (event: EventStudentProfile) => void;
  events: EventStudentProfile[];
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

const Calendar = forwardRef<CalendarHandles, CalendarProps>(({ onEventClick, events }, ref) => {
  // fonction pour obtenir le lundi de la semaine d'une date donnée
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(getMonday(new Date()));
  const [animationDirection, setAnimationDirection] = useState<'slide-left' | 'slide-right' | ''>('');

  // paramètres de la grille horaire
  const GRID_START_HOUR = 8; // la grille démarre à 8h
  const GRID_END_HOUR = 23;  // la grille se termine à 23h
  const SLOT_DURATION_MIN = 30; // durée d'un créneau en minutes
  const SLOT_HEIGHT_PX = 30; // hauteur d'un créneau en pixels

  // nombre total de créneaux dans la journée
  const numberOfSlots = ((GRID_END_HOUR - GRID_START_HOUR) * 2) + 1;
  // hauteur totale d'une colonne de jour
  const dayColumnHeight = numberOfSlots * SLOT_HEIGHT_PX;

  // navigation vers la semaine précédente
  const prevWeek = (): void => {
    setAnimationDirection('slide-right');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // navigation vers la semaine suivante
  const nextWeek = (): void => {
    setAnimationDirection('slide-left');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // réinitialisation de l'animation après 500 ms
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  // calcul des jours de la semaine à partir du lundi
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays: Date[] = getWeekDays(currentWeekStartDate);

  // fonction pour calculer le style de positionnement d'un événement
  const getEventPositionStyle = (event: EventStudentProfile) => {
    const startTotalMin = event.start.getHours() * 60 + event.start.getMinutes();
    const endTotalMin = event.end.getHours() * 60 + event.end.getMinutes();
    const startIndex = (startTotalMin - (GRID_START_HOUR * 60)) / SLOT_DURATION_MIN;
    const durationMin = endTotalMin - startTotalMin;
    const slotCount = durationMin / SLOT_DURATION_MIN;
    const topPx = startIndex * SLOT_HEIGHT_PX;
    const heightPx = slotCount * SLOT_HEIGHT_PX;
    return {
      top: `${topPx}px`,
      height: `${heightPx}px`
    };
  };

  // filtrage des événements pour la semaine courante
  const eventsThisWeek = events.filter((event) => {
    const eventDate = new Date(event.start).getTime();
    const weekStart = currentWeekStartDate.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // exposition des fonctions via useImperativeHandle
  useImperativeHandle(ref, () => ({
    addCourse: (selectedSlot, answerCourse) => {
      console.log('ajout d’un cours', selectedSlot, answerCourse);
    },
    deleteCourse: (courseCode: string) => {
      console.log('suppression du cours', courseCode);
    },
    confirmSlot: (courseCode: string, newSlotIndex: number) => {
      console.log('confirmation du créneau pour le cours', courseCode, newSlotIndex);
    }
  }));

  // configuration pour le défilement horizontal
  const columnWidth = 200;
  const gap = 16; // 16px = 2*8px
  const totalMinWidth = columnWidth * weekDays.length + gap * (weekDays.length - 1);
  const extraScrollSpace = 300;

  return (
    <div
      className="flex flex-col h-screen box-border"
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd'
      }}
    >
      {/* en-tête de la grille des jours */}
      <div
        className="grid border-b border-gray-300 sticky top-0 z-10"
        style={{
          gridTemplateColumns: '60px repeat(7, 1fr)',
          backgroundColor: '#f9f9f9'
        }}
      >
        <div></div>
        {weekDays.map((date, index) => (
          <div key={index} className="text-center py-2 font-bold border-l border-gray-300">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
        ))}
      </div>

      {/* corps du calendrier avec défilement vertical */}
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          {/* colonne des horaires */}
          <div className="flex flex-col">
            {Array.from({ length: numberOfSlots }).map((_, index) => {
              const totalMinutes = GRID_START_HOUR * 60 + index * SLOT_DURATION_MIN;
              const hour = Math.floor(totalMinutes / 60);
              const minute = totalMinutes % 60;
              return (
                <div
                  key={index}
                  className="h-[30px] leading-[30px] text-right pr-2 border-t border-gray-200 text-xs text-gray-600"
                >
                  {minute === 0 ? `${hour}:00` : ''}
                </div>
              );
            })}
          </div>

          {/* colonnes pour chaque jour */}
          {weekDays.map((date, dayIndex) => (
            <div
              key={dayIndex}
              className="relative border-l border-gray-200"
              style={{ height: `${dayColumnHeight}px` }}
            >
              {/* grille de fond pour les créneaux */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent ${SLOT_HEIGHT_PX - 1}px, #e5e7eb ${SLOT_HEIGHT_PX - 1}px)`,
                  backgroundSize: `100% ${SLOT_HEIGHT_PX}px`
                }}
              />
              {/* affichage des événements pour ce jour */}
              {eventsThisWeek.filter((event) => {
                const eventDate = new Date(event.start);
                return (
                  eventDate.getFullYear() === date.getFullYear() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getDate() === date.getDate()
                );
              }).map((event) => {
                if (!isValid(event.start) || !isValid(event.end)) {
                  console.error(`Invalid time value for event "${event.title}"`, event);
                  return null;
                }
                const tag = event.category || 'Default';
                const color = topicColors[tag] || topicColors['Default'];
                return (
                  <div
                    key={event.id}
                    className="absolute w-full px-1"
                    style={getEventPositionStyle(event)}
                    onClick={() => onEventClick(event)}
                  >
                    <Paper
                      onClick={() => onEventClick(event)}
                      sx={{
                        marginBottom: 2,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      elevation={3}
                    >
                      {/* bande colorée en haut pour symboliser la category */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          backgroundColor: color,
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px'
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
                            fontSize: '0.75rem'
                          }}
                        >
                          {tag}
                        </Box>
                      </Box>
                    </Paper>
                  </div>
                );
              })}
            </div>
          ))}

          {/* espaceur pour étendre l'amplitude du scroll horizontal */}
          <Box sx={{ flex: '0 0 auto', width: extraScrollSpace }} />
        </div>
      </div>

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.5s ease-out;
        }
        .animate-slide-right {
          animation: slide-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
});

export default Calendar;

