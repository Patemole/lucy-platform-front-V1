
//CODE QUI MARCHE POUR AFFICHER DES MESSAGES AVEC LA SOURCE ET LE COPIER/COLLER + POUCE VERS LE HAUT ET POUCE VERS LE BAS 
import React, { useState } from 'react';
import { AIMessage, HumanMessage } from '../components/Messages';
import { FeedbackType } from '../components/types';
import { ValidSources } from '../components/sources'; // Assurez-vous que le chemin est correct

const ScheduleMeeting: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);

  const handleFeedback = (feedbackType: FeedbackType) => {
    setFeedback(feedbackType);
    console.log(`Feedback received: ${feedbackType}`);
  };

  return (
    <div className="container mx-auto px-4 py-5">
      <h1 className="text-center text-2xl font-bold mb-4">Meeting Schedule Page</h1>
      
      <HumanMessage content="Hello! I'm here to help you today." />
      <AIMessage 
        messageId={1} 
        content="How can I assist you with scheduling your meeting?" 
        personaName="Lucy"
        citedDocuments={[
          {
            document_id: "1",
            document_name: "Meeting Scheduling Guide.pdf",
            link: "https://example.com/meeting-scheduling-guide",
            source_type: "course_resource" as ValidSources, // Type de source valide
          }
        ]}
        isComplete={true}
        hasDocs={true}
        handleFeedback={handleFeedback}
      />

      {feedback && <p className="text-center mt-4">Feedback received: {feedback}</p>}
    </div>
  );
};

export default ScheduleMeeting;

