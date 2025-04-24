import { useRef } from 'react';
import { useEffect} from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
//import { useAuth } from '../../../auth/hooks/useAuth';
//import { useChat } from '../../../auth/hooks/useChat';
import { sendMessageSocraticLangGraph, saveMessageAIToBackend } from '../../../api/chat';
import { submitFeedbackWrongAnswer, submitFeedbackGoodAnswer } from '../../../api/feedback_wrong_answer';
import { Message, StreamingError,AnswerPiecePacket, AnswerDocumentPacket, Conversation, SocialThread, AnswerDocument, AnswerTAK, AnswerCHART, AnswerCourse, AnswerWaiting, ReasoningStep, AnswerREDDIT, AnswerINSTA, AnswerYOUTUBE, AnswerQUORA, AnswerINSTA_CLUB, AnswerLINKEDIN, AnswerINSTA2, AnswerERROR, AnswerACCURACYSCORE, AnswerTITLEANDCATEGORY } from '../../../interfaces/interfaces_eleve';
import { debounce } from 'lodash';
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




    //Detector de scroll
     //Scrolling useffect for autoscrolling, Attached a listener to the scrollable div
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


    //Reactor based on the value of isAtBottom for autoscrolling
    useEffect(() => {
        if (isAtBottom) {
        scrollToBottom();
        } else {
        setNewMessagesCount((prevCount) => prevCount + 1);
        }
    }, [messages, isAtBottom]); // Depend on messages and isAtBottom


