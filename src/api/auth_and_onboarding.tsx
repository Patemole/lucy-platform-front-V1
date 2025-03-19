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
                subject: 'Welcome to Lucy! 🎉',
                html: `
                  <p>Hi ${name || "there"}!</p>
              
                  <p>We're thrilled to have you join <strong>Lucy</strong>, your personalized AI peer advisor designed to simplify your university journey.</p>
              
                  <p>With Lucy, you can effortlessly access tailored course recommendations, explore campus opportunities, and receive support whenever you need it.</p>
              
                  <p>Ready to get started? Log in now and experience smarter university life!</p>
              
                  <p>Cheers,<br>
                  The Lucy Team 🚀</p>
                `,
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



export const scrapeLinkedInProfile = async (linkedinUrl: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/chat/linkedin_scraping`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: linkedinUrl }) 
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(`Erreur lors du scraping LinkedIn : ${errorJson.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('Données scrappées depuis LinkedIn :', data);
        return data;
    } catch (error) {
        console.error('Erreur lors du scraping LinkedIn:', error);
        return null;
    }
};
