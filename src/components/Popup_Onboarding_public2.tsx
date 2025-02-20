import React from "react";

interface Popup2Props {
    onNext: () => void;
}

const Popup2: React.FC<Popup2Props> = ({ onNext }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-bold">📚 Don't wast time anymore</h2>
        <p className="mt-2 text-gray-700">
          Need to find a club, a course, or some polcicies on financial aids for example. Just ask Lucy!
        </p>
        <button onClick={onNext} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Next (2/4)
        </button>
      </div>
    </div>
  );
};

export default Popup2;
