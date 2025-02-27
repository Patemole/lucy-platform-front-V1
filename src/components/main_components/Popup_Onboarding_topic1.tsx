import React from "react";

interface Popup1Props {
  onNext: () => void;
}

const topicColors: { [key: string]: string } = {
  "Financial Aid": "#27AE60", // Green
  "Events": "#E67E22", // Orange
  "Policies": "#2980B9", // Blue
  "Housing": "#8E44AD", // Purple
  "Courses": "#EAC117", // Yellow
  "Chitchat": "#7F8C8D", // Gray
  "Default": "#7F8C8D" // Default Gray
};

const topics = [
  "Financial Aid",
  "Events",
  "Policies",
  "Housing",
  "Courses",
  "Chitchat"
];

const Popup1: React.FC<Popup1Props> = ({ onNext }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div 
        className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col justify-between"
        style={{
          width: "500px", // Taller than wide
          height: "450px", // Adjusted height
          maxWidth: "90%", // Ensures responsiveness on small screens
        }}
      >
        <h2 className="text-2xl font-bold">Welcome to Lucy 🎉</h2>

        <p className="mt-2 text-gray-700 text-lg px-4">
          Ask Lucy anything about non-academic topics at your university!
        </p>

        {/* Topics in two rows of three */}
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {topics.map((topic) => (
            <div
              key={topic}
              style={{
                color: topicColors[topic] || topicColors["Default"], // Colored text
                backgroundColor: `${topicColors[topic] || topicColors["Default"]}20`, // Light background
                padding: "10px 15px",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "500",
                display: "inline-block",
                width: "140px", // Makes all boxes equal width
                textAlign: "center"
              }}
            >
              {topic}
            </div>
          ))}
        </div>

        {/* More compact button */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={onNext}
            className="bg-blue-500 text-white px-4 py-2 rounded text-lg transition duration-300 hover:bg-blue-600"
            style={{
              minWidth: "350px", // Prevents it from being too long
              textAlign: "center", // Ensures the text stays centered
            }}
          >
            Next (1/4)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup1;


