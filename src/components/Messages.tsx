import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Button, TextField } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { AnswerCourse, AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  CourseData?: AnswerCourse[] | null; // New CourseData prop
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
  handleSendCOURSEMessage: (COURSE_message: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  CourseData, // Added CourseData to props
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
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  // Log data to debug
  useEffect(() => {
    console.log("CourseData passed to the component: ", CourseData);
  }, [CourseData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      );

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  // Send the selected answers or the entered input
  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(", ");
    handleSendTAKMessage(message);
  };

  const isSendDisabled = selectedAnswers.length === 0 && otherInput.trim() === "";

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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
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
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
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
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                        If other, please specify
                      </label>
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{ backgroundColor: "white", fontWeight: "500", fontSize: "0.875rem" }}
                        InputProps={{
                          style: { fontWeight: "500", fontSize: "0.875rem", color: "gray" },
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log("Ignored")}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
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
                      Send
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render CourseData */}
          {CourseData && CourseData.length > 0 && (
            <div style={{ width: "100%" }}>
              {/* Ajout de la marge entre le texte et le premier bloc de cours */}
              <div style={{ marginBottom: "24px" }}></div>

              {CourseData.map((course, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FCFCFC",
                    border: "1px solid #BCBCBC",
                    padding: "16px",
                    marginBottom: idx === CourseData.length - 1 ? "16px" : "8px", // Réduction de la marge entre les cours
                    borderRadius: "8px",
                    width: "95%", // Ajustement pour que les blocs de cours soient alignés avec le texte
                    marginLeft: "auto", // Centre le bloc à gauche
                    marginRight: "auto", // Centre le bloc à droite
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ maxWidth: "100%" }}>
                    {/* Title */}
                    <p
                      style={{
                        color: "#011F5B",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        wordWrap: "break-word",
                        marginBottom: "12px",
                      }}
                    >
                      {course.title}
                    </p>

                    {/* Semester, Credit, Prerequisites */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                      {/* Semester */}
                      <span
                        style={{
                          backgroundColor: "#FFD9BF",
                          color: "#F97315",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {course.Semester}
                      </span>

                      {/* Credit */}
                      <span
                        style={{
                          backgroundColor: "#D6EAF7",
                          color: "#011F5B",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {course.Credit}
                      </span>

                      {/* Prerequisites */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            backgroundColor: "#FEEAEA",
                            color: "#EF4361",
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            wordWrap: "break-word",
                          }}
                        >
                          {course.Prerequisites}
                        </span>

                        {/* Green check icon */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#25C35E",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiCheck style={{ color: "white" }} />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: "#011F5B",
                        fontSize: "1rem",
                        wordWrap: "break-word",
                        marginBottom: "12px",
                      }}
                    >
                      {course.Description}
                    </p>

                    {/* Prospectus and Syllabus links */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
                      <a
                        href={course.Prospectus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1A71FF",
                          fontSize: "1rem",
                          textDecoration: "none",
                          flexShrink: 1,
                        }}
                      >
                        Prospectus
                      </a>
                      <a
                        href={course.Syllabus_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1A71FF",
                          fontSize: "1rem",
                          textDecoration: "none",
                          flexShrink: 1,
                        }}
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
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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





//DERNIER CODE À JOUR QUI MARCHE 09/12/2024
/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Button, TextField } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { AnswerCourse, AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  handleSendCOURSEMessage: (COURSE_message: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
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
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      );

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  // Send the selected answers or the entered input
  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(", ");
    handleSendTAKMessage(message);
  };

  const isSendDisabled = selectedAnswers.length === 0 && otherInput.trim() === "";

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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
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
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
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
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                        If other, please specify
                      </label>
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{ backgroundColor: "white", fontWeight: "500", fontSize: "0.875rem" }}
                        InputProps={{
                          style: { fontWeight: "500", fontSize: "0.875rem", color: "gray" },
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log("Ignored")}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
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
                      Send
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2 ml-8">
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/







//NOUVEAU CODE POUR PRENDRE EN COMPTE LA VALEUR DE LA RÉPONSE DE TAK ET QU'ELLE SOIT ENVOYÉ AU BACKEND -TOUT FONCTIONNE BIEN
/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Button, TextField } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  handleSendTAKMessage: (TAK_message: string) => void
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
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
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      );

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  // Send the selected answers or the entered input
  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(", ");
    handleSendTAKMessage(message);
    //setOtherInput(""); // Reset input after sending
    //setSelectedAnswers([]); // Reset checkboxes
  };

  const isSendDisabled = selectedAnswers.length === 0 && otherInput.trim() === "";

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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {/* Display waiting message until content is available *
          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {/* Main content *
          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            </div>
          )}

          {images && images.length > 0 && (
            <div className="mt-4 flex justify-start ml-8">
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-4 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="max-w-1/2 h-auto rounded-lg shadow-lg"
                    style={{ maxWidth: "50%" }}
                  />
                  {image.image_description && (
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
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
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                        If other, please specify
                      </label>
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder="e.g., None"
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{ backgroundColor: "white", fontWeight: "500", fontSize: "0.875rem" }}
                        InputProps={{
                          style: { fontWeight: "500", fontSize: "0.875rem", color: "gray" },
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log("Ignored")}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
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
                      Send
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2 ml-8">
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/



/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Button, TextField } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  handleSendMessageSocraticLangGraph: (message: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  handleSendMessageSocraticLangGraph,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      ); // Combine sentence1, sentence2, and sentence3

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);

        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
      }, 1500); // Wait for 1.5 seconds between each message
    } else {
      setCurrentWaitingMessage(null); // Clear the waiting message when content arrives
    }

    return () => clearInterval(interval); // Clean up the interval on unmount
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  //To send the value that we click on chekbox on TAK
  const handleSendClick = () => {
    const message = otherInput ? otherInput : selectedAnswers.join(", ");
    console.log("This is the message that we will send from TAK")
    console.log(message)
    handleSendMessageSocraticLangGraph(message);
    setOtherInput(""); // Reset the input after sending
    setSelectedAnswers([]); // Reset checkboxes
  };

  const isSendDisabled = selectedAnswers.length === 0 && otherInput.trim() === "";

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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {/* Display waiting message until content is available *
          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {/* Main content *
          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            </div>
          )}

          {images && images.length > 0 && (
            <div className="mt-4 flex justify-start ml-8">
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-4 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="max-w-1/2 h-auto rounded-lg shadow-lg"
                    style={{ maxWidth: "50%" }}
                  />
                  {image.image_description && (
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
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
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <TextField
                        fullWidth
                        id={`other-${idx}`}
                        placeholder={tak.other_specification.placeholder}
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        variant="outlined"
                        style={{ color: theme.palette.text.primary }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4 gap-x-4">
                    <Button
                      variant="outlined"
                      onClick={() => console.log("Ignored")}
                      style={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      <AiOutlineStop className="mr-2" />
                      Ignore
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
                      Send
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2 ml-8">
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/



/* DERNIER CODE À JOUR QUI FONCTIONNE 
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      ); // Combine sentence1, sentence2, and sentence3

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);

        // Move to the next message index
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
      }, 1500); // Wait for 1.5 seconds between each message
    } else {
      setCurrentWaitingMessage(null); // Clear the waiting message when content arrives
    }

    return () => clearInterval(interval); // Clean up the interval on unmount
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {/* Display waiting message until content is available *
          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {/* Main content *
          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            </div>
          )}

          {images && images.length > 0 && (
            <div className="mt-4 flex justify-start ml-8">
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-4 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="max-w-1/2 h-auto rounded-lg shadow-lg"
                    style={{ maxWidth: "50%" }}
                  />
                  {image.image_description && (
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
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
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                        {tak.other_specification.label}
                      </label>
                      <input
                        type="text"
                        id={`other-${idx}`}
                        placeholder={tak.other_specification.placeholder}
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        className="p-2 border rounded-md w-full"
                        style={{ color: theme.palette.text.primary }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button className="flex items-center mr-4 text-gray-500 hover:text-gray-700" onClick={() => console.log("Ignored")}>
                      <AiOutlineStop className="mr-2" />
                      Ignore
                    </button>
                    <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={handleSendClick}>
                      <FiSend className="mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2 ml-8">
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/



/*
//NOUVEAU TEST POUR LE DEEPSEARCH amélioration de la fenêtre TAK et enlever le deep search si pas waiting message
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waitingMessages && waitingMessages.length > 0 && !content) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      ); // Combine sentence1, sentence2, and sentence3

      interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);

        // Move to the next message index
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
      }, 1500); // Wait for 1.5 seconds between each message
    } else {
      setCurrentWaitingMessage(null); // Clear the waiting message when content arrives
    }

    return () => clearInterval(interval); // Clean up the interval on unmount
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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {/* Display waiting message until content is available *
          {!content && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {/* Main content *
          {content && (
            <div
              className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
              style={{ color: theme.palette.text.primary }}
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            </div>
          )}

          {images && images.length > 0 && (
            <div className="mt-4 flex justify-start">
              {images.map((image, ind) => (
                <div
                  key={image.image_id}
                  className="my-4 flex flex-col items-start cursor-pointer"
                  onClick={() => handleImageClick(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.image_description || `Image ${ind + 1}`}
                    className="max-w-1/2 h-auto rounded-lg shadow-lg"
                    style={{ maxWidth: "50%" }}
                  />
                  {image.image_description && (
                    <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                      {image.image_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {takData && takData.length > 0 && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              {takData.map((tak, idx) => (
                <div key={idx} className="mb-4">
                  <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                        <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tak.other_specification && (
                    <div className="mt-4">
                      <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                        {tak.other_specification.label}
                      </label>
                      <input
                        type="text"
                        id={`other-${idx}`}
                        placeholder={tak.other_specification.placeholder}
                        value={otherInput}
                        onChange={handleOtherInputChange}
                        className="p-2 border rounded-md w-full"
                        style={{ color: theme.palette.text.primary }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button className="flex items-center mr-4 text-gray-500 hover:text-gray-700" onClick={() => console.log("Ignored")}>
                      <AiOutlineStop className="mr-2" />
                      Ignore
                    </button>
                    <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={handleSendClick}>
                      <FiSend className="mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {citedDocuments && citedDocuments.length > 0 && (
            <div className="mt-2">
              <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                Sources:
              </b>
              <div className="flex flex-wrap gap-2">
                {citedDocuments.map((document, ind) => {
                  const display = (
                    <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                      <div className="mr-1 my-auto">
                        <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                      </div>
                      {document.document_name}
                    </div>
                  );
                  if (document.link) {
                    return (
                      <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                        {display}
                      </div>
                    );
                  } else {
                    return <div key={document.document_id} className="cursor-default">{display}</div>;
                  }
                })}
              </div>
            </div>
          )}

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/





/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK, AnswerWaiting } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: AnswerWaiting[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    if (waitingMessages && waitingMessages.length > 0) {
      const messagesArray = waitingMessages.map(
        (msg) => `${msg.sentence1} ${msg.sentence2} ${msg.sentence3}`
      ); // Combine sentence1, sentence2, and sentence3

      const interval = setInterval(() => {
        setCurrentWaitingMessage(messagesArray[waitingMessageIndex]);

        // Move to the next message index
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length);
      }, 1500); // Wait for 1.5 seconds between each message

      return () => clearInterval(interval); // Clean up the interval on unmount
    }
  }, [waitingMessages, waitingMessageIndex]);

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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {waitingMessages && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }}
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {takData && takData.length > 0 && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                {takData.map((tak, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                          <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {tak.other_specification && (
                      <div className="mt-4">
                        <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                          {tak.other_specification.label}
                        </label>
                        <input
                          type="text"
                          id={`other-${idx}`}
                          placeholder={tak.other_specification.placeholder}
                          value={otherInput}
                          onChange={handleOtherInputChange}
                          className="p-2 border rounded-md w-full"
                          style={{ color: theme.palette.text.primary }}
                        />
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <button className="flex items-center mr-4 text-gray-500 hover:text-gray-700" onClick={() => console.log("Ignored")}>
                        <AiOutlineStop className="mr-2" />
                        Ignore
                      </button>
                      <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={handleSendClick}>
                        <FiSend className="mr-2" />
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                  Sources:
                </b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                          {display}
                        </div>
                      );
                    } else {
                      return <div key={document.document_id} className="cursor-default">{display}</div>;
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/



/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: string[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    if (waitingMessages && waitingMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentWaitingMessage(waitingMessages[waitingMessageIndex]);
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % waitingMessages.length);
      }, 1000); // Rotate messages every 1 second

      return () => clearInterval(interval); // Clean up the interval on unmount
    }
  }, [waitingMessages, waitingMessageIndex]);

  useEffect(() => {
    if (content) {
      setCurrentWaitingMessage("Deep search done");
    }
  }, [content]);

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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
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
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {waitingMessages && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }}
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {takData && takData.length > 0 && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                {takData.map((tak, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-left" style={{ color: theme.palette.text.primary }}>
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
                          <label htmlFor={`option-${idx}-${i}`} style={{ color: theme.palette.text.primary }}>
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {tak.other_specification && (
                      <div className="mt-4">
                        <label htmlFor={`other-${idx}`} className="block mb-1" style={{ color: theme.palette.text.primary }}>
                          {tak.other_specification.label}
                        </label>
                        <input
                          type="text"
                          id={`other-${idx}`}
                          placeholder={tak.other_specification.placeholder}
                          value={otherInput}
                          onChange={handleOtherInputChange}
                          className="p-2 border rounded-md w-full"
                          style={{ color: theme.palette.text.primary }}
                        />
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <button className="flex items-center mr-4 text-gray-500 hover:text-gray-700" onClick={() => console.log("Ignored")}>
                        <AiOutlineStop className="mr-2" />
                        Ignore
                      </button>
                      <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={handleSendClick}>
                        <FiSend className="mr-2" />
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>
                  Sources:
                </b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div key={document.document_id} className="cursor-pointer hover:bg-hover" onClick={() => handleSourceClick(document.link)}>
                          {display}
                        </div>
                      );
                    } else {
                      return <div key={document.document_id} className="cursor-default">{display}</div>;
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/

/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  waitingMessages?: string[] | null;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void;
  drawerOpen: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData,
  waitingMessages,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>("");
  const [currentWaitingMessage, setCurrentWaitingMessage] = useState<string | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState<number>(0);
  const theme = useTheme();

  // Logging the received props for debugging
  useEffect(() => {
    console.log("AIMessage Component Props:");
    console.log("messageId:", messageId);
    console.log("content:", content);
    console.log("personaName:", personaName);
    console.log("citedDocuments:", citedDocuments);
    console.log("images:", images);
    console.log("takData:", takData);
    console.log("waitingMessages:", waitingMessages);
  }, [messageId, content, personaName, citedDocuments, images, takData, waitingMessages]);

  // Effect to handle rotating waiting messages if they exist
  useEffect(() => {
    if (waitingMessages && waitingMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentWaitingMessage(waitingMessages[waitingMessageIndex]);
        setWaitingMessageIndex((prevIndex) => (prevIndex + 1) % waitingMessages.length);
      }, 1000); // Rotate messages every 1 second

      return () => clearInterval(interval); // Clean up the interval on unmount
    }
  }, [waitingMessages, waitingMessageIndex]);

  // Effect to handle when a new answer arrives (content)
  useEffect(() => {
    if (content) {
      setCurrentWaitingMessage("Deep search done"); // Replace waiting message with confirmation
    }
  }, [content]);

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
    handleFeedback && handleFeedback("like");
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

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
          style={{
            justifyContent: drawerOpen ? "center" : "center",
            paddingLeft: drawerOpen ? "240px" : "0px",
          }}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="shadow-lg"
            style={{
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px",
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>
            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          {/* Display the rotating waiting message if provided and waitingMessages is not null *
          {waitingMessages && currentWaitingMessage && (
            <div className="mt-2 text-gray-500 text-lg">
              [{currentWaitingMessage}]
            </div>
          )}

          {/* Display the main AI-generated content after the waiting message *
          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
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
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {/* Display images *
            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }}
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Display TAK data *
            {takData && takData.length > 0 && (
              <div className="mt-4">
                {takData.map((tak, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="font-bold" style={{ color: theme.palette.text.primary }}>
                      {tak.question}
                    </h3>
                    <div className="ml-4">
                      {tak.answer_options.map((option, i) => (
                        <div key={i} className="flex items-center mb-2">
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
                      {tak.other_specification && (
                        <div className="mt-2">
                          <label
                            htmlFor={`other-${idx}`}
                            className="block mb-1"
                            style={{ color: theme.palette.text.primary }}
                          >
                            {tak.other_specification.label}
                          </label>
                          <input
                            type="text"
                            id={`other-${idx}`}
                            placeholder={tak.other_specification.placeholder}
                            value={otherInput}
                            onChange={handleOtherInputChange}
                            className="p-2 border rounded-md w-full"
                            style={{ color: theme.palette.text.primary }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex mt-4">
                      <button
                        className="flex items-center mr-4 text-gray-500 hover:text-gray-700"
                        onClick={() => console.log("Ignored")}
                      >
                        <AiOutlineStop className="mr-2" />
                        Ignore
                      </button>
                      <button
                        className="flex items-center text-blue-500 hover:text-blue-700"
                        onClick={handleSendClick}
                      >
                        <FiSend className="mr-2" />
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display cited documents *
            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>
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
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
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
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Section *
          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? (
                  <FiCheck style={{ color: theme.palette.text.primary }} />
                ) : (
                  <FiCopy style={{ color: theme.palette.text.primary }} />
                )}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp
                  className={thumbsUpClicked ? "text-green-400 fill-current" : ""}
                  style={{ color: theme.palette.text.primary }}
                />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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

*/



/*
 //fonction qui marche avec les sources et les images mais j'arrive pas à faire fonctionner avec tak car il est undefined 
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiSend } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage, AnswerTAK } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  takData?: AnswerTAK[] | null; // Updated TAK to takData
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
  drawerOpen: boolean; // New prop to handle sidebar open state
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  takData, // Changed TAK to takData for consistency
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen, // Received prop for sidebar open state
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to handle image enlargement
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // To handle checkbox selections
  const [otherInput, setOtherInput] = useState<string>(""); // To handle 'Other' input text

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Enhanced logging to ensure the component receives the correct props
    console.log("AIMessage Component Props:");
    console.log("messageId:", messageId);
    console.log("content:", content);
    console.log("personaName:", personaName);
    console.log("citedDocuments:", citedDocuments);
    console.log("images:", images);
    console.log("takData:", takData); // Ensure TAK data is logged correctly
  }, [messageId, content, personaName, citedDocuments, images, takData]);

  // Add more logging and checks in case takData is undefined
  useEffect(() => {
    if (!takData) {
      console.warn("takData is undefined in AIMessage.");
    } else {
      console.log("takData successfully passed to AIMessage:", takData);
    }
  }, [takData]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the clicked image as the selected image
  };

  const handleCloseImage = () => {
    setSelectedImage(null); // Close the enlarged image
  };

  const handleCheckboxChange = (option: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(option)
        ? prev.filter((answer) => answer !== option)
        : [...prev, option]
    );
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value);
  };

  const handleSendClick = () => {
    console.log("Selected Answers:", selectedAnswers);
    console.log("Other Input:", otherInput);
    // Here, you would send the data to the backend or handle accordingly
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
          style={{
            justifyContent: drawerOpen ? "center" : "center", // Ensure centering in both scenarios
            paddingLeft: drawerOpen ? "240px" : "0px", // Sidebar width handling
          }}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="shadow-lg" // Apply consistent shadow
            style={{
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px", // Ensure rounded corners
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 ? (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No images received.</p>
            )}

            {takData && takData.length > 0 ? (
              <div className="mt-4">
                {takData.map((tak, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="font-bold" style={{ color: theme.palette.text.primary }}>
                      {tak.question}
                    </h3>
                    <div className="ml-4">
                      {tak.answer_options.map((option, i) => (
                        <div key={i} className="flex items-center mb-2">
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
                      {tak.other_specification && (
                        <div className="mt-2">
                          <label
                            htmlFor={`other-${idx}`}
                            className="block mb-1"
                            style={{ color: theme.palette.text.primary }}
                          >
                            {tak.other_specification.label}
                          </label>
                          <input
                            type="text"
                            id={`other-${idx}`}
                            placeholder={tak.other_specification.placeholder}
                            value={otherInput}
                            onChange={handleOtherInputChange}
                            className="p-2 border rounded-md w-full"
                            style={{ color: theme.palette.text.primary }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex mt-4">
                      <button
                        className="flex items-center mr-4 text-gray-500 hover:text-gray-700"
                        onClick={() => console.log("Ignored")}
                      >
                        <AiOutlineStop className="mr-2" />
                        Ignore
                      </button>
                      <button
                        className="flex items-center text-blue-500 hover:text-blue-700"
                        onClick={handleSendClick}
                      >
                        <FiSend className="mr-2" />
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No TAK data received.</p>
            )}

            {citedDocuments && citedDocuments.length > 0 ? (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ) : (
              <p>No cited documents received.</p>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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

*/








//modification pour ajouter TAK mais ici fonction qui fonctionne parfaitement bien
/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
  drawerOpen: boolean; // New prop to handle sidebar open state
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen, // Received prop for sidebar open state
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to handle image enlargement

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Log the images received by this component for debugging purposes
    console.log("Images received in AIMessage component:", images);
  }, [images]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the clicked image as the selected image
  };

  const handleCloseImage = () => {
    setSelectedImage(null); // Close the enlarged image
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
          style={{
            justifyContent: drawerOpen ? "center" : "center", // Ensure centering in both scenarios
            paddingLeft: drawerOpen ? "240px" : "0px", // Sidebar width handling
          }}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="shadow-lg" // Apply consistent shadow
            style={{
              margin: "2rem",
              maxWidth: "90%",
              maxHeight: "80%",
              objectFit: "contain",
              borderRadius: "16px", // Ensure rounded corners
            }}
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/




/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
  drawerOpen: boolean; // New prop to handle sidebar open state
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen, // Received prop for sidebar open state
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to handle image enlargement

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Log the images received by this component for debugging purposes
    console.log("Images received in AIMessage component:", images);
  }, [images]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the clicked image as the selected image
  };

  const handleCloseImage = () => {
    setSelectedImage(null); // Close the enlarged image
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
          style={{
            justifyContent: "center", // Always center the image
            paddingLeft: drawerOpen ? "240px" : "0px", // Account for sidebar when open
            paddingRight: drawerOpen ? "240px" : "0px", // Optional: Ensure balance on both sides
          }}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg" // Margins, max width/height, and rounded borders
            style={{ margin: "2rem", objectFit: "contain" }} // Ensure the image fits within the given space
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/


/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
  drawerOpen: boolean; // New prop to handle sidebar open state
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
  drawerOpen, // Received prop for sidebar open state
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to handle image enlargement

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Log the images received by this component for debugging purposes
    console.log("Images received in AIMessage component:", images);
  }, [images]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the clicked image as the selected image
  };

  const handleCloseImage = () => {
    setSelectedImage(null); // Close the enlarged image
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
          style={{
            justifyContent: drawerOpen ? "center" : "flex-start", // Adjust position based on sidebar state
            paddingLeft: drawerOpen ? "240px" : "0px", // Account for the sidebar width when it's open
          }}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg" // Margins, max width/height, and rounded borders
            style={{ margin: "2rem", objectFit: "contain" }} // Ensure the image fits within the given space
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
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
*/



/*
//POUR POUVOIR CLIQUER SUR L'IMAGE ET L'AGRANDIR - fonctionne mais problème de sidebar
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images, // Updated to handle AnswerImage[] type
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to handle image enlargement

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Log the images received by this component for debugging purposes
    console.log("Images received in AIMessage component:", images);
  }, [images]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the clicked image as the selected image
  };

  const handleCloseImage = () => {
    setSelectedImage(null); // Close the enlarged image
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImage}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg" // Margins, max width/height, and rounded borders
            style={{ margin: "2rem", objectFit: "contain" }} // Ensure the image fits within the given space
          />
        </div>
      )}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div
                    key={image.image_id}
                    className="my-4 flex flex-col items-start cursor-pointer"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
*/




/*
import React, { useState, useEffect } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Circles } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument, AnswerImage } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from "../lucy_new_face_contour2.png";
import certifiate_icon from "../certifiate.png";
import remarkGfm from "remark-gfm"; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from "@mui/material/styles";

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${
        isActive ? "bg-neutral-300" : ""
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
  images?: AnswerImage[] | null; // Updated to use AnswerImage type
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images, // Updated to handle AnswerImage[] type
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const theme = useTheme(); // Accessing the current theme

  useEffect(() => {
    // Log the images received by this component for debugging purposes
    console.log("Images received in AIMessage component:", images);
  }, [images]);

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div
              className="font-bold ml-2 my-auto flex items-center"
              style={{ color: theme.palette.text.primary }}
            >
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div
            className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"
            style={{ color: theme.palette.text.primary }}
          >
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                        {children}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, "  \n")}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <Circles height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-4 flex justify-start">
                {images.map((image, ind) => (
                  <div key={image.image_id} className="my-4 flex flex-col items-start">
                    <img
                      src={image.image_url} // Correctly fetching the image URL from the variable
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-1/2 h-auto rounded-lg shadow-lg"
                      style={{ maxWidth: "50%" }} // Limiting image width for a better visual fit
                    />
                    {image.image_description && (
                      <p className="text-sm mt-2 text-left" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div
                        className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex"
                        style={{ color: theme.palette.text.primary }}
                      >
                        <div className="mr-1 my-auto">
                          <SourceIcon sourceType={document.source_type as ValidSources} iconSize={16} />
                        </div>
                        {document.document_name}
                      </div>
                    );
                    if (document.link) {
                      return (
                        <div
                          key={document.document_id}
                          className="cursor-pointer hover:bg-hover"
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
                        >
                          {display}
                        </div>
                      );
                    } else {
                      return (
                        <div key={document.document_id} className="cursor-default">
                          {display}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? "text-green-400 fill-current" : ""} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? "fill-current text-primary" : ""}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
*/




/*
//CODE TEST POUR AFFICHER DES IMAGES EN PLUS DES SOURCES - marche presque correctement avec les images
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from '@mui/material/styles';


export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
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
  images?: { image_id: string, image_url: string, image_description?: string }[] | null; // New prop for handling images
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  images, // New prop for handling images
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,  // New prop for handling source clicks
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const theme = useTheme(); // To access the current theme

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg" style={{ color: theme.palette.text.primary }}>
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
            )}

            {images && images.length > 0 && (
              <div className="mt-2">
                {images.map((image, ind) => (
                  <div key={image.image_id} className="my-2">
                    <img
                      src={image.image_url}
                      alt={image.image_description || `Image ${ind + 1}`}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                    {image.image_description && (
                      <p className="text-sm mt-1" style={{ color: theme.palette.text.secondary }}>
                        {image.image_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
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
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
*/





/* CODE QUI MARCHE POUR AFFICHER LES SOURCES 
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from '@mui/material/styles';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
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
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  handleSourceClick: (link: string) => void; // New prop for handling source clicks
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
  handleSourceClick,  // New prop for handling source clicks
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const theme = useTheme(); // To access the current theme

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg" style={{ color: theme.palette.text.primary }}>
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
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
                          onClick={() => handleSourceClick(document.link)} // Call the handleSourceClick function
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
*/



//CODE D'ORIGINE QUI FONCTIONNE - SANS LA SOURCE QUI S'OUVRE DANS L'IFRAME, QUAND ON CLIQUE ÇA OUVRE DANS UNE NOUVELLE PAGE
/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from '@mui/material/styles';

// Hoverable Component for feedback icons
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component for AI-generated messages
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const theme = useTheme(); // To access the current theme

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg" style={{ color: theme.palette.text.primary }}>
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color={theme.palette.primary.main} />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component for user-generated messages
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  const theme = useTheme(); // To access the current theme

  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" style={{ color: theme.palette.text.primary }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto" style={{ color: theme.palette.text.primary }}>
              You
            </div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words" style={{ color: theme.palette.text.primary }}>
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  remarkPlugins={[remarkGfm]}  // Enable GFM for lists, etc.
                  components={{ br: () => <br /> }} // Handle line breaks
                >
                  {content.replace(/\n/g, '  \n')}
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/


/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)
import { useTheme } from '@mui/material/styles';

