import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CustomCalendar.css'; // Make sure this file exists

const events = [
  { title: 'CIS 4210 320', start: '2024-09-10T10:00:00', end: '2024-09-10T11:00:00', backgroundColor: '#ADD8E6', customColor: '#4682B4' },
  { title: 'LING 0500 311', start: '2024-09-12T11:00:00', end: '2024-09-12T12:00:00', backgroundColor: '#FFFACD', customColor: '#FFD700' },
  { title: 'CIS 5300 401', start: '2024-09-11T13:00:00', end: '2024-09-11T14:00:00', backgroundColor: '#E6E6FA', customColor: '#9370DB' },
  { title: 'PHYS 3362 931', start: '2024-09-11T16:00:00', end: '2024-09-11T17:00:00', backgroundColor: '#D3D3D3', customColor: '#4682B4' },
];

const MyCalendar = () => {
  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      events={events}
      hiddenDays={[0, 6]} // Hide Sunday (0) and Saturday (6)
      headerToolbar={false} // Hide the header navigation
      allDaySlot={false} // Remove the "all-day" slot
      slotMinTime="09:00:00" // Display from 9 AM
      slotMaxTime="18:00:00" // End display at 6 PM
      slotDuration="01:00:00" // Each slot represents 1 hour
      editable={true} // Allow dragging and resizing
      height="auto" // Auto adjust height to fit the content
      dayHeaderFormat={{ weekday: 'short' }} // Show "Mon", "Tue", etc.
      slotLabelFormat={{
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: true,
        meridiem: 'short',
      }} // Customize hour display to show only the main hour label
      eventContent={(eventInfo) => (
        <div className="custom-event" style={{ backgroundColor: eventInfo.event.extendedProps.backgroundColor }}>
          <div className="event-top-bar" style={{ backgroundColor: eventInfo.event.extendedProps.customColor }}></div>
          <div className="event-title" style={{ color: eventInfo.event.extendedProps.customColor }}>
            {eventInfo.event.title}
          </div>
        </div>
      )} // Custom rendering for events
      eventClassNames="no-border" // Use this to apply the no-border class
    />
  );
};

export default MyCalendar;













/*
import React from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css'; // Import Schedule-X default theme

const event = [
  {
    id: '1',
    title: 'CIS 4210 320',
    start: '2024-09-12T10:00:00', // One event starting at 10 AM
    end: '2024-09-12T11:00:00',   // and ending at 11 AM
  },
];

const CustomCalendar: React.FC = () => {
  // Initialize the calendar with views and events
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: event,
    // Set the time boundaries from 8 AM to 6 PM
    dayBoundaries: {
      start: '08:00',
      end: '18:00',
    },
  });

  return (
    <div style={{ width: '100%', padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <div
        className="sx-react-calendar-wrapper"
        style={{
          height: '600px',
          width: '100%',
          maxWidth: '100vw',
          maxHeight: '70vh',
          overflowY: 'auto',
          border: 'none', // Removes the border for a cleaner look
        }}
      >
        <ScheduleXCalendar
          calendarApp={calendar}
        />
      </div>
    </div>
  );
};

export default CustomCalendar;
*/








