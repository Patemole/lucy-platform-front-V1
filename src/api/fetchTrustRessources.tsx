
/*
import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;

interface DocumentDownloadRequest {
    fullName: string;
    email: string;
    companyName: string;
    reason: string;
    documentName: string;
}

// Function to request a presigned URL for document download
export const requestDocumentDownload = async ({
    fullName,
    email,
    companyName,
    reason,
    documentName,
}: DocumentDownloadRequest) => {
    try {
        // Modifier le nom du fichier avant de l'envoyer au backend
        // Ici, on transforme "Risk Assessment Policy" en "Risk Assessment Policy - My Lucy Corp - 2024.pdf"
        let formattedDocumentName = documentName;
        
        if (documentName === "Risk Assessment Policy") {
            formattedDocumentName = "Risk Assessment Policy - My Lucy Corp - 2024.pdf";
        }
        
        // Vous pouvez ajouter d'autres transformations selon d'autres noms si nécessaire
        // if (documentName === "Autre Nom") {
        //     formattedDocumentName = "Autre Nom Modifié.pdf";
        // }

        // Envoyer la requête POST à votre backend pour générer l'URL S3 présignée
        const response = await fetch(`${apiUrlPrefix}/files/RessourceTrustDownload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                email,
                companyName,
                reason,
                documentName: formattedDocumentName,  // Utiliser le nom du fichier formaté
            }),
        });

        // Vérifier si la requête a réussi
        if (!response.ok) {
            const errorJson = await response.json();
            const errorMsg = errorJson.message || errorJson.detail || "Erreur lors du téléchargement du document";
            throw new Error(`Échec de l'obtention de l'URL présignée - ${errorMsg}`);
        }

        const responseBody = await response.json();
        const { presignedUrl } = responseBody;

        // Déclencher le téléchargement du fichier en utilisant l'URL présignée
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.setAttribute('download', formattedDocumentName);  // Nom du fichier à télécharger
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Document téléchargé avec succès depuis S3');
    } catch (error) {
        console.error('Erreur lors du téléchargement du document :', error);
        throw error;
    }
};
*/



// src/api/documentDownload.ts
// src/api/documentDownload.ts
interface DocumentDownloadRequest {
    fullName: string;
    email: string;
    companyName: string;
    reason: string;
    documentName: string;
}

// Function to download a document from a fixed S3 URL and open it in a new tab
export const requestDocumentDownload = async ({
    fullName,
    email,
    companyName,
    reason,
    documentName,
}: DocumentDownloadRequest) => {
    try {
        // Définir l'URL S3 en fonction du documentName
        let downloadUrl = '';

        if (documentName === "Risk Assessment Policy") {
            downloadUrl = "https://trust-ressources.s3.amazonaws.com/Risk+Assessment+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }


        if (documentName === "Vendor Management Policy") {
            downloadUrl = "https://trust-ressources.s3.amazonaws.com/Vendor+Management+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Data Retention Policy") {
            downloadUrl = "https://trust-ressources.s3.amazonaws.com/Data+Retention+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Incidence Response Plan") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Incidence+Response+Plan+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Data Protection Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Data+Protection+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Business Continuity Plan") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Business+Continuity+Plan+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Vendor Management Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Vendor+Management+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Access Control Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Access+Control+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Encryption Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Encryption+Policy+-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Privacy Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Privacy+Policy+-+My+Lucy+Corp+-+2024+-+11%3A11%3A24.pdf";
        }

        if (documentName === "Online Subscription Agreement") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Online+Subscription+Agreement++-+My+Lucy+Corp+-+2024.pdf";
        }

        if (documentName === "Information Security Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Information+Security+Policy+(ISP)+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "Third-Party Management Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Third-Party+Management+Policy+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "Privileged Access Review Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Privileged+Access+Review+Policy+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "Quality Assurance (QA) Program") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Quality+Assurance+(QA)+Program+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "Systems Development Life Cycle (SDLC)") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Systems+Development+Life+Cycle+(SDLC)+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "Change Management Policy") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/Change+Management+Policy+-+My+Lucy+Corp+-+2025.pdf";
        }

        if (documentName === "HECVAT - full - January 2025") {
            downloadUrl = "https://trust-ressources.s3.us-east-1.amazonaws.com/HECVAT+-+FULL+-+January+2025.xlsx";
        }


        // Ajouter d'autres conditions pour d'autres documents si nécessaire
        // if (documentName === "Autre Nom") {
        //     downloadUrl = "https://trust-ressources.s3.amazonaws.com/Autre+Nom.pdf";
        // }

        // Si l'URL n'a pas été définie (document non trouvé)
        if (!downloadUrl) {
            throw new Error("Le document demandé n'existe pas.");
        }

        // Créer un lien et ouvrir le document dans un nouvel onglet
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('target', '_blank');  // Ouvrir dans un nouvel onglet
        link.setAttribute('rel', 'noopener noreferrer');  // Pour plus de sécurité
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Document ouvert avec succès dans un nouvel onglet depuis S3');
    } catch (error) {
        console.error('Erreur lors de l\'ouverture du document :', error);
        throw error;
    }
};



