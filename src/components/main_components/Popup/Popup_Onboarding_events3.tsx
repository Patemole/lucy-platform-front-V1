import React from "react";
import { useTheme } from '@mui/material/styles';
import eventKanban from '../onboarding_image/eventkanban.png';
interface Popup3Props {
  onNext: () => void;
}

const Popup3: React.FC<Popup3Props> = ({ onNext }) => {

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div 
        className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col justify-between"
        style={{
          width: "500px", // Balanced width
          height: "450px", // Increased height for better layout
          maxWidth: "90%", // Ensures responsiveness
        }}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold">Centralized Calendar 📆</h2>

        {/* Description */}
        <p className="mt-4 text-gray-700 text-lg px-4">
          No more endless newsletters. 
          Lucy recommends personalized events based on your profile.
        </p>

        {/* Kanban Image Illustration */}
        <div className="mt-4 flex justify-center">
          <img 
            src={eventKanban} 
            alt="Kanban View Example" 
            style={{
              width: "100%",
              maxWidth: "310px",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }} 
          />
        </div>

        {/* Next Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onNext}
            className="bg-blue-500 text-white px-4 py-2 rounded text-lg transition duration-300 hover:bg-blue-600"
            style={{
              minWidth: "350px", // Prevents it from being too long
              textAlign: "center", // Ensures the text stays centered
            }}
          >
            Next (3/4)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup3;


