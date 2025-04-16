import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Message } from '../interfaces/interfaces_eleve';

interface FeedbackStore {
  feedbackStatus: { [key: number]: boolean };
  setFeedbackStatus: (messageId: number, status: boolean) => void;
  shouldShowFeedback: (messages: Message[], isStreamingResponse: boolean) => boolean;
  getLastAiMessageAndContext: (messages: Message[]) => { aiMessage: Message | null; humanMessage: Message | null };
}

const useFeedbackStore = create<FeedbackStore>()(
  devtools(
    (set, get): FeedbackStore => ({
      feedbackStatus: {},
      
      setFeedbackStatus: (messageId: number, status: boolean) => {
        set((state: FeedbackStore) => ({
          feedbackStatus: {
            ...state.feedbackStatus,
            [messageId]: status,
          },
        }));
      },

      shouldShowFeedback: (messages: Message[], isStreamingResponse: boolean) => {
        if (!messages.length || isStreamingResponse) return false;
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.type !== 'ai') return false;
        
        const aiMessageCount = messages.filter(msg => msg.type === 'ai').length;
        return aiMessageCount > 0 && aiMessageCount % 4 === 0 && !get().feedbackStatus[lastMessage.id];
      },
      

      getLastAiMessageAndContext: (messages: Message[]) => {
        if (!messages.length) return { aiMessage: null, humanMessage: null };
        
        const aiMessageIndex = [...messages].reverse().findIndex(msg => msg.type === 'ai');
        if (aiMessageIndex === -1) return { aiMessage: null, humanMessage: null };
        
        const aiMessage = messages[messages.length - 1 - aiMessageIndex];
        
        const humanMessageIndex = messages.length - 1 - aiMessageIndex - 1;
        const humanMessage = humanMessageIndex >= 0 ? messages[humanMessageIndex] : null;
        
        return { aiMessage, humanMessage };
      },
    }),
    { name: "FeedbackStore" }
  )
);

export default useFeedbackStore; 