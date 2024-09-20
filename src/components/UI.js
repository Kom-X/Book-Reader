// src/components/UI.js
import React from 'react';
import './UI.css';  // Import for CSS styling

const UI = ({ onPrevPage, onNextPage, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="ui-container">
      <div className="frame-background">
        {/* Previous Page Button */}
        <button className="custom-button" onClick={onPrevPage}>
          Previous Page
        </button>

        {/* Dark Mode Toggle Button */}
        <button className="custom-button" onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Next Page Button */}
        <button className="custom-button" onClick={onNextPage}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default UI;
