import React, { useState, useEffect, useRef } from 'react';
import { getMusicPrediction } from './api';

const EffectsManager = ({ text, isListeningMode }) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [activeEffects, setActiveEffects] = useState([]);
  const effectIntervalRef = useRef(null);
  const chunkSize = 500;
  const totalChunks = useRef([]); // Store all the chunks from the extracted text

  // Helper function to load and play an audio effect
  const loadAudioEffect = (effect) => {
    return new Promise((resolve, reject) => {
      const effectAudio = new Audio(`https://Kom-X.github.io/Book-Reader/Effects/${effect}.mp3`);

      effectAudio.oncanplaythrough = () => {
        console.log('Effect can play through:', effect);
        effectAudio.play()
          .then(() => {
            console.log('Effect is playing:', effect);
            resolve(effectAudio);
          })
          .catch(reject);
      };

      effectAudio.onerror = (event) => {
        console.error('Error loading effect:', event);
        reject(new Error(`Failed to load effect: ${effect}`));
      };

      effectAudio.onended = () => {
        console.log('Effect playback ended:', effect);
        removeEffect(effectAudio);
        resolve();
      };

      setActiveEffects((prevEffects) => [...prevEffects, effectAudio]);
    });
  };

  const removeEffect = (effectAudio) => {
    if (effectAudio) {
      console.log('Removing effect:', effectAudio.src);
      effectAudio.pause();
      effectAudio.src = '';
      effectAudio.load();
    }
  };

  // Play effects one by one with a delay (0s, 7s, 14s, etc.)
  const playEffectsSequentiallyWithDelay = (effects) => {
    effects.forEach((effect, index) => {
      setTimeout(() => {
        console.log(`Playing effect ${effect} at ${index * 11000} ms`);
        loadAudioEffect(effect).catch(error => {
          console.error('Error playing effect:', error);
        });
      }, index * 11000); // Delay for each effect
    });
  };

  // Function to fetch effects for a specific chunk
  const fetchEffectsForChunk = async (chunk) => {
    try {
      const response = await getMusicPrediction(chunk);
      if (response && response.predicted_effects) {
        console.log('Predicted effects:', response.predicted_effects);
        playEffectsSequentiallyWithDelay(response.predicted_effects);
      }
    } catch (error) {
      console.error('Error fetching effects:', error);
    }
  };

  // Start processing the chunks sequentially
  const processNextChunk = () => {
    if (currentChunkIndex < totalChunks.current.length) {
      const chunk = totalChunks.current[currentChunkIndex];
      console.log(`Processing chunk ${currentChunkIndex + 1}:`, chunk);

      fetchEffectsForChunk(chunk); // Fetch effects for the current chunk

      setCurrentChunkIndex((prevIndex) => prevIndex + 1); // Move to the next chunk

      // Set up the next chunk to be processed after 37 seconds
      effectIntervalRef.current = setTimeout(() => {
        processNextChunk(); // Process the next chunk after the delay
      }, 37000);
    } else {
      console.log('All chunks processed.');
      clearTimeout(effectIntervalRef.current); // Clear the interval once all chunks are processed
    }
  };

  // Extract all chunks from the text when text or isListeningMode changes
  useEffect(() => {
    if (isListeningMode && text.length > 0) {
      // Split the text into chunks of 500 characters
      totalChunks.current = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        totalChunks.current.push(text.substring(i, i + chunkSize));
      }
      console.log('Total chunks extracted:', totalChunks.current.length);

      setCurrentChunkIndex(0); // Reset the chunk index
      processNextChunk(); // Start processing the first chunk

      return () => {
        clearTimeout(effectIntervalRef.current); // Cleanup on unmount or stop
        stopEffects(); // Cleanup effects
      };
    } else {
      clearTimeout(effectIntervalRef.current);
      stopEffects();
    }
  }, [text, isListeningMode]);

  const stopEffects = () => {
    activeEffects.forEach((effectAudio) => removeEffect(effectAudio));
    setActiveEffects([]);
  };

  useEffect(() => {
    return () => {
      clearTimeout(effectIntervalRef.current);
      stopEffects();
    };
  }, []);

  return null;
};

export default EffectsManager;
