import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CourseEvent from './CourseEvent'; // adjust the path as needed
import './CalendarCustom.css';
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

  // returns monday for a given date (if date is sunday, it returns the previous monday)
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    // if sunday (0), subtract 6; otherwise, subtract (day - 1)
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // generate array for a full week (monday to sunday)
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

  // generate time slots from 8:00 to 23:00 in 30-minute increments
  const timeSlots: { hour: number; minute: number }[] = [];
  for (let hour = 8; hour < 23; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }
  timeSlots.push({ hour: 23, minute: 0 }); // add the final slot at 23:00

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

  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => setAnimationDirection(''), 500);
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDayAbbreviation = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // display period from monday to sunday
  const period: string = `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;

  // filter events that occur during the current week
  const eventsThisWeek = events.filter((event) => {
    const eventTime = event.date.getTime();
    const weekStart = currentWeekStartDate.getTime();
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    return eventTime >= weekStart && eventTime < weekEnd;
  });

  // get event duration in number of 30-minute slots
  const getEventDurationSlots = (event: Event): number => {
    const start = event.startHour * 60 + event.startMinute;
    const end = event.endHour * 60 + event.endMinute;
    return (end - start) / 30;
  };

  // calculate index for a given time slot (starting from 8:00)
  const getTimeSlotIndex = (hour: number, minute: number): number => {
    return (hour - 8) * 2 + (minute === 30 ? 1 : 0);
  };

  // expose imperative handles
  useImperativeHandle(ref, () => ({
    addCourse: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => {
      const newEvents = addCourseSlot(selectedSlot, answerCourse);
      setEvents((prevEvents) => [...prevEvents, ...newEvents]);
    },
    deleteCourse: (courseCode: string) => {
      setEvents((prevEvents) => prevEvents.filter((event) => event.category !== courseCode));
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
      setEvents((prevEvents) => prevEvents.filter((event) => event.category !== courseCode));
      const updatedEvents = addCourseSlot(newSlot, course);
      setEvents((prevEvents) => [...prevEvents, ...updatedEvents]);
    },
  }));

  // helper function to add course slot events
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
          startHour,
          startMinute,
          endHour,
          endMinute,
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

  // get the next date for a specific day of week starting from a given date
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

  return (
    <div className="calendar-container flex-grow">
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button onClick={prevWeek} style={{ marginLeft: '10px' }}>{'<'}</button>
        </div>
        <div className="calendar-header-center">
          <span className="calendar-period">{period}</span>
        </div>
        <div className="calendar-header-right">
          <button onClick={nextWeek} style={{ marginRight: '10px' }}>{'>'}</button>
        </div>
      </div>
      <div
        className={`calendar-grid ${animationDirection}`}
        onAnimationEnd={() => setAnimationDirection('')}
      >
        <div className="calendar-grid-header">
          <div className="calendar-time-column"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="calendar-day-header">
              {getDayAbbreviation(date)}
            </div>
          ))}
        </div>
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
              {timeSlots.map((slot) => {
                const timeSlotKey = `${date.toDateString()}-${slot.hour}-${slot.minute}`;
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
                      style={{ height: 30 * durationSlots, position: 'relative' }}
                    >
                      <CourseEvent
                        title={event.title}
                        category={event.category}
                        description={event.description}
                        onClick={() => onEventClick(event)}
                      />
                    </div>
                  );
                } else {
                  // check if the current slot is covered by an event
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