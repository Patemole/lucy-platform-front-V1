export interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  year?: string;
  faculty?: string[];
  academic_advisor?: string;
  major?: string[];
  minor?: string[];
  interests?: string[];
  role?: string;
  linkedin_url?: string;
  linkedin_profile?: any;
  instagram_username?: string;
  instagram_profile?: any;
  registered_club_status?: string;
  registered_clubs?: string;
  onboardingComplete?: boolean;
  onboardingMessageSent?: boolean;
  complianceAccepted?: boolean;
  termsAccepted?: boolean;
  ageConfirmed?: boolean;
  chatsessions?: string[];
  createdAt?: string;
  lastLogin?: string;
  profilePicture?: string;

}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  loading: boolean;
  chatIds: string[];
  addChatId: (chatId: string) => void;
  removeChatId: (chatId: string) => void;
  setPrimaryChatId: (chatId: string) => void;
  login: () => void;
  logout: () => void;
}


// Type du contexte
export interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  isLandingPageVisible: boolean;
  setIsLandingPageVisible: React.Dispatch<React.SetStateAction<boolean>>;
  socialThreads: SocialThread[];
  setSocialThreads: React.Dispatch<React.SetStateAction<SocialThread[]>>;
  isSocialThread: boolean;
  setIsSocialThread: React.Dispatch<React.SetStateAction<boolean>>;
}


export interface Conversation {
  chat_id: string;
  name: string;
  thread_type: string;
  topic?: string;
  modified_at?: Date;
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
  METADATAONBOARDING?: string; // THE DATA FROM THE ONBOARDING, CAN BE SCHOOL, MAJOR, MINOR...
  isLoading?: boolean; // Ajouté pour gérer l'état de chargement optimiste
};



//----------------------------//


export interface AnswerDocumentPacket {
  answer_document: AnswerDocument
}

export interface AnswerPiecePacket {
  answer_piece: string;
}

export interface StreamingError {
  error: string;
}



export interface AnswerDocument {
    document_id: string;
    link: string;
    document_name: string;
    source_type: string;
}


export interface SocialThread {
  chat_id: string;
  name: string;
  created_at: any; // ou un type plus précis comme firebase.Timestamp
  topic?: string;
  university?: string;
  thread_type?: string;
  isRead?: boolean; // Ajout de la propriété isRead
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
  category: string; // Code unique du cours
  description: string; // Type de cours (pour la couleur/affichage)
  answerCourse: AnswerCourse; // Détails complets du cours
}


export interface StudentProfile {
  userId: string;
  username: string;
  name: string;
  university: string;
  year: string;
  interests:string[];
  studentProfile: string;
  major: string[];
  minor: string[];
  faculty: string[];
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  profilePicture: string;
  academic_advisor?: string; // Ajoute la propriété `academic_advisor`
  registered_club_status?: string;
  registered_clubs?: string;
}

export interface EventStudentProfile {
  id: string;
  title: string;
  start: Date | null;  // 🔥 Peut être `null`
  end: Date | null;    // 🔥 Peut être `null`
  day?: string;        // 🔥 Ajout de `day` en optionnel
  location: string;
  organizer: string;
  category: string;
  sub_category: string;
  description: string;
  tags: string[];
  banner: string;
}



export interface Course {
    id: string;
    name: string;
  };


export interface AnswerREDDIT{
  comment: string;
  score: string;
  author: string;
  link: string;

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
  conversation_title: string; // A concise and descriptive title for the conversation
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


export interface AnswerCHART {
  answer_chart?: ChartData;
  answer_charts?: ChartData[];
}


// Interface pour représenter une seule étape de raisonnement
export interface ReasoningStep {
  step: number;                  // Numéro de l'étape
  description: string;           // Description de l'étape
}

export interface PopupSpec {
    type: "success" | "error";
    message: string;
}