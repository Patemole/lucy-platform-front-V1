import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;

// Function to send the backend the feedback on wrong answer or issue on the student platform message
export const submitAcademicAdvisorEmailAdress = async (email: string, uid: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/feedback/academic_advisor/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, uid }), // Envoi du email et uid au backend
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

export{}
/*
export const sendStudentProfile = async (profileData, uid: string) => {
    const apiUrlPrefix = config.server_url;
    try {
      const response = await fetch(`${apiUrlPrefix}/chat/student_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const result = await response.json();
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        student_profile: result.student_profile
      });
    } catch (error) {
      console.error("Error sending student profile:", error);
    }
  };
  */