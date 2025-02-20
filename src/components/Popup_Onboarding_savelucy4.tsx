import React from "react";

interface Popup4Props {
    onFinish: () => void;
}

const Popup4: React.FC<Popup4Props> = ({ onFinish }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-bold">🚀 Ready to begin?</h2>
        <p className="mt-2 text-gray-700">
          You are ready to explore Lucy! Click on "Finish" to begin your journey.
        </p>
        <button onClick={onFinish} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
          Finish (4/4)
        </button>
      </div>
    </div>
  );
};

export default Popup4;
