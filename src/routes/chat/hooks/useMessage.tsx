import { useRef } from 'react';
import { useEffect} from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
//import { useAuth } from '../../../auth/hooks/useAuth';
//import { useChat } from '../../../auth/hooks/useChat';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend } from '../../../api/chat';
import { submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../../../api/feedback_wrong_answer';
import { Message, StreamingError,AnswerPiecePacket, AnswerDocumentPacket, Conversation, SocialThread, AnswerDocument, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR, AnswerACCURACYSCORE, AnswerTITLEANDCATEGORY } from '../../../interfaces/interfaces_eleve';
import { debounce, throttle } from 'lodash';
import { KeyboardEvent } from 'react';
import useChatStore from '../../../stores/useChatStore'; // Importer le store
import useAuthStore from '../../../stores/useAuthStore'; // Importer le store d'authentification



export const useMessage = ({
  generateUniqueId,
  inputValue,
  setInputValue,
  setHasNewContent,
  scrollableDivRef,
  isAtBottom,
  setIsAtBottom,
  setNewMessagesCount,
  endDivRef,
  setSelectedAiMessage,
  setSelectedHumanMessage,
  setModalOpen,
  setSnackbarOpen,
}: {
  generateUniqueId: () => number;
  inputValue: string;
  setInputValue: (val: string) => void;
  setHasNewContent: (val: boolean) => void;
  scrollableDivRef: React.RefObject<HTMLDivElement>;
  isAtBottom:boolean;
  setIsAtBottom: (val: boolean) => void;
  setNewMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  endDivRef: React.RefObject<HTMLDivElement>;
  setSelectedAiMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedHumanMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

    const { user, chatIds } = useAuthStore();
    const {
      messages,
      setMessages,
      conversations,
      setConversations,
      socialThreads,
      setSocialThreads,
      setIsLandingPageVisible,
      setAbortController,
      isStreamingResponse: isStreaming,
      _setIsStreamingResponse: setIsStreaming,
      _setRelatedQuestions: setRelatedQuestions,
    } = useChatStore();


    /*
     // Autoscroll logic based on isAtBottom
    useEffect(() => {
        if (isAtBottom) {
        scrollToBottom();
        } else {
        setNewMessagesCount((prevCount) => prevCount + 1);
        }
    }, [messages, isAtBottom]); // Depend on messages and isAtBottom
    */


    //Scrolling useffect for autoscrolling I think
    useEffect(() => {
        const handleScroll = debounce(() => {
        const scrollDiv = scrollableDivRef.current;
        if (scrollDiv) {
            const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
            const atBottom = scrollTop + clientHeight >= scrollHeight - 100; // Adjust threshold as needed
            setIsAtBottom(atBottom);
            if (atBottom) setNewMessagesCount(0);
        }
        }, 100); // Delay of 100ms
    
        const scrollDiv = scrollableDivRef.current;
        scrollDiv?.addEventListener('scroll', handleScroll);
    
        return () => scrollDiv?.removeEventListener('scroll', handleScroll);
    }, []);

//------------------------------------------------------------------------

    //Permet d ouvrir le lien de la source recupere depuis AIMessage
    const handleSourceClick = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer"); // Ouvre dans un nouvel onglet
    };


    // Fonction pour envoyer le message à l'AI ou à l'API
    const onSubmit = async (messageHistory: Message[], inputValue: string, isOnboardingMessage: boolean = false) => {
        console.log(`[useMessage onSubmit START] Input: "${inputValue}", History length: ${messageHistory.length}, IsOnboarding: ${isOnboardingMessage}`);
        setIsStreaming(true);
        setHasNewContent(false);
        // Variables locales pour accumuler les changements avant la mise à jour throttled
        let currentAnswerChunk = '';
        let currentCitedDocuments: AnswerDocument[] = [];
        let currentImages: { image_id: string; image_url: string; image_description?: string }[] = [];
        let currentRelatedQuestions: string[] = [];
        let currentTAK: AnswerTAK[] = [];
        let currentCHART: AnswerCHART[] = [];
        let currentCourse: AnswerCourse[] = [];
        let currentWaiting: AnswerWaiting[] = [];
        let currentReasoning: ReasoningStep[] = [];
        let currentREDDIT: AnswerREDDIT[] = [];
        let currentINSTA: AnswerINSTA[] = [];
        let currentINSTA2: AnswerINSTA2[] = [];
        let currentYOUTUBE: AnswerYOUTUBE[] = [];
        let currentQUORA: AnswerQUORA[] = [];
        let currentINSTA_CLUB: AnswerINSTA_CLUB[] = [];
        let currentLINKEDIN: AnswerLINKEDIN[] = [];
        let currentERROR: AnswerERROR[] = [];
        let currentACCURACYSCORE: AnswerACCURACYSCORE[] = [];
        let currentTITLEANDCATEGORY: AnswerTITLEANDCATEGORY[] = [];

        let error: string | null = null;
        const lastAiMessageId = messageHistory[messageHistory.length - 1]?.id; // ID du message AI à mettre à jour

        // Fonction pour mettre à jour l'état (via le store)
        const updateStoreMessage = () => {
            console.log(`[useMessage updateStoreMessage THROTTLED CALL] Updating message ID: ${lastAiMessageId} with partial content.`);
            const currentMessages = useChatStore.getState().messages;
            const messageIndex = currentMessages.findIndex(m => m.id === lastAiMessageId);
            if (messageIndex === -1) return; // Message non trouvé

            const updatedMessages = [...currentMessages];
            const messageToUpdate = updatedMessages[messageIndex];

            updatedMessages[messageIndex] = {
                ...messageToUpdate,
                content: currentAnswerChunk, // Utiliser le contenu accumulé
                // Fusionner les métadonnées accumulées
                citedDocuments: [...(messageToUpdate.citedDocuments || []), ...currentCitedDocuments],
                images: [...(messageToUpdate.images || []), ...currentImages],
                TAK: [...(messageToUpdate.TAK || []), ...currentTAK],
                CHART: [...(messageToUpdate.CHART || []), ...currentCHART],
                COURSE: [...(messageToUpdate.COURSE || []), ...currentCourse],
                waitingMessages: currentWaiting.length > 0 ? [...(messageToUpdate.waitingMessages || []), ...currentWaiting] : messageToUpdate.waitingMessages,
                ReasoningSteps: [...(messageToUpdate.ReasoningSteps || []), ...currentReasoning],
                REDDIT: [...(messageToUpdate.REDDIT || []), ...currentREDDIT],
                INSTA: [...(messageToUpdate.INSTA || []), ...currentINSTA],
                YOUTUBE: [...(messageToUpdate.YOUTUBE || []), ...currentYOUTUBE],
                QUORA: [...(messageToUpdate.QUORA || []), ...currentQUORA],
                ERROR: [...(messageToUpdate.ERROR || []), ...currentERROR],
                CONFIDENCESCORE: [...(messageToUpdate.CONFIDENCESCORE || []), ...currentACCURACYSCORE],
                INSTA_CLUB: [...(messageToUpdate.INSTA_CLUB || []), ...currentINSTA_CLUB],
                LINKEDIN: [...(messageToUpdate.LINKEDIN || []), ...currentLINKEDIN],
                INSTA2: [...(messageToUpdate.INSTA2 || []), ...currentINSTA2],
                isLoading: true, // Toujours en cours pendant le throttle
            };

            useChatStore.getState().setMessages(updatedMessages);
            // Réinitialiser les accumulateurs locaux après la mise à jour du store
            currentCitedDocuments = [];
            currentImages = [];
            currentTAK = [];
            currentCHART = [];
            currentCourse = [];
            currentWaiting = [];
            currentReasoning = [];
            currentREDDIT = [];
            currentINSTA = [];
            currentYOUTUBE = [];
            currentQUORA = [];
            currentERROR = [];
            currentACCURACYSCORE = [];
            currentINSTA_CLUB = [];
            currentLINKEDIN = [];
            currentINSTA2 = [];
            // Ne pas réinitialiser currentRelatedQuestions ou currentTITLEANDCATEGORY car ils arrivent généralement en fin de stream
        };

        // Créer la version throttled de la mise à jour du store
        const throttledUpdateStoreMessage = throttle(updateStoreMessage, 150, { leading: true, trailing: false });


        const abortController = new AbortController();
        setAbortController(abortController);

        try {
            const chatSessionId = useChatStore.getState().currentChatId;

            if (!chatSessionId) {
                console.error("onSubmit: currentChatId is null. Cannot send message.");
                setIsStreaming(false);
                setAbortController(null);
                return;
            }

            const courseId = 'default_course_id';
            const username = user?.name || 'default_username_OnSubmitFunction';
            const university = user?.university || 'University Name';
            const linkedin_profile = user?.linkedin_profile || 'nolinkedinprofile';
            const year = user?.year || 'Null';
            const interests = Array.isArray(user?.interests) ? user?.interests : ['No interest']; //Adding new interest into Lucy
            const student_profile = localStorage.getItem('student_profile') || 'Brief profile description';
            const major = Array.isArray(user?.major) ? user?.major : ['None_Default'];
            const minor = Array.isArray(user?.minor) ? user?.minor : ['None_Default'];
            const faculty = Array.isArray(user?.faculty) ? user?.faculty : ['None_Default'];

            console.log('chatSessionId:', chatSessionId);
            console.log('username:', username);
            console.log('university:', university);
            console.log('interests', interests);
            console.log('major:', major);
            console.log('minor:', minor);
            console.log('year:', year);
            console.log('faculty:', faculty);

            const lastMessageIndex = messageHistory.length - 1;

            console.log("Voici la valeur de chatSessionID", chatSessionId)
            console.log("Contenu de conversations:", conversations);

            let currentConversation = null;

            if (isOnboardingMessage) {
              const newConv: Conversation = { chat_id: chatSessionId, name: 'New Chat', thread_type: 'Public' };
              // Get current state, create new array, pass new array to setter
              const currentConversations = useChatStore.getState().conversations;
              setConversations([newConv, ...currentConversations]);
              currentConversation = newConv; // ✅ tu sais que tu viens de l'ajouter
            } else {
              currentConversation = conversations.find((conv) => conv.chat_id === chatSessionId);
            }

            const isFirstMessage = currentConversation?.name === 'New Chat';

            console.log("This is the name of the current conversation", currentConversation?.name)
            console.log("This is the value of isFirstMessage", isFirstMessage)
            console.log("This is the value for onboardingMessage", isOnboardingMessage)

        

            for await (const packetBunch of sendMessageSocraticLangGraph({
                message: inputValue,
                chatSessionId: chatSessionId,
                courseId: courseId,
                username: username,
                university: university,
                interests: interests || [],
                student_profile: student_profile,
                major: major || [],
                minor: minor || [],
                year: year,
                faculty: faculty || [],
                isFirstMessage: isFirstMessage,
                user: user,
                isOnboardingMessage: isOnboardingMessage,
            },
            abortController.signal
        )) {
            console.log(`[useMessage onSubmit] Received packet bunch.`);
                // Vérifier si la conversation a été annulée via le store (si nécessaire, mais AbortController suffit)
                // if (useChatStore.getState().isCancellationRequested) { ... }

                // Process each packet in the packet bunch
                if (Array.isArray(packetBunch)) {
                    for (const packet of packetBunch) {
                        if (typeof packet === 'string') {
                            setHasNewContent(true); // Detects new content
                            currentAnswerChunk += packet.replace(/\|/g, ''); // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
                            currentAnswerChunk += (packet as AnswerPiecePacket).answer_piece; // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
                            currentImages.push((packet as any).image_data); // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
                            currentTAK.push((packet as any).answer_TAK_data); // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_CHART_data')) {
                            currentCHART.push((packet as any).answer_CHART_data); // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
                            currentCourse.push((packet as any).answer_COURSE_data); // Accumuler localement
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'reasoning_steps')) {
                            currentReasoning.push((packet as any).reasoning_steps); // Accumuler localement
                            console.log("Étapes de raisonnement ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'reddit')) {
                            currentREDDIT.push((packet as any).reddit); // Accumuler localement
                            console.log("Reddit ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta')) {
                            currentINSTA.push((packet as any).insta); // Accumuler localement
                            console.log("Insta ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta2')) {
                            currentINSTA2.push((packet as any).insta2); // Accumuler localement
                            console.log("Insta2 ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta_club')) {
                            currentINSTA_CLUB.push((packet as any).insta_club); // Accumuler localement
                            console.log("Insta club ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'linkedin')) {
                            currentLINKEDIN.push((packet as any).linkedin); // Accumuler localement
                            console.log("Linkedin ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'youtube')) {
                            currentYOUTUBE.push((packet as any).youtube); // Accumuler localement
                            console.log("Youtube ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'quora')) {
                            currentQUORA.push((packet as any).quora); // Accumuler localement
                            console.log("Quora ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'error_back')) {
                            currentERROR.push((packet as any).error_back); // Accumuler localement
                            console.log("Error ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'accuracy_score')) {
                            currentACCURACYSCORE.push((packet as any).accuracy_score); // Accumuler localement
                            console.log("Accuracy score ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'classification_title_result')) {
                            currentTITLEANDCATEGORY.push((packet as any).classification_title_result); // Accumuler localement
                            console.log("title and category ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
                            currentWaiting = (packet as any).answer_waiting; // Accumuler localement (remplace, ne fusionne pas ici)
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
                            error = (packet as StreamingError).error;
                        }
                    }
                } else if (typeof packetBunch === 'object' && packetBunch !== null) {
                    // Gérer les paquets uniques (qui sont moins fréquents, donc on peut les accumuler directement)
                    if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
                        currentCitedDocuments.push((packetBunch as AnswerDocumentPacket).answer_document); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
                        currentImages.push((packetBunch as any).image_data); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
                        currentTAK.push((packetBunch as any).answer_TAK_data); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reasoning_steps')) {
                        currentReasoning.push((packetBunch as any).reasoning_steps); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reddit')) {
                        currentREDDIT.push((packetBunch as any).reddit); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta')) {
                        currentINSTA.push((packetBunch as any).insta); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta2')) {
                        currentINSTA2.push((packetBunch as any).insta2); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta_club')) {
                        currentINSTA_CLUB.push((packetBunch as any).insta_club); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'linkedin')) {
                        currentLINKEDIN.push((packetBunch as any).linkedin); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'youtube')) {
                        currentYOUTUBE.push((packetBunch as any).youtube); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'quora')) {
                        currentQUORA.push((packetBunch as any).quora); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error_back')) {
                        currentERROR.push((packetBunch as any).error_back); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'accuracy_score')) {
                        currentACCURACYSCORE.push((packetBunch as any).accuracy_score); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'classification_title_result')) {
                        currentTITLEANDCATEGORY.push((packetBunch as any).classification_title_result); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_CHART_data')) {
                        currentCHART.push((packetBunch as any).answer_CHART_data); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
                        currentCourse.push((packetBunch as any).answer_COURSE_data); // Accumuler
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
                        currentRelatedQuestions = (packetBunch as any).related_questions; // Remplacer
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
                        currentWaiting = (packetBunch as any).answer_waiting; // Remplacer
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
                        error = (packetBunch as StreamingError).error;
                    }
                }

                // Appeler la fonction throttled pour mettre à jour le store
                if (!error) {
                    throttledUpdateStoreMessage();
                }
            }

            // --- Finalisation après la boucle de streaming ---
            throttledUpdateStoreMessage.cancel(); // Annuler tout appel throttled en attente

            // Mise à jour finale et sauvegarde si pas d'erreur
            if (!error) {
                // Mettre à jour l'état final une dernière fois avec toutes les données accumulées
                console.log(`[useMessage onSubmit] Finalizing message ID: ${lastAiMessageId} after stream.`);
                const finalMessages = useChatStore.getState().messages;
                const finalMessageIndex = finalMessages.findIndex(m => m.id === lastAiMessageId);
                if (finalMessageIndex !== -1) {
                    const updatedFinalMessages = [...finalMessages];
                    const finalMessageToUpdate = updatedFinalMessages[finalMessageIndex];
                    updatedFinalMessages[finalMessageIndex] = {
                        ...finalMessageToUpdate,
                        content: currentAnswerChunk,
                        citedDocuments: [...(finalMessageToUpdate.citedDocuments || []), ...currentCitedDocuments],
                        images: [...(finalMessageToUpdate.images || []), ...currentImages],
                        TAK: [...(finalMessageToUpdate.TAK || []), ...currentTAK],
                        CHART: [...(finalMessageToUpdate.CHART || []), ...currentCHART],
                        COURSE: [...(finalMessageToUpdate.COURSE || []), ...currentCourse],
                        waitingMessages: currentWaiting.length > 0 ? [...(finalMessageToUpdate.waitingMessages || []), ...currentWaiting] : finalMessageToUpdate.waitingMessages,
                        ReasoningSteps: [...(finalMessageToUpdate.ReasoningSteps || []), ...currentReasoning],
                        REDDIT: [...(finalMessageToUpdate.REDDIT || []), ...currentREDDIT],
                        INSTA: [...(finalMessageToUpdate.INSTA || []), ...currentINSTA],
                        YOUTUBE: [...(finalMessageToUpdate.YOUTUBE || []), ...currentYOUTUBE],
                        QUORA: [...(finalMessageToUpdate.QUORA || []), ...currentQUORA],
                        ERROR: [...(finalMessageToUpdate.ERROR || []), ...currentERROR],
                        CONFIDENCESCORE: [...(finalMessageToUpdate.CONFIDENCESCORE || []), ...currentACCURACYSCORE],
                        INSTA_CLUB: [...(finalMessageToUpdate.INSTA_CLUB || []), ...currentINSTA_CLUB],
                        LINKEDIN: [...(finalMessageToUpdate.LINKEDIN || []), ...currentLINKEDIN],
                        INSTA2: [...(finalMessageToUpdate.INSTA2 || []), ...currentINSTA2],
                        isLoading: false, // Terminé!
                    };
                    useChatStore.getState().setMessages(updatedFinalMessages);
                    console.log(`[useMessage onSubmit] Final message state set for ID: ${lastAiMessageId}.`);
                }

                setRelatedQuestions(currentRelatedQuestions); // Mettre à jour les questions liées finales

                // Mise à jour du titre/catégorie si nécessaire (déplacé de la boucle)
                if (currentTITLEANDCATEGORY.length > 0) {
                  const { category: newCategory, conversation_title: newTitle } = currentTITLEANDCATEGORY[0];
                  const chatSessionId = useChatStore.getState().currentChatId;
                  if (chatSessionId) {
                      useChatStore.getState().updateConversationTitleAndTopic(chatSessionId, newTitle, newCategory);
                  }
                }

                // Sauvegarde Backend
                if (!user?.id) {
                    throw new Error("L'ID utilisateur (uid) est manquant.");
                }
                console.log("Conversation active -> Envoi du message AI finalisé au backend");
                await saveMessageAIToBackend({
                    message: currentAnswerChunk, // Contenu final
                    chatSessionId: useChatStore.getState().currentChatId || '', // ID du chat courant
                    courseId: 'default_course_id',
                    username: 'Lucy',
                    type: 'ai',
                    uid: user.id,
                    input_message: inputValue,
                    university: user.university || '',
                    // Inclure ici les métadonnées finales si nécessaire pour la sauvegarde
                    // confident_score: currentACCURACYSCORE[0]?.confidenceScore ? parseFloat(currentACCURACYSCORE[0].confidenceScore) : null,
                    // sources: currentCitedDocuments.map(doc => ({...})), // etc.
                });
                console.log(`[useMessage onSubmit] AI message saved to backend for ID: ${lastAiMessageId}.`);

            } else {
                console.log(`[useMessage onSubmit] Stream finished with error or cancellation for message ID: ${lastAiMessageId}. No final update/save.`);
                // Optionnel: Mettre à jour le message AI pour indiquer l'erreur/annulation si nécessaire
            }

        } catch (e: any) {
            if (e.name === 'AbortError') {
            console.log('[useMessage onSubmit] Stream aborted by user.');
            // setIsStreaming(false); // Déjà dans finally
            // setHasNewContent(false); // Déjà dans finally ou reset avant appel
            // Optionnel : Ajouter une indication à l'UI pour signaler que la réponse est stoppée
            } else {
            console.error('[useMessage onSubmit] Error during streaming:', e.message);
             // Get current state, create new array, pass new array to setter
            const currentMessagesWithError = useChatStore.getState().messages;
            const errorMsg: Message = {
                id: Date.now(),
                type: 'error',
                content: 'An error occurred. Try to send the message again or open a new chat.',
            };
            setMessages([...currentMessagesWithError, errorMsg]);
            }
        } finally {
            setIsStreaming(false);
            setAbortController(null);
            console.log(`[useMessage onSubmit END] Input: "${inputValue}"`);
        }
    };


    //pernmet d envoyer le message qu on a choisi dans tak en cliquant sur le composant
    const handleSendTAKMessage = (TAK_message: string) => {
        if (TAK_message.trim() === '') return;

        const newMessage: Message = { id: Date.now(), type: 'human', content: TAK_message };
        const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true }; // Add isLoading
        const currentMessages = useChatStore.getState().messages;
        const messagesWithHuman = [...currentMessages, newMessage];
        setMessages(messagesWithHuman);
        const messagesWithLoading = [...messagesWithHuman, loadingMessage];
        setMessages(messagesWithLoading);

        onSubmit(messagesWithLoading, TAK_message);
    };


    //permet d envoyer le message qu on a choisi dans le coursemessage en cliquant sur le composant
    const handleSendCOURSEMessage = (COURSE_message: string) => {
        if (COURSE_message.trim() === '') return;

        const newMessage: Message = { id: Date.now(), type: 'human', content: COURSE_message };
        const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true }; // Add isLoading
        const currentMessages = useChatStore.getState().messages;
        const messagesWithHuman = [...currentMessages, newMessage];
        setMessages(messagesWithHuman);
        const messagesWithLoading = [...messagesWithHuman, loadingMessage];
        setMessages(messagesWithLoading);

        onSubmit(messagesWithLoading, COURSE_message);
    };



    const handleSendMessageFromLandingPage = (message: string) => {
        console.log("handleSendMessageFromLandingPage called with message:", message);
        console.log("Before adding message, messages.length:", messages.length);
    
        if (message.trim() !== '') {
        const wasEmpty = (messages.length === 0);
        console.log("wasEmpty (was the conversation empty before this message?):", wasEmpty);
    
        const newMessage: Message = { id: Date.now(), type: 'human', content: message };
        const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy' };
    
        // Créer un nouveau tableau de messages, incluant le message humain et le message "en cours"
        const newMessagesArray = [...messages, newMessage, loadingMessage];
        console.log("New messages array length after adding newMessage and loadingMessage:", newMessagesArray.length);
    
        // Met à jour l'état des messages
        setMessages(newMessagesArray);
    
        console.log("Calling onSubmit with newMessagesArray and message:", message);
        onSubmit(newMessagesArray, message);
    
        setInputValue('');
        setIsLandingPageVisible(false);
        } else {
        console.log("Message was empty, no action taken.");
        }
    };


    //fonction qui gere differents etats et les messages avant d aller traiter la reponse par onsubmit
    const handleSendMessageSocraticLangGraph = (message: string) => {
        if (message.trim() === '') return;

        // Masquer la LandingPage après l'envoi du premier message
        setIsLandingPageVisible(false);
        setRelatedQuestions([]);
        setIsStreaming(true);

        const newMessage: Message = { id: generateUniqueId(), type: 'human', content: message };
        const loadingMessage: Message = { id: generateUniqueId() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true }; // Add isLoading
        const currentMessages = useChatStore.getState().messages;
        const messagesWithHuman = [...currentMessages, newMessage];
        setMessages(messagesWithHuman);
        const messagesWithLoading = [...messagesWithHuman, loadingMessage];
        setMessages(messagesWithLoading);

        onSubmit(messagesWithLoading, message);
        setInputValue('');
    };


    //const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent) => {
    const handleInputKeyPressSocraticLangGraph = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
        if (isStreaming) {
            console.warn("Cannot send a new message while the AI is responding. Please stop the current response first.");
            event.preventDefault(); // Prevents sending the message
        } else {
            event.preventDefault();
            handleSendMessageSocraticLangGraph(inputValue);
        }
        }
    };


    const scrollToBottom = () => {
        if (endDivRef.current) {
        endDivRef.current.scrollIntoView({ behavior: 'smooth' });
        setIsAtBottom(true); // Mettre à jour l'état pour refléter que nous sommes en bas
        setNewMessagesCount(0); // Réinitialiser le compteur de nouveaux messages
        }
    };

    const scrollToBottomNewMessage = () => {
        if (endDivRef.current) {
        endDivRef.current.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
        }
    };


//-------PART FOR FEEDBACK MESSAGE----------

    const handleSubmitWrongAnswerFeedback = async (
        feedback: string,
        aiMessageContent: string | null,
        humanMessageContent: string | null,
        ratings: { relevance?: number; accuracy?: number; format?: number; sources?: number; overall_satisfaction?: number }
    ) => {
        const uid = user?.id || 'default_uid';
        const chatId = useChatStore.getState().currentChatId || 'default_chat_id';
    
        await submitFeedbackWrongAnswer({
        userId: uid,
        chatId,
        aiMessageContent: aiMessageContent || 'default_ai_message',
        humanMessageContent: humanMessageContent || 'default_human_message',
        feedback,
        ...ratings,
        });
    
        setSnackbarOpen(true);
        handleCloseWrongAnswerModal();
    };


    const handleWrongAnswerClick = (index: number) => {
        const currentMessage = messages[index];
        const previousMessage = index > 0 ? messages[index - 1] : null;
        setSelectedAiMessage(currentMessage.content);
        setSelectedHumanMessage(previousMessage ? previousMessage.content : null);
        setModalOpen(true);
        //setSnackbarOpen(true);
    };


    const handleFeedbackClick = async (index: number) => {
        const currentMessage = messages[index];
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const uid = user?.id || 'default_uid';
        const chatId = useChatStore.getState().currentChatId || 'default_chat_id';


        await submitFeedbackGoodAnswer({
        userId: uid,
        chatId,
        aiMessageContent: currentMessage.content || 'default_ai_message',
        humanMessageContent: previousMessage ? previousMessage.content : 'default_human_message',
        feedback: 'positive',
        });

        setSnackbarOpen(true);
    };

    //Close the popup to fill when click on the thumb up or down
    const handleCloseWrongAnswerModal = () => {
        setModalOpen(false);
    };

    return {
        onSubmit,
        handleSendMessageFromLandingPage,
        handleSendTAKMessage,
        handleSendCOURSEMessage,
        handleSendMessageSocraticLangGraph,
        handleInputKeyPressSocraticLangGraph,
        scrollToBottom,
        scrollToBottomNewMessage,
        handleSourceClick,
        handleSubmitWrongAnswerFeedback,
        handleWrongAnswerClick,
        handleFeedbackClick,
        handleCloseWrongAnswerModal,

      };
};