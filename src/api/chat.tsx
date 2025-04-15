// src/api/chat.tsx
import { AnswerDocumentPacket,StreamingError } from "../interfaces/interfaces";
import {Message} from "../interfaces/interfaces_eleve";
import { AnswerPiecePacket } from "../interfaces/interfaces";
import { handleStream } from "./streaming_utils";
import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;



export interface SendMessageRequest {
    message: string;
    chatSessionId: string;
    courseId: string;
    username: string;
    university: string;
    interests: string[];
    student_profile: string; 
    major: string[];
    minor: string[];
    year: string;
    faculty: string[];
    isFirstMessage: boolean;
    user?: any;
    isOnboardingMessage?: boolean;
}


//ANCIENNE FONCTION POUR RECUPERER L'HISTORIQUE DES MESSAGES QUI FONCTIONNE MAIS QUI NE RECUPERE PAS LES SOURCES, LE CONFIDENCE SCORE ET LE METADATAONBOARDING
export async function getChatHistory(chat_id: string) {
    console.log(`🔍 Fetching chat history for chat_id: ${chat_id}`);

    const response = await fetch(`${apiUrlPrefix}/chat/get_chat_history/${chat_id}`, {
        method: "GET",
    });

    if (!response.ok) {
        console.error(`❌ Failed to fetch chat history. Status: ${response.status}`);
        throw new Error("Failed to get chat history from backend");
    }

    let responseBody: any[];

    try {
        responseBody = await response.json();
        console.log(`📦 Chat history response received:`, responseBody);
    } catch (jsonError) {
        console.error("❌ Error parsing JSON response:", jsonError);
        throw new Error("Invalid JSON response received from backend");
    }

    if (!Array.isArray(responseBody)) {
        console.error("❌ Unexpected chat history format:", responseBody);
        throw new Error("Chat history response is not an array");
    }

    const messages: Message[] = responseBody.map((message: any, index: number) => {
        const newMessage: Message = {
            id: message.message_id,
            content: message.body,
            type: message.username === "Lucy" ? "ai" : "human",
            METADATAONBOARDING: undefined,
            //citedDocuments: [],
            //CONFIDENCESCORE: [],
        };

        console.log(`🔖 Processing message #${index}:`, message);


        // Gérer step_metadata si disponible et non vide
        if (message.step_metadata) {
            newMessage.METADATAONBOARDING = Array.isArray(message.step_metadata)
                ? message.step_metadata[0]
                : message.step_metadata;
            console.log(`📝 Added METADATAONBOARDING to message #${index}:`, newMessage.METADATAONBOARDING);
        }

        
        // Gérer les sources si elles sont présentes et valides
        if (Array.isArray(message.sources) && message.sources.length > 0) {
            newMessage.citedDocuments = message.sources.map((source: any) => ({
                document_id: source.document_id,
                document_name: source.document_name,
                link: source.link,
                source_type: source.source_type
            }));
            console.log(`📚 Added citedDocuments to message #${index}:`, newMessage.citedDocuments);
        }

        // Gérer confidence_score s'il est présent et non null
        if ('confidence_score' in message && message.confidence_score !== null) {
            newMessage.CONFIDENCESCORE = [{
                confidenceScore: message.confidence_score.toString()
            }];
            console.log(`✅ Added CONFIDENCESCORE to message #${index}:`, newMessage.CONFIDENCESCORE);
        }

        return newMessage;
    });

    console.log(`🎉 Successfully constructed ${messages.length} messages from history.`);
    return messages;
}




//Endpoint to send a message
export async function* sendMessageSocraticLangGraph({
    message,
    chatSessionId,
    courseId,
    username,
    university,
    interests,
    student_profile, //We dont using it now 
    major,
    minor,
    year,
    faculty,
    isFirstMessage, 
    user,
    isOnboardingMessage,

}: SendMessageRequest,
    signal?: AbortSignal)

{
    console.log("SENDING MESSAGE");
    const sendMessageResponse = await fetch(`${apiUrlPrefix}/chat/send_message_socratic_langgraph`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            course_id: courseId,
            username: username,
            message: message,
            chat_id: chatSessionId,
            university: university,
            interests: interests,
            student_profile: student_profile,
            major: major,
            minor:minor,
            year: year,
            faculty: faculty,
            is_first_message: isFirstMessage, // Ajoute isFirstMessage au payload
            user: user,
            isOnboardingMessage: isOnboardingMessage,

            //is_first_message: true, // Ajoute isFirstMessage au payload
        }),
        signal: signal, // Passez le signal ici
    });
    if (!sendMessageResponse.ok) {
        const errorJson = await sendMessageResponse.json();
        const errorMsg = errorJson.message || errorJson.detail || "";
        throw Error(`Failed to send message - ${errorMsg}`);
    }

    yield* handleStream<AnswerPiecePacket | AnswerDocumentPacket | StreamingError>(sendMessageResponse);
}




