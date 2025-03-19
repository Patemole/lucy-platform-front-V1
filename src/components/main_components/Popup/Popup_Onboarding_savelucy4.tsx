
/*
import React, { useState, useRef } from "react";
import { useTheme } from '@mui/material/styles';
import Confetti from 'react-confetti';
import add_web from '../onboarding_image/add_webapp.png';
import add_mobile from '../onboarding_image/add_mobile.jpeg';

interface Popup4Props {
  onFinish: () => void;
  confettiOptions?: {
    particleCount?: number;
    spread?: number;
    duration?: number;
    gravity?: number;
  };
}

const Popup4: React.FC<Popup4Props> = ({ onFinish, confettiOptions }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Get button position

  const defaultConfettiOptions = {
    particleCount: confettiOptions?.particleCount || 500,
    spread: confettiOptions?.spread || 200,
    duration: confettiOptions?.duration || 2800,
    gravity: confettiOptions?.gravity || 1.2, // Faster fall
  };

  const handleFinish = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect(); // Get button position
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onFinish(); // Call the finish function after confetti
      }, defaultConfettiOptions.duration);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      {/* Confetti Effect *
      {showConfetti && buttonRef.current && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={defaultConfettiOptions.particleCount}
          gravity={defaultConfettiOptions.gravity} // Make confetti fall faster
          recycle={false}
        />
      )}

      <div 
        className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col justify-between"
        style={{
          width: "500px",
          height: "450px",
          maxWidth: "90%"
        }}
      >
        {/* Title *
        <h2 className="text-2xl font-bold">Mobile App is Coming Soon 📲</h2>

        {/* Description *
        <p className="mt-4 text-gray-700 text-lg px-4">
          Meanwhile, save Lucy on your device.
        </p>

        {/* Two Images in a Row *
        <div className="mt-4 flex justify-center gap-6">
          {/* Web App Image *
          <div className="flex flex-col items-center">
            <img 
              src={add_web} 
              alt="Save on Laptop" 
              style={{
                width: "170px",
                height: "200px",
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }} 
            />
            <p className="mt-2 text-gray-600 italic text-sm">Pin on your laptop</p>
          </div>

          {/* Mobile App Image *
          <div className="flex flex-col items-center">
            <img 
              src={add_mobile} 
              alt="Save on Mobile" 
              style={{
                width: "170px",
                height: "200px",
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }} 
            />
            <p className="mt-2 text-gray-600 italic text-sm">Bookmark on your phone</p>
          </div>
        </div>

        {/* Finish Button *
        <div className="mt-6 flex justify-center">
          <button 
            ref={buttonRef}
            onClick={handleFinish} 
            className="bg-green-500 text-white px-4 py-2 rounded text-lg transition duration-300 hover:bg-green-600"
          >
            Finish (4/4)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup4;

*/

import React, { useState, useRef } from "react";
import Confetti from 'react-confetti';
import add_web from '../onboarding_image/add_webapp.png';
import add_mobile from '../onboarding_image/add_mobile.jpeg';

interface Popup4Props {
  onFinish: () => void;
  confettiOptions?: {
    particleCount?: number;
    spread?: number;
    duration?: number;
    gravity?: number;
  };
}

const Popup4: React.FC<Popup4Props> = ({ onFinish, confettiOptions }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const defaultConfettiOptions = {
    particleCount: confettiOptions?.particleCount || 500,
    spread: confettiOptions?.spread || 200,
    duration: confettiOptions?.duration || 2800,
    gravity: confettiOptions?.gravity || 1.2,
  };

  const handleFinish = () => {
    if (buttonRef.current) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onFinish();
      }, defaultConfettiOptions.duration);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      {showConfetti && buttonRef.current && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={defaultConfettiOptions.particleCount}
          gravity={defaultConfettiOptions.gravity}
          recycle={false}
        />
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col justify-between w-full max-w-[500px] h-[450px]">
        {/* Title */}
        <h1 id="popup1-title" className="text-2xl font-bold">Mobile App is Coming Soon 📲</h1>

        {/* Description */}
        <p id="popup4-desc" className="mt-4 text-gray-700 text-lg px-4">
          Meanwhile, save Lucy on your device.
        </p>

        {/* Images en ligne */}
        <div className="mt-4 flex justify-center gap-6">
          {/* Web App Image */}
          <div className="flex flex-col items-center">
            <img 
              src={add_web} 
              alt="Save on Laptop" 
              className="w-[170px] h-[200px] rounded-lg shadow-md object-cover"
            />
            <p className="mt-2 text-gray-600 italic text-sm">Pin on your laptop</p>
          </div>

          {/* Mobile App Image */}
          <div className="flex flex-col items-center">
            <img 
              src={add_mobile} 
              alt="Save on Mobile" 
              className="w-[170px] h-[200px] rounded-lg shadow-md object-cover"
            />
            <p className="mt-2 text-gray-600 italic text-sm">Bookmark on your phone</p>
          </div>
        </div>

        {/* Bouton Finish */}
        <div className="mt-6 flex justify-center">
          <button 
            ref={buttonRef}
            onClick={handleFinish} 
            className="bg-green-500 text-white px-4 py-2 rounded text-lg transition duration-300 hover:bg-green-600"
          >
            Finish (4/4)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup4;
