import React from 'react';
import { Box, Button } from '@mui/material';
import { AIMessage } from '../../../components/main_components/MessagesWEB';
import LandingPage from '../../../components/main_components/LandingPageImprove'; // Ancienne Landing Page
import LandingPageV2 from '../../../components/main_components/landing_page_v2/LandingPageV2'; // Nouvelle Landing Page
import { Message } from '../../../interfaces/interfaces_eleve';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';

// Interface pour l'état AuthState (partielle, juste ce dont on a besoin ici)
interface PartialAuthState {
  user?: { onboardingComplete?: boolean } | null;
}

// Interface pour l'état ChatState (partielle, juste ce dont on a besoin ici)
interface PartialChatState {
  currentChatId: string | null;
  isLoadingMessages: boolean;
  isLoadingOnboardingMessage: boolean;
}

interface ChatContentProps {
    isLandingPageVisible: boolean;
    inputValue: string;
    setInputValue: (val: string) => void;
    messages: Message[];
    isComplete: boolean;
    drawerOpen: boolean;
    isSmallScreen: boolean;
    messageMarginX: string;
    endDivRef: React.RefObject<HTMLDivElement>;
    scrollableDivRef: React.RefObject<HTMLDivElement>;
    lastAiMessageId: number | null;
    relatedQuestions: string[];
    handleSendMessageFromLandingPage: (message: string) => void;
    handleSendTAKMessage: (message: string) => void;
    handleSendCOURSEMessage: (message: string) => void;
    handleFeedbackClick: (index: number) => void;
    handleWrongAnswerClick: (index: number) => void;
    handleSourceClick: (url: string) => void;
    isStreaming: boolean;
    hasNewContent: boolean;
    handleSendSCHOOLMessage: (value: string) => void;
    handleSendYEARMessage: (value: string) => void;
    handleSendTESTMessage: (value: string) => void;
    handleSendLINKEDINMessage: (value: string) => void;
    handleSendINSTAGRAMMessage: (value: string) => void;
    handleSendFAVORITE_COLORMessage: (value: string) => void;
    handleSendPET_NAMEMessage: (value: string) => void;
    handleSendMAJORMINORMessage: (data: { majors: string[]; minors: string[] }) => void;
    handleSendCOMPLIANCEMessage: (data: { termsAccepted: boolean; ageConfirmed: boolean }) => void;
    hasStartedStreaming: boolean;
    handlePrivacyChange: (newState: boolean) => void;
    setIsAtBottom: (val: boolean) => void;
    setNewMessagesCount: React.Dispatch<React.SetStateAction<number>>;
    userUniversity: string | null | undefined;
    handleSendSCHOOLKEDGEMessage: (value: string) => void;
  }


  const ChatContent: React.FC<ChatContentProps> = ({
    isLandingPageVisible,
    messages,
    isComplete,
    drawerOpen,
    isSmallScreen,
    messageMarginX,
    endDivRef,
    scrollableDivRef,
    lastAiMessageId,
    handleSendMessageFromLandingPage,
    handleSendTAKMessage,
    handleSendCOURSEMessage,
    handleFeedbackClick,
    handleWrongAnswerClick,
    handleSourceClick,
    isStreaming,
    hasNewContent,
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendTESTMessage,
    handleSendLINKEDINMessage,
    handleSendINSTAGRAMMessage,
    handleSendFAVORITE_COLORMessage,
    handleSendPET_NAMEMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
    hasStartedStreaming,
    handlePrivacyChange,
    setIsAtBottom,
    setNewMessagesCount,
    userUniversity,
    handleSendSCHOOLKEDGEMessage,
    setInputValue,
  }) => {
    console.log('<<< RENDERING ChatContent >>>');

    const theme = useTheme();
    const onboardingComplete = useAuthStore((state: PartialAuthState) => state.user?.onboardingComplete);
    const currentChatId = useChatStore((state: PartialChatState) => state.currentChatId);
    const isLoadingMessages = useChatStore((state: PartialChatState) => state.isLoadingMessages);
    const isLoadingOnboardingMessage = useChatStore((state) => state.isLoadingOnboardingMessage);

    // Déterminer si l'on est en environnement de production
    const isProduction = process.env.NODE_ENV === 'production';

    // Déterminer si la landing page doit être affichée
    const shouldShowLandingPage = 
      (onboardingComplete || !isLoadingOnboardingMessage) &&
      !isLoadingMessages &&
      (isLandingPageVisible || (currentChatId && messages.length === 0 && !!onboardingComplete));

    // Déterminer quelle landing page afficher (V2 pour UPenn, ancienne sinon)
    const useNewLandingPage = userUniversity === 'upenn';

    return (
        <>
           {shouldShowLandingPage ? (
        <>
            {useNewLandingPage ? (
                <LandingPageV2 
                    onSend={handleSendMessageFromLandingPage} 
                    userUniversity={userUniversity}
                    onTaskTextSelect={setInputValue}
                />
            ) : (
                <LandingPage 
                    onSend={handleSendMessageFromLandingPage} 
                    userUniversity={userUniversity}
                />
            )}
        </>
        ) : (
        <section
            aria-label="Chat content"
            className="flex-grow"
            style={{ 
              backgroundColor: 'transparent', 
              paddingBottom: '100px',
              overflow: 'hidden',
              height: '0'
            }}
        >
            <div
            className={`flex flex-col space-y-2 ${isSmallScreen ? 'px-1 py-4' : 'p-4'}`}
            ref={scrollableDivRef}
            onScroll={() => {
                const scrollDiv = scrollableDivRef.current;
                if (scrollDiv) {
                const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
                const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
                setIsAtBottom(atBottom);
                if (atBottom) setNewMessagesCount(0);
                }
            }}
            style={{
                overflowY: 'auto',
                height: '100%',
                touchAction: 'manipulation',
            }}
            >
            {messages.map((message, index) =>
                message.type === 'human' ? (
                <div
                    key={message.id}
                    className={`flex justify-end ${messageMarginX} ${index === 0 ? 'mt-8' : ''}`}
                >
                    <div className="max-w-3/4 w-full text-right">
                    <div className="flex items-center justify-end mb-1"></div>
                    <div className="flex justify-end">
                        <div
                        style={{
                            backgroundColor: theme.palette.button.background,
                            padding: '8px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            textAlign: 'left',
                            maxWidth: '75%',
                            marginRight: '12px',
                            fontSize: '1.05rem',
                            color: theme.palette.text_human_message_historic,
                        }}
                        >
                        {message.fileType ? (
                            <embed
                            src={message.content}
                            type={message.fileType === 'pdf' ? 'application/pdf' : 'video/mp4'}
                            width="100%"
                            height="200px"
                            />
                        ) : (
                            message.content
                        )}
                        </div>
                    </div>
                    </div>
                </div>
                ) : (
                <div key={message.id} className={`flex justify-start ${messageMarginX}`}>
                    <div className="max-w-3/4 w-full flex items-center">
                    <AIMessage
                        messageId={message.id}
                        content={message.content}
                        personaName={message.personaName}
                        citedDocuments={message.citedDocuments}
                        isComplete={isComplete}
                        hasDocs={!!message.citedDocuments?.length}
                        handleFeedback={(feedbackType) => handleFeedbackClick(index)}
                        handleWrongAnswerClick={() => handleWrongAnswerClick(index)}
                        handleSourceClick={handleSourceClick}
                        images={message.images}
                        takData={message.TAK}
                        CourseData={message.COURSE}
                        waitingMessages={message.waitingMessages}
                        ReasoningSteps={message.id === lastAiMessageId ? message.ReasoningSteps : undefined}
                        chartData={message.CHART}
                        drawerOpen={drawerOpen}
                        handleSendTAKMessage={handleSendTAKMessage}
                        handleSendCOURSEMessage={handleSendCOURSEMessage}
                        isGloballyStreaming={isStreaming}
                        isMessageLoading={message.isLoading ?? false}
                        hasNewContent={hasNewContent}
                        redditData={message.REDDIT}
                        instaData={message.INSTA}
                        youtubeData={message.YOUTUBE}
                        quoraData={message.QUORA}
                        errorData={message.ERROR}
                        confidenceScoreData={message.CONFIDENCESCORE}
                        instaclubData={message.INSTA_CLUB}
                        linkedinData={message.LINKEDIN}
                        insta2Data={message.INSTA2}
                        metadataOnboarding={message.METADATAONBOARDING || null}
                        handleSendSCHOOLMessage={handleSendSCHOOLMessage}
                        handleSendYEARMessage={handleSendYEARMessage}
                        handleSendTESTMessage={handleSendTESTMessage}
                        handleSendLINKEDINMessage={handleSendLINKEDINMessage}
                        handleSendINSTAGRAMMessage={handleSendINSTAGRAMMessage}
                        handleSendFAVORITE_COLORMessage={handleSendFAVORITE_COLORMessage}
                        handleSendPET_NAMEMessage={handleSendPET_NAMEMessage}
                        handleSendMAJORMINORMessage={handleSendMAJORMINORMessage}
                        handleSendCOMPLIANCEMessage={handleSendCOMPLIANCEMessage}
                        hasStartedStreaming={hasStartedStreaming}
                        userUniversity={userUniversity}
                        handleSendSCHOOLKEDGEMessage={handleSendSCHOOLKEDGEMessage}
                    />
                    </div>
                </div>
                )
            )}
            <div ref={endDivRef}></div>
            </div>
            </section>
        )}
    </>
    );
  };
  
  export default ChatContent;