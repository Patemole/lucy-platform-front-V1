// pages/UniversityListPage.tsx
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import lucyLogo from '../../logo_lucy.png';
import { useNavigate } from 'react-router-dom';
import universitiesList from '../../data/us_universities.json';
import WaitlistPopup from '../../components/main_components/Popup/Popup_Waitlist';
import { sendUniversityRequestEmail } from '../../api/auth_and_onboarding';

interface University {
  name: string;
  signupLink?: string;
  logoUrl?: string;
}

const UniversityListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [universitiesLucy, setUniversitiesLucy] = useState<University[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      const snapshot = await getDocs(collection(db, 'universities'));
      const uniList = snapshot.docs.map(doc => doc.data() as University);
      setUniversitiesLucy(uniList);
    };
    fetchUniversities();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.length > 1) {
      const matches = universitiesList
        .filter((uni) => uni.institution.toLowerCase().includes(term.toLowerCase()))
        .map((uni) => uni.institution)
        .slice(0, 10);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleUniversityClick = (uni: University) => {
    if (uni.signupLink) {
      window.open(uni.signupLink, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedUniversity(uni.name);
      setModalOpen(true);
    }
  };

  const handleAddUniversity = () => {
    if (!searchTerm) return;
    const existing = universitiesLucy.find(u => u.name.toLowerCase() === searchTerm.toLowerCase());

    if (existing) {
      handleUniversityClick(existing);
    } else {
      setSelectedUniversity(searchTerm);
      setModalOpen(true);
    }
  };

  const handleWaitlistSubmit = async (email: string) => {
    const existingUni = universitiesLucy.find(
      u => u.name.toLowerCase() === selectedUniversity.toLowerCase()
    );
  
    if (existingUni) {
      await addDoc(collection(db, 'waitlist'), { email, university: selectedUniversity });
      await sendUniversityRequestEmail(email, selectedUniversity);
    } else {
      await addDoc(collection(db, 'requested_universities'), { email, name: selectedUniversity });
      await sendUniversityRequestEmail(email, selectedUniversity);
    }
  
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center p-4 bg-white shadow-sm">
        <img src={lucyLogo} alt="Lucy Logo" className="h-8" />
        <h1 className="text-lg font-medium text-gray-800">Select your University</h1>
      </header>

      <main className="max-w-xl mx-auto mt-10">
        <h2 className="text-lg font-medium mb-2">Universities offering Lucy</h2>
        <div className="max-h-96 overflow-y-auto bg-white rounded-lg shadow-sm border">
          {universitiesLucy.map((uni, idx) => (
            <div
              key={idx}
              onClick={() => handleUniversityClick(uni)}
              className="flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
            >
              {uni.logoUrl && (
                <img
                  src={uni.logoUrl}
                  alt={`${uni.name} logo`}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
              )}
              <span>{uni.name}</span>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-medium mt-8 mb-2">Can't find your uni? Add it to bring Lucy to your campus!</h2>
        <input
          type="text"
          placeholder="Type the name of your university..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        {suggestions.length > 0 && (
          <div className="border bg-white rounded-lg shadow-sm">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSearchTerm(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddUniversity}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Join the Waitlist
        </button>

        {modalOpen && (
          <WaitlistPopup
            universityName={selectedUniversity}
            onClose={() => setModalOpen(false)}
            onSubmit={handleWaitlistSubmit}
          />
        )}
      </main>
    </div>
  );
};

export default UniversityListPage;


