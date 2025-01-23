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

export interface AnswerWaiting {
  Sentence1: string;
  Sentence2: string;
  Sentence3: string;
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

// Define the CourseSlot interface
export interface CourseSlot {
  CourseID: string;
  TeacherName: string;       // Name of the professor
  TeacherQuality: string;    // Quality rating of the professor (e.g., "4.5")
  Days: string[];            // Array of days when the class takes place (e.g., ["Mon", "Wed"])
  StartTime: string;         // Class start time in 'HH:MM' format (e.g., "10:00")
  EndTime: string;           // Class end time in 'HH:MM' format (e.g., "11:30")
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


export interface Message {
    id: number;
    type: 'human' | 'ai' | 'error';
    content: string;
    personaName?: string;
    citedDocuments?: AnswerDocument[];
    fileType?: 'pdf' | 'mp4';
    images?: AnswerImage[] | null; // Utilisation de la nouvelle interface AnswerImage
    TAK?: AnswerTAK[] | null; // Ajout de l'interface AnswerTAK pour gérer les réponses spécifiques
    COURSE?: AnswerCourse[] | null; // Ajout de l'interface AnswerTAK pour gérer les réponses spécifiques
    waitingMessages?: AnswerWaiting[]| null;
    CHART?: AnswerCHART[] | null; // Ajout de AnswerChart pour gérer les graphiques
    ReasoningSteps?: ReasoningStep[] | null; // Utiliser un tableau de ReasoningStep pour plus de clarté
    REDDIT?: AnswerREDDIT[] | null;
    INSTA?: AnswerINSTA[] | null;
    YOUTUBE?: AnswerYOUTUBE[] | null;
    QUORA?: AnswerQUORA[] | null;
    ERROR?: AnswerERROR[] | null;
    CONFIDENCESCORE?: AnswerACCURACYSCORE[] | null;
    INSTA_CLUB?: AnswerINSTA_CLUB[] | null;
    LINKEDIN?: AnswerLINKEDIN[] | null;
    INSTA2?: AnswerINSTA2[] | null;
  };


export interface Course {
    id: string;
    name: string;
  };


  /*
export interface AnswerCHART {
  chartType: 'line' | 'bar' | 'pie'; // Types de graphiques supportés
  chartTitle: string; // Titre du graphique
  xAxisTitle: string; // Titre de l'axe X
  yAxisTitle: string; // Titre de l'axe Y
  data: { label: string; x: number; y: number }[]; // Données pour les axes X et Y
  }
  */

/*
  // Définition de ChartData si ce n'est pas déjà fait
export interface ChartData {
  chartType: 'line' | 'bar' | 'pie';
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  data: { label: string; x: number; y: number }[];
}
*/

export interface AnswerREDDIT{
  comment: string;
  score: string;
}

export interface AnswerINSTA{
  title: string;
  nbr_view: string;
  link: string;
  picture: string;
}

export interface AnswerINSTA2{
  username: string;
  title: string;
  followers: string;
  posts: string;
  link: string;
  picture: string;
}

export interface AnswerINSTA_CLUB{
  username: string;
  title: string;
  followers: string;
  posts: string;
  link: string;
  picture: string;
}

export interface AnswerLINKEDIN{
  name: string;
  picture: string;
  headline: string;
  sentence: string;
  link: string;
}

export interface AnswerYOUTUBE{
  title: string;
  link: string;
  miniature: string;
  nbr_view: string;

}

export interface AnswerQUORA{
  comment: string;
  score: string;
}

export interface AnswerERROR{
  errorSentence: string;
}

export interface AnswerACCURACYSCORE{
  confidenceScore: string;
}

export interface AnswerTITLEANDCATEGORY {
  category: string; // The category of the question (e.g., Financial Aids, Events, Policies, Housing, Courses)
  conversationTitle: string; // A concise and descriptive title for the conversation
}


export interface ChartData {
  chartType: 'line' | 'bar' | 'pie' | 'column' | 'doughnut' | 'scatter' | 'pyramid' | 'gauge' | 'bubble' | 'treemap' | 'waterfall';
  chartTitle: string;                 // Titre principal du graphique
  xAxisTitle: string;                 // Titre de l'axe X
  yAxisTitle: string;                 // Titre de l'axe Y
  series: {
    seriesName: string;               // Nom de la série (ex: "2023", "2022", "Graduate", etc.)
    data: { label: string; x: number; y: number; z?: number }[]; // Points de données, avec `z` optionnel pour les bulles
  }[];                                // Tableau de séries pour supporter des comparaisons
}

/*
// Définition de AnswerCHART
export interface AnswerCHART {
  answer_chart: ChartData;
}
*/

export interface AnswerCHART {
  answer_chart?: ChartData;
  answer_charts?: ChartData[];
}


// Interface pour représenter une seule étape de raisonnement
export interface ReasoningStep {
  step: number;                  // Numéro de l'étape
  description: string;           // Description de l'étape
}