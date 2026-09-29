import React, { useState } from 'react';
import { Volume2, VolumeX, Globe, Play, Check } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const VoiceGuidancePanel = ({
  activePrompt = 'Stand clear of the patient. Automated chest compressions commencing now.',
  languages = [
    { code: 'en', name: 'English', text: 'Stand clear of the patient. Automated chest compressions commencing now.' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', text: 'ರೋಗಿಯಿಂದ ದೂರ ನಿಲ್ಲಿ. ಸ್ವಯಂಚಾಲಿತ ಸಿಪಿಆರ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ.' },
    { code: 'hi', name: 'Hindi (हिन्दी)', text: 'मरीज से दूर रहें। स्वचालित सीपीआर शुरू हो रहा है।' },
    { code: 'es', name: 'Spanish (Español)', text: 'Aléjese del paciente. Las compresiones automáticas comienzan ahora.' }
  ],
  volumeDb = 85,
  isEmergency = false,
  className = ''
}) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentText = languages.find(l => l.code === selectedLang)?.text || activePrompt;

  const handleTestAudio = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2500);
  };

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Volume2 className="h-4 w-4 text-cjack-accent" />
          <span>Multilingual Voice Guidance</span>
        </div>
        <StatusBadge
          status={isEmergency ? 'CRITICAL' : 'NORMAL'}
          size="sm"
          text={isEmergency ? 'SPEAKER BROADCASTING' : 'STANDBY (85 dB)'}
          pulse={isEmergency}
        />
      </div>

      {/* Active Broadcast Box */}
      <div className="p-3 rounded-lg bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark mb-3">
        <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">
          Current Audio Synthesizer Output:
        </span>
        <p className="text-sm font-semibold text-gray-900 dark:text-white italic">
          "{currentText}"
        </p>
      </div>

      {/* Language Buttons & Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelectedLang(l.code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                selectedLang === l.code
                  ? 'bg-cjack-primary text-white shadow-sm'
                  : 'bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleTestAudio}
          disabled={isPlaying}
          className="px-3 py-1 text-xs font-bold rounded bg-cjack-accent text-white hover:bg-sky-600 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Play className="h-3 w-3" />
          <span>{isPlaying ? 'Broadcasting...' : 'Play Prompt'}</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceGuidancePanel;
