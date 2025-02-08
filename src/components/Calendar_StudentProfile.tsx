import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CourseEvent from './CourseEvent';
import { EventStudentProfile } from '../interfaces/interfaces_eleve';


// interface pour les handles du calendrier (pour d'éventuelles actions futures)
export interface CalendarHandles {
  addCourse: (selectedSlot: any, answerCourse: any) => void;
  deleteCourse: (courseCode: string) => void;
  confirmSlot: (courseCode: string, newSlotIndex: number) => void;
}

interface CalendarProps {
  onEventClick: (event: EventStudentProfile) => void;
  events: EventStudentProfile[];
}

const Calendar = forwardRef<CalendarHandles, CalendarProps>(({ onEventClick, events }, ref) => {
  // état pour les événements
  //const [events, setEvents] = useState<EventStudentProfile[]>([]); // comme on le recoit via les props on a plus besoin de l avoir. 
  // début de la semaine affichée (lundi)
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(getMonday(new Date()));
  // direction de l'animation lors du changement de semaine
  const [animationDirection, setAnimationDirection] = useState<'slide-left' | 'slide-right' | ''>('');

  // paramètres de la grille horaire
  const GRID_START_HOUR = 8; // la grille démarre à 8h
  const GRID_END_HOUR = 23;  // la grille se termine à 23h
  const SLOT_DURATION_MIN = 30; // durée d'un créneau en minutes
  const SLOT_HEIGHT_PX = 30; // hauteur d'un créneau en pixels

  // calcul du nombre total de créneaux dans la journée
  const numberOfSlots = ((GRID_END_HOUR - GRID_START_HOUR) * 2) + 1;
  // hauteur totale d'une colonne de jour
  const dayColumnHeight = numberOfSlots * SLOT_HEIGHT_PX;


  const parseEventDate = (day: string, month: string, year: string, time: string): Date | null => {
    const months: Record<string, number> = {
      "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
      "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };
  
    // Vérification et conversion des valeurs
    const dayNumber = parseInt(day) || 1; // Si `day` est `nan` ou vide, on met `1`
    const yearNumber = parseInt(year) || new Date().getFullYear();
    const monthNumber = months[month] ?? 0;
  
    const [hours, minutes] = time?.split(":").map(Number) || [0, 0]; // Si `time` est `nan`, mettre 00:00
  
    try {
      return new Date(yearNumber, monthNumber, dayNumber, hours, minutes);
    } catch (e) {
      console.error(`Erreur lors du parsing de la date : ${day}-${month}-${year} ${time}`, e);
      return null;
    }
  };
  


  // fonction pour obtenir le lundi de la semaine d'une date donnée
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    console.log('lundi calculé pour la date', d, 'est', date);
    return date;
  }

  // navigation vers la semaine précédente
  const prevWeek = (): void => {
    console.log('navigation vers la semaine précédente');
    setAnimationDirection('slide-right');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      console.log('nouvelle date de début (précédente) :', newDate);
      return newDate;
    });
  };

  // navigation vers la semaine suivante
  const nextWeek = (): void => {
    console.log('navigation vers la semaine suivante');
    setAnimationDirection('slide-left');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      console.log('nouvelle date de début (suivante) :', newDate);
      return newDate;
    });
  };

  // réinitialisation de l'animation après 500 ms
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        console.log('réinitialisation de l’animation');
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
    console.log('jours de la semaine :', days);
    return days;
  };

  const weekDays: Date[] = getWeekDays(currentWeekStartDate);

  // fonction pour calculer le style de positionnement (top et height) d'un événement
  const getEventPositionStyle = (event: EventStudentProfile) => {
    // conversion des heures en minutes depuis minuit
    const startTotalMin = event.start.getHours() * 60 + event.start.getMinutes();
    const endTotalMin = event.end.getHours() * 60 + event.end.getMinutes();
    // calcul de l'index de départ en créneaux depuis GRID_START_HOUR
    const startIndex = (startTotalMin - (GRID_START_HOUR * 60)) / SLOT_DURATION_MIN;
    // calcul de la durée de l'événement en minutes
    const durationMin = endTotalMin - startTotalMin;
    // calcul du nombre de créneaux occupés par l'événement
    const slotCount = durationMin / SLOT_DURATION_MIN;
    // calcul du décalage vertical et de la hauteur en pixels
    const topPx = startIndex * SLOT_HEIGHT_PX;
    const heightPx = slotCount * SLOT_HEIGHT_PX;
    console.log(`événement "${event.title}" : startIndex = ${startIndex}, slotCount = ${slotCount}, top = ${topPx}px, height = ${heightPx}px`);
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
    const inWeek = eventDate >= weekStart && eventDate < weekEnd;
    console.log(`l’événement "${event.title}" est ${inWeek ? '' : 'hors'} de la semaine courante`);
    return inWeek;
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

  return (
    <div className="flex flex-col h-screen box-border">
      {/* en-tête du calendrier avec boutons de navigation */}
      <div className="flex justify-between items-center h-10 bg-gray-100 px-2 border-b border-gray-300">
        <button onClick={prevWeek} className="ml-2">{'<'}</button>
        <span className="text-lg font-medium">
          {weekDays.length > 0 ? `${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}` : ''}
        </span>
        <button onClick={nextWeek} className="mr-2">{'>'}</button>
      </div>

      {/* grille du calendrier */}
      <div
        className={`flex-grow flex flex-col overflow-auto relative bg-white ${animationDirection === 'slide-left' ? 'animate-slide-left' : animationDirection === 'slide-right' ? 'animate-slide-right' : ''}`}
        onAnimationEnd={() => {
          console.log('fin de l’animation');
          setAnimationDirection('');
        }}
      >
        {/* en-tête de la grille (ligne des jours) */}
        <div className="grid bg-gray-600 border-b border-gray-300 sticky top-0 z-10" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div></div>
          {weekDays.map((date, index) => (
            <div key={index} className="text-center py-2 font-bold border-l border-gray-300">
              {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
            </div>
          ))}
        </div>

        {/* corps de la grille */}
        <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          {/* colonne des horaires */}
          <div className="flex flex-col">
            {Array.from({ length: numberOfSlots }).map((_, index) => {
              // calcul de l'heure correspondant à ce créneau
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
              {/* grille de fond pour visualiser les créneaux (grillage) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent ${SLOT_HEIGHT_PX - 1}px, #e5e7eb ${SLOT_HEIGHT_PX - 1}px)`,
                  backgroundSize: `100% ${SLOT_HEIGHT_PX}px`
                }}
              />
              {/* affichage des événements pour le jour courant */}
              {eventsThisWeek.filter((event) => {
                const eventDate = new Date(event.start);
                return (
                  eventDate.getFullYear() === date.getFullYear() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getDate() === date.getDate()
                );
              }).map((event) => (
                <div
                  key={event.id}
                  className="absolute w-full px-1"
                  style={getEventPositionStyle(event)}
                  onClick={() => onEventClick(event)}
                >
                  <CourseEvent title={event.title} category={event.category} description={event.description} onClick={() => onEventClick(event)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* styles d'animation personnalisés */}
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
