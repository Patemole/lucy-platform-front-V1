
// src/components/NewCalendarCustom.tsx

/*

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
  for (let hour = 8; hour <= 23; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }
  timeSlots.push({ hour: 23, minute: 0 }); // Ajouter le dernier créneau à 18h00

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
      {/* En-tête *
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

      {/* Grille du calendrier *
      <div className={`calendar-grid ${animationDirection}`} onAnimationEnd={() => setAnimationDirection('')}>
        {/* En-têtes des jours *
        <div className="calendar-grid-header">
          <div className="calendar-time-column"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="calendar-day-header">
              {getDayAbbreviation(date)}
            </div>
          ))}
        </div>

        {/* Créneaux horaires *
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

  */


import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CourseEvent from './CourseEvent';
import { CourseSlot, AnswerCourse, Event } from '../interfaces/interfaces_eleve';

export interface CalendarHandles {
  addCourse: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => void;
  deleteCourse: (courseCode: string) => void;
  confirmSlot: (courseCode: string, newSlotIndex: number) => void;
}

interface CalendarProps {
  onEventClick: (event: Event) => void;
}

const Calendar = forwardRef<CalendarHandles, CalendarProps>(({ onEventClick }, ref) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(getMonday(new Date()));
  const [animationDirection, setAnimationDirection] = useState<'slide-left' | 'slide-right' | ''>('');

  // add fake events for demonstration
  useEffect(() => {
    const fakeEvents: Event[] = [
      {
        id: 'fake-1',
        title: 'Cours de math - MATH101',
        date: new Date(),
        startHour: 14,
        startMinute: 0,
        endHour: 16,
        endMinute: 0,
        description: 'MATH101',
        category: 'MATH',
        answerCourse: {
          document_id: 'doc-math101',
          title: 'Cours de math - MATH101',
          code: 'MATH101',
          Semester: 'Fall 2024',
          Credit: '3',
          Prerequisites: 'None',
          Description: 'Cours de math avancée',
          Prospectus_link: 'https://example.com/mat101-prospectus',
          Syllabus_link: 'https://example.com/mat101-syllabus',
          Work: '3',
          CourseQuality: '4',
          Difficulty: '2',
          CoursesSlot: [],
        },
      },
      {
        id: 'fake-2',
        title: "Cours d'anglais - ENGL201",
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        startHour: 14,
        startMinute: 30,
        endHour: 15,
        endMinute: 30,
        description: 'ENGL201',
        category: 'ENGL',
        answerCourse: {
          document_id: 'doc-engl201',
          title: "Cours d'anglais - ENGL201",
          code: 'ENGL201',
          Semester: 'Spring 2024',
          Credit: '3',
          Prerequisites: 'Basic English',
          Description: 'Intermediate English course',
          Prospectus_link: 'https://example.com/engl201-prospectus',
          Syllabus_link: 'https://example.com/engl201-syllabus',
          Work: '2',
          CourseQuality: '3',
          Difficulty: '1',
          CoursesSlot: [],
        },
      },
    ];
    setEvents(fakeEvents);
  }, []);

  // function to obtain monday of the week for a given date
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // function to get the next date for a specific day number
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

  // navigate to previous week
  const prevWeek = (): void => {
    setAnimationDirection('slide-right');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  // navigate to next week
  const nextWeek = (): void => {
    setAnimationDirection('slide-left');
    setCurrentWeekStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // reset animation after 500ms
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  // get the dates for the current week (monday to sunday)
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

  // generate time slots in 30-minute intervals from 8:00 to 23:00
  const timeSlots: { hour: number; minute: number }[] = [];
  for (let hour = 8; hour < 23; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }
  timeSlots.push({ hour: 23, minute: 0 });

  // function to format a date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // function to get the day abbreviation
  const getDayAbbreviation = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // update period to display monday to sunday
  const period: string = `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;

  // filter events for the current week
  const eventsThisWeek = events.filter((event) => {
    const eventDate = new Date(event.date).getTime();
    const weekStart = currentWeekStartDate.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // get the number of 30-minute slots an event spans
  const getEventDurationSlots = (event: Event): number => {
    const start = event.startHour * 60 + event.startMinute;
    const end = event.endHour * 60 + event.endMinute;
    return (end - start) / 30;
  };

  // get the index of a time slot
  const getTimeSlotIndex = (hour: number, minute: number): number => {
    return (hour - 8) * 2 + (minute === 30 ? 1 : 0);
  };

  // expose functions via ref
  useImperativeHandle(ref, () => ({
    addCourse: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
      const newEvents = addCourseSlot(selectedSlot, answerCourse);
      setEvents((prevEvents) => [...prevEvents, ...newEvents]);
    },
    deleteCourse: (courseCode: string) => {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.category !== courseCode)
      );
    },
    confirmSlot: (courseCode: string, newSlotIndex: number) => {
      const course = events.find((event) => event.category === courseCode)?.answerCourse;
      if (!course) {
        console.error(`course with code ${courseCode} not found.`);
        return;
      }
      const newSlot = course.CoursesSlot[newSlotIndex];
      if (!newSlot) {
        console.error('invalid slot index.');
        return;
      }
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.category !== courseCode)
      );
      const updatedEvents = addCourseSlot(newSlot, course);
      setEvents((prevEvents) => [...prevEvents, ...updatedEvents]);
    },
  }));

  // function to add course events based on a course slot
  const addCourseSlot = (courseSlot: CourseSlot, answerCourse: AnswerCourse): Event[] => {
    const SEMESTER_END = new Date(2024, 11, 31);
    SEMESTER_END.setHours(0, 0, 0, 0);
    const dayMap: { [key: string]: number } = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const [startHour, startMinute] = courseSlot.StartTime.split(':').map(Number);
    const [endHour, endMinute] = courseSlot.EndTime.split(':').map(Number);
    let newEvents: Event[] = [];
    const baseTitle = answerCourse.title.split(' - ')[0];
    const eventTitle = `${baseTitle} - ${courseSlot.CourseID}`;
    for (const day of courseSlot.Days) {
      const dayNumber = dayMap[day];
      let currentDate = getNextDateForDay(dayNumber, getMonday(new Date()));
      while (currentDate <= SEMESTER_END) {
        const event: Event = {
          id: `${answerCourse.code}-${currentDate.getTime()}-${courseSlot.CourseID}`,
          title: eventTitle,
          date: new Date(currentDate),
          startHour: startHour,
          startMinute: startMinute,
          endHour: endHour,
          endMinute: endMinute,
          category: answerCourse.code,
          description: answerCourse.code,
          answerCourse: { ...answerCourse },
        };
        newEvents.push(event);
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
    return newEvents;
  };

  return (
    <div className="flex flex-col h-screen box-border">

      
      {/* header */}
      {/*
      <div className="flex justify-between items-center h-10 bg-gray-100 px-2 border-b border-gray-300">
        <div className="flex items-center">
          <button onClick={prevWeek} className="ml-2">{'<'}</button>
        </div>
        <div className="flex justify-center items-center">
          <span className="text-lg font-medium">{period}</span>
        </div>
        <div className="flex items-center">
          <button onClick={nextWeek} className="mr-2">{'>'}</button>
        </div>
      </div>
      */}

      {/* calendar grid */}
      <div
        className={`flex-grow flex flex-col overflow-auto bg-white ${
          animationDirection === 'slide-left'
            ? 'animate-slide-left'
            : animationDirection === 'slide-right'
            ? 'animate-slide-right'
            : ''
        }`}
        onAnimationEnd={() => setAnimationDirection('')}
      >
        {/* grid header with sticky days row */}
        <div
          className="grid bg-gray-600 border-b border-gray-300 sticky top-0 z-10"
          style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
        >
          <div className="flex flex-col"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="text-center py-2 font-bold border-l border-gray-300">
              {getDayAbbreviation(date)}
            </div>
          ))}
        </div>

        {/* grid body */}
        <div className="grid flex-grow" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="flex flex-col">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="h-[30px] leading-[30px] text-right pr-2 border-t border-gray-200 text-xs text-gray-600"
              >
                {slot.minute === 0 ? `${slot.hour}:00` : ''}
              </div>
            ))}
          </div>
          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className="flex flex-col border-l border-gray-200">
              {timeSlots.map((slot) => {
                const timeSlotKey = `${date.toDateString()}-${slot.hour}-${slot.minute}`;
                const event = eventsThisWeek.find(
                  (event) =>
                    new Date(event.date).getFullYear() === date.getFullYear() &&
                    new Date(event.date).getMonth() === date.getMonth() &&
                    new Date(event.date).getDate() === date.getDate() &&
                    event.startHour === slot.hour &&
                    event.startMinute === slot.minute
                );
                if (event) {
                  const durationSlots = getEventDurationSlots(event);
                  return (
                    <div
                      key={timeSlotKey}
                      className="border-t border-gray-200 relative"
                      style={{ height: 30 * durationSlots }}
                    >
                      <CourseEvent
                        title={event.title}
                        description={event.description}
                        category={event.category}
                        onClick={() => onEventClick(event)}
                      />
                    </div>
                  );
                } else {
                  const isCovered = eventsThisWeek.some((event) => {
                    if (
                      new Date(event.date).getFullYear() === date.getFullYear() &&
                      new Date(event.date).getMonth() === date.getMonth() &&
                      new Date(event.date).getDate() === date.getDate()
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
                    return null;
                  } else {
                    return (
                      <div
                        key={timeSlotKey}
                        className="border-t border-gray-200 relative"
                      ></div>
                    );
                  }
                }
              })}
            </div>
          ))}
        </div>
      </div>

      {/* custom animations */}
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







