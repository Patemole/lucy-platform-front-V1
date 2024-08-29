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
  sentence1: string;
  sentence2: string;
  sentence3: string;
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

export interface Message {
    id: number;
    type: 'human' | 'ai' | 'error';
    content: string;
    personaName?: string;
    citedDocuments?: AnswerDocument[];
    fileType?: 'pdf' | 'mp4';
    images?: AnswerImage[] | null; // Utilisation de la nouvelle interface AnswerImage
    TAK?: AnswerTAK[] | null; // Ajout de l'interface AnswerTAK pour gérer les réponses spécifiques
    waitingMessages?: AnswerWaiting[]| null;
  };


export interface Course {
    id: string;
    name: string;
  };