//------------------------------------------------------------------------

    //Permet d ouvrir le lien de la source recupere depuis AIMessage
    const handleSourceClick = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer"); // Ouvre dans un nouvel onglet
    };


    // Fonction pour envoyer le message à l'AI ou à l'API
    const onSubmit = async (messageHistory: Message[], inputValue: string, isOnboardingMessage: boolean = false) => {
        setIsStreaming(true);
        setHasNewContent(false);
        let answer = '';
        let answerDocuments: AnswerDocument[] = [];
        let answerImages: { image_id: string; image_url: string; image_description?: string }[] = [];
        let relatedQuestionsList: string[] = [];
        let answerTAK: AnswerTAK[] = [];
        let answerCHART: AnswerCHART[] = [];
        let answerCourse: AnswerCourse[] = [];
        let answerWaiting: AnswerWaiting[] = [];
        let answerReasoning: ReasoningStep[] = [];
        let answerREDDIT: AnswerREDDIT[] = [];
        let answerINSTA: AnswerINSTA[] = [];
        let answerINSTA2: AnswerINSTA2[] = [];
        let answerYOUTUBE: AnswerYOUTUBE[] = [];
        let answerQUORA: AnswerQUORA[] = [];
        let answerINSTA_CLUB: AnswerINSTA_CLUB[] = [];
        let answerLINKEDIN: AnswerLINKEDIN[] = [];
        let answerERROR: AnswerERROR[] = [];
        let answerACCURACYSCORE: AnswerACCURACYSCORE[] = [];
        let answerTITLEANDCATEGORY: AnswerTITLEANDCATEGORY[] = [];
        let flattenedACCURACYSCORE: AnswerACCURACYSCORE[] = [];
        let error: string | null = null;

        // Flag to track if the first text piece has arrived
        let firstTextPacketReceived = false;

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
              // Ne pas créer une nouvelle conversation pour l'onboarding
              // Utiliser la conversation existante ou en créer une si nécessaire
              currentConversation = conversations.find((conv) => conv.chat_id === chatSessionId);
              
              // Si aucune conversation n'existe, en créer une
              if (!currentConversation) {
                const newConv: Conversation = { chat_id: chatSessionId, name: 'New Chat', thread_type: 'Public' };
                const currentConversations = useChatStore.getState().conversations;
                setConversations([newConv, ...currentConversations]);
                currentConversation = newConv;
              }
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

                // Vérifier si la conversation a été annulée via le store (si nécessaire, mais AbortController suffit)
                // if (useChatStore.getState().isCancellationRequested) { ... }

                // Process each packet in the packet bunch
                if (Array.isArray(packetBunch)) {
                    for (const packet of packetBunch) {
                        if (typeof packet === 'string') {
                            setHasNewContent(true); // Detects new content
                            answer = packet.replace(/\|/g, '');
                            if (!firstTextPacketReceived) firstTextPacketReceived = true; // Mark first text packet
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_piece')) {
                            answer = (packet as AnswerPiecePacket).answer_piece;
                            if (!firstTextPacketReceived) firstTextPacketReceived = true; // Mark first text packet
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'image_data')) {
                            answerImages.push((packet as any).image_data);
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_TAK_data')) {
                            answerTAK.push((packet as any).answer_TAK_data);
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_CHART_data')) {
                            answerCHART.push((packet as any).answer_CHART_data);
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_COURSE_data')) {
                            answerCourse.push((packet as any).answer_COURSE_data);
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'reasoning_steps')) {
                            answerReasoning.push((packet as any).reasoning_steps);
                            console.log("Étapes de raisonnement ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'reddit')) {
                            answerREDDIT.push((packet as any).reddit);
                            console.log("Reddit ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta')) {
                            answerINSTA.push((packet as any).insta);
                            console.log("Insta ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta2')) {
                            answerINSTA2.push((packet as any).insta2);
                            console.log("Insta2 ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'insta_club')) {
                            answerINSTA_CLUB.push((packet as any).insta_club);
                            console.log("Insta club ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'linkedin')) {
                            answerLINKEDIN.push((packet as any).linkedin);
                            console.log("Linkedin ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'youtube')) {
                            answerYOUTUBE.push((packet as any).youtube);
                            console.log("Youtube ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'quora')) {
                            answerQUORA.push((packet as any).quora);
                            console.log("Quora ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'error_back')) {
                            answerERROR.push((packet as any).error_back);
                            console.log("Error ajoutées");
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'accuracy_score')) {
                            answerACCURACYSCORE.push((packet as any).accuracy_score);
                            console.log("Accuracy score ajoutées");

                        } else if (Object.prototype.hasOwnProperty.call(packet, 'classification_title_result')) {
                            answerTITLEANDCATEGORY.push((packet as any).classification_title_result);
                            console.log("title and category ajoutées");

                        } else if (Object.prototype.hasOwnProperty.call(packet, 'answer_waiting')) {
                            answerWaiting = (packet as any).answer_waiting;
                        } else if (Object.prototype.hasOwnProperty.call(packet, 'error')) {
                            error = (packet as StreamingError).error;
                        }
                    }
                } else if (typeof packetBunch === 'object' && packetBunch !== null) {
                    if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_document')) {
                        answerDocuments.push((packetBunch as AnswerDocumentPacket).answer_document);
                        console.log('This is a test');
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'image_data')) {
                        answerImages.push((packetBunch as any).image_data);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_TAK_data')) {
                        answerTAK.push((packetBunch as any).answer_TAK_data);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reasoning_steps')) {
                        answerReasoning.push((packetBunch as any).reasoning_steps);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'reddit')) {
                        answerREDDIT.push((packetBunch as any).reddit);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta')) {
                        answerINSTA.push((packetBunch as any).insta);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta2')) {
                        answerINSTA2.push((packetBunch as any).insta2);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'insta_club')) {
                        answerINSTA_CLUB.push((packetBunch as any).insta_club);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'linkedin')) {
                        answerLINKEDIN.push((packetBunch as any).linkedin);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'youtube')) {
                        answerYOUTUBE.push((packetBunch as any).youtube);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'quora')) {
                        answerQUORA.push((packetBunch as any).quora);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error_back')) {
                        answerERROR.push((packetBunch as any).error_back);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'accuracy_score')) {
                        answerACCURACYSCORE.push((packetBunch as any).accuracy_score);

                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'classification_title_result')) {
                        answerTITLEANDCATEGORY.push((packetBunch as any).classification_title_result);

                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_CHART_data')) {
                        answerCHART.push((packetBunch as any).answer_CHART_data);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_COURSE_data')) {
                        answerCourse.push((packetBunch as any).answer_COURSE_data);
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'related_questions')) {
                        relatedQuestionsList = (packetBunch as any).related_questions;
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'answer_waiting')) {
                        answerWaiting = (packetBunch as any).answer_waiting;
                    } else if (Object.prototype.hasOwnProperty.call(packetBunch, 'error')) {
                        error = (packetBunch as StreamingError).error;
                    }
                }

                console.log("Valeur brute de answerTITLEANDCATEGORY :", answerTITLEANDCATEGORY);

                const flattenedImages = answerImages.flat();
                const flattenedTAK = answerTAK.flat();
                const flattenedReasoning = answerReasoning.flat();
                const flattenedREDDIT = answerREDDIT.flat();
                const flattenedINSTA = answerINSTA.flat();
                const flattenedINSTA2 = answerINSTA2.flat();
                const flattenedINSTA_CLUB = answerINSTA_CLUB.flat();
                const flattenedLINKEDIN = answerLINKEDIN.flat();
                const flattenedYOUTUBE = answerYOUTUBE.flat();
                const flattenedQUORA = answerQUORA.flat();
                const flattenedERROR = answerERROR.flat();
                // Log before flattening `answerACCURACYSCORE`
                console.log("Raw answerACCURACYSCORE received:", answerACCURACYSCORE);

                console.log("Raw answerACCURACYSCORE received:", flattenedREDDIT);

                flattenedACCURACYSCORE = answerACCURACYSCORE.flat();

                const flattenedTITLEANDCATEGORY = answerTITLEANDCATEGORY.flat();
                console.log("Flattened answerTITLEANDCATEGORY:", flattenedTITLEANDCATEGORY);



                //permet de pouvoir update le topic de la conversation en cours en fonction de la question de l utilisateur
                if (flattenedTITLEANDCATEGORY.length > 0) {
                  const { category: newCategory, conversation_title: newTitle } = flattenedTITLEANDCATEGORY[0];
                  // Utiliser l'action du store qui gère la mise à jour optimiste et Firestore
                  useChatStore.getState().updateConversationTitleAndTopic(chatSessionId, newTitle, newCategory);
                }

                //const flattenedTITLEANDCATEGORY = [
                //  { category: "Financial Aids", conversation_title: "Scholarship Details" }
                //];

                // Log after flattening `answerACCURACYSCORE`
                console.log("Flattened answerACCURACYSCORE:", flattenedACCURACYSCORE);
                const flattenedCHART = answerCHART.flat();
                const flattenedCourse = answerCourse.flat();
                const flattenedwaitingdata = answerWaiting.flat();

                // Update the messages if conversation was not cancelled
                if (!error) {
                    // Get current state, create new array, pass new array to setter
                    const currentMessages = useChatStore.getState().messages;
                    const updatedMessages = [...currentMessages];
                    // Ensure lastMessageIndex is valid before updating
                    if (lastMessageIndex >= 0 && lastMessageIndex < updatedMessages.length) {
                        updatedMessages[lastMessageIndex] = {
                            ...(updatedMessages[lastMessageIndex] as Message), // Added type assertion
                            type: 'ai',
                            content: answer,
                            personaName: 'Lucy',
                            citedDocuments: answerDocuments,
                            images: flattenedImages,
                            TAK: flattenedTAK,
                            CHART: flattenedCHART,
                            COURSE: flattenedCourse,
                            waitingMessages: flattenedwaitingdata,
                            ReasoningSteps: flattenedReasoning,
                            REDDIT: flattenedREDDIT,
                            INSTA: flattenedINSTA,
                            YOUTUBE: flattenedYOUTUBE,
                            QUORA: flattenedQUORA,
                            ERROR: flattenedERROR,
                            CONFIDENCESCORE: flattenedACCURACYSCORE,
                            INSTA_CLUB: flattenedINSTA_CLUB,
                            LINKEDIN: flattenedLINKEDIN,
                            INSTA2: flattenedINSTA2,
                            // Ensure isLoading is handled if needed, maybe set to false here?
                            isLoading: !firstTextPacketReceived, // Update isLoading based on the flag
                        };
                         setMessages(updatedMessages);
                    } else {
                        console.error("onSubmit: Invalid lastMessageIndex", lastMessageIndex, "Messages length:", currentMessages.length);
                        // Handle error case - maybe add a new AI message instead?
                    }
                }
            }

            // Mettre à jour les questions liées et arrêter le streaming si non annulé
            if (!error) {
            setRelatedQuestions(relatedQuestionsList);
            setIsStreaming(false);
            }

            if (!user?.id) {
            throw new Error("L'ID utilisateur (uid) est manquant dans l'URL.");
            }

            // Save AI message to backend if conversation is still active
            // Vérifier l'état de error avant d'appeler la fonction
            console.log("error:", error);
            if (!error) {
               
                await saveMessageAIToBackend({
                    message: answer,
                    chatSessionId: chatSessionId,
                    courseId: courseId,
                    username: 'Lucy',
                    type: 'ai',
                    uid: user?.id,
                    input_message: inputValue,
                    university: university,
                    sources: answerDocuments.map((doc) => ({ 
                      document_id: doc.document_id,
                        document_name: doc.document_name,
                        link: doc.link,
                        source_type: doc.source_type
                    })),
                    confident_score: flattenedACCURACYSCORE.length > 0 ? parseFloat(flattenedACCURACYSCORE[0].confidenceScore): null, // 👈 Conversion correcte en nombre
                    });
                    //confident_score: confident_score => important
                    //sources: sources / un tableau je pense avec le le titre et le lien des sources. avec answer document je pense => important
                    //reasonning_steps / un tableau 
                    //TAK / une structure de donnne, je ne sais pas comment save pour l instant

            } else {
            console.log("Conversation annulée -> Le message AI ne sera pas envoyé");
        }
        } catch (e: any) {
            if (e.name === 'AbortError') {
            console.log('Requête interrompue par l utilisateur.');
            // setIsStreaming(false); // Déjà dans finally
            // setHasNewContent(false); // Déjà dans finally ou reset avant appel
            // Optionnel : Ajouter une indication à l'UI pour signaler que la réponse est stoppée
            } else {
            console.error('Erreur lors du traitement des messages :', e.message);
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
        const loadingMessage: Message = { id: Date.now() + 1, type: 'ai', content: '', personaName: 'Lucy', isLoading: true };
    
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