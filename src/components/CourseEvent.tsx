import React from 'react';
import styled from 'styled-components';

const courseColors: { [key: string]: { pastel: string; dark: string } } = {
  CIS: { pastel: '#D6DDF5', dark: '#3155CC' },
  LING: { pastel: '#FDF0D6', dark: '#F5BD4F' },
  PHYS: { pastel: '#ECE3FF', dark: '#7C3BEC' },
  MATH: { pastel: '#E6FFFA', dark: '#059669' },
  ENGL: { pastel: '#FEF3C7', dark: '#B45309' },
  HIST: { pastel: '#FFE4E6', dark: '#BE123C' },
  CHEM: { pastel: '#E0F7FA', dark: '#00838F' },
};

const EventContainer = styled.div<{ pastelColor: string; darkColor: string }>`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.pastelColor};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  color: ${(props) => props.darkColor};
  font-family: Arial, sans-serif;
  position: relative;
  border: none !important;
  box-shadow: none !important;
  cursor: pointer;
`;

const TitleBar = styled.div<{ darkColor: string }>`
  height: 4px;
  background-color: ${(props) => props.darkColor};
`;

const EventTitle = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0 4px;
  word-break: break-word;
`;

interface CourseEventProps {
  title: string;
  description: string;
  category: string;
  onClick: () => void; // onClick added to handle event click
}

const CourseEvent: React.FC<CourseEventProps> = ({ title, description, category, onClick }) => {
  const colors = courseColors[description] || {
    pastel: '#E5E7EB',
    dark: '#374151',
  };

  return (
    <EventContainer pastelColor={colors.pastel} darkColor={colors.dark} onClick={onClick}>
      <TitleBar darkColor={colors.dark} />
      <EventTitle>
        {title}
      </EventTitle>
    </EventContainer>
  );
};

export default CourseEvent;





