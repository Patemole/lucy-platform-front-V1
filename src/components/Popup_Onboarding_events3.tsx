import React from "react";

interface Popup3Props {
    onNext: () => void;
}

const Popup3: React.FC<Popup3Props> = ({ onNext }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-bold">🔍 Lucy knows you</h2>
        <p className="mt-2 text-gray-700">
          Lucy learn your preferences and recommand personnalized events based on your profil. 
        </p>
        <button onClick={onNext} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Next (3/4)
        </button>
      </div>
    </div>
  );
};

export default Popup3;
