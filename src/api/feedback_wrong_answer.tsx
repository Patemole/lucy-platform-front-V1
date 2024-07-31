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
