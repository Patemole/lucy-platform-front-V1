export interface AnswerDocument {
    document_id: string;
    link: string;
    document_name: string;
    source_type: string;
}

export interface Message {
    id: number;
    type: 'human' | 'ai' | 'error';
    content: string;
    personaName?: string;
    citedDocuments?: AnswerDocument[];
    fileType?: 'pdf' | 'mp4';
  };


export interface Course {
    id: string;
    name: string;
  };