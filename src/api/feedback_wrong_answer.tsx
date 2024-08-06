import config from '../config';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;

interface WrongAnswerFeedback {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
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



/* CODE QUI MARCHE POUR LA RÉCUPÉRATION DES MESSAGES DANS WRONG ANSWER
import config from '../config';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;

interface WrongAnswerFeedback {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
}

// Function to send feedback on wrong answers to the backend
export const submitFeedbackWrongAnswer = async (feedback: WrongAnswerFeedback): Promise<void> => {
  try {
    console.log('Submitting feedback with the following data:');
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

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};

// Function to send general feedback on the student platform to the backend
export const submitFeedbackAnswer = async (feedback: string): Promise<void> => {
  try {
    console.log(`Submitting general feedback: ${feedback}`);

    const response = await fetch(`${apiUrlPrefix}/feedback/feedback_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from server: ${responseText}`);
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};
*/



/*
import config from '../config';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;

// Function to send feedback on wrong answers to the backend
export const submitFeedbackWrongAnswer = async (feedback: {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
}) => {
  try {
    console.log('Submitting feedback with the following data:');
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

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};

// Function to send general feedback on the student platform to the backend
export const submitFeedbackAnswer = async (feedback: string) => {
  try {
    console.log(`Submitting general feedback: ${feedback}`);

    const response = await fetch(`${apiUrlPrefix}/feedback/feedback_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from server: ${responseText}`);
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};
*/





/*
import config from '../config';

// Define the API URL prefix based on the environment
const apiUrlPrefix: string = config.server_url;

// Function to send feedback on wrong answers to the backend
export const submitFeedbackWrongAnswer = async (feedback: {
  userId: string;
  chatId: string;
  aiMessageContent: string;
  humanMessageContent: string;
  feedback: string;
}) => {
  try {
    const response = await fetch(`${apiUrlPrefix}/feedback/wrong_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.log('Error submitting feedback:', error);
  }
};

// Function to send general feedback on the student platform to the backend
export const submitFeedbackAnswer = async (feedback: string) => {
  try {
    const response = await fetch(`${apiUrlPrefix}/feedback/feedback_answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    console.log('Feedback successfully submitted');
  } catch (error) {
    console.log('Error submitting feedback:', error);
  }
};
*/






/*
// src/api/feedback_wrong_answer.ts

import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;



//Function to send the backend the feedback on wrong answer or issue on the studen platform message
export const submitFeedbackWrongAnswer = async (feedback: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/feedback/wrong_answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit feedback');
        }

        console.log('Feedback successfully submitted');
    } catch (error) {
        console.log('Error submitting feedback:', error);
    }
};


//Function to send the backend the feedback on the studen platform
export const submitFeedbackAnswer = async (feedback: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/feedback/feedback_answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit feedback');
        }

        console.log('Feedback successfully submitted');
    } catch (error) {
        console.log('Error submitting feedback:', error);
    }
};
*/