// Hoverable Component for feedback icons
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component for AI-generated messages
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const theme = useTheme(); // To access the current theme

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
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto flex items-center" style={{ color: theme.palette.text.primary }}>
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg" style={{ color: theme.palette.text.primary }}> {/* Taille de la police augmentée 
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm" style={{ color: theme.palette.text.primary }}>Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex" style={{ color: theme.palette.text.primary }}>
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck style={{ color: theme.palette.text.primary }} /> : <FiCopy style={{ color: theme.palette.text.primary }} />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} style={{ color: theme.palette.text.primary }} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm" style={{ color: theme.palette.text.primary }}>
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component for user-generated messages
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  const theme = useTheme(); // To access the current theme

  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" style={{ color: theme.palette.text.primary }} />
              </div>
            </div>

            <div className="font-bold ml-2 my-auto" style={{ color: theme.palette.text.primary }}>
              You
            </div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words" style={{ color: theme.palette.text.primary }}>
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  remarkPlugins={[remarkGfm]}  // Enable GFM for lists, etc.
                  components={{ br: () => <br /> }} // Handle line breaks
                >
                  {content.replace(/\n/g, '  \n')}
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/




/*import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)

// Hoverable Component for feedback icons
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component for AI-generated messages
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content);
    handleWrongAnswerClick(content);
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    console.log("AI Message Content for Positive Feedback:", content);
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify text-lg"> {/* Taille de la police augmentée *
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')} 
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component for user-generated messages
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  remarkPlugins={[remarkGfm]}  // Enable GFM for lists, etc.
                  components={{ br: () => <br /> }} // Handle line breaks
                >
                  {content.replace(/\n/g, '  \n')} 
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/









/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Enable GitHub Flavored Markdown (GFM)

// Hoverable Component for feedback icons
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component for AI-generated messages
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content);
    handleWrongAnswerClick(content);
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    console.log("AI Message Content for Positive Feedback:", content);
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                  br: () => <br />, // Force new lines where appropriate
                }}
              >
                {content.replace(/\n/g, '  \n')} 
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component for user-generated messages
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words ">
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  remarkPlugins={[remarkGfm]}  // Enable GFM for lists, etc.
                  components={{ br: () => <br /> }} // Handle line breaks
                >
                  {content.replace(/\n/g, '  \n')} 
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/




/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import remarkGfm from 'remark-gfm'; // Plugin to enable GitHub Flavored Markdown (GFM) for tables, strikethroughs, etc.

// Hoverable Component for feedback icons
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component for AI-generated messages
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content);
    handleWrongAnswerClick(content);
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    console.log("AI Message Content for Positive Feedback:", content);
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <ReactMarkdown
                className="prose max-w-full"
                remarkPlugins={[remarkGfm]}  // Enable GitHub Flavored Markdown
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
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />, // Styling for bullet lists
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />, // Styling for numbered lists
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
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
                }}
              >
                {content}
              </ReactMarkdown>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component for user-generated messages
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <ReactMarkdown
                  className="prose max-w-full"
                  remarkPlugins={[remarkGfm]}  // Enable GFM for lists, etc.
                >
                  {content}
                </ReactMarkdown>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/




/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

// Hoverable Component
export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// AIMessage Component
interface AIMessageProps {
  messageId: number | null;
  content: string;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    console.log("AI Message Content for Positive Feedback:", content); // Log AI message content
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  // Replace new lines with <br /> and inject as HTML
  const formattedContent = content.replace(/\n/g, "<br />");

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <div
                dangerouslySetInnerHTML={{ __html: formattedContent }}
                className="prose max-w-full"
              />
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HumanMessage Component
export const HumanMessage: React.FC<{ content: string | JSX.Element; fileType?: 'pdf' | 'mp4' }> = ({
  content,
  fileType,
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === "string" ? (
                <embed
                  src={content}
                  type={fileType === "pdf" ? "application/pdf" : "video/mp4"}
                  width="100%"
                  height="200px"
                />
              ) : typeof content === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }} />
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/


//CODE D'ORIGINE
/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
  //handleLinkClick?: (url: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setThumbsUpClicked(true);
    console.log("AI Message Content for Positive Feedback:", content); // Log AI message content
    handleFeedback && handleFeedback("like");
    setTimeout(() => setThumbsUpClicked(false), 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={thumbsUpClicked}>
                <FiThumbsUp className={thumbsUpClicked ? 'text-green-400 fill-current' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/



/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';
import Confetti from 'react-confetti';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setFeedbackClicked(true);
    setShowConfetti(true);
    console.log("AI Message Content for Positive Feedback:", content); // Log AI message content
    handleFeedback && handleFeedback("like");
    setTimeout(() => {
      setFeedbackClicked(false);
      setShowConfetti(false);
    }, 2000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full relative"}>
      {showConfetti && <Confetti numberOfPieces={50} />}
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={feedbackClicked}>
                <FiThumbsUp className={feedbackClicked ? 'text-green-400' : ''} />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/




/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  const handleThumbUpClick = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content for Positive Feedback:", content); // Log AI message content
    handleFeedback && handleFeedback("like");
    setTimeout(() => setFeedbackClicked(false), 3000);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={handleThumbUpClick} isActive={feedbackClicked}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/



/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8 text-justify">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/



/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-1 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/





/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto flex items-center">
              {personaName || "Lucy"}
              <img src={certifiate_icon} alt="Certificate Icon" className="ml-2 w-4 h-4" />
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/





/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_new_face_contour2.png';
import certifiate_icon from '../certifiate.png'

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(content.toString());
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 3000);
  };

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
    setTimeout(() => setFeedbackClicked(false), 50);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable onClick={handleCopyClick}>
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/




/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: (aiMessageContent: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    console.log("AI Message Content:", content); // Log AI message content
    handleWrongAnswerClick(content.toString());
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
*/





