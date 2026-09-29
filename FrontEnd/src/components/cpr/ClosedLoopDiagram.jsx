import React, { useState } from 'react';
import {
  Target,
  Cpu,
  Activity,
  Gauge,
  Scale,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  LayoutGrid,
  ListOrdered
} from 'lucide-react';

export const ClosedLoopDiagram = ({
  isActive = true,
  feedbackActive = true,
  currentDepth = 52,
  currentForce = 410,
  targetDepthRange = [50, 60],
  targetForceRange = [350, 450],
  className = ''
}) => {
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'flowchart'
  const isLoopLive = isActive && feedbackActive;

  const nodes = [
    {
      id: 'target',
      title: 'Target compression',
      subtitle: 'AHA Standard Baseline',
      metric: `${targetDepthRange[0]}-${targetDepthRange[1]} mm • ${targetForceRange[0]}-${targetForceRange[1]} N`,
      icon: Target,
      tag: 'Setpoint Input',
      color: 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'motor_control',
      title: 'Motor control',
      subtitle: 'PWM & Solenoid Valves',
      metric: isLoopLive ? '3,200 RPM • 88% PWM' : 'Standby (0 RPM)',
      icon: Cpu,
      tag: 'Actuator Driver',
      color: 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'mechanical_cpr',
      title: 'Mechanical compression',
      subtitle: 'Sternal Pneumatic Vest',
      metric: isLoopLive ? 'Active Downstroke / Recoil' : 'Depressurized',
      icon: Activity,
      tag: 'Physical Plant',
      color: 'border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
    },
    {
      id: 'load_cell',
      title: 'Load cell',
      subtitle: 'Dual S-Beam Transducers',
      metric: isLoopLive ? 'Wheatstone Bridge Balanced' : 'Zero-Calibrated',
      icon: Scale,
      tag: 'Force Transducer',
      color: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'measured_telemetry',
      title: 'Measured force/depth',
      subtitle: '24-Bit ADC + Optical Quad',
      metric: isLoopLive ? `${currentForce} N • ${currentDepth} mm` : '0 N • 0 mm',
      icon: Gauge,
      tag: 'Sensor Feedback',
      color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'controller',
      title: 'Controller',
      subtitle: 'ESP32 PID Algorithm',
      metric: isLoopLive ? 'Sampling @ 100 Hz (Error: -0.4mm)' : 'Idle Loop',
      icon: RefreshCw,
      tag: 'Discrete PID',
      color: 'border-cyan-500/40 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'motor_adjustment',
      title: 'Motor adjustment',
      subtitle: 'Closed-Loop Correction',
      metric: isLoopLive ? 'ΔPWM +2.4% (Force Trim)' : 'No Trim Required',
      icon: Sliders,
      tag: 'Feedback Trim',
      color: 'border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header with Closed-Loop Status Badge and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${isLoopLive ? 'text-cjack-accent animate-spin' : 'text-gray-400'}`} style={{ animationDuration: '4s' }} />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Closed-Loop Resuscitation Feedback Architecture
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Dynamic Real-Time PID Depth & Force Stabilization Circuit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/50 dark:bg-surface-mutedDark/50 p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Horizontal Pipeline View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('flowchart')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'flowchart'
                  ? 'bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Vertical Flowchart View"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Flowchart (↓)</span>
            </button>
          </div>

          {/* Feedback Control State Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase ${
            isLoopLive
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isLoopLive ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <span>FEEDBACK CONTROL: {isLoopLive ? 'ACTIVE & COMPENSATING' : 'STANDBY / OPEN-LOOP'}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: HORIZONTAL PIPELINE VIEW */}
      {viewMode === 'pipeline' && (
        <div className="relative overflow-x-auto pb-2">
          <div className="min-w-[760px] flex items-center justify-between gap-2 py-4">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isLast = index === nodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  {/* Node Box */}
                  <div className={`flex-1 p-3 rounded-lg border flex flex-col justify-between min-h-[120px] transition-all ${node.color} ${
                    isLoopLive ? 'shadow-sm hover:scale-[1.02]' : 'opacity-80'
                  }`}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-75">
                        {node.tag}
                      </span>
                      <Icon className="h-4 w-4 shrink-0" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold leading-tight font-sans">
                        {node.title}
                      </h4>
                      <p className="text-[10px] opacity-75 mt-0.5 leading-tight">
                        {node.subtitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-current/10 font-mono text-[10px] font-semibold truncate">
                      {node.metric}
                    </div>
                  </div>

                  {/* Arrow Conduit */}
                  {!isLast && (
                    <div className="flex flex-col items-center justify-center shrink-0 px-1">
                      <div className={`h-0.5 w-4 ${isLoopLive ? 'bg-cjack-accent shadow-xs' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      <span className={`text-[10px] font-mono ${isLoopLive ? 'text-cjack-accent font-bold' : 'text-gray-400'}`}>
                        ↓
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Feedback Return Loop Visualizer */}
          <div className="min-w-[760px] mt-1 pt-2 border-t-2 border-dashed border-cjack-accent/40 rounded-b-lg px-4 flex items-center justify-between text-[11px] font-mono text-cjack-accent">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="font-bold uppercase tracking-wider">
                Feedback Loop Return:
              </span>
              <span className="text-gray-600 dark:text-gray-300 font-sans">
                Motor adjustment continuously trims Motor control PWM at 100 Hz to compensate for thoracic stiffness drift.
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-cjack-accent animate-ping" />
              <span>LATENCY: 8.2 ms</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VERTICAL FLOWCHART VIEW (EXPLICIT SEQUENCE MATCHING PROMPT) */}
      {viewMode === 'flowchart' && (
        <div className="py-2 max-w-xl mx-auto">
          <div className="space-y-1 relative">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isLast = index === nodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  {/* Step Card */}
                  <div className={`p-3 rounded-lg border flex items-center justify-between transition-all ${node.color} ${
                    isLoopLive ? 'shadow-sm' : 'opacity-80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-current/10 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase opacity-75">
                            Stage {index + 1}:
                          </span>
                          <h4 className="text-xs font-bold font-sans">
                            {node.title}
                          </h4>
                        </div>
                        <p className="text-[11px] opacity-75 font-mono">
                          {node.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs font-bold">
                      {node.metric}
                    </div>
                  </div>

                  {/* Flow Arrow (↓) */}
                  {!isLast && (
                    <div className="flex items-center justify-center py-0.5">
                      <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-cjack-accent">
                        <ArrowDown className={`h-4 w-4 ${isLoopLive ? 'animate-bounce' : 'text-gray-400'}`} />
                        <span className="text-[10px] uppercase font-mono text-gray-400">Flow</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Return Loop Connection */}
            <div className="mt-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-900 dark:text-sky-200 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span><strong>Closed-Loop Return:</strong> Motor adjustment outputs trim back to Motor control @ 100 Hz</span>
              </div>
              <span className="font-bold text-sky-600 dark:text-sky-400 uppercase">
                {isLoopLive ? 'Loop Active' : 'Loop Standby'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosedLoopDiagram;
