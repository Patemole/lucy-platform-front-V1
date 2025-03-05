import React from "react";

interface PopupEventSoonAvailableProps {
  onClose: () => void;
}

const PopupEventSoonAvailable: React.FC<PopupEventSoonAvailableProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center flex flex-col justify-between w-full max-w-xs sm:max-w-md md:max-w-lg">
        {/* Titre */}
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
          Coming Soon 🚀
        </h2>

        {/* Message */}
        <p className="text-gray-700 text-sm sm:text-base mt-4">
          This feature will be available soon for Holy Family University.
        </p>

        {/* Bouton Fermer */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 rounded-md text-sm sm:text-lg transition duration-300 hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupEventSoonAvailable;
