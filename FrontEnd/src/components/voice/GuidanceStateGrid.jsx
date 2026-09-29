import React from 'react';
import { useVoice } from '../../context/VoiceContext';
import { 
  Play, 
  Square, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Radio,
  Eye
} from 'lucide-react';

/**
 * GuidanceStateGrid
 * 
 * Interactive showcase and tester for all 14 guidance states:
 * 1. Device activated
 * 2. Checking vitals
 * 3. Position device
 * 4. Cardiac arrest suspected
 * 5. Confirmation in progress
 * 6. CPR started
 * 7. Emergency alert sent
 * 8. GPS unavailable
 * 9. Network unavailable
 * 10. Battery low
 * 11. Sensor disconnected
 * 12. CPR paused
 * 13. Emergency stop
 * 14. Responder approaching
 */
export const GuidanceStateGrid = () => {
  const { 
    catalog, 
    selectedLanguage, 
    currentLanguageObj, 
    activeStateKey, 
    isPlaying, 
    speak, 
    stop 
  } = useVoice();

  const states = Object.values(catalog);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              14 Medical & Operational Guidance States
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono">
              AUDIO & VISUAL PAIRS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any state to broadcast synthesized audio in {currentLanguageObj.name} and preview visual UI equivalent.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 self-start sm:self-auto">
          Active Voice: <span className="text-cyan-400 font-bold">{currentLanguageObj.name}</span>
        </div>
      </div>

      {/* Grid of 14 states */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3.5">
        {states.map((st) => {
          const isCurrent = activeStateKey === st.id;
          const isCurrentlyBroadcasting = isCurrent && isPlaying;
          const promptText = st.prompts[selectedLanguage] || st.prompts.en;
          const englishText = st.prompts.en;
          const isEnglish = selectedLanguage === 'en';

          return (
            <div
              key={st.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isCurrentlyBroadcasting
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : isCurrent
                  ? 'bg-slate-850 border-cyan-600/60'
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div>
                {/* State Top Strip */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      STATE {st.order.toString().padStart(2, '0')}
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                      {st.title}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.2 text-[9px] font-black rounded uppercase font-mono ${
                    st.severity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border border-red-800/50'
                      : st.severity === 'ACTION'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      : st.severity === 'ADVISORY'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {st.severity}
                  </span>
                </div>

                {/* Voice Audio Phrase */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 mb-2">
                  <div className="text-[9px] font-mono text-cyan-400 uppercase mb-0.5">
                    VOICE PHRASE ({currentLanguageObj.nativeName}):
                  </div>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    "{promptText}"
                  </p>
                  {!isEnglish && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                      En: "{englishText}"
                    </p>
                  )}
                </div>

                {/* Visual Equivalent Specification (Exact Requirement) */}
                <div className="p-2 rounded bg-slate-900/50 border border-slate-800/60 text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 uppercase mb-0.5">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Visual Equivalent Display:</span>
                  </div>
                  <div className="font-bold text-slate-200 uppercase text-[10px]">
                    [{st.visualTitle}]
                  </div>
                  <div className="text-slate-400 text-[10px] truncate mt-0.5">
                    Action: {st.visualAction}
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Speaker Output: 85 dBA SPL
                </span>

                <button
                  onClick={() => {
                    if (isCurrentlyBroadcasting) {
                      stop();
                    } else {
                      speak(st.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded transition-colors ${
                    isCurrentlyBroadcasting
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-cyan-600/80 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {isCurrentlyBroadcasting ? (
                    <>
                      <Square className="w-3 h-3" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Test Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
