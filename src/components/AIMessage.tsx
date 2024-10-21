// src/components/AIMessage.tsx

import React from 'react';
import { Avatar } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnswerDocument } from '../interfaces/interfaces';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import logo_lucy_face from '../lucy_new_face_contour2.png';

interface AIMessageProps {
  messageId: number | null;
  content: string;
  personaName?: string;
  citedDocuments?: AnswerDocument[] | null;
  isComplete?: boolean;
  hasDocs?: boolean;
  handleSourceClick: (link: string) => void;
}

const AIMessage: React.FC<AIMessageProps> = ({
  messageId,
  content,
  personaName,
  citedDocuments,
  isComplete,
  hasDocs,
  handleSourceClick,
}) => {
  return (
    <div className="py-2 px-2 flex w-full relative">
      <div className="w-full">
        <div className="flex">
          <div className="p-1 pr-0 bg-ai rounded-lg h-fit my-auto">
            <div className="text-inverted">
              <Avatar
                alt="Avatar Lucy"
                src={logo_lucy_face}
                sx={{ width: 25, height: 25 }}
              />
            </div>
          </div>
          <div
            className="font-bold ml-2 my-auto flex items-center"
            style={{ color: '#000000' }}
          >
            {personaName || 'Lucy'}
          </div>
        </div>

        <div
          className="break-words mt-1 ml-8 text-justify text-base"
          style={{ color: '#000000' }}
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
            {content.replace(/\n/g, '  \n')}
          </ReactMarkdown>
        </div>

        {/* Display cited documents */}
        {citedDocuments && citedDocuments.length > 0 && (
          <div className="mt-2 ml-8">
            <b className="text-sm" style={{ color: '#000000' }}>
              Sources:
            </b>
            <div className="flex flex-wrap gap-2">
              {citedDocuments.map((document, ind) => (
                <div
                  key={document.document_id}
                  className="max-w-350 text-ellipsis flex text-sm border py-1 px-2 rounded flex"
                  style={{ color: '#000000', cursor: 'pointer' }}
                  onClick={() => handleSourceClick(document.link || '')}
                >
                  {document.document_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessage;