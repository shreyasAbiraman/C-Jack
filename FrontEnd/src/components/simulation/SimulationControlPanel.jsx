/**
 * SimulationControlPanel
 * Developer-only floating control panel for the CJack Simulation Engine.
 * 
 * Toggle: Ctrl+Shift+D
 * Position: Fixed bottom-right corner, collapsible.
 *
 * NOTICE: This panel controls simulated data only. Not for clinical use.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import { SCENARIOS } from '../../simulation/simulationScenarios';
import {
  Zap, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Square,
  AlertTriangle, WifiOff, Wifi, Battery, Heart, Activity,
  FlaskConical, Timer, Settings, X, ChevronRight, FastForward,
  Radio
} from 'lucide-react';

// ─── Parameter Slider ─────────────────────────────────────────────────────────
const ParameterSlider = ({ label, paramKey, min, max, step = 1, unit, value, onSet }) => {
  const [localVal, setLocalVal] = useState(value ?? Math.round((min + max) / 2));

  useEffect(() => {
    if (value !== undefined && value !== null) setLocalVal(value);
  }, [value]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-[11px] font-mono font-bold text-white tabular-nums">
          {localVal}{unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localVal}
          onChange={e => {
            const v = parseFloat(e.target.value);
            setLocalVal(v);
            onSet(paramKey, v);
          }}
          className="flex-1 h-1.5 accent-amber-400 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// ─── Scenario Button ───────────────────────────────────────────────────────────
const ScenarioButton = ({ scenario, isActive, onSelect }) => (
  <button
    onClick={() => onSelect(scenario.id)}
    title={scenario.description}
    className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded text-left w-full transition-all border text-[10px] font-mono
      ${isActive
        ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-200'
      }`}
  >
    <span className="text-sm leading-none shrink-0">{scenario.icon}</span>
    <span className="truncate">{scenario.name}</span>
    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
  </button>
);

// ─── Timeline Progress ─────────────────────────────────────────────────────────
const TimelineBar = ({ progress, elapsed, total, isPaused, isDemo }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-mono text-slate-500">
      <span>{isDemo ? 'DEMO LOOP' : 'TIMELINE'} {isPaused ? '— PAUSED' : ''}</span>
      <span>{Math.round(elapsed)}s / {Math.round(total)}s</span>
    </div>
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${isPaused ? 'bg-amber-500' : isDemo ? 'bg-violet-500' : 'bg-emerald-500'}`}
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  </div>
);

// ─── Main Panel ────────────────────────────────────────────────────────────────
const SimulationControlPanel = () => {
  const {
    simulationMode, activeScenario, isPaused, isRunningDemo,
    timelineProgress, timelineTotalSeconds, timelineElapsedSeconds,
    currentSystemState,
    startScenario, triggerInstant, pause, resume, reset, startDemoLoop,
    setParameter, setTimelineSpeed, timelineSpeed,
    triggerEmergency, triggerSensorFailure, triggerNetworkFailure,
    restoreNetwork, triggerBatteryLow, triggerROSC,
  } = useSimulation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'controls' | 'params'
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenario?.id || 1);
  const panelRef = useRef(null);

  // Ctrl+Shift+D keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleStartScenario = useCallback(() => {
    startScenario(selectedScenarioId, true);
  }, [selectedScenarioId, startScenario]);

  const handleInstantApply = useCallback((id) => {
    setSelectedScenarioId(id);
    triggerInstant(id);
  }, [triggerInstant]);

  // Derive param values from current sim state
  const vitals = currentSystemState?.vitals || {};
  const device = currentSystemState?.device || {};
  const cpr = currentSystemState?.cpr || {};

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="Simulation Control Panel (Ctrl+Shift+D)"
        className={`fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-2xl border transition-all
          ${isOpen
            ? 'bg-amber-500 border-amber-400 text-black rotate-45'
            : 'bg-slate-900 border-amber-400/60 text-amber-400 hover:bg-slate-800 hover:border-amber-400'
          }`}
      >
        {isOpen ? <X className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-5 z-50 w-80 max-h-[80vh] flex flex-col bg-slate-950 border border-amber-400/30 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
          role="dialog"
          aria-label="Simulation Control Panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-amber-400/10 border-b border-amber-400/20 shrink-0">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 font-mono">
                SIMULATION CONTROL
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500">DEV ONLY</span>
            </div>
          </div>

          {/* Active scenario + timeline */}
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 shrink-0 space-y-1.5">
            {activeScenario && (
              <div className="flex items-center gap-2">
                <span className="text-base">{activeScenario.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-bold text-white truncate">{activeScenario.name}</p>
                  <p className="text-[9px] font-mono text-slate-500 truncate">{activeScenario.shortName}</p>
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold"
                  style={{ borderColor: activeScenario.color + '80', color: activeScenario.color, backgroundColor: activeScenario.color + '15' }}
                >
                  {activeScenario.category?.toUpperCase()}
                </span>
              </div>
            )}

            {(timelineTotalSeconds > 0) && (
              <TimelineBar
                progress={timelineProgress}
                elapsed={timelineElapsedSeconds}
                total={timelineTotalSeconds}
                isPaused={isPaused}
                isDemo={isRunningDemo}
              />
            )}

            {/* Playback controls */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={handleStartScenario}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
              >
                <Play className="w-3 h-3" /> Start
              </button>

              {isPaused ? (
                <button onClick={resume} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-colors">
                  <Play className="w-3 h-3" /> Resume
                </button>
              ) : (
                <button onClick={pause} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors">
                  <Pause className="w-3 h-3" /> Pause
                </button>
              )}

              <button onClick={reset} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>

              <button
                onClick={() => startDemoLoop()}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors ml-auto ${isRunningDemo ? 'bg-violet-500/20 text-violet-400 border-violet-500/40' : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'}`}
              >
                <FastForward className="w-3 h-3" />
                {isRunningDemo ? 'Demo...' : 'Demo Loop'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            {[
              { id: 'scenarios', label: 'Scenarios', icon: FlaskConical },
              { id: 'controls', label: 'Quick Actions', icon: Zap },
              { id: 'params', label: 'Parameters', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors
                  ${activeTab === tab.id
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">

            {/* ── SCENARIOS TAB ── */}
            {activeTab === 'scenarios' && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-2">Select scenario, then press Start</p>
                {SCENARIOS.map(s => (
                  <ScenarioButton
                    key={s.id}
                    scenario={s}
                    isActive={selectedScenarioId === s.id}
                    onSelect={(id) => setSelectedScenarioId(id)}
                  />
                ))}
              </div>
            )}

            {/* ── QUICK ACTIONS TAB ── */}
            {activeTab === 'controls' && (
              <div className="space-y-2">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Instant state triggers</p>

                <div className="space-y-1.5">
                  <button onClick={triggerEmergency} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 transition-colors text-left">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Trigger Cardiac Arrest
                  </button>

                  <button onClick={triggerSensorFailure} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-pink-500/15 text-pink-400 border border-pink-500/40 hover:bg-pink-500/25 transition-colors text-left">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    Trigger Sensor Failure
                  </button>

                  <button onClick={triggerNetworkFailure} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-gray-500/15 text-gray-400 border border-gray-500/40 hover:bg-gray-500/25 transition-colors text-left">
                    <WifiOff className="w-3.5 h-3.5 shrink-0" />
                    Trigger Network Failure
                  </button>

                  <button onClick={restoreNetwork} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/40 hover:bg-blue-500/25 transition-colors text-left">
                    <Wifi className="w-3.5 h-3.5 shrink-0" />
                    Restore Network
                  </button>

                  <button onClick={triggerBatteryLow} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/25 transition-colors text-left">
                    <Battery className="w-3.5 h-3.5 shrink-0" />
                    Battery Low (12%)
                  </button>

                  <button onClick={triggerROSC} className="w-full flex items-center gap-2 px-3 py-2 rounded text-[11px] font-mono font-bold bg-teal-500/15 text-teal-400 border border-teal-500/40 hover:bg-teal-500/25 transition-colors text-left">
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    Pulse Detected (ROSC)
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-2 mt-2">
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-2">Timeline Speed</p>
                  <ParameterSlider
                    label="Playback Speed"
                    paramKey="_speed"
                    min={0.25}
                    max={5}
                    step={0.25}
                    unit="×"
                    value={timelineSpeed}
                    onSet={(_, v) => setTimelineSpeed(v)}
                  />
                </div>
              </div>
            )}

            {/* ── PARAMETERS TAB ── */}
            {activeTab === 'params' && (
              <div className="space-y-3">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Live parameter overrides</p>

                <div className="space-y-3 divide-y divide-slate-800">
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono text-slate-400 font-bold">VITALS</p>
                    <ParameterSlider label="Heart Rate" paramKey="heartRate" min={0} max={220} unit=" BPM" value={vitals.heartRate} onSet={setParameter} />
                    <ParameterSlider label="SpO₂" paramKey="spo2" min={60} max={100} unit="%" value={vitals.spo2} onSet={setParameter} />
                    <ParameterSlider label="EtCO₂" paramKey="etco2" min={0} max={80} unit=" mmHg" value={vitals.etco2} onSet={setParameter} />
                    <ParameterSlider label="Respiration Rate" paramKey="respirationRate" min={0} max={40} unit=" RR" value={vitals.respirationRate} onSet={setParameter} />
                  </div>

                  <div className="pt-3 space-y-3">
                    <p className="text-[10px] font-mono text-slate-400 font-bold">CPR</p>
                    <ParameterSlider label="Compression Rate" paramKey="compressionRate" min={0} max={200} unit=" CPM" value={cpr.compressionRate} onSet={setParameter} />
                    <ParameterSlider label="Compression Depth" paramKey="compressionDepth" min={0} max={80} unit=" mm" value={cpr.currentDepthMm} onSet={setParameter} />
                  </div>

                  <div className="pt-3 space-y-3">
                    <p className="text-[10px] font-mono text-slate-400 font-bold">DEVICE</p>
                    <ParameterSlider label="Battery Level" paramKey="batteryLevel" min={0} max={100} unit="%" value={device.batteryLevel} onSet={setParameter} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 px-3 py-2 flex items-center justify-between shrink-0">
            <span className="text-[9px] font-mono text-slate-600">CJack Sim Engine v1.0</span>
            <span className="text-[9px] font-mono text-amber-500/60">⚡ SIMULATED DATA ONLY</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationControlPanel;
