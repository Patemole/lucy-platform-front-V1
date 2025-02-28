import React from "react";

interface Popup2Props {
  onNext: () => void;
}

const messageTypes = [
  { type: "Public", description: "Share your search to inspire, aware and help other students.", color: "#4A90E2" }, // Blue
  { type: "Private", description: "Keep sensitive/personalized information private, just for you.", color: "#6F6F6F" } // Dark Gray
];

const unreadCount = 3; // Example unread message count

const Popup2: React.FC<Popup2Props> = ({ onNext }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div 
        className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col justify-between"
        style={{
          width: "500px", // Balanced height and width
          height: "450px", // Taller for better readability
          maxWidth: "90%", // Ensures responsiveness
        }}
      >
        {/* Title with notification badge */}
        <div className="flex items-center justify-center space-x-3">
          <h2 className="text-2xl font-bold">Meet <span className="text-purple-600">Social Thread</span></h2>
          {unreadCount > 0 && (
            <div
              style={{
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '8px',
                padding: '2px 8px',
                fontSize: '0.85rem',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '24px',
                height: '24px'
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>

        {/* Public & Private Sections with increased spacing */}
        <div className="mt-8 space-y-10">
          {messageTypes.map(({ type, description, color }) => (
            <div key={type} className="text-left">
              <h3 className="text-lg font-semibold">{type === "Public" ? "On Public" : "On Private"}</h3>
              <p className="text-gray-700">{description}</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: `${color}20`, // Light background
                  color: color, // Text color
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  marginTop: "12px",
                  width: "130px", // Adjusted width for consistency
                  justifyContent: "center"
                }}
              >
                {type}
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onNext}
            className="bg-blue-500 text-white px-4 py-2 rounded text-lg transition duration-300 hover:bg-blue-600"
            style={{
              minWidth: "350px", // Prevents it from being too long
              textAlign: "center", // Ensures the text stays centered
            }}
          >
            Next (2/4)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup2;

