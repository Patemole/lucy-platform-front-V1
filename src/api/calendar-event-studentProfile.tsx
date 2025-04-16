import config from '../config';
import { StudentProfile, EventStudentProfile } from '../interfaces/interfaces_eleve';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;
  
/*
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
      //const eventDate = event.start ? new Date(event.start) : (event.day ? event.day : null);
      //const endDate = event.end ? new Date(event.end) : null;

  
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
  

  export const formatEvents = (rawEvents: any[]): EventStudentProfile[] => {
    return rawEvents.map((event, index) => {
        // ✅ Vérifie si les dates sont valides
        const eventDate = event.start_time && event.day && event.month && event.year
            ? parseEventDate(event.day, event.month, event.year, event.start_time)
            : null;
        
        const endDate = event.end_time && event.day && event.month && event.year
            ? parseEventDate(event.day, event.month, event.year, event.end_time)
            : null;

        // ✅ Gère les cas où `start` et `end` sont invalides → on garde `day`
        const formattedDay = (!eventDate && !endDate && event.day) ? event.day : undefined;

        return {
            id: `event-${index}`,
            title: event.title || "Untitled Event",
            start: eventDate, // ✅ Peut être `null`
            end: endDate, // ✅ Peut être `null`
            day: formattedDay, // ✅ Stocke `day` si pas de date
            location: event.location !== "nan" ? event.location : "No location specified",
            organizer: event.organizer !== "nan" ? event.organizer : "Unknown",
            category: event.category !== "nan" ? event.category : "General",
            sub_category: event.sub_category !== "nan" ? event.sub_category : "General",
            description: event.description !== "nan" ? event.description : "No description available",
            tags: event.tags && event.tags !== "nan"
                ? (Array.isArray(event.tags) ? event.tags : event.tags.split(","))
                : [],
            banner: event.banner !== "nan" ? event.banner : "Unknown",
        };
    });
};

/*  
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
  */

  
  const parseEventDate = (day: string, month: string, year: string, time: string): Date | null => {
    if (!day || !month || !year || !time || time === "nan") return null; // ✅ Gère les valeurs invalides

    const months: Record<string, number> = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    const dayNumber = parseInt(day, 10) || 1;
    const yearNumber = parseInt(year, 10) || new Date().getFullYear();
    const monthNumber = months[month] ?? 0;

    const [hours, minutes] = time?.split(":").map(Number) || [0, 0];

    const parsedDate = new Date(yearNumber, monthNumber, dayNumber, hours, minutes);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

  