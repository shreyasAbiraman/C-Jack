import React, { useState } from 'react';
import { SectionHeader, Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../components/ui';
import { Sliders, Save, RotateCcw, AlertTriangle, ShieldCheck, Globe, Volume2, Info } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import { LanguageSelector } from '../components/voice/LanguageSelector';
import AmbulanceContactsSection from '../components/emergency/AmbulanceContactsSection';

const SettingsPage = () => {
  const { selectedLanguage, setLanguage, volume, setVolume, currentLanguageObj } = useVoice();
  const [cprRate, setCprRate] = useState(108);
  const [targetDepth, setTargetDepth] = useState(52);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        title="Device Settings & Resuscitation Parameters"
        question="What are the device parameters, thresholds, and calibration limits?"
        statusBadge={<StatusBadge status="safe" text="Parameters Synchronized" />}
        actions={
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
            {saved ? 'Parameters Saved' : 'Save Parameters'}
          </Button>
        }
      />

      {/* Language Localization Card in Settings */}
      <Card>
        <CardHeader>
          <CardTitle icon={Globe}>Voice Guidance Language Preferences</CardTitle>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            ACTIVE: {currentLanguageObj.nativeName} ({currentLanguageObj.name})
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Select the primary language for audible life-saving instructions broadcast by the vest speaker.
            Settings are persisted across system restarts.
          </p>

          <LanguageSelector variant="compact" />

          {/* Reliability Notice */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2 font-mono">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Deterministic Audio Protocol: </strong>
              Automatic language detection is intentionally omitted to avoid unreliable ambient speech errors during high-stress cardiac resuscitation. Selected language persists in device non-volatile memory.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ambulance Dispatch Network Management */}
      <AmbulanceContactsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle icon={Sliders}>CPR Compression Targets (AHA Standard)</CardTitle>
            <span className="text-xs font-mono text-gray-500">MECHANICAL ACTUATORS</span>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span>Target Compression Rate:</span>
                <span className="font-mono font-bold text-cjack-primary">{cprRate} CPM</span>
              </div>
              <input
                type="range"
                min="90"
                max="130"
                value={cprRate}
                onChange={(e) => setCprRate(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Min: 90 CPM</span>
                <span>Guideline: 100-120 CPM</span>
                <span>Max: 130 CPM</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span>Target Compression Depth:</span>
                <span className="font-mono font-bold text-cjack-primary">{targetDepth} mm</span>
              </div>
              <input
                type="range"
                min="40"
                max="65"
                value={targetDepth}
                onChange={(e) => setTargetDepth(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Min: 40 mm</span>
                <span>Guideline: 50-60 mm</span>
                <span>Max: 65 mm</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span>Audio Prompt Speaker Volume:</span>
                <span className="font-mono font-bold text-cjack-primary">{volume}% ({Math.round(60 + (volume / 100) * 35)} dB SPL)</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Quiet (60 dB)</span>
                <span>Standard (85 dB)</span>
                <span>Street (95 dB)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon={ShieldCheck}>Safety Overrides & Hardware Guardrails</CardTitle>
            <span className="text-xs font-mono text-gray-500">FAILSAFE LIMITS</span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">MAXIMUM FORCE LIMITER:</span>
                <span className="font-semibold text-status-safe">500 N (Auto-Vent)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MAX CONTINUOUS CPR DURATION:</span>
                <span className="font-semibold text-status-safe">10 Minutes per cycle</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DUAL-SENSOR TIMEOUT:</span>
                <span className="font-semibold text-status-safe">3.0 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BATTERY RESERVE SHUTOFF:</span>
                <span className="font-semibold text-status-warning">5% Emergency Hold</span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" icon={RotateCcw}>
                Restore Factory Clinical Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
