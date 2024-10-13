

// src/components/CourseSelectionAIMessages.tsx

// src/components/CourseSelectionAIMessages.tsx

import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiCopy,
  FiThumbsDown,
  FiThumbsUp,
  FiSend,
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Button, TextField, Avatar } from '@mui/material';
import {
  AnswerCourse,
  AnswerDocument,
  AnswerImage,
  AnswerTAK,
  AnswerWaiting,
  CourseSlot,
} from '../interfaces/interfaces_eleve';
import { FeedbackType } from './types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from './icons/SourceIcon';
import { ValidSources } from './sources';
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@mui/material/styles';
import { ThreeDots } from 'react-loader-spinner';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? 'bg-neutral-300' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  images?: AnswerImage[] | null;
  takData?: AnswerTAK[] | null;
  CourseData?: AnswerCourse[] | null;
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  handleSendTAKMessage: (TAK_message: string) => void;
  handleSendCOURSEMessage?: (COURSE_message: string) => void;
  drawerOpen: boolean;
  handleShowSnackbar: () => void;
  handleAddCourseToCalendar: (selectedSlot: CourseSlot, answerCourse: AnswerCourse) => void;
  handleOpenDrawer: (course: AnswerCourse) => void; // Renommé pour gérer l'ouverture du panneau intégré
}

