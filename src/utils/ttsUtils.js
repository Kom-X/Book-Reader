// src/utils/ttsUtils.js

/**
 * Calculate delay in milliseconds based on TTS speed in WPM and segment length.
 * @param {number} wpm - Words per minute.
 * @param {number} segmentLength - Length of text segment in characters.
 * @returns {number} - Delay in milliseconds.
 */
export function calculateDelay(wpm, segmentLength) {
    // Average words per character (approximated)
    const wordsPerCharacter = 0.5;
    const words = segmentLength * wordsPerCharacter;
    const minutes = words / wpm;
    return minutes * 60 * 1000; // Convert minutes to milliseconds
  }
  