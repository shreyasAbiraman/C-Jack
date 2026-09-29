import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, GUIDANCE_CATALOG } from '../services/guidanceCatalog';
import { voiceService } from '../services/voiceService';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
  // 1. Language persistence in localStorage (Requirements: "Language can be changed from settings. Persist selected language.")
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('cjack_voice_language');
      const exists = SUPPORTED_LANGUAGES.some(l => l.code === saved);
      return exists ? saved : 'en';
    } catch (e) {
      return 'en';
    }
  });

  const [activeStateKey, setActiveStateKey] = useState('CPR_STARTED');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(85); // 85 dB SPL
  const [activeDriver, setActiveDriverState] = useState('webSpeech');

  // Sync language changes to localStorage
  const setLanguage = useCallback((langCode) => {
    const exists = SUPPORTED_LANGUAGES.some(l => l.code === langCode);
    if (exists) {
      setSelectedLanguage(langCode);
      try {
        localStorage.setItem('cjack_voice_language', langCode);
      } catch (e) {
        // ignore storage errors
      }
    }
  }, []);

  const setVolume = useCallback((vol) => {
    setVolumeState(vol);
    voiceService.setVolume(vol / 100);
  }, []);

  const setAudioDriver = useCallback((driverName) => {
    setActiveDriverState(driverName);
    voiceService.setDriver(driverName);
  }, []);

  // Main Speak function
  const speakState = useCallback((stateKey, overrideLang = null) => {
    const lang = overrideLang || selectedLanguage;
    const stateObj = GUIDANCE_CATALOG[stateKey] || GUIDANCE_CATALOG.CPR_STARTED;
    const promptText = stateObj.prompts[lang] || stateObj.prompts.en;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

    setActiveStateKey(stateKey);
    setIsPlaying(true);

    voiceService.speak(promptText, {
      bcp47: langObj.bcp47,
      stateKey,
      language: lang,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  }, [selectedLanguage]);

  const stopPlayback = useCallback(() => {
    voiceService.stop();
    setIsPlaying(false);
  }, []);

  // Get current active prompt text and visual details
  const activeGuidance = GUIDANCE_CATALOG[activeStateKey] || GUIDANCE_CATALOG.CPR_STARTED;
  const currentPrompt = activeGuidance.prompts[selectedLanguage] || activeGuidance.prompts.en;
  const englishPrompt = activeGuidance?.prompts?.en || '';
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const speakCondition = useCallback((condition) => {
    if (condition === 'LOW') {
      speakState('HEART_RATE_LOW');
    } else if (condition === 'CRITICAL') {
      speakState('HEART_RATE_CRITICAL');
    } else if (condition === 'NORMAL') {
      speakState('HEART_RATE_NORMAL');
    }
  }, [speakState]);

  return (
    <VoiceContext.Provider
      value={{
        selectedLanguage,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguageObj: currentLangObj,
        activeStateKey,
        activeGuidance,
        currentPrompt,
        englishPrompt,
        isPlaying,
        volume,
        setVolume,
        activeDriver,
        setAudioDriver,
        speak: speakState,
        speakCondition,
        stop: stopPlayback,
        catalog: GUIDANCE_CATALOG
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
