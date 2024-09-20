import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { getMusicPrediction } from './api';
import EffectsManager from './EffectsManager';
import './PDFViewer.css';

const PDFViewer = ({ pdfFile, isListeningMode }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [textToRead, setTextToRead] = useState('');
  const [currentScript, setCurrentScript] = useState('');
  const [pageChangeCount, setPageChangeCount] = useState(0);
  const [audio, setAudio] = useState(null);

  const canvasRef = useRef(null);
  const renderTask = useRef(null);

  const audioBaseUrl = 'https://Kom-X.github.io/Book-Reader/audio/';

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(pdfFile));
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
    };

    if (pdfFile) {
      loadPdf();
    }
  }, [pdfFile]);

  useEffect(() => {
    const renderPage = async () => {
      if (pdf) {
        if (renderTask.current) {
          renderTask.current.cancel();
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask.current = page.render(renderContext);

        const textContent = await page.getTextContent();
        const extractedText = textContent.items.map(item => item.str).join(' ');

        setTextToRead(extractedText);
        setCurrentScript(extractedText.substring(0, 500));
        setPageChangeCount(prevCount => prevCount + 1);

        if (document.body.classList.contains('dark-mode')) {
          context.globalCompositeOperation = 'difference';
        } else {
          context.globalCompositeOperation = 'source-over';
        }
      }
    };

    renderPage();
  }, [pdf, pageNumber]);

  useEffect(() => {
    if (isListeningMode && textToRead) {
      const utterance = new SpeechSynthesisUtterance(textToRead);

      // Ensure page changes only after TTS ends
      utterance.onend = () => {
        console.log('TTS ended for page');
        handleNextPage(); // Move to the next page when TTS is done
      };

      // Start speaking the whole page content
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);

      return () => {
        window.speechSynthesis.cancel(); // Clean up on unmount or when switching modes
      };
    }
  }, [textToRead, isListeningMode]);

  useEffect(() => {
    const fetchAndPlayMusic = async () => {
      if (currentScript && pageChangeCount >= 3) {
        try {
          let data = await getMusicPrediction(currentScript);
          let musicTrack = null;

          let pageToCheck = pageNumber;

          while ((!data.predicted_music || data.predicted_music.length === 0) && pageToCheck > 1) {
            console.log(`No music predicted for page ${pageToCheck}, checking previous page...`);
            pageToCheck--;

            const previousPage = await pdf.getPage(pageToCheck);
            const textContent = await previousPage.getTextContent();
            const previousScript = textContent.items.map(item => item.str).join(' ').substring(0, 500);

            data = await getMusicPrediction(previousScript);
          }

          if (data && data.predicted_music && data.predicted_music.length > 0) {
            musicTrack = data.predicted_music[0];
          }

          if (musicTrack) {
            if (audio) {
              audio.pause();
              setAudio(null);
            }

            const newAudio = new Audio(`${audioBaseUrl}${musicTrack}.mp3`);

            newAudio.oncanplaythrough = () => {
              newAudio.play().catch(error => {
                console.error('Error playing audio:', error);
              });
              setAudio(newAudio);
            };

            newAudio.onerror = (event) => {
              console.error(`Error loading audio for track ${musicTrack}:`, event);
            };

            newAudio.onabort = () => {
              console.error('Audio loading was aborted');
            };

            newAudio.onloadeddata = () => {
              console.log('Audio loaded successfully');
            };

            newAudio.onplay = () => {
              console.log('Audio is playing');
            };

            newAudio.onended = () => {
              console.log('Audio playback ended');
            };
          } else {
            console.error('No valid music track predicted after checking fallback pages.');
          }

          setPageChangeCount(0);

        } catch (error) {
          console.error('Error fetching music prediction:', error);
        }
      }
    };

    fetchAndPlayMusic();
  }, [currentScript, pageChangeCount]);

  const handleNextPage = () => {
    if (pdf && pageNumber < numPages) {
      setPageNumber(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pdf && pageNumber > 1) {
      setPageNumber(prevPage => prevPage - 1);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-controls">
        <button className="pdf-button" onClick={handlePrevPage}>Previous</button>
        <div className="page-number">Page {pageNumber} of {numPages}</div>
        <button className="pdf-button" onClick={handleNextPage}>Next</button>
      </div>
      <div className="pdf-canvas-container">
        <canvas
          ref={canvasRef}
          className={`pdf-canvas ${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}`}
        ></canvas>
      </div>

      <EffectsManager text={currentScript} isListeningMode={isListeningMode} />
    </div>
  );
};

export default PDFViewer;
