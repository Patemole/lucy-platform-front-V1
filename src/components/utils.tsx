//To be depreciated
import { RefObject } from "react";
import { ChatSession, Message } from "../interfaces/interfaces";
export function groupSessionsByDateRange(chatSessions: ChatSession[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison

    const groups: Record<string, ChatSession[]> = {
        Today: [],
        "Previous 7 Days": [],
        "Previous 30 Days": [],
        "Over 30 days ago": [],
    };

    chatSessions.forEach((chatSession) => {
        const chatSessionDate = new Date(chatSession.time_created);

        const diffTime = today.getTime() - chatSessionDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24); // Convert time difference to days

        if (diffDays < 1) {
            groups["Today"].push(chatSession);
        } else if (diffDays <= 7) {
            groups["Previous 7 Days"].push(chatSession);
        } else if (diffDays <= 30) {
            groups["Previous 30 Days"].push(chatSession);
        } else {
            groups["Over 30 days ago"].push(chatSession);
        }
    });

    return groups;
}

export function getLastSuccessfulMessageId(messageHistory: Message[]) {
    const lastSuccessfulMessage = messageHistory
        .slice()
        .reverse()
        .find(
            (message) =>
                message.type === "assistant" &&
                message.messageId !== -1 &&
                message.messageId !== null
        );
    return lastSuccessfulMessage ? lastSuccessfulMessage?.messageId : null;
}

export function handleAutoScroll(
    endRef: RefObject<any>,
    scrollableRef: RefObject<any>,
    isUserScrolling: boolean, // Indicates if the user is scrolling
    buffer: number = 300
) {
    console.log('🔄 handleAutoScroll appelé');
    console.log(`📌 Parameters - isUserScrolling: ${isUserScrolling}, buffer: ${buffer}`);

    if (!endRef?.current || !scrollableRef?.current) {
        console.log('❌ Refs non disponibles');
        return;
    }

    const { scrollHeight, scrollTop, clientHeight } = scrollableRef.current;
    console.log(`📏 scrollHeight: ${scrollHeight}, scrollTop: ${scrollTop}, clientHeight: ${clientHeight}`);

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    console.log(`📉 distanceFromBottom: ${distanceFromBottom}`);

    // Si l'utilisateur ne défile pas manuellement et que la distance du bas est inférieure ou égale au buffer, activer l'auto-scroll
    if (!isUserScrolling && distanceFromBottom <= buffer) {
        console.log('✅ Conditions remplies pour l\'auto-scroll');
        endRef.current.scrollIntoView({ behavior: "smooth" });
        console.log('🎯 Scrolling vers la fin déclenché');
    } else {
        console.log('❌ Conditions non remplies pour l\'auto-scroll');
    }
}

export function getHumanAndAIMessageFromMessageNumber(
    messageHistory: Message[],
    messageId: number
) {
    let messageInd;
    // -1 is special -> means use the last message
    if (messageId === -1) {
        messageInd = messageHistory.length - 1;
    } else {
        messageInd = messageHistory.findIndex(
            (message) => message.messageId === messageId
        );
    }
    if (messageInd !== -1) {
        const matchingMessage = messageHistory[messageInd];
        const pairedMessage =
            matchingMessage.type === "user"
                ? messageHistory[messageInd + 1]
                : messageHistory[messageInd - 1];

        const humanMessage =
            matchingMessage.type === "user" ? matchingMessage : pairedMessage;
        const aiMessage =
            matchingMessage.type === "user" ? pairedMessage : matchingMessage;

        return {
            humanMessage,
            aiMessage,
        };
    } else {
        return {
            humanMessage: null,
            aiMessage: null,
        };
    }
}