const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  CourseData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  handleSendTAKMessage,
  handleSendCOURSEMessage,
  drawerOpen,
  handleShowSnackbar,
  handleAddCourseToCalendar,
  handleOpenDrawer,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>('');
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.Sentence1} ${msg.Sentence2} ${msg.Sentence3}`
      );

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);
        setWaitingMessageIndex(
          (prevIndex) => (prevIndex + 1) % messagesArray.length
        );
      }, 1500);
    } else {
      setCurrentWaitingMessage(null);
    }

    return () => clearInterval(interval);
  }, [waitingMessages, waitingMessageIndex, content]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    handleWrongAnswerClick(content);
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    handleFeedback && handleFeedback('like');
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleCheckboxChange = (option: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(option)
        ? prev.filter((answer) => answer !== option)
        : [...prev, option]
    );
  };

  const handleOtherInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(', ');
    handleSendTAKMessage(message);
  };

  const isSendDisabled =
    selectedAnswers.length === 0 && otherInput.trim() === '';

  const handleCourseClick = (course: AnswerCourse) => {
    handleOpenDrawer(course); // Appel de la fonction pour ouvrir le panneau de cours
  };

  return (
    <div className="py-5 px-5 flex -mr-6 w-full relative">
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="shadow-lg"
            style={{
              margin: '2rem',
              maxWidth: '90%',
              maxHeight: '80%',
              objectFit: 'contain',
              borderRadius: '16px',
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar
                  alt="Lucy Avatar"
                  src={lucy_face_logo}
                  sx={{ width: 25, height: 25 }}
                />
              </div>
            </div>
            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || 'Lucy'}
              <img
                src={certifiate_icon}
                alt="Certificate Icon"
                className="ml-1 w-4 h-4"
              />
            </div>
          </div>

          {!content && (
            <div className="flex items-center mt-2 ml-8">
              <ThreeDots
                height="30"
                width="50"
                color={theme.palette.primary.main}
              />
            </div>
          )}

          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary, fontSize: '1.05rem' }}
            >
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p {...props} />,
                  strong: ({ node, ...props }) => <strong {...props} />,
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-blue-500 hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-6" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-6" {...props} />
                  ),
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />,
                }}
              >
                {content.replace(/\n/g, '  \n')}
              </ReactMarkdown>
            </div>
          )}

          {images && images.length > 0 && (
            <div className="mt-4 flex justify-start ml-8 gap-4">
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-1 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="w-120 h-64 object-cover rounded-lg shadow-lg"
                  />
                  {image.image_description && (
                    <p
                      className="text-sm mt-2 text-left"
                      style={{ color: theme.palette.text.secondary }}
                    >
                      {image.image_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {takData && takData.length > 0 && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg ml-8">
              {takData.map((tak, idx) => (
                <div key={idx} className="mb-4">
                  <p
                    className="text-left"
                    style={{ color: theme.palette.text.primary }}
                  >
                    {tak.question}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    {tak.answer_options.map((option, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${idx}-${i}`}
                          value={option}
                          checked={selectedAnswers.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`option-${idx}-${i}`}
                          style={{ color: theme.palette.text.primary }}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label
                        htmlFor={`other-${idx}`}
                        className="block mb-1"
                        style={{ color: theme.palette.text.primary }}
                      >
                        Si autre, veuillez préciser
                      </label>
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder="e.g., Aucun"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{
                          backgroundColor: 'white',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                        }}
                        InputProps={{
                          style: {
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: 'gray',
                          },
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log('Ignoré')}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      Ignorer
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSendClick}
                      style={{
                        color: theme.palette.text.primary,
                        backgroundColor: theme.palette.button.background,
                      }}
                      disabled={isSendDisabled}
                    >
                      <FiSend className="mr-2" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {CourseData && CourseData.length > 0 && (
            <div style={{ width: '100%' }}>
              {/* Marge entre le texte et le premier bloc de cours */}
              <div style={{ marginBottom: '24px' }}></div>

              {CourseData.map((course, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCourseClick(course)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: '#FCFCFC',
                    border: '1px solid #BCBCBC',
                    padding: '16px',
                    marginBottom:
                      idx === CourseData.length - 1 ? '16px' : '8px',
                    borderRadius: '8px',
                    width: '95%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ maxWidth: '100%' }}>
                    {/* Titre */}
                    <p
                      style={{
                        color: '#011F5B',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        wordWrap: 'break-word',
                        marginBottom: '12px',
                      }}
                    >
                      {course.title}
                    </p>

                    {/* Semestre, Crédit, Prérequis */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      {/* Semestre */}
                      <span
                        className="tag"
                        style={{
                          backgroundColor: '#FFD9BF',
                          color: '#F97315',
                        }}
                      >
                        {course.Semester}
                      </span>

                      {/* Crédit */}
                      <span
                        className="tag"
                        style={{
                          backgroundColor: '#D6EAF7',
                          color: '#011F5B',
                        }}
                      >
                        {course.Credit}
                      </span>

                      {/* Prérequis */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          className="tag"
                          style={{
                            backgroundColor: '#FEEAEA',
                            color: '#EF4361',
                          }}
                        >
                          {course.Prerequisites}
                        </span>

                        {/* Icône de vérification */}
                        <div className="iconCircle">
                          <FiCheck style={{ color: 'white' }} />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: '#011F5B',
                        fontSize: '0.875rem',
                        wordWrap: 'break-word',
                        marginBottom: '12px',
                      }}
                    >
                      {course.Description}
                    </p>

                    {/* Liens vers le Prospectus et le Syllabus */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <a
                        href={course.Prospectus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Prospectus
                      </a>
                      <a
                        href={course.Syllabus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Syllabus
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2 ml-8">
              <b
                className="text-sm"
                style={{ color: theme.palette.text.primary }}
              >
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div
                      className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                      style={{ color: theme.palette.text.primary }}
                    >
                      <div className="mr-1 my-auto">
                        <SourceIcon
                          sourceType={document.source_type as ValidSources}
                          iconSize={16}
                        />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div
                        key={document.document_id}
                        className="cursor-pointer hover:bg-hover"
                        onClick={() => handleSourceClick(document.link)}
                      >
                        {display}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={document.document_id}
                        className="cursor-default"
                      >
                        {display}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? (
                  <FiCheck style={{ color: theme.palette.text.primary }} />
                ) : (
                  <FiCopy style={{ color: theme.palette.text.primary }} />
                )}
              </Hoverable>
              <Hoverable
                onClick={handleThumbUpClick}
                isActive={thumbsUpClicked}
              >
                <FiThumbsUp
                  className={
                    thumbsUpClicked ? 'text-green-400 fill-current' : ''
                  }
                  style={{ color: theme.palette.text.primary }}
                />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div
                  className="flex items-center text-sm"
                  style={{ color: theme.palette.text.primary }}
                >
                  <FiThumbsDown
                    className={`mr-1 ${
                      feedbackClicked ? 'fill-current text-primary' : ''
                    }`}
                  />
                  Wrong answer give us feedback
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;









//NOUVEAU CODE POUR LA SIDEBAR DE CRENEAU



