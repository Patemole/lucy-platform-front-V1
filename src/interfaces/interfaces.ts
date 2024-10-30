export interface AnswerDocument {
    document_id: string;
    link: string;
    document_name: string;
    source_type: string;
}


export interface AnswerImage {
    image_id: string;
    image_url: string;
    image_description?: string;
}


// Interface pour la structure de answer_TAK
export interface AnswerTAK {
    document_id: string;
    question: string;
    answer_options: string[]; // Liste des options de réponse pour l'utilisateur
    other_specification?: {
      label: string;
      placeholder: string;
    }; // Spécifications supplémentaires, comme un champ de texte pour "Other"
  }


// Interface pour la structure de AnswerCourse
/*
export interface AnswerCourse {
    document_id: string; // Identifiant du document du cours
    title: string; // Titre du cours
    Semester: string; // Semestre pendant lequel le cours est offert
    Credit: string; // Crédit attribué au cours
    Prerequisites: string; // Liste des prérequis pour le cours
    Description: string; // Brève description du cours
    Prospectus_link: string; // Lien vers le prospectus du cours
    Syllabus_link: string; // Lien vers le syllabus du cours
  }
*/


export interface CourseSlot {
    CourseID: string;
    TeacherName: string;       // Name of the professor
    TeacherQuality: string;    // Quality rating of the professor (e.g., "4.5")
    Days: string[];            // Array of days when the class takes place (e.g., ["Mon", "Wed"])
    StartTime: string;         // Class start time in 'HH:MM' format (e.g., "10:00")
    EndTime: string;           // Class end time in 'HH:MM' format (e.g., "11:30")
  }


  export interface Event {
    id: string; // Identifiant unique
    title: string;
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    code: string; // Code unique du cours
    type: string; // Type de cours (pour la couleur/affichage)
    answerCourse: AnswerCourse; // Détails complets du cours
  }
  
  // Update the AnswerCourse interface
  export interface AnswerCourse {
    document_id: string;          // Identifier of the course document
    title: string;                // Title of the course
    code: string;
    Semester: string;             // Semester during which the course is offered
    Credit: string;               // Credits attributed to the course
    Prerequisites: string;        // List of prerequisites for the course
    Description: string;          // Brief description of the course
    Prospectus_link: string;      // Link to the course prospectus
    Syllabus_link: string;        // Link to the course syllabus
    Work: string;                 // Workload rating (e.g., "2.5")
    CourseQuality: string;        // Course quality rating (e.g., "3.5")
    Difficulty: string;           // Difficulty rating (e.g., "2")
    CoursesSlot: CourseSlot[];    // Array of available course slots
  }

export interface AnswerWaiting {
    Sentence1: string;
    Sentence2: string;
    Sentence3: string;
  }


export enum RetrievalType {
    None = "none",
    Search = "search",
    SelectedDocs = "selectedDocs",
}

export interface RetrievalDetails {
    run_search: "always" | "never" | "auto";
    real_time: boolean;
    enable_auto_detect_filters?: boolean | null;
}

type CitationMap = { [key: string]: number };

export interface ChatSession {
    id: string;
    name: string;
    course_id: string;
    time_created: string;
}

export interface Message {
    messageId: number | null;
    message: string;
    type: "user" | "assistant" | "error";
    retrievalType?: RetrievalType;
    query?: string | null;
    documents?: AnswerDocument[] | null;
    citations?: CitationMap;
    images?: AnswerImage[] | null; // Utilisation de la nouvelle interface AnswerImage
    TAK?: AnswerTAK[] | null; // Ajout de l'interface AnswerTAK pour gérer les réponses spécifiques
    COURSE?: AnswerCourse[] | null; // Ajout de l'interface AnswerTAK pour gérer les réponses spécifiques
    waitingMessages?: AnswerWaiting[]| null;
    CHART?: AnswerCHART[] | null; // Ajout de AnswerChart pour gérer les graphiques
};

export interface BackendChatSession {
    chat_session_id: number;
    description: string;
    persona_id: number;
    messages: BackendMessage[];
}

export interface BackendMessage {
    message_id: number;
    parent_message: number | null;
    latest_child_message: number | null;
    message: string;
    rephrased_query: string | null;
    context_docs: { top_documents: AnswerDocument[] } | null;
    message_type: "user" | "assistant" | "system";
    time_sent: string;
    citations: CitationMap;
}

export interface DocumentsResponse {
    top_documents: AnswerDocument[];
    rephrased_query: string | null;
}

export interface AnswerDocumentPacket {
    answer_document: AnswerDocument
}

export interface AnswerPiecePacket {
    answer_piece: string;
}

export interface StreamingError {
    error: string;
}

/*
export type PopupSpec = {
    type: 'success' | 'error';
    message: string;
  };
*/

// Define or update PopupSpec interface
export interface PopupSpec {
    type: "success" | "error";
    message: string;
  }


export interface AnswerCHART {
  chartType: 'line' | 'bar' | 'pie'; // Types de graphiques supportés
  chartTitle: string; // Titre du graphique
  xAxisTitle: string; // Titre de l'axe X
  yAxisTitle: string; // Titre de l'axe Y
  data: { label: string; x: number; y: number }[]; // Données pour les axes X et Y
    }
  