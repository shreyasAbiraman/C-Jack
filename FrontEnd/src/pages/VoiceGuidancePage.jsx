import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import { SectionHeader, StatusBadge } from '../components/ui';
import { VisualGuidanceCard } from '../components/voice/VisualGuidanceCard';
import { LanguageSelector } from '../components/voice/LanguageSelector';
import { GuidanceStateGrid } from '../components/voice/GuidanceStateGrid';
import { 
  Volume2, 
  Mic, 
  Globe, 
  Radio, 
  ShieldCheck, 
  Sliders,
  Cpu,
  Layers
} from 'lucide-react';

const VoiceGuidancePage = () => {
  const { 
    selectedLanguage, 
    currentLanguageObj, 
    activeGuidance, 
    isPlaying, 
    volume, 
    setVolume, 
    activeDriver, 
    setAudioDriver 
  } = useVoice();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <SectionHeader
        title="Multilingual Voice Guidance & Audio System"
        question="What voice instructions are currently active for bystanders and responders across all languages?"
        statusBadge={
          <StatusBadge
            status={isPlaying ? 'emergency' : 'safe'}
            text={isPlaying ? `AUDIO ACTIVE: ${currentLanguageObj.code.toUpperCase()}` : 'SPEAKER STANDBY (85 dBA)'}
            pulse={isPlaying}
          />
        }
      />

      {/* =========================================================================
          PROMINENT VISUAL GUIDANCE CARD WITH AUDIO BROADCAST
          (Voice instruction + visual headline + anatomical illustration)
          ========================================================================= */}
      <VisualGuidanceCard />

      {/* =========================================================================
          6 REGIONAL & INTERNATIONAL LANGUAGE OPTIONS
          (English, Tamil, Hindi, Telugu, Kannada, Malayalam - Extensible)
          ========================================================================= */}
      <LanguageSelector variant="card" />

      {/* =========================================================================
          14 GUIDANCE STATES INTERACTIVE GRID (AUDIO & VISUAL PAIRS)
          ========================================================================= */}
      <GuidanceStateGrid />

      {/* =========================================================================
          ACOUSTIC HARDWARE PARAMETERS & AUDIO DRIVER SETTINGS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hardware Audio Layer Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Acoustic Hardware Parameters (Physical Vest)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">I2S DAC CODEC</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">SPEAKER OUTPUT SPL:</span>
              <span className="font-bold text-emerald-400">85 dBA @ 1 Meter (AHA Standard)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">CLASS-D AMPLIFIER:</span>
              <span className="font-bold text-white">Maxim Integrated MAX98357A I2S Mono</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">AMBIENT NOISE AGC:</span>
              <span className="font-bold text-cyan-300">Active Auto-Gain (+6dB in high ambient noise)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">SPI FLASH PROMPT BANK:</span>
              <span className="font-bold text-slate-200">16 MB Winbond W25Q128 (PCM audio buffers)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">AUDIO LATENCY:</span>
              <span className="font-bold text-emerald-400">12 ms (Zero jitter)</span>
            </div>
          </div>
        </div>

        {/* Audio Driver & Speaker Volume Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Audio System Driver Abstraction
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400">PLUGGABLE ARCHITECTURE</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1.5">Active Audio Driver:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAudioDriver('webSpeech')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      activeDriver === 'webSpeech'
                        ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-[11px]">WebSpeech</span>
                    <span className="text-[9px] text-slate-500">Browser TTS</span>
                  </button>

                  <button
                    onClick={() => setAudioDriver('hardwareBridge')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      activeDriver === 'hardwareBridge'
                        ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-[11px]">Hardware Bridge</span>
                    <span className="text-[9px] text-slate-500">I2S Vest DAC</span>
                  </button>

                  <button
                    onClick={() => setAudioDriver('mock')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      activeDriver === 'mock'
                        ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-[11px]">Mock Synthesizer</span>
                    <span className="text-[9px] text-slate-500">Audio Tone</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Speaker Volume:</span>
                  <span className="text-cyan-400 font-bold">{volume}% ({Math.round(60 + (volume / 100) * 35)} dBA)</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Quiet (60 dBA)</span>
                  <span>Emergency Nominal (85 dBA)</span>
                  <span>Street Max (95 dBA)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Selected Language Persistence:</span>
            <span className="text-emerald-400 font-bold">SAVED (localStorage: {selectedLanguage})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceGuidancePage;
