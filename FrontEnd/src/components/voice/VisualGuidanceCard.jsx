import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Globe, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Radio,
  Zap,
  Activity,
  Heart,
  Target
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';

/**
 * VisualGuidanceCard
 * 
 * Requirement: "Every voice instruction should have a visual equivalent.
 * Example:
 * Voice: 'Position CJack correctly.'
 * UI: [Chest alignment illustration] ALIGN DEVICE WITH STERNUM"
 */
export const VisualGuidanceCard = () => {
  const { 
    activeGuidance, 
    currentPrompt, 
    englishPrompt, 
    selectedLanguage, 
    currentLanguageObj, 
    isPlaying, 
    speak, 
    stop, 
    volume 
  } = useVoice();

  const isEnglish = selectedLanguage === 'en';
  const severity = activeGuidance?.severity || 'NORMAL';

  // Severity styling
  const getSeverityTheme = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-red-600',
          bg: 'from-red-950/90 via-slate-900 to-slate-950',
          badgeBg: 'bg-red-700 text-white',
          accent: 'text-red-400',
          iconBg: 'bg-red-600 text-white'
        };
      case 'ACTION':
        return {
          border: 'border-amber-600',
          bg: 'from-amber-950/80 via-slate-900 to-slate-950',
          badgeBg: 'bg-amber-600 text-slate-950 font-bold',
          accent: 'text-amber-400',
          iconBg: 'bg-amber-500 text-slate-950'
        };
      case 'ADVISORY':
        return {
          border: 'border-blue-600',
          bg: 'from-blue-950/80 via-slate-900 to-slate-950',
          badgeBg: 'bg-blue-600 text-white',
          accent: 'text-blue-400',
          iconBg: 'bg-blue-600 text-white'
        };
      default:
        return {
          border: 'border-cyan-600',
          bg: 'from-cyan-950/80 via-slate-900 to-slate-950',
          badgeBg: 'bg-cyan-700 text-white',
          accent: 'text-cyan-400',
          iconBg: 'bg-cyan-600 text-white'
        };
    }
  };

  const theme = getSeverityTheme();

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} border-2 ${theme.border} p-5 md:p-6 text-white shadow-2xl backdrop-blur-md`}>
      {/* Top Bar: Broadcast Status & Language Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.iconBg} shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}>
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
                ACTIVE VOICE GUIDANCE BROADCAST
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${theme.badgeBg}`}>
                {severity}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-white font-mono">
                {currentLanguageObj.nativeName} ({currentLanguageObj.name})
              </span>
              <span className="text-slate-400 text-xs font-mono">• 85 dBA Speaker SPL</span>
            </div>
          </div>
        </div>

        {/* Audio Control Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPlaying ? (
            <button
              onClick={stop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition-colors shadow-sm"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              onClick={() => speak(activeGuidance.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Broadcast Prompt</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Visual & Audio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left (8 Cols): Voice Instruction & Visual Text Equivalent */}
        <div className="lg:col-span-8 space-y-4">
          {/* Spoken Voice Phrase */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
              <span>Voice Instruction ({currentLanguageObj.name}):</span>
              {isPlaying && (
                <span className="flex items-center gap-1 text-cyan-400 font-bold animate-pulse">
                  <Radio className="w-3 h-3" /> AUDIO BROADCASTING
                </span>
              )}
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              "{currentPrompt}"
            </p>

            {/* Non-English reference subtitle */}
            {!isEnglish && (
              <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-mono">
                <span className="text-slate-500">English translation:</span> "{englishPrompt}"
              </p>
            )}
          </div>

          {/* VISUAL EQUIVALENT HEADLINE (Exact Requirement) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
              VISUAL DISPLAY EQUIVALENT (ON-JACKET OLED & CONSOLE):
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">
              {activeGuidance.visualTitle}
            </div>
            <div className="text-xs font-mono text-slate-300 mt-1">
              {activeGuidance.visualSubtitle}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-xs font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>ACTION: {activeGuidance.visualAction}</span>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): SVG Anatomical / State Graphic Illustration */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="w-36 h-36 relative flex items-center justify-center">
            {/* Pulsing visual halo */}
            <div className={`absolute inset-0 rounded-full bg-cyan-500/10 ${isPlaying ? 'animate-ping' : ''}`}></div>

            {/* Dynamic Diagram Render */}
            {activeGuidance.diagramType === 'CHEST_ALIGNMENT' && (
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                {/* Torso outline */}
                <path d="M 20 40 Q 60 10 100 40 L 95 105 Q 60 115 25 105 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                {/* Ribcage lines */}
                <line x1="40" y1="50" x2="55" y2="55" stroke="#334155" strokeWidth="2" />
                <line x1="80" y1="50" x2="65" y2="55" stroke="#334155" strokeWidth="2" />
                <line x1="38" y1="65" x2="55" y2="70" stroke="#334155" strokeWidth="2" />
                <line x1="82" y1="65" x2="65" y2="70" stroke="#334155" strokeWidth="2" />
                {/* Sternum Target Circle */}
                <circle cx="60" cy="65" r="16" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="60" cy="65" r="6" fill="#06b6d4" />
                <line x1="60" y1="40" x2="60" y2="90" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="35" y1="65" x2="85" y2="65" stroke="#06b6d4" strokeWidth="1.5" />
              </svg>
            )}

            {activeGuidance.diagramType === 'CPR_ACTIVE' && (
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#ef4444" strokeWidth="3" />
                <path d="M 40 60 Q 60 25 80 60 Q 60 95 40 60 Z" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" />
                {/* Piston arrow */}
                <path d="M 60 30 L 60 70 M 50 60 L 60 75 L 70 60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <text x="60" y="100" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">108 CPM</text>
              </svg>
            )}

            {activeGuidance.diagramType === 'COUNTDOWN' && (
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#334155" strokeWidth="4" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="280" strokeDashoffset="70" />
                <text x="60" y="70" fill="#fbbf24" fontSize="32" fontWeight="black" textAnchor="middle" fontFamily="monospace">3</text>
                <text x="60" y="90" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">SECONDS</text>
              </svg>
            )}

            {activeGuidance.diagramType !== 'CHEST_ALIGNMENT' && 
             activeGuidance.diagramType !== 'CPR_ACTIVE' && 
             activeGuidance.diagramType !== 'COUNTDOWN' && (
              <div className="p-6 rounded-full bg-slate-900 border-2 border-cyan-500/50 text-cyan-400">
                <Activity className="w-12 h-12 animate-pulse" />
              </div>
            )}
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase block">
              [Visual Guide Equivalent]
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Synchronized Audio-Visual Cue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
