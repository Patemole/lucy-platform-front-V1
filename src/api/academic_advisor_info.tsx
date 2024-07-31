import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;

// Function to send the backend the feedback on wrong answer or issue on the student platform message
export const submitAcademicAdvisorEmailAdress = async (email: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/academic_advisor/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit feedback: ${errorText}`);
        }

        console.log('Feedback successfully submitted');
    } catch (error) {
        console.log('Error submitting feedback:', error);
    }
};