/* CODE QUI MARCHE QUI AFFICHE UN TRUC PAS TROP MAL COMME JE VEUX 
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CustomCalendar.css'; // Custom CSS is defined here
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const events = [
  {
    id: '1',
    title: 'CIS 4210 320',
    start: '2024-09-02T10:00:00',
    end: '2024-09-02T11:00:00',
  },
  {
    id: '2',
    title: 'LING 0500 311',
    start: '2024-09-04T11:00:00',
    end: '2024-09-04T12:00:00',
  },
  {
    id: '3',
    title: 'CIS 5300 401',
    start: '2024-09-03T13:00:00',
    end: '2024-09-03T14:00:00',
  },
  {
    id: '4',
    title: 'ESE 6190 108',
    start: '2024-09-03T14:00:00',
    end: '2024-09-03T15:00:00',
  },
  {
    id: '5',
    title: 'PHYS 3362 931',
    start: '2024-09-01T16:00:00',
    end: '2024-09-01T17:00:00',
  },
];

const CustomCalendar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('Week');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option: string) => {
    setSelectedFilter(option);
    setAnchorEl(null);
  };

  const renderToolbar = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0}>
      <Box display="flex" alignItems="center">
        <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
          {document.querySelector('.fc-toolbar-title')?.innerHTML}
        </Typography>
      </Box>

      <Box>
        <Typography
          onClick={handleClick}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}
        >
          {selectedFilter}
          <ExpandMoreIcon />
        </Typography>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose(selectedFilter)}
          MenuListProps={{
            'aria-labelledby': 'lock-button',
            role: 'listbox',
          }}
        >
          <MenuItem onClick={() => setSelectedFilter('Week')}>Week</MenuItem>
          <MenuItem onClick={() => setSelectedFilter('Month')}>Month</MenuItem>
          <MenuItem onClick={() => setSelectedFilter('Year')}>Year</MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <div style={{ width: '100%', padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      {renderToolbar()}
      <div style={{ height: '450px', width: '100%', overflowY: 'auto' }}>
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          headerToolbar={{
            left: '', 
            center: '',
            right: '',
          }}
          allDaySlot={false}
          hiddenDays={[0, 6]} // Hides Sunday and Saturday
          slotMinTime="08:00:00" // Start time at 8 AM
          slotMaxTime="20:00:00" // End time at 8 PM
          slotLabelFormat={{
            hour: 'numeric',
            meridiem: 'short',
          }} 
          dayHeaderFormat={{ weekday: 'short' }} // Mon, Tue, etc.
          expandRows={true}
          scrollTime="08:00:00"
          slotDuration="01:00:00" // Keep 1-hour slots
          height="auto"
          contentHeight={400} 
          dayMaxEvents={true} 
        />
      </div>
    </div>
  );
};

export default CustomCalendar;

*/

























/*
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import the styles

// Setup localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const events = [
  {
    id: 1,
    title: 'CIS 4210 320',
    start: new Date(2024, 8, 2, 10, 0),
    end: new Date(2024, 8, 2, 11, 0),
  },
  {
    id: 2,
    title: 'LING 0500 311',
    start: new Date(2024, 8, 4, 11, 0),
    end: new Date(2024, 8, 4, 12, 0),
  },
  {
    id: 3,
    title: 'CIS 5300 401',
    start: new Date(2024, 8, 3, 13, 0),
    end: new Date(2024, 8, 3, 14, 0),
  },
  {
    id: 4,
    title: 'ESE 6190 108',
    start: new Date(2024, 8, 3, 14, 0),
    end: new Date(2024, 8, 3, 15, 0),
  },
  {
    id: 5,
    title: 'PHYS 3362 931',
    start: new Date(2024, 8, 1, 16, 0),
    end: new Date(2024, 8, 1, 17, 0),
  },
];

const CustomCalendar: React.FC = () => {
  // State to manage the dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('Week'); // Default filter selected
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option: string) => {
    setSelectedFilter(option); // Update the selected filter
    setAnchorEl(null); // Close the menu
  };

  // Customize toolbar (header with arrows and dropdown)
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    return (
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={goToBack}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            {toolbar.label}
          </Typography>
          <IconButton onClick={goToNext}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Box>
          <Typography
            onClick={handleClick}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}
          >
            {selectedFilter}
            <ExpandMoreIcon />
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleClose(selectedFilter)}
            MenuListProps={{
              'aria-labelledby': 'lock-button',
              role: 'listbox',
            }}
          >
            <MenuItem onClick={() => toolbar.onView('week') && handleClose('Week')}>Week</MenuItem>
            <MenuItem onClick={() => toolbar.onView('month') && handleClose('Month')}>Month</MenuItem>
            <MenuItem onClick={() => toolbar.onView('agenda') && handleClose('Agenda')}>Agenda</MenuItem>
          </Menu>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', padding: '16px' }}>
      {/* Calendar Component *
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week" // Default view is Week
        views={['week', 'month', 'agenda']} // Available views
        style={{ height: 500 }} // Set the height of the calendar
        components={{
          toolbar: CustomToolbar, // Custom toolbar with dropdown
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#D6EAF7',
            borderRadius: '4px',
            color: '#1F77B4',
            border: '1px solid #1F77B4',
            textAlign: 'center',
            padding: '2px',
          },
        })}
      />
    </Box>
  );
};

export default CustomCalendar;
*/









