import React from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface RelatedQuestionsProps {
  relatedQuestions: string[];
  setInputValue: (val: string) => void;
}

const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({ relatedQuestions, setInputValue }) => {
  console.log('<<< RENDERING RelatedQuestions >>>');
  const theme = useTheme();

  if (relatedQuestions.length === 0) return null;

  return (
    <section className="mt-4 px-8 flex justify-center" aria-label="Related questions">
      <div className="flex flex-wrap gap-2 justify-center">
        {relatedQuestions.slice(0, 3).map((question, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => setInputValue(question)}
            sx={{
              borderColor: theme.palette.button_sign_in,
              color: theme.palette.button_sign_in,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            {question}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default RelatedQuestions;