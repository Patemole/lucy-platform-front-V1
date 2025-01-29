import config from '../config';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;

/*
interface WrongAnswerFeedback {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
}
*/

interface WrongAnswerFeedback {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
  relevance?: number;
  accuracy?: number;
  format?: number;
  sources?: number;
  overall_satisfaction?: number;
}

interface GeneralFeedback {
  userId: string;
  feedback: string;
  courseId: string;
}



// Function to send feedback on wrong answers to the backend
export const submitFeedbackWrongAnswer = async (feedback: WrongAnswerFeedback): Promise<void> => {
  try {
    console.log('Submitting feedback wrong answer with the following data:');
    console.log(`User ID: ${feedback.userId}`);
    console.log(`Chat ID: ${feedback.chatId}`);
    console.log(`AI Message Content: ${feedback.aiMessageContent}`);
    console.log(`Human Message Content: ${feedback.humanMessageContent}`);
    console.log(`Feedback: ${feedback.feedback}`);

    console.log(`Feedback relevance: ${feedback.relevance}`);
    console.log(`Feedback accuracy: ${feedback.accuracy}`);
    console.log(`Feedback format: ${feedback.format}`);
    console.log(`Feedback sources: ${feedback.sources}`);
    console.log(`Feedback overall_satisfaction: ${feedback.overall_satisfaction}`);

    const response = await fetch(`${apiUrlPrefix}/feedback/wrong_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from server: ${responseText}`);
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback wrong answer successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};


export const submitFeedbackGoodAnswer = async (feedback: WrongAnswerFeedback): Promise<void> => {
    try {
      console.log('Submitting feedback wrong answer with the following data:');
      console.log(`User ID: ${feedback.userId}`);
      console.log(`Chat ID: ${feedback.chatId}`);
      console.log(`AI Message Content: ${feedback.aiMessageContent}`);
      console.log(`Human Message Content: ${feedback.humanMessageContent}`);
      console.log(`Feedback: ${feedback.feedback}`);
  
      const response = await fetch(`${apiUrlPrefix}/feedback/wrong_answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
  
      console.log(`Response status: ${response.status}`);
      console.log(`Response status text: ${response.statusText}`);
  
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error response from server: ${responseText}`);
        throw new Error('Failed to submit feedback');
      }
  
      console.log('Feedback GOOD answer successfully submitted');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };



// Function to send general feedback on the student platform to the backend
export const submitFeedbackAnswer = async (feedback: GeneralFeedback): Promise<void> => {
  try {
    console.log('Submitting feedback on about or menu with the following data:');
    console.log(`User ID: ${feedback.userId}`);
    console.log(`Course ID: ${feedback.courseId}`);
    console.log(`Feedback: ${feedback.feedback}`);

    const response = await fetch(`${apiUrlPrefix}/feedback/feedback_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from server: ${responseText}`);
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback about or menu successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};


