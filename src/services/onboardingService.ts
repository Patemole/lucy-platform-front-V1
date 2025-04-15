import { Message } from '../interfaces/interfaces_eleve';
import useChatStore from '../stores/useChatStore';

export const onboardingMessages = [
  { question: "What is your current school?", metadata: "SCHOOL" },
  { question: "What year are you in?", metadata: "YEAR" },
  { question: "What is you linkedin URL?", metadata: "LINKEDIN" },
  { question: "What is your major and minor?", metadata: "MAJOR&MINOR" },
  { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" },
];

export async function streamOnboardingMessage(
  messageContent: string,
  metadata: string,
  messageId: number,
  currentMessages: Message[]
): Promise<Message[]> {
  const chunks = messageContent.split(' ');
  let displayedContent = '';
  let workingMessages = [...currentMessages];
  const chatStore = useChatStore.getState();

  // Vérifier si le message existe déjà
  const messageExists = workingMessages.some(msg => msg.id === messageId);
  if (!messageExists) {
    const loadingMsg: Message = {
      id: messageId,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
      METADATAONBOARDING: metadata,
      isLoading: true
    };
    workingMessages = [...workingMessages, loadingMsg];
    chatStore.setMessages(workingMessages);
  }

  // Simuler le streaming
  for (const chunk of chunks) {
    displayedContent += chunk + ' ';
    workingMessages = workingMessages.map((msg: Message) =>
      msg.id === messageId ? { ...msg, content: displayedContent.trim(), isLoading: true } : msg
    );
    chatStore.setMessages(workingMessages);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Finaliser le message
  const finalMessages = workingMessages.map((msg: Message) =>
    msg.id === messageId ? { ...msg, isLoading: false } : msg
  );
  chatStore.setMessages(finalMessages);
  chatStore._setIsStreamingResponse(false);

  return finalMessages;
}

export async function startOnboarding() {
  const chatStore = useChatStore.getState();
  const messageId = Date.now();
  const firstMessage = onboardingMessages[0];

  // Préparer l'état initial
  chatStore.setIsLandingPageVisible(false);
  chatStore._setRelatedQuestions([]);
  chatStore._setIsStreamingResponse(true);

  // Créer et afficher le message initial
  const initialMessage: Message = {
    id: messageId,
    type: 'ai',
    content: '',
    personaName: 'Lucy',
    METADATAONBOARDING: firstMessage.metadata,
    isLoading: true
  };

  chatStore.setMessages([initialMessage]);

  // Streamer le premier message
  await streamOnboardingMessage(
    firstMessage.question,
    firstMessage.metadata,
    messageId,
    [initialMessage]
  );
} 