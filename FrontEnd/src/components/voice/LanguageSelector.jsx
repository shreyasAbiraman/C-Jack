import React from 'react';
import { useVoice } from '../../context/VoiceContext';
import { Globe, CheckCircle2 } from 'lucide-react';

/**
 * LanguageSelector
 * 
 * Selects between the 6 supported languages:
 * English, Tamil, Hindi, Telugu, Kannada, Malayalam
 * 
 * Language selection persists in localStorage.
 */
export const LanguageSelector = ({ variant = 'card' }) => {
  const { selectedLanguage, setLanguage, supportedLanguages } = useVoice();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {supportedLanguages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all ${
                isSelected
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="mr-1">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Multilingual Audio Localization (6 Regional Languages)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
          PERSISTENT SETTING
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Voice prompts synthesized via browser Text-To-Speech or hardware DAC. The selected language is saved automatically to device preferences.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {supportedLanguages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;

          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/50 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{lang.flag}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-600 uppercase">{lang.code}</span>
                )}
              </div>

              <div>
                <div className={`text-sm font-bold tracking-tight ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}>
                  {lang.nativeName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {lang.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
