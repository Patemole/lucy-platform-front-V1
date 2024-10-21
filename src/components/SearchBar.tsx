// SearchBar.tsx
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void; // Function to handle search query
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle the change in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // Trigger the onSearch callback when input changes
  };

  return (
    <div style={styles.searchBarContainer}>
      <input
        type="text"
        placeholder="Search for a student..."
        value={searchTerm}
        onChange={handleInputChange}
        style={styles.searchInput}
      />
    </div>
  );
};

// Inline styles
const styles = {
  searchBarContainer: {
    margin: '20px 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  searchInput: {
    width: '60%', // Adjust the width as needed
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  },
};

export default SearchBar;