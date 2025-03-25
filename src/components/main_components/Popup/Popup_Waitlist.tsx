// components/WaitlistPopup.tsx
import React, { useState, useEffect, useRef } from "react";

interface WaitlistPopupProps {
  universityName: string;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ universityName, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = () => {
    if (email.trim()) {
      onSubmit(email.trim());
      setEmail("");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-popup-title"
      aria-describedby="waitlist-popup-desc"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto">
        <div className="p-6">
          <h2 id="waitlist-popup-title" className="text-lg font-bold text-gray-900">
            Join the Waitlist 🎓
          </h2>
          <p id="waitlist-popup-desc" className="mt-2 text-sm text-gray-600">
            Lucy isn't available at <strong>{universityName}</strong> yet. Enter your email below, and we'll notify you when it launches!
          </p>

          <input
            ref={inputRef}
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 w-full p-3 border rounded-lg text-gray-900"
            aria-label="Your email address"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPopup;