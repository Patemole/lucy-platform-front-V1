import config from '../config'; // Récupération de l'URL du serveur backend

const apiUrlPrefix: string = config.server_url; // Utilisation de l'URL du backend

export const sendWelcomeEmail = async (email: string, name: string, university: string) => {

    const firstName = name ? name.split(' ')[0] : "there";
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
                  <p>Hi ${firstName || "there"}!</p>
              
                  <p>We're thrilled to have you join <strong>Lucy</strong>, your personalized AI-Powered Peer Advisor designed to simplify your university journey.</p>
              
                  <p>With Lucy, you can effortlessly access tailored course recommendations, explore campus opportunities, and receive support whenever you need it.</p>
              
                  <p>Ready to get started? <a href="https://${university}.my-lucy.com/auth/sign-in">Log in now</a> and experience smarter university life!</p>
              
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



export const sendUniversityRequestEmail = async (email: string, university: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/files/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: `Thanks for requesting Lucy at ${university}! 🎓`,
                html: `
                  <p>Hi there!</p>
                  <p>Thank you for your interest in bringing <strong>Lucy</strong> to <strong>${university}</strong>!</p>
                  <p>We're excited about expanding Lucy's reach to more campuses. We'll notify you as soon as Lucy becomes available at your university.</p>
                  <p>Stay tuned!</p>
                  <p>Cheers,<br>The Lucy Team 🚀</p>
                `,
            }),
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(`Error sending email: ${errorJson.detail || response.statusText}`);
        }

        console.log('University request email sent successfully');
    } catch (error) {
        console.error('Error sending university request email:', error);
    }
};



export const scrapeLinkedInProfile = async (linkedinUrl: string, userId: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/files/linkedin_scraping_onboarding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: linkedinUrl,
                user_id: userId 
            }) 
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


export const scrapeInstagramProfile = async (instagramnUrl: string, userId: string) => {
    try {
        const response = await fetch(`${apiUrlPrefix}/files/instagram_scraping_onboarding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username: instagramnUrl,
                user_id: userId 
            }) 
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(`Erreur lors du scraping instagram : ${errorJson.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('Données scrappées depuis Instagram :', data);
        return data;
    } catch (error) {
        console.error('Erreur lors du scraping Instagram:', error);
        return null;
    }
};



export const sendUserInfoLinkedInScraping = async ({
  firstName,
  lastName,
  university,
  userId
}: {
  firstName: string;
  lastName: string;
  university: string;
  userId: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrlPrefix}/files/linkedin_scraping_sign_up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        university,
        user_id: userId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // On suppose que le backend renvoie { linkedInFound: boolean }
    return data.linkedInFound || false;
  } catch (error) {
    console.error('Error sending user signup info:', error);
    return false; // En cas d'erreur, on retourne false pour poser la question
  }
};

// Nouvelle fonction pour appeler l'endpoint proxy
export const fetchProxiedImage = async (imageUrl: string): Promise<Blob | null> => {
    console.log(`[API fetchProxiedImage] Requesting image from proxy for URL: ${imageUrl}`);
    try {
        const response = await fetch(`${apiUrlPrefix}/files/proxy-image`, { // Utilisation de la nouvelle route '/api/proxy-image'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Ajouter d'autres headers si nécessaire (ex: Authentification si votre API l'exige)
            },
            body: JSON.stringify({
                imageUrl: imageUrl, // Envoyer l'URL dans le corps JSON comme attendu par le backend FastAPI
            }),
        });

        if (!response.ok) {
            // Essayer de lire le message d'erreur du backend s'il existe
            let errorDetail = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = await response.json();
                errorDetail = errorJson.detail || errorDetail; // Utiliser le détail de l'erreur FastAPI si disponible
            } catch (e) {
                // Ignorer si la réponse n'est pas du JSON valide
                errorDetail = `${errorDetail} - ${response.statusText}`;
            }
            console.error(`[API fetchProxiedImage] Error fetching proxied image: ${errorDetail}`);
            throw new Error(errorDetail);
        }

        // Si la réponse est ok, le corps est le Blob de l'image
        const imageBlob = await response.blob();
        console.log(`[API fetchProxiedImage] Successfully fetched image blob. Size: ${imageBlob.size}, Type: ${imageBlob.type}`);
        return imageBlob;

    } catch (error) {
        console.error('[API fetchProxiedImage] Failed to fetch proxied image:', error);
        // Renvoyer null ou relancer l'erreur selon la gestion souhaitée dans le hook
        return null;
    }
};