//Endpoint to send a message
export async function* sendMessageFakeDemo({
    message,
    chatSessionId,
    courseId,
    username,
    university,
    student_profile

}: SendMessageRequest) {
    console.log("SENDING MESSAGE");
    const sendMessageResponse = await fetch(`${apiUrlPrefix}/chat/send_message_fake_demo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            course_id: courseId,
            username: username,
            message: message,
            chat_id: chatSessionId,
            university: university,
            student_profile: student_profile
        }),
    });
    if (!sendMessageResponse.ok) {
        const errorJson = await sendMessageResponse.json();
        const errorMsg = errorJson.message || errorJson.detail || "";
        throw Error(`Failed to send message - ${errorMsg}`);
    }

    yield* handleStream<AnswerPiecePacket | AnswerDocumentPacket | StreamingError>(sendMessageResponse);
}



// Function to save the ai message to the backend
export const saveMessageAIToBackend = async ({
    message,
    chatSessionId,
    courseId,
    username,
    type,
    uid,
    input_message,
    university,
    sources,
    confident_score
}: {
    message: string;
    chatSessionId: string;
    courseId: string;
    username: string;
    type: string;
    uid: string,
    input_message: string
    university: string
    sources?: { document_id: string; document_name: string; link: string; source_type: string }[];
    confident_score?: number | null; // 👈 Ajout du confident_score
}) => {
    try {
        console.log("Entering saveMessageAIToBackend with message:", message);
        const response = await fetch(`${apiUrlPrefix}/chat/save_ai_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                chatSessionId,
                courseId,
                username,
                type,
                uid,
                input_message,
                university,
                sources,
                confidence_score: confident_score,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save message to the backend');
        }

        console.log('Message successfully saved to the backend');
    } catch (error) {
        console.log('Error saving message to the backend:', error);
    }
};


export const saveOnboardingStep = async ({
    chatId,
    userId,
    metadata,
    message,
    type,
  }: {
    chatId: string;
    userId: string;
    metadata?: string;
    message: string;
    type: 'ai' | 'human';
  }) => {
    try {
      const username = type === 'ai' ? 'Lucy' : 'onboardingstudent';
  
      await fetch(`${apiUrlPrefix}/chat/save_ai_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatSessionId: chatId,
          courseId: 'onboarding_course', // ou "" si inutile
          username,
          type,
          uid: userId,
          input_message: '',
          university: 'onboarding', // ou user.university
          ...(type === 'ai' && metadata ? { metadataOnboarding: metadata } : {}), // Ajoute metadata seulement si AI
        }),
      });
  
      console.log(`✅ Onboarding ${type} message saved successfully.`);
    } catch (error) {
      console.error(`❌ Error saving onboarding ${type} message:`, error);
    }
  };
  
  
//NOUVELLE FONCTION POUR ENREGISTRER LE FEEDBACK SANS POPUP
export const saveFeedback = async ({
    messageId,
    chatSessionId,
    isPositive,
    userId,
    aiMessageContent,
    humanMessageContent,
}: {
    messageId: number;
    chatSessionId: string;
    isPositive: boolean;
    userId: string;
    aiMessageContent?: string;
    humanMessageContent?: string;
}) => {
    try {
        console.log("Preparing to send feedback:");
        console.log("messageId:", messageId);
        console.log("chatSessionId:", chatSessionId);
        console.log("isPositive:", isPositive);
        console.log("userId:", userId);
        console.log("aiMessageContent:", aiMessageContent);
        console.log("humanMessageContent:", humanMessageContent);

        const payload = {
            message_id: messageId,
            chat_id: chatSessionId,
            is_positive: isPositive,
            user_id: userId,
            ai_message_content: aiMessageContent,
            human_message_content: humanMessageContent,
        };

        const response = await fetch(`${apiUrlPrefix}/chat/save_feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to save feedback - ${response.status}`);
        }

        // lire d'abord la réponse
        const responseData = await response.json();
        console.log("Feedback enregistré avec succès:", responseData);

        return responseData;
    } catch (error) {
        console.error("Error saving feedback:", error);
        throw error;
    }
};