/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';
import PopupWrongAnswer from './PopupWrongAnswer';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface AIMessageProps {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick: () => void; // Ajoutez cette ligne
}

export const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick, // Ajoutez cette ligne
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleWrongAnswer = () => {
    setFeedbackClicked(true);
    setPopupOpen(true);
    handleWrongAnswerClick();
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    console.log("Feedback submitted:", feedback);
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswer} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
      {popupOpen && (
        <PopupWrongAnswer
          open={popupOpen}
          onClose={handleClosePopup}
          selectedFilter=""
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {}
*/





//CODE QUI PERMET D'AFFICHER DANS LA CONSOLE LE MESSAGE LÀ OU ON CLIQUE SUR WRONG ANSWER
/*import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';
import PopupWrongAnswer from './PopupWrongAnswer';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const AIMessage = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
}: {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleWrongAnswerClick = (content: string | JSX.Element) => {
    setFeedbackClicked(true);
    setPopupOpen(true);
    console.log("Wrong Answer Content:", content); // You can use this content as needed
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    console.log("Feedback submitted:", feedback);
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={() => handleWrongAnswerClick(content)} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
      {popupOpen && (
        <PopupWrongAnswer
          open={popupOpen}
          onClose={handleClosePopup}
          selectedFilter=""
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {}
*/




/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';
import PopupWrongAnswer from './PopupWrongAnswer';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive = false }) => {
  return (
    <div
      className={`hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer ${isActive ? 'bg-neutral-300' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const AIMessage = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
}: {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  const [feedbackClicked, setFeedbackClicked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleWrongAnswerClick = () => {
    setFeedbackClicked(true);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    console.log("Feedback submitted:", feedback);
    setPopupOpen(false);
    setFeedbackClicked(false);
  };

  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswerClick} isActive={feedbackClicked}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className={`mr-1 ${feedbackClicked ? 'fill-current text-primary' : ''}`} />
                  Wrong answer give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
      {popupOpen && (
        <PopupWrongAnswer
          open={popupOpen}
          onClose={handleClosePopup}
          selectedFilter=""
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {}
*/








/*
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div className="hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer" onClick={onClick}>
      {children}
    </div>
  );
};

export const AIMessage = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
  handleWrongAnswerClick,
}: {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
  handleWrongAnswerClick?: () => void;
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable onClick={handleWrongAnswerClick}>
                <div className="flex items-center text-sm">
                  <FiThumbsDown className="mr-1" />
                  Wrong answer? Give us feedbacks
                </div>
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {}
*/


/*
//nouveau test messages
import React, { useState } from "react";
import { FiCheck, FiCopy, FiThumbsDown, FiThumbsUp, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { ThreeDots, FallingLines } from "react-loader-spinner";
import Avatar from "@mui/material/Avatar";
import { AnswerDocument } from "../interfaces/interfaces";
import { FeedbackType } from "./types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { SourceIcon } from "./icons/SourceIcon";
import { ValidSources } from "./sources";
import lucy_face_logo from '../lucy_face.png';

export const Hoverable: React.FC<{
  children: JSX.Element;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div className="hover:bg-neutral-300 p-2 rounded h-fit cursor-pointer" onClick={onClick}>
      {children}
    </div>
  );
};

export const AIMessage = ({
  messageId,
  content,
  query,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleFeedback,
  isCurrentlyShowingRetrieved,
  handleShowRetrieved,
  handleSearchQueryEdit,
  handleForceSearch,
  retrievalDisabled,
}: {
  messageId: number | null;
  content: string | JSX.Element;
  query?: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleFeedback?: (feedbackType: FeedbackType) => void;
  isCurrentlyShowingRetrieved?: boolean;
  handleShowRetrieved?: (messageNumber: number | null) => void;
  handleSearchQueryEdit?: (query: string) => void;
  handleForceSearch?: () => void;
  retrievalDisabled?: boolean;
}) => {
  const [copyClicked, setCopyClicked] = useState(false);
  return (
    <div className={"py-5 px-5 flex -mr-6 w-full"}>
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
        <div className="ml-0 w-full">
          <div className="flex">
            <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
              <div className="text-inverted">
                <Avatar alt="Lucy Avatar" src={lucy_face_logo} sx={{ width: 25, height: 25 }} />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">
              {personaName || "Lucy"}
            </div>
          </div>

          <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words mt-1 ml-8">
            {content ? (
              <>
                {typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    children={content}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      code: (props) => {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                ) : (
                  content
                )}
              </>
            ) : isComplete ? null : (
              <FallingLines height="30" width="50" color="#955bf7" />
            )}

            {citedDocuments && citedDocuments.length > 0 && (
              <div className="mt-2">
                <b className="text-sm text-emphasis">Sources:</b>
                <div className="flex flex-wrap gap-2">
                  {citedDocuments.map((document, ind) => {
                    const display = (
                      <div className="max-w-350 text-ellipsis flex text-sm border border-border py-1 px-2 rounded flex">
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
                        <a
                          key={document.document_id}
                          href={document.link}
                          target="_blank"
                          className="cursor-pointer hover:bg-hover"
                        >
                          {display}
                        </a>
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
          </div>

          {handleFeedback && (
            <div className="flex flex-col md:flex-row gap-x-0.5 ml-8 mt-1">
              <Hoverable
                onClick={() => {
                  navigator.clipboard.writeText(content.toString());
                  setCopyClicked(true);
                  setTimeout(() => setCopyClicked(false), 3000);
                }}
              >
                {copyClicked ? <FiCheck /> : <FiCopy />}
              </Hoverable>
              <Hoverable onClick={() => handleFeedback("like")}>
                <FiThumbsUp />
              </Hoverable>
              <Hoverable>
                <FiThumbsDown onClick={() => handleFeedback("dislike")} />
              </Hoverable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HumanMessage = ({
  content,
  fileType
}: {
  content: string | JSX.Element;
  fileType?: 'pdf' | 'mp4';
}) => {
  return (
    <div className="py-5 px-5 flex -mr-6 w-full">
      <div className="w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <div className="ml-0">
          <div className="flex">
            <div className="p-1 bg-user rounded-lg h-fit">
              <div className="text-inverted">
                <FiUser size={19} className="my-auto mx-auto" />
              </div>
            </div>

            <div className="font-bold text-emphasis ml-2 my-auto">You</div>
          </div>
          <div className="mx-auto mt-1 ml-8 w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar-default flex flex-wrap">
            <div className="w-message-xs 2xl:w-message-sm 3xl:w-message-default break-words">
              {fileType && typeof content === 'string' ? (
                <embed src={content} type={fileType === 'pdf' ? 'application/pdf' : 'video/mp4'} width="100%" height="200px" />
              ) : (
                typeof content === "string" ? (
                  <ReactMarkdown
                    className="prose max-w-full"
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-500 hover:text-blue-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  content
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export {}
*/
