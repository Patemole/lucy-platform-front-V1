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



/*
export async function getChatHistory(chat_id: string) {
    const getChatHistoryResponse = await fetch(
        `${apiUrlPrefix}/chat/get_chat_history/${chat_id}`,
        {
            method: "GET",
        }
    );
    if (!getChatHistoryResponse.ok) {
        console.log(
            `Failed to get chat history - ${getChatHistoryResponse.status}`
        );
        throw Error("Failed to get chat history");
    }
    const responseBody = await getChatHistoryResponse.json();

    const messages: Message[] = responseBody.map((message: any) => {
        const newMessage: Message = {
            id: message['message_id'],
            content: message['body'],
            type: message['username'] === "Lucy" ? "ai" : "human", // type de message, qui est "ai" si le username est "TAI", sinon "human".
            METADATAONBOARDING: undefined, // initialisé proprement
            citedDocuments: message['documents'] || [], // 👈 sécurité supplémentaire //to recuperer les sources du backend
        };

        if (Object.prototype.hasOwnProperty.call(message, 'step_metadata')) {
            newMessage.METADATAONBOARDING = Array.isArray(message.step_metadata)
                ? message.step_metadata[0]
                : message.step_metadata;
        }


        if (Object.prototype.hasOwnProperty.call(message, 'documents')) {
            newMessage.citedDocuments = Array.isArray(message.documents)
              ? message.documents.map((doc: any) => ({
                  document_id: doc.document_id,
                  document_name: doc.document_name,
                  link: doc.link,
                  source_type: doc.source_type
                }))
              : [];
          }

        if (Object.prototype.hasOwnProperty.call(message, 'documents')) {
            newMessage.citedDocuments = message.documents;
        }
        return newMessage;
    });

    return messages;
}
*/


export async function getChatHistory(chat_id: string) {
    const getChatHistoryResponse = await fetch(
      `${apiUrlPrefix}/chat/get_chat_history/${chat_id}`,
      {
        method: "GET",
      }
    );
  
    if (!getChatHistoryResponse.ok) {
      console.log(
        `Failed to get chat history - ${getChatHistoryResponse.status}`
      );
      throw Error("Failed to get chat history");
    }
  
    const responseBody = await getChatHistoryResponse.json();
  
    const messages: Message[] = responseBody.map((message: any) => {
      const newMessage: Message = {
        id: message['message_id'],
        content: message['body'],
        type: message['username'] === "Lucy" ? "ai" : "human",
        METADATAONBOARDING: undefined,
        citedDocuments: [], // Initialisation claire
        CONFIDENCESCORE: [], // initialisation en tableau comme dans onSubmit ✅
      };
  
      if (Object.prototype.hasOwnProperty.call(message, 'step_metadata')) {
        newMessage.METADATAONBOARDING = Array.isArray(message.step_metadata)
          ? message.step_metadata[0]
          : message.step_metadata;
      }
  
      if (Object.prototype.hasOwnProperty.call(message, 'sources')) {
        newMessage.citedDocuments = Array.isArray(message.sources)
          ? message.sources.map((source: any) => ({
              document_id: source.document_id,
              document_name: source.document_name,
              link: source.link,
              source_type: source.source_type
            }))
          : [];
      }


      if (Object.prototype.hasOwnProperty.call(message, 'confidence_score')) {
        newMessage.CONFIDENCESCORE = [{
          confidenceScore: message.confidence_score 
            ? message.confidence_score.toString() 
            : "0"  // valeur par défaut si null
        }];
      }
  
      return newMessage;
    });
  
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
                confident_score
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



/*
export const saveOnboardingStep = async ({
    chatId,
    userId,
    metadata,
    question,
    answer,
    isLastStep = false, // 👈 Paramètre supplémentaire avec valeur par défaut à false
  }: {
    chatId: string;
    userId: string;
    metadata: string;
    question: string;
    answer: string;
    isLastStep?: boolean; // 👈 optionnel
  }) => {
    try {
      // Message AI (Lucy) avec metadata
      if (!isLastStep) {
      await fetch(`${apiUrlPrefix}/chat/save_ai_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          chatSessionId: chatId,
          courseId: 'onboarding_course', // ou "" si inutile
          username: 'Lucy',
          type: 'ai',
          uid: userId,
          input_message: '',
          university: 'onboarding', // ou user.university
          metadataOnboarding: metadata, // 👈 à ajouter dans le backend
        }),
      });
    }
  
      // Message de l'étudiant
      if (answer && answer.trim() !== '') {
      await fetch(`${apiUrlPrefix}/chat/save_ai_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: answer,
          chatSessionId: chatId,
          courseId: 'onboarding_course',
          username: 'onboardingstudent', // 👈 distinct pour pouvoir filtrer
          type: 'human',
          uid: userId,
          input_message: '',
          university: 'onboarding',
        }),
      });
    }
  
      console.log(`✅ Onboarding step '${metadata}' saved as two messages`);
    } catch (error) {
      console.error('❌ Error saving onboarding step:', error);
    }
  };
*/


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
  


