import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebase';
import { saveOnboardingStep } from '../../../api/chat';
import { Message, StudentProfile } from '../../../interfaces/interfaces_eleve';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useChat } from '../../../auth/hooks/useChat';


// Hook principal
export const useOnboarding = ({
  setInputValue,
  setRelatedQuestions,
  setIsComplete,
  setIsStreaming,
  onSubmit,
  generateUniqueId,
  hasStartedStreaming,
  setHasStartedStreaming,
}: {
  setInputValue: (value: string) => void;
  setRelatedQuestions: (value: string[]) => void;
  setIsComplete: (value: boolean) => void;
  setIsStreaming: (value: boolean) => void;
  onSubmit: (history: Message[], inputValue: string, isOnboardingMessage?: boolean) => Promise<void>;
  generateUniqueId: () => number;
  hasStartedStreaming: boolean;
  setHasStartedStreaming: (val: boolean) => void;
}) => {
  const { user, setUser, chatIds } = useAuth();
  const { messages, setMessages, isLandingPageVisible, setIsLandingPageVisible } = useChat();
  const hasRun = useRef(false);

/*
  useEffect(() => {
    const hasStartedOnboarding = messages.some(msg => msg.METADATAONBOARDING);
    if (user?.onboardingComplete && !hasStartedOnboarding && !hasRun.current) {
      hasRun.current = true; // Empêche le double lancement
      console.log("🟢 Lancement de l'onboarding à la première question");
      console.log("📊 Messages actuels :", messages.map(m => m.METADATAONBOARDING));
      sendNextOnboardingMessage(0);
    }
  }, [user?.onboardingComplete, messages]); 
  */

  useEffect(() => {
    const shouldStart = !hasRun.current && user?.onboardingComplete === false;
    const hasNoMetadata = messages.every(msg => !msg.METADATAONBOARDING);
  
    console.log("🧪 Onboarding check -> shouldStart:", shouldStart, "| hasNoMetadata:", hasNoMetadata);
  
    if (shouldStart && hasNoMetadata) {
      hasRun.current = true;
      console.log("🚀 Onboarding started");
      sendNextOnboardingMessage(0);
    }
  }, [user?.onboardingComplete, messages.length]);


  const onboardingMessages = [
    { question: "What is your current school?", metadata: "SCHOOL" },
    { question: "What year are you in?", metadata: "YEAR" },
    { question: "What is you linkedin URL?", metadata: "LINKEDIN" },
    { question: "What is your major and minor?", metadata: "MAJOR&MINOR" },
    { question: "To finish, you need to check these boxes", metadata: "COMPLIANCE" },
  ];

  // Récupère précisément le dernier message qui possède la propriété METADATAONBOARDING
  const currentOnboardingMessage = [...messages].reverse().find(msg => msg.METADATAONBOARDING);
    // Récupère précisément le nom de l'étape actuelle ou une chaîne vide si aucun message n'est trouvé
  const currentMetadataOnboarding = currentOnboardingMessage?.METADATAONBOARDING || '';
    // Détermine l'index de l'étape actuelle dans onboardingMessages
  const currentStepIndex = onboardingMessages.findIndex(
    step => step.metadata === currentMetadataOnboarding
    );
    // Calcule précisément la progression en fonction de l'étape actuelle
  const totalSteps = onboardingMessages.length;
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressPercent = ((completedSteps + 1) / totalSteps) * 100;
    // Vérifie précisément si c'est la dernière étape
  const isLastStep = currentStepIndex === totalSteps - 1;


  const updateUserField = async (
    fieldOrObject: string | Record<string, any>,
    value?: any
  ) => {
    if (!user) return;

    const userRef = doc(db, "users", user.id);
    const updatePayload =
      typeof fieldOrObject === "string" ? { [fieldOrObject]: value } : fieldOrObject;

    await updateDoc(userRef, updatePayload);

    setUser((prev) => (prev ? { ...prev, ...updatePayload } : null));
  };


  const sendNextOnboardingMessage = async (
    index: number,
    fieldToUpdate?: string | Record<string, any>,
    previousAnswer?: string
  ) => {
    if (index >= onboardingMessages.length) {
      await updateUserField({ onboardingComplete: true });

      const lastStep = onboardingMessages[onboardingMessages.length - 1];
      const newMessage: Message = {
        id: generateUniqueId(),
        type: 'human',
        content: previousAnswer || '',
      };
      const loadingMessage: Message = {
        id: generateUniqueId() + 1,
        type: 'ai',
        content: '',
        personaName: 'Lucy',
      };

      setMessages((prev) => [...prev, newMessage, loadingMessage]);

      if (typeof fieldToUpdate === 'string') {
        await updateUserField(fieldToUpdate, previousAnswer);
      } else if (typeof fieldToUpdate === 'object') {
        await updateUserField(fieldToUpdate);
      }

      if (user?.id && chatIds[0] && previousAnswer) {
        await saveOnboardingStep({
          chatId: chatIds[0],
          userId: user.id,
          metadata: lastStep.metadata,
          message: previousAnswer,
          type: 'human',
        });
      }

      onSubmit([...messages, newMessage, loadingMessage], '');
      setInputValue('');
      return;
    }

    setIsLandingPageVisible(false);
    setRelatedQuestions([]);
    setIsComplete(false);
    setIsStreaming(true);

    const { question, metadata } = onboardingMessages[index];
    const onboardingMessageId = generateUniqueId();

    const loadingMessage: Message = {
      id: onboardingMessageId,
      type: 'ai',
      content: '',
      personaName: 'Lucy',
      METADATAONBOARDING: metadata,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    if (typeof fieldToUpdate === 'string') {
      await updateUserField(fieldToUpdate, previousAnswer);
    } else if (typeof fieldToUpdate === 'object') {
      await updateUserField(fieldToUpdate);
    }

    if (user?.id && chatIds[0]) {
      await saveOnboardingStep({
        chatId: chatIds[0],
        userId: user.id,
        metadata,
        message: question,
        type: 'ai',
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    await fakeStreamMessage(question, metadata, onboardingMessageId);
    setIsStreaming(false);
  };


   // Fonction qui simule le stream en ajoutant chunk par chunk
   const fakeStreamMessage = async (messageContent: string, metadata: string, messageId: number) => {
    const chunks = messageContent.split(' ');
    let displayedContent = '';
  
  
    // 🟢 Vérifie si le message existe déjà avant de l'ajouter
    setMessages((prev) => {
      const existing = prev.some(msg => msg.id === messageId);
      return existing ? prev : [
        ...prev,
        { id: messageId, type: 'ai', content: '', personaName: 'Lucy', METADATAONBOARDING: metadata },
      ];
    });
  
    for (const chunk of chunks) {
      displayedContent += chunk + ' ';
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: displayedContent.trim() } : msg
        )
      );
      if (displayedContent.trim().length > 0 && !hasStartedStreaming) {
        setHasStartedStreaming(true); // ✅ dès que le premier mot est là on envoie a messageWEB pour dire que le stream a commence et on enleve le three dot de chargement 
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };



  const handleSendSCHOOLMessage = async (SCHOOL_message: string) => {
    const newMessage: Message = { id: Date.now(), type: 'human', content: SCHOOL_message };
    setMessages((prev) => [...prev, newMessage]);

    if (user?.id && chatIds[0]) {
      await saveOnboardingStep({
        chatId: chatIds[0],
        userId: user.id,
        message: SCHOOL_message,
        type: 'human',
      });
    }

    await sendNextOnboardingMessage(1, 'faculty', SCHOOL_message);
  };



  const handleSendYEARMessage = async (YEAR_message: string) => {
    const newMessage: Message = { id: Date.now(), type: 'human', content: YEAR_message };
    setMessages((prev) => [...prev, newMessage]);

    if (user?.id && chatIds[0]) {
      await saveOnboardingStep({
        chatId: chatIds[0],
        userId: user.id,
        message: YEAR_message,
        type: 'human',
      });
    }

    await sendNextOnboardingMessage(2, 'year', YEAR_message);
  };



  const handleSendLINKEDINMessage = async (LINKEDIN_message: string) => {
    const newMessage: Message = { id: Date.now(), type: 'human', content: LINKEDIN_message };
    setMessages((prev) => [...prev, newMessage]);

    if (user?.id && chatIds[0]) {
      await saveOnboardingStep({
        chatId: chatIds[0],
        userId: user.id,
        message: LINKEDIN_message,
        type: 'human',
      });
    }

    await sendNextOnboardingMessage(3, 'linkedin_url', LINKEDIN_message);
  };



  const handleSendMAJORMINORMessage = async ({
    majors,
    minors,
  }: {
    majors: string[];
    minors: string[];
  }) => {
    const content = `Majors: ${majors.join(', ')} | Minors: ${minors.join(', ')}`;
    const newMessage: Message = { id: Date.now(), type: 'human', content };
    setMessages((prev) => [...prev, newMessage]);

    if (user?.id && chatIds[0]) {
      await saveOnboardingStep({
        chatId: chatIds[0],
        userId: user.id,
        message: content,
        type: 'human',
      });
    }

    await sendNextOnboardingMessage(4, { major: majors, minor: minors }, content);
  };



  const handleSendCOMPLIANCEMessage = async (payload: {
    termsAccepted: boolean;
    ageConfirmed: boolean;
  }) => {
    const summary = `Terms accepted: ${payload.termsAccepted ? '✔️' : '❌'} | Age confirmed: ${
      payload.ageConfirmed ? '✔️' : '❌'
    }`;

    await sendNextOnboardingMessage(5, {
      complianceAccepted: true,
      ...payload,
    }, summary);
  };


  return {
    sendNextOnboardingMessage,
    fakeStreamMessage,
    handleSendSCHOOLMessage,
    handleSendYEARMessage,
    handleSendLINKEDINMessage,
    handleSendMAJORMINORMessage,
    handleSendCOMPLIANCEMessage,
  };
};