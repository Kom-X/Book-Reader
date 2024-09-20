// src/App.js
import React, { useState } from 'react';
import Dropzone from './components/Dropzone';
import PDFViewer from './components/PDFViewer';
import './index.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListeningMode, setIsListeningMode] = useState(false);

  const handleFileDrop = (file) => {
    setPdfFile(file);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    document.body.className = !isDarkMode ? 'dark-mode' : 'light-mode';
  };

  const toggleListeningMode = () => {
    setIsListeningMode(prevMode => !prevMode);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h1>Book Reader</h1>
      <div className="button-group">
        <button className="mode-button" onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {pdfFile && (
          <button className="mode-button" onClick={toggleListeningMode}>
            {isListeningMode ? 'Switch to Reading Mode' : 'Switch to Listening Mode'}
          </button>
        )}
      </div>
      {!pdfFile ? (
        <Dropzone onFileDrop={handleFileDrop} />
      ) : (
        <PDFViewer pdfFile={pdfFile} isListeningMode={isListeningMode} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default App;
