// Calendar.tsx



/* CODE QUI MARCHE AVEC JUSTE LE BUG DE LA POP-UP ET DES INFORMATIONS À FAIRE PASSER
import React, { useState, useEffect } from 'react';
import CourseEvent from './CourseEvent'; // Ensure the path is correct
import './CalendarCustom.css';
import { CourseSlot } from '../interfaces/interfaces_eleve';
import EventPopup from './PopupCourseEvent'; // Import the new EventPopup component

interface Event {
  id: string; // Use string for unique IDs
  title: string;
  date: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  code: string; // Now required
  type: string; // Now required
}

interface CalendarProps {
  newCourseSlot?: { slot: CourseSlot; title: string; code: string } | null;
}


const Calendar: React.FC<CalendarProps> = ({ newCourseSlot }) => {

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);


    const openPopup = (event: Event) => {
        setSelectedEvent(event);
        setPopupOpen(true);
      };
    
      const closePopup = () => {
        setPopupOpen(false);
        setSelectedEvent(null);
      };


  // Function to get the Monday of the week for a given date
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // State for the start date of the current week
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(
    getMonday(new Date())
  );
  const [animationDirection, setAnimationDirection] = useState<
    'slide-left' | 'slide-right' | ''
  >('');

  // Initial fake events
  const initialEvents: Event[] = [
    {
      id: 'event1',
      title: 'CIS 1210 - 101',
      date: new Date(
        currentWeekStartDate.getFullYear(),
        currentWeekStartDate.getMonth(),
        currentWeekStartDate.getDate() + 1
      ), // Tuesday
      startHour: 15,
      startMinute: 0,
      endHour: 16,
      endMinute: 30,
      code: 'CIS',
      type: 'CIS',
    },
    {
      id: 'event2',
      title: 'PHYS 201 - 102',
      date: new Date(
        currentWeekStartDate.getFullYear(),
        currentWeekStartDate.getMonth(),
        currentWeekStartDate.getDate() + 2
      ), // Wednesday
      startHour: 11,
      startMinute: 0,
      endHour: 12,
      endMinute: 0,
      code: 'PHYS',
      type: 'PHYS',
    },
    {
      id: 'event3',
      title: 'LING 301 - 103',
      date: new Date(
        currentWeekStartDate.getFullYear(),
        currentWeekStartDate.getMonth(),
        currentWeekStartDate.getDate() + 3
      ), // Thursday
      startHour: 14,
      startMinute: 0,
      endHour: 15,
      endMinute: 30,
      code: 'LING',
      type: 'LING',
    },
  ];

  // State for events, initialized with fake events
  const [events, setEvents] = useState<Event[]>(initialEvents);

  // Function to add a new CourseSlot
  const addCourseSlot = (
    courseSlot: CourseSlot,
    title: string,
    code: string
  ) => {
    const SEMESTER_END = new Date(2024, 11, 31); // December 31, 2024
    SEMESTER_END.setHours(0, 0, 0, 0); // Ensure time is set to midnight

    const dayMap: { [key: string]: number } = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    // Parse the start and end times
    const [startHour, startMinute] = courseSlot.StartTime.split(':').map(Number);
    const [endHour, endMinute] = courseSlot.EndTime.split(':').map(Number);

    let newEvents: Event[] = [];

    // Extract the base title (before the "-")
    const baseTitle = title.split(' - ')[0];
    const eventTitle = ` ${baseTitle} - ${courseSlot.CourseID}`;

    for (const day of courseSlot.Days) {
      const dayNumber = dayMap[day];

      // Get the first occurrence of the day from today
      let currentDate = getNextDateForDay(dayNumber, new Date());

      while (currentDate <= SEMESTER_END) {
        // Create the event
        const event: Event = {
          id: `${title}-${currentDate.getTime()}-${courseSlot.CourseID}`, // Unique ID
          title: eventTitle,
          date: new Date(currentDate),
          startHour: startHour,
          startMinute: startMinute,
          endHour: endHour,
          endMinute: endMinute,
          code: code,
          type: code, // Use code as type to determine color
        };

        newEvents.push(event);

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    // Update the events state once
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
  };

  // Update events when newCourseSlot prop changes
  useEffect(() => {
    if (newCourseSlot) {
      addCourseSlot(
        newCourseSlot.slot,
        newCourseSlot.title,
        newCourseSlot.code
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCourseSlot]);

  // Function to get the next date for a specific day of the week
  const getNextDateForDay = (dayNumber: number, fromDate: Date): Date => {
    const resultDate = new Date(fromDate);
    const currentDay = resultDate.getDay();
    let daysAhead = dayNumber - currentDay;
    if (daysAhead < 0) {
      daysAhead += 7;
    }
    resultDate.setDate(resultDate.getDate() + daysAhead);
    resultDate.setHours(0, 0, 0, 0);
    return resultDate;
  };

  // Function to navigate to the previous week
  const prevWeek = (): void => {
    setAnimationDirection('slide-right');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // Function to navigate to the next week
  const nextWeek = (): void => {
    setAnimationDirection('slide-left');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Reset animation direction after animation ends
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection('');
      }, 500); // Duration of the animation in milliseconds
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  // Get dates from Monday to Friday of the current week
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      // Monday to Friday
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays: Date[] = getWeekDays(currentWeekStartDate);

  // Generate time slots in 30-minute increments from 9:00 AM to 6:00 PM
  const timeSlots: { hour: number; minute: number }[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }
  timeSlots.push({ hour: 18, minute: 0 }); // Add the last slot at 6:00 PM

  // Function to format the date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to get the day abbreviation
  const getDayAbbreviation = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get the period to display
  const period: string = `${formatDate(weekDays[0])} - ${formatDate(weekDays[4])}`;

  // Filter events for the current week
  const eventsThisWeek = events.filter((event) => {
    const eventDate = event.date.getTime();
    const weekStart = currentWeekStartDate.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000; // Add 7 days
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // Function to get the duration of the event in number of slots (30-minute increments)
  const getEventDurationSlots = (event: Event): number => {
    const start = event.startHour * 60 + event.startMinute;
    const end = event.endHour * 60 + event.endMinute;
    return (end - start) / 30;
  };

  // Function to get the index of the time slot
  const getTimeSlotIndex = (hour: number, minute: number): number => {
    return (hour - 9) * 2 + (minute === 30 ? 1 : 0);
  };

  return (
    <div className="calendar-container">
      {/* Header *
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button onClick={prevWeek} style={{ marginLeft: '10px' }}>
            {'<'}
          </button>
        </div>
        <div className="calendar-header-center">
          <span className="calendar-period">{period}</span>
        </div>
        <div className="calendar-header-right">
          <button onClick={nextWeek} style={{ marginRight: '10px' }}>
            {'>'}
          </button>
        </div>
      </div>
  
      {/* Calendar Grid *
      <div
        className={`calendar-grid ${animationDirection}`}
        onAnimationEnd={() => setAnimationDirection('')}
      >
        {/* Day Headers *
        <div className="calendar-grid-header">
          <div className="calendar-time-column"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="calendar-day-header">
              {getDayAbbreviation(date)}
            </div>
          ))}
        </div>
  
        {/* Time Slots *
        <div className="calendar-grid-body">
          <div className="calendar-time-column">
            {timeSlots.map((slot, index) => (
              <div key={index} className="calendar-time-slot">
                {slot.minute === 0 ? `${slot.hour}:00` : ''}
              </div>
            ))}
          </div>
  
          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className="calendar-day-column">
              {timeSlots.map((slot, slotIndex) => {
                const timeSlotKey = `${date.toDateString()}-${slot.hour}-${slot.minute}`;
                // Find the event that starts at this time slot
                const event = eventsThisWeek.find(
                  (event) =>
                    event.date.getFullYear() === date.getFullYear() &&
                    event.date.getMonth() === date.getMonth() &&
                    event.date.getDate() === date.getDate() &&
                    event.startHour === slot.hour &&
                    event.startMinute === slot.minute
                );
                if (event) {
                  const durationSlots = getEventDurationSlots(event);
                  return (
                    <div
                      key={timeSlotKey}
                      className="calendar-cell"
                      style={{
                        height: 30 * durationSlots,
                        position: 'relative',
                      }}
                    >
                      <CourseEvent
                        title={event.title}
                        code={event.code}
                        type={event.type}
                        onClick={() => openPopup(event)} // Handle event click to open the popup
                      />
                    </div>
                  );
                } else {
                  // Check if this time slot is covered by an event
                  const isCovered = eventsThisWeek.some((event) => {
                    if (
                      event.date.getFullYear() === date.getFullYear() &&
                      event.date.getMonth() === date.getMonth() &&
                      event.date.getDate() === date.getDate()
                    ) {
                      const eventStartIndex = getTimeSlotIndex(
                        event.startHour,
                        event.startMinute
                      );
                      const eventDurationSlots = getEventDurationSlots(event);
                      const eventEndIndex = eventStartIndex + eventDurationSlots;
                      const currentIndex = slotIndex;
                      return (
                        currentIndex > eventStartIndex &&
                        currentIndex < eventEndIndex
                      );
                    }
                    return false;
                  });
                  if (isCovered) {
                    // Do not render this slot as it's covered by an event
                    return null;
                  } else {
                    return <div key={timeSlotKey} className="calendar-cell"></div>;
                  }
                }
              })}
            </div>
          ))}
        </div>
      </div>
  
      {/* Popup for event details *
      {selectedEvent && (
        <EventPopup
            course={selectedEvent}  // Pass the selected event (course data)
            isOpen={popupOpen}  // Use `isOpen` instead of `open`
            onClose={closePopup}  // Close the modal
            onAddCourse={handleAddCourse}  // Pass the function to add course
            onDeleteCourse={handleDeleteCourse}  // Pass the function to delete the course
            currentSlotIndex={currentSlotIndex}  // Pass the current slot index
        />
      )}
    </div>
  );
  
}
export default Calendar;
*/
// src/components/NewCalendarCustom.tsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CourseEvent from './CourseEvent'; // Assurez-vous que le chemin est correct
import './CalendarCustom.css';
import { CourseSlot, AnswerCourse, Event } from '../interfaces/interfaces_eleve';

