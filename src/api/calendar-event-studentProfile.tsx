import config from '../config';
import { StudentProfile, EventStudentProfile } from '../interfaces/interfaces_eleve';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;
  

export const sendUserInfoToBackend = async (userInfo: StudentProfile): Promise<{ events?: EventStudentProfile[] }> => {
    try {
      console.log("Sending user info to backend:", userInfo);
  
      const response = await fetch(`${apiUrlPrefix}/chat/get_calendar_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
  
      console.log(`Response status: ${response.status}`);
      console.log(`Response status text: ${response.statusText}`);
  
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error response from server: ${responseText}`);
        throw new Error("Failed to send user info");
      }
  
      const data = await response.json(); // On attend la réponse en JSON
      console.log("User info successfully sent to backend. Response data:", data);

      // appliquer le formatage des événements
      const eventsFormatted = formatEvents(data.events);
      console.log("formatted events:", eventsFormatted); // log ajouté pour voir la différence
  
      return { events: eventsFormatted };
    } catch (error) {
      console.error("Error sending user info:", error);
      return {}; // Retourne un objet vide pour éviter les erreurs si l'API échoue
    }
  };
  

export const formatEvents = (rawEvents: any[]): EventStudentProfile[] => {
    return rawEvents.map((event, index) => {
      // Convertir les dates
      const eventDate = parseEventDate(event.day, event.month, event.year, event.start_time);
      const endDate = parseEventDate(event.day, event.month, event.year, event.end_time);
  
      return {
        id: `event-${index}`, // Génère un ID unique si non fourni par l'API
        title: event.title || "Untitled Event",
        start: eventDate,
        end: endDate,
        location: event.location || "No location specified",
        organizer: event.organizer || "Unknown",
        category: event.category || "General",
        sub_category: event.sub_category || "General",
        description: event.description || "No description available",
        tags: event.tags ? (Array.isArray(event.tags) ? event.tags : event.tags.split(",")) : [],
        banner: event.banner || "Unknown",
      };
    });
  };
  
  // Fonction pour convertir `day`, `month`, `year`, `time` en Date
  const parseEventDate = (day: string, month: string, year: string, time: string): Date => {
    const months: Record<string, number> = {
      "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
      "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };
  
    const dayNumber = parseInt(day) || 1;
    const yearNumber = parseInt(year) || new Date().getFullYear();
    const monthNumber = months[month] ?? 0;
  
    const [hours, minutes] = time?.split(":").map(Number) || [0, 0];
  
    return new Date(yearNumber, monthNumber, dayNumber, hours, minutes);
  };
  