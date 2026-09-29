import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Radio,
  Gauge,
  Info,
  CheckCircle2
} from 'lucide-react';

export const CprSimulatorControls = ({
  onUpdateSimulator,
  currentConfig = {},
  className = ''
}) => {
  const [rate, setRate] = useState(currentConfig.compressionRate || 108);
  const [depth, setDepth] = useState(currentConfig.currentDepthMm || 52);
  const [force, setForce] = useState(currentConfig.appliedForceNewtons || 410);
  const [sensorState, setSensorState] = useState(currentConfig.sensorState || 'Healthy');
  const [motorState, setMotorState] = useState(currentConfig.motorState || 'Nominal');
  const [closedLoop, setClosedLoop] = useState(true);

  const applyChanges = (overrides = {}) => {
    const payload = {
      compressionRate: overrides.rate !== undefined ? overrides.rate : rate,
      currentDepthMm: overrides.depth !== undefined ? overrides.depth : depth,
      appliedForceNewtons: overrides.force !== undefined ? overrides.force : force,
      sensorState: overrides.sensorState !== undefined ? overrides.sensorState : sensorState,
      motorState: overrides.motorState !== undefined ? overrides.motorState : motorState,
      closedLoopActive: overrides.closedLoop !== undefined ? overrides.closedLoop : closedLoop
    };
    if (onUpdateSimulator) {
      onUpdateSimulator(payload);
    }
  };

  const handlePreset = (preset) => {
    let newRate = 108;
    let newDepth = 52;
    let newForce = 410;
    let newSensor = 'Healthy';
    let newMotor = 'Nominal';
    let newLoop = true;

    if (preset === 'aha') {
      newRate = 108;
      newDepth = 52;
      newForce = 410;
      newSensor = 'Healthy';
      newMotor = 'Nominal';
      newLoop = true;
    } else if (preset === 'shallow') {
      newRate = 100;
      newDepth = 36;
      newForce = 260;
      newSensor = 'Healthy';
      newMotor = 'Nominal';
      newLoop = false;
    } else if (preset === 'tachy') {
      newRate = 132;
      newDepth = 54;
      newForce = 430;
      newSensor = 'Healthy';
      newMotor = 'Overheated';
      newLoop = true;
    } else if (preset === 'fault') {
      newRate = 0;
      newDepth = 0;
      newForce = 0;
      newSensor = 'Fault';
      newMotor = 'Stalled';
      newLoop = false;
    }

    setRate(newRate);
    setDepth(newDepth);
    setForce(newForce);
    setSensorState(newSensor);
    setMotorState(newMotor);
    setClosedLoop(newLoop);

    applyChanges({
      rate: newRate,
      depth: newDepth,
      force: newForce,
      sensorState: newSensor,
      motorState: newMotor,
      closedLoop: newLoop
    });
  };

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Simulation Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cjack-accent" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Interactive CPR Hardware Simulator
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
                PROTOTYPE SIMULATION
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              Hardware-in-the-Loop Resuscitation Parameter Synthesizer
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handlePreset('aha')}
            className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            ★ AHA Compliant
          </button>
          <button
            onClick={() => handlePreset('shallow')}
            className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 hover:bg-amber-100 transition-colors"
          >
            Shallow Depth
          </button>
          <button
            onClick={() => handlePreset('tachy')}
            className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 hover:bg-purple-100 transition-colors"
          >
            Tachy Pacing
          </button>
          <button
            onClick={() => handlePreset('fault')}
            className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 hover:bg-red-100 transition-colors"
          >
            Trip Stall Fault
          </button>
        </div>
      </div>

      {/* Mandatory Clinical Prototype Safety Warning */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs mb-4 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="font-sans leading-relaxed">
          <strong>Prototype Simulation Notice:</strong> This interactive control panel is designed for software bench validation. <strong>Do not imply or assume that this dashboard alone is sufficient to safely operate a physical CPR actuator.</strong> Physical chest compression machines require certified hardware interlocks, redundant physical E-stops, and clinical operator surveillance.
        </div>
      </div>

      {/* Simulator Sliders & Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Compression Rate Slider */}
        <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-gray-700 dark:text-gray-300">
              Compression Rate:
            </span>
            <span className="text-base font-mono font-extrabold text-cjack-accent">
              {rate} <span className="text-[10px] text-gray-500">CPM</span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="140"
            step="2"
            value={rate}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRate(val);
              applyChanges({ rate: val });
            }}
            className="w-full accent-cjack-accent cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>0 CPM</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target: 100-120</span>
            <span>140 CPM</span>
          </div>
        </div>

        {/* 2. Compression Depth Slider */}
        <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-gray-700 dark:text-gray-300">
              Compression Depth:
            </span>
            <span className="text-base font-mono font-extrabold text-cjack-accent">
              {depth} <span className="text-[10px] text-gray-500">mm ({ (depth / 10).toFixed(1) } cm)</span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="75"
            step="1"
            value={depth}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDepth(val);
              applyChanges({ depth: val });
            }}
            className="w-full accent-cjack-accent cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>0 mm</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target: 50-60 mm</span>
            <span>75 mm</span>
          </div>
        </div>

        {/* 3. Applied Force Slider */}
        <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-gray-700 dark:text-gray-300">
              Applied Peak Force:
            </span>
            <span className="text-base font-mono font-extrabold text-cjack-accent">
              {force} <span className="text-[10px] text-gray-500">N</span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="600"
            step="10"
            value={force}
            onChange={(e) => {
              const val = Number(e.target.value);
              setForce(val);
              applyChanges({ force: val });
            }}
            className="w-full accent-cjack-accent cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>0 N</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target: 350-450 N</span>
            <span>600 N</span>
          </div>
        </div>
      </div>

      {/* Selectors for Sensor State, Motor State & Closed Loop Toggle */}
      <div className="mt-4 pt-4 border-t border-surface-borderLight dark:border-surface-borderDark grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sensor State */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
            Simulated Sensor State:
          </label>
          <select
            value={sensorState}
            onChange={(e) => {
              setSensorState(e.target.value);
              applyChanges({ sensorState: e.target.value });
            }}
            className="w-full px-3 py-1.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white font-mono text-xs"
          >
            <option value="Healthy">Healthy (Nominal Transducers)</option>
            <option value="Degraded">Degraded (Signal Noise / SNR 12dB)</option>
            <option value="Fault">Fault (Lead Detached / Bridge Open)</option>
          </select>
        </div>

        {/* Motor State */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
            Simulated Motor State:
          </label>
          <select
            value={motorState}
            onChange={(e) => {
              setMotorState(e.target.value);
              applyChanges({ motorState: e.target.value });
            }}
            className="w-full px-3 py-1.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white font-mono text-xs"
          >
            <option value="Nominal">Nominal (Optimal Duty Cycle)</option>
            <option value="Overheated">Overheated (Thermal Throttle)</option>
            <option value="Stalled">Stalled (Overcurrent Trip)</option>
          </select>
        </div>

        {/* Closed Loop Feedback Toggle */}
        <div className="flex items-end">
          <label className="w-full flex items-center justify-between p-2.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 cursor-pointer">
            <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 uppercase">
              Closed-Loop PID Feedback:
            </span>
            <input
              type="checkbox"
              checked={closedLoop}
              onChange={(e) => {
                setClosedLoop(e.target.checked);
                applyChanges({ closedLoop: e.target.checked });
              }}
              className="h-4 w-4 text-cjack-primary rounded accent-cjack-accent cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CprSimulatorControls;
