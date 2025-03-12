import config from '../config'; // Récupération de l'URL du serveur backend

const apiUrlPrefix: string = config.server_url; // Utilisation de l'URL du backend

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/files/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: 'Welcome on Lucy 🎉',
                html: `<p>Heyy ${name || "Student"},</p><p>Welcome on <strong>Lucy</strong> ! We are glad to have you on board!</p>`,
            }),
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(`Erreur lors de l'envoi de l'email : ${errorJson.detail || response.statusText}`);
        }

        console.log('Email envoyé avec succès via le backend');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};