/*
import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Calendar: React.FC = () => {
  // State to manage the dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('Per Week'); // Default filter selected
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option: string) => {
    setSelectedFilter(option); // Update the selected filter
    setAnchorEl(null); // Close the menu
  };

  // Course Data
  const courses = [
    { id: 1, name: 'CIS 4210 320', day: 'Tue', startTime: 10, endTime: 11, color: '#D6EAF7' },
    { id: 2, name: 'LING 0500 311', day: 'Thu', startTime: 11, endTime: 12, color: '#FDEBD0' },
    { id: 3, name: 'CIS 5300 401', day: 'Wed', startTime: 1, endTime: 2, color: '#D6EAF7' },
    { id: 4, name: 'ESE 6190 108', day: 'Wed', startTime: 2, endTime: 3, color: '#D6EAF7' },
    { id: 5, name: 'PHYS 3362 931', day: 'Mon', startTime: 4, endTime: 5, color: '#D7BDE2' },
  ];

  // Function to render courses on the calendar
  const renderCourses = () => {
    return courses.map((course) => {
      return (
        <Box
          key={course.id}
          sx={{
            position: 'absolute',
            top: `${course.startTime * 50}px`,
            height: `${(course.endTime - course.startTime) * 50}px`,
            width: '100%',
            backgroundColor: course.color,
            border: '1px solid #1F77B4',
            borderRadius: '4px',
            color: '#1F77B4',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {course.name}
        </Box>
      );
    });
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ width: '100%', padding: '16px' }}>
      {/* Header with title, arrows, and dropdown filter *
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}>
            Your Fall Semester
          </Typography>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Box>
          <Typography
            onClick={handleClick}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '500', fontSize: '0.875rem', color: '#011F5B' }}
          >
            {selectedFilter}
            <ExpandMoreIcon />
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleClose(selectedFilter)}
            MenuListProps={{
              'aria-labelledby': 'lock-button',
              role: 'listbox',
            }}
          >
            <MenuItem onClick={() => handleClose('Per Week')}>Per Week</MenuItem>
            <MenuItem onClick={() => handleClose('Per Month')}>Per Month</MenuItem>
            <MenuItem onClick={() => handleClose('Per Semester')}>Per Semester</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Calendar Grid *
      <Box display="flex" sx={{ width: '100%' }}>
        <Box flex={1} sx={{ paddingTop: '32px', fontWeight: 'bold', color: '#7F7F7F' }}>
          {/* Spaced time intervals *
          <Typography sx={{ height: '50px' }}>10 AM</Typography>
          <Typography sx={{ height: '50px' }}>11 AM</Typography>
          <Typography sx={{ height: '50px' }}>12 PM</Typography>
          <Typography sx={{ height: '50px' }}>1 PM</Typography>
          <Typography sx={{ height: '50px' }}>2 PM</Typography>
          <Typography sx={{ height: '50px' }}>3 PM</Typography>
          <Typography sx={{ height: '50px' }}>4 PM</Typography>
          <Typography sx={{ height: '50px' }}>5 PM</Typography>
        </Box>

        <Box flex={4} position="relative" sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridAutoRows: '50px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <Box key={day} display="flex" justifyContent="center" alignItems="center" sx={{ fontWeight: 'bold', color: '#7F7F7F' }}>
              <Typography>{day}</Typography>
            </Box>
          ))}

          {/* Adjust grid size to remove extra square *
          {Array(30)
            .fill(null)
            .map((_, idx) => (
              <Box key={idx} sx={{ border: '1px solid #F0F0F0' }} />
            ))}

          {/* Courses placed on the grid *
          <Box gridColumn="2 / 3" gridRow="3 / 4" sx={{ position: 'relative' }}>
            {renderCourses()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;

*/