// src/api/chat.tsx
import { AnswerDocumentPacket,StreamingError } from "../interfaces/interfaces";
import {Message} from "../interfaces/interfaces_eleve";
import { AnswerPiecePacket } from "../interfaces/interfaces";
import { handleStream } from "./streaming_utils";
import config from '../config';  // Utilisez import au lieu de require

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;

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
        };
        if (Object.prototype.hasOwnProperty.call(message, 'documents')) {
            newMessage.citedDocuments = message.documents;
        }
        return newMessage;
    });

    return messages;
}



export interface SendMessageRequest {
    message: string;
    chatSessionId: string;
    courseId: string;
    username: string;
    university: string
}

// fonction dépréciée à enlever
export async function* sendMessage({
    message,
    chatSessionId,
    courseId,
    username
   
}: SendMessageRequest) {
    console.log("SENDING MESSAGE");
    const sendMessageResponse = await fetch(`${apiUrlPrefix}/chat/send_message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            course_id: courseId,
            username: username,
            message: message,
            chat_id: chatSessionId
        }),
    });
    if (!sendMessageResponse.ok) {
        const errorJson = await sendMessageResponse.json();
        const errorMsg = errorJson.message || errorJson.detail || "";
        throw Error(`Failed to send message - ${errorMsg}`);
    }

    yield* handleStream<
        AnswerPiecePacket | AnswerDocumentPacket | StreamingError
    >(sendMessageResponse);
}

// nouvelle version test 1
export async function* sendMessageSocraticLangGraph({
    message,
    chatSessionId,
    courseId,
    username,
    university

}: SendMessageRequest) {
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
            university: university
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
}: {
    message: string;
    chatSessionId: string;
    courseId: string;
    username: string;
    type: string;
}) => {
    try {
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

