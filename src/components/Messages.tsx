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

