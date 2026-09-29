/**
 * SimulationPage — Full-screen Simulation Control Center
 * Developer-only page accessible from sidebar nav.
 * NOTICE: All data shown here is synthetic simulation data only.
 */
import React, { useState } from 'react';
import { useSimulation } from '../simulation/SimulationContext';
import { SCENARIOS, SCENARIO_COLORS } from '../simulation/simulationScenarios';
import {
  FlaskConical, Play, Pause, RotateCcw, FastForward, Zap,
  AlertTriangle, WifiOff, Wifi, Battery, Heart, Activity,
  Settings, ChevronRight, Info, Clock, Timer
} from 'lucide-react';

// ─── Scenario Card ─────────────────────────────────────────────────────────────
const ScenarioCard = ({ scenario, isActive, onStart, onInstant }) => {
  const categoryColors = {
    baseline: 'from-emerald-500/10 to-transparent border-emerald-500/20',
    warning: 'from-amber-500/10 to-transparent border-amber-500/20',
    emergency: 'from-red-500/10 to-transparent border-red-500/20',
    cpr: 'from-violet-500/10 to-transparent border-violet-500/20',
    responder: 'from-blue-500/10 to-transparent border-blue-500/20',
    failure: 'from-gray-500/10 to-transparent border-gray-500/20',
    recovery: 'from-teal-500/10 to-transparent border-teal-500/20',
  };
  const cardGradient = categoryColors[scenario.category] || categoryColors.baseline;

  return (
    <div
      className={`relative bg-gradient-to-br ${cardGradient} border rounded-xl p-4 flex flex-col gap-3 transition-all
        ${isActive ? 'ring-2 shadow-lg' : 'hover:border-slate-600'}`}
      style={isActive ? { ringColor: scenario.color, boxShadow: `0 0 20px ${scenario.color}25` } : {}}
    >
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">ACTIVE</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5 shrink-0">{scenario.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">
              SCENARIO {scenario.id.toString().padStart(2, '0')}
            </span>
            <span
              className="text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase"
              style={{ color: scenario.color, backgroundColor: scenario.color + '20' }}
            >
              {scenario.category}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-tight">{scenario.name}</h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{scenario.description}</p>
        </div>
      </div>

      {/* Timeline events preview */}
      {scenario.timelineEvents?.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Timeline</p>
          <div className="flex flex-wrap gap-1">
            {scenario.timelineEvents.map((evt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700"
              >
                <Clock className="w-2.5 h-2.5 shrink-0" />
                {evt.offsetSeconds}s — {evt.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onStart(scenario.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all hover:brightness-110"
          style={{ borderColor: scenario.color + '60', color: scenario.color, backgroundColor: scenario.color + '12' }}
        >
          <Play className="w-3 h-3" />
          Start with Timeline
        </button>
        <button
          onClick={() => onInstant(scenario.id)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors"
          title="Apply instantly without timeline"
        >
          <Zap className="w-3 h-3" />
          Instant
        </button>
      </div>
    </div>
  );
};

// ─── Current State Monitor ──────────────────────────────────────────────────────
const StateMonitor = ({ currentSystemState, activeScenario }) => {
  if (!currentSystemState) return null;
  const { vitals, cpr, device, communication } = currentSystemState;
  const v = vitals || {};
  const c = cpr || {};
  const d = device || {};
  const comm = communication || {};

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Simulation State Monitor</h3>
        <span className="text-[9px] font-mono text-amber-400 animate-pulse">⚡ SIMULATED</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Heart Rate', value: v.heartRate ?? '—', unit: ' BPM', highlight: v.heartRate === 0 || v.heartRate > 130 },
          { label: 'SpO₂', value: v.spo2 ?? '—', unit: '%', highlight: v.spo2 < 90 },
          { label: 'EtCO₂', value: v.etco2 ?? '—', unit: ' mmHg', highlight: v.etco2 < 20 },
          { label: 'RR', value: v.respirationRate ?? '—', unit: '/min', highlight: v.respirationRate === 0 },
          { label: 'CPR', value: c.active ? 'ACTIVE' : 'OFF', unit: '', highlight: c.active },
          { label: 'Compression', value: c.compressionRate || '—', unit: ' CPM', highlight: c.active },
          { label: 'Battery', value: d.batteryLevel ?? '—', unit: '%', highlight: d.batteryLevel < 20 },
          { label: 'Network', value: comm.alertStatus?.split(' ')[0] || '—', unit: '', highlight: false },
        ].map(m => (
          <div
            key={m.label}
            className={`p-2.5 rounded-lg border text-center ${m.highlight ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-800/50'}`}
          >
            <p className="text-[9px] font-mono text-slate-500 uppercase mb-1">{m.label}</p>
            <p className={`text-sm font-black font-mono tabular-nums ${m.highlight ? 'text-red-400' : 'text-white'}`}>
              {m.value}<span className="text-[10px] font-normal text-slate-500">{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {v.ecgRhythm && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-300">ECG: <strong className="text-white">{v.ecgRhythm}</strong></span>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SimulationPage = () => {
  const {
    simulationMode, activeScenario, isPaused, isRunningDemo,
    timelineProgress, timelineTotalSeconds, timelineElapsedSeconds,
    currentSystemState, timelineSpeed,
    startScenario, triggerInstant, pause, resume, reset, startDemoLoop,
    triggerEmergency, triggerSensorFailure, triggerNetworkFailure,
    restoreNetwork, triggerBatteryLow, triggerROSC,
    setTimelineSpeed,
  } = useSimulation();

  const [filter, setFilter] = useState('all');
  const categories = ['all', 'baseline', 'warning', 'emergency', 'cpr', 'responder', 'failure', 'recovery'];
  const filteredScenarios = filter === 'all' ? SCENARIOS : SCENARIOS.filter(s => s.category === filter);

  return (
    <div className="space-y-6 pb-12">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-black text-white tracking-tight">Simulation Control Center</h1>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30 tracking-widest">
              DEV ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono max-w-xl">
            Control CJack clinical scenarios for software demonstration. All data is synthetic. Never confuse simulated data with real patient telemetry.
          </p>
        </div>

        {/* Global playback controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isPaused ? (
            <button onClick={resume} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-colors">
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          ) : (
            <button onClick={pause} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => startDemoLoop()}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono border transition-colors ${isRunningDemo ? 'bg-violet-500/20 text-violet-400 border-violet-500/40 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
          >
            <FastForward className="w-3.5 h-3.5" />
            {isRunningDemo ? 'Demo Running...' : 'Full Demo Loop'}
          </button>
        </div>
      </div>

      {/* SIMULATION MODE notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono mb-1">⚡ SIMULATION MODE — NOT REAL PATIENT DATA</p>
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            This control center generates entirely synthetic telemetry for software demonstration only. No real patient monitoring is active. 
            All vitals, CPR metrics, and emergency states displayed in the application are fabricated simulation values.
          </p>
        </div>
      </div>

      {/* Timeline progress (if running) */}
      {timelineTotalSeconds > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">
                {isRunningDemo ? 'Demo Loop Timeline' : `${activeScenario?.name || 'Scenario'} Timeline`}
              </span>
              {isPaused && <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">PAUSED</span>}
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {Math.round(timelineElapsedSeconds)}s / {Math.round(timelineTotalSeconds)}s
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isPaused ? 'bg-amber-500' : isRunningDemo ? 'bg-violet-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, timelineProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">Speed:</span>
              {[0.5, 1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setTimelineSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${timelineSpeed === s ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Monitor */}
      <StateMonitor currentSystemState={currentSystemState} activeScenario={activeScenario} />

      {/* Quick Actions */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">Quick Actions — Instant Triggers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { label: 'Trigger Cardiac Arrest', icon: AlertTriangle, action: triggerEmergency, color: 'red' },
            { label: 'Trigger Sensor Failure', icon: Activity, action: triggerSensorFailure, color: 'pink' },
            { label: 'Trigger Network Failure', icon: WifiOff, action: triggerNetworkFailure, color: 'gray' },
            { label: 'Restore Network', icon: Wifi, action: restoreNetwork, color: 'blue' },
            { label: 'Battery Low (12%)', icon: Battery, action: triggerBatteryLow, color: 'yellow' },
            { label: 'Pulse Detected (ROSC)', icon: Heart, action: triggerROSC, color: 'teal' },
          ].map(action => (
            <button
              key={action.label}
              onClick={action.action}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold border transition-colors text-left
                bg-${action.color}-500/10 text-${action.color}-400 border-${action.color}-500/30 hover:bg-${action.color}-500/20`}
            >
              <action.icon className="w-3.5 h-3.5 shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">12 Clinical Scenarios</h3>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-colors ${filter === cat ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredScenarios.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isActive={activeScenario?.id === scenario.id}
              onStart={(id) => startScenario(id, true)}
              onInstant={(id) => triggerInstant(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
