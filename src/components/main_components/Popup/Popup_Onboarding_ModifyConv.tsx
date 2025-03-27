import React from "react";

interface PopupOnboardingRequiredProps {
  onClose: () => void;
}

const PopupOnboardingRequired: React.FC<PopupOnboardingRequiredProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center flex flex-col justify-between w-full max-w-xs sm:max-w-md md:max-w-lg">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
          Finish Onboarding First 🚧
        </h2>
        <p className="text-gray-700 text-sm sm:text-base mt-4">
          Please complete onboarding before editing or deleting conversations.
        </p>
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

export default PopupOnboardingRequired;