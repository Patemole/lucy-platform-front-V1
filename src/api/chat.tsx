// src/api/chat.tsx
import { AnswerDocumentPacket, Message, StreamingError } from "../interfaces/interfaces";
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
            messageId: null,
            message: message['body'],
            type: message['username'] === "TAI" ? "assistant" : "user",
        };
        if (Object.prototype.hasOwnProperty.call(message, 'documents')) {
            newMessage.documents = message.documents;
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
}

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

//////////////////////////////////////////////////////
// VERSION AVEC LE SOCRATICLANGRAPH
//////////////////////////////////////////////////////

export async function* sendMessageSocraticLangGraph({
    message,
    chatSessionId,
    courseId,
    username
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