export interface CalendarHandles {
  addCourse: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => void;
  deleteCourse: (courseCode: string) => void;
  confirmSlot: (courseCode: string, newSlotIndex: number) => void;
}

interface CalendarProps {
  onEventClick: (event: Event) => void; // Callback quand un événement est cliqué
}

const Calendar = forwardRef<CalendarHandles, CalendarProps>(({ onEventClick }, ref) => {
  const [events, setEvents] = useState<Event[]>([]); // Liste des événements du calendrier
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(getMonday(new Date()));
  const [animationDirection, setAnimationDirection] = useState<'slide-left' | 'slide-right' | ''>('');

  // Fonction pour obtenir le lundi de la semaine d'une date donnée
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Fonction pour obtenir la prochaine date correspondant à un jour spécifique
  const getNextDateForDay = (dayNumber: number, fromDate: Date): Date => {
    const resultDate = new Date(fromDate);
    const currentDay = resultDate.getDay();
    let daysAhead = dayNumber - currentDay;
    if (daysAhead < 0) {
      daysAhead += 7;
    }
    resultDate.setDate(resultDate.getDate() + daysAhead);
    resultDate.setHours(0, 0, 0, 0);
    return resultDate;
  };

  // Fonction pour naviguer vers la semaine précédente
  const prevWeek = (): void => {
    setAnimationDirection('slide-right');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // Fonction pour naviguer vers la semaine suivante
  const nextWeek = (): void => {
    setAnimationDirection('slide-left');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Réinitialiser la direction de l'animation après la fin de l'animation
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection('');
      }, 500); // Durée de l'animation en millisecondes
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  // Obtenir les dates du lundi au vendredi de la semaine actuelle
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      // Du lundi au vendredi
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays: Date[] = getWeekDays(currentWeekStartDate);

  // Générer les créneaux horaires par tranches de 30 minutes de 9h00 à 18h00
  const timeSlots: { hour: number; minute: number }[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }
  timeSlots.push({ hour: 18, minute: 0 }); // Ajouter le dernier créneau à 18h00

  // Fonction pour formater la date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Fonction pour obtenir l'abréviation du jour
  const getDayAbbreviation = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Obtenir la période à afficher
  const period: string = `${formatDate(weekDays[0])} - ${formatDate(weekDays[4])}`;

  // Filtrer les événements pour la semaine actuelle
  const eventsThisWeek = events.filter((event) => {
    const eventDate = event.date.getTime();
    const weekStart = currentWeekStartDate.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000; // Ajouter 7 jours
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // Fonction pour obtenir la durée d'un événement en nombre de créneaux (30 minutes chacun)
  const getEventDurationSlots = (event: Event): number => {
    const start = event.startHour * 60 + event.startMinute;
    const end = event.endHour * 60 + event.endMinute;
    return (end - start) / 30;
  };

  // Fonction pour obtenir l'index d'un créneau horaire
  const getTimeSlotIndex = (hour: number, minute: number): number => {
    return (hour - 9) * 2 + (minute === 30 ? 1 : 0);
  };

  // Fonctions exposées via ref
  useImperativeHandle(ref, () => ({
    addCourse: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
      const newEvents = addCourseSlot(selectedSlot, answerCourse);
      setEvents((prevEvents) => [...prevEvents, ...newEvents]);
    },
    deleteCourse: (courseCode: string) => {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.code !== courseCode)
      );
    },
    confirmSlot: (courseCode: string, newSlotIndex: number) => {
      const course = events.find((event) => event.code === courseCode)?.answerCourse;
      if (!course) {
        console.error(`Course with code ${courseCode} not found.`);
        return;
      }

      const newSlot = course.CoursesSlot[newSlotIndex];
      if (!newSlot) {
        console.error("Invalid slot index.");
        return;
      }

      // Remove old events
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.code !== courseCode)
      );

      // Add new events with the new slot
      const updatedEvents = addCourseSlot(newSlot, course);
      setEvents((prevEvents) => [...prevEvents, ...updatedEvents]);
    },
  }));

  // Fonction pour ajouter des événements basés sur un créneau de cours
  const addCourseSlot = (
    courseSlot: CourseSlot,
    answerCourse: AnswerCourse
  ): Event[] => {
    const SEMESTER_END = new Date(2024, 11, 31); // 31 décembre 2024
    SEMESTER_END.setHours(0, 0, 0, 0); // Heure à minuit

    const dayMap: { [key: string]: number } = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    // Parse des heures de début et de fin
    const [startHour, startMinute] = courseSlot.StartTime.split(':').map(Number);
    const [endHour, endMinute] = courseSlot.EndTime.split(':').map(Number);

    let newEvents: Event[] = [];

    // Extraction du titre de base (avant le "-")
    const baseTitle = answerCourse.title.split(' - ')[0];
    const eventTitle = `${baseTitle} - ${courseSlot.CourseID}`;

    for (const day of courseSlot.Days) {
      const dayNumber = dayMap[day];

      // Obtenir la première occurrence du jour à partir de la semaine actuelle
      let currentDate = getNextDateForDay(dayNumber, getMonday(new Date()));

      while (currentDate <= SEMESTER_END) {
        // Création de l'événement avec tous les détails du cours
        const event: Event = {
          id: `${answerCourse.code}-${currentDate.getTime()}-${courseSlot.CourseID}`, // Identifiant unique utilisant le code du cours et CourseID
          title: eventTitle,
          date: new Date(currentDate), // Date de l'occurrence du cours
          startHour: startHour,
          startMinute: startMinute,
          endHour: endHour,
          endMinute: endMinute,
          code: answerCourse.code, // Code du cours
          type: answerCourse.code, // Type de cours (pour la couleur/affichage)
          answerCourse: { ...answerCourse }, // Inclusion complète de l'objet AnswerCourse
        };

        newEvents.push(event);

        // Passer à la semaine suivante
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    return newEvents;
  };

  return (
    <div className={`calendar-container ${animationDirection}`}>
      {/* En-tête */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button onClick={prevWeek} style={{ marginLeft: '10px' }}>
            {'<'}
          </button>
        </div>
        <div className="calendar-header-center">
          <span className="calendar-period">{period}</span>
        </div>
        <div className="calendar-header-right">
          <button onClick={nextWeek} style={{ marginRight: '10px' }}>
            {'>'}
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className={`calendar-grid ${animationDirection}`} onAnimationEnd={() => setAnimationDirection('')}>
        {/* En-têtes des jours */}
        <div className="calendar-grid-header">
          <div className="calendar-time-column"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="calendar-day-header">
              {getDayAbbreviation(date)}
            </div>
          ))}
        </div>

        {/* Créneaux horaires */}
        <div className="calendar-grid-body">
          <div className="calendar-time-column">
            {timeSlots.map((slot, index) => (
              <div key={index} className="calendar-time-slot">
                {slot.minute === 0 ? `${slot.hour}:00` : ''}
              </div>
            ))}
          </div>

          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className="calendar-day-column">
              {timeSlots.map((slot, slotIndex) => {
                const timeSlotKey = `${date.toDateString()}-${slot.hour}-${slot.minute}`;
                // Trouver l'événement qui commence à ce créneau horaire
                const event = eventsThisWeek.find(
                  (event) =>
                    event.date.getFullYear() === date.getFullYear() &&
                    event.date.getMonth() === date.getMonth() &&
                    event.date.getDate() === date.getDate() &&
                    event.startHour === slot.hour &&
                    event.startMinute === slot.minute
                );
                if (event) {
                  const durationSlots = getEventDurationSlots(event);
                  return (
                    <div
                      key={timeSlotKey}
                      className="calendar-cell"
                      style={{
                        height: 30 * durationSlots, // Hauteur basée sur la durée
                        position: 'relative',
                      }}
                    >
                      <CourseEvent
                        title={event.title}
                        code={event.code}
                        type={event.type}
                        onClick={() => onEventClick(event)} // Appeler le callback passé via les props
                      />
                    </div>
                  );
                } else {
                  // Vérifier si ce créneau est couvert par un événement
                  const isCovered = eventsThisWeek.some((event) => {
                    if (
                      event.date.getFullYear() === date.getFullYear() &&
                      event.date.getMonth() === date.getMonth() &&
                      event.date.getDate() === date.getDate()
                    ) {
                      const eventStartIndex = getTimeSlotIndex(event.startHour, event.startMinute);
                      const eventDurationSlots = getEventDurationSlots(event);
                      const eventEndIndex = eventStartIndex + eventDurationSlots;
                      const currentIndex = getTimeSlotIndex(slot.hour, slot.minute);
                      return currentIndex > eventStartIndex && currentIndex < eventEndIndex;
                    }
                    return false;
                  });
                  if (isCovered) {
                    // Ne pas afficher ce créneau car il est couvert par un événement
                    return null;
                  } else {
                    return <div key={timeSlotKey} className="calendar-cell"></div>;
                  }
                }
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Calendar;

  







