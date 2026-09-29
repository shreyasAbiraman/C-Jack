/**
 * SimulationBanner
 * Global amber ribbon shown at the top of every page when simulation mode is active.
 * NEVER displayed in production with real patient data.
 */
import React from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import { Zap, FlaskConical } from 'lucide-react';

const SimulationBanner = () => {
  const { simulationMode, activeScenario } = useSimulation();

  if (!simulationMode) return null;

  return (
    <div
      className="w-full bg-amber-400/95 dark:bg-amber-500/90 border-b border-amber-500 dark:border-amber-600 px-4 py-1.5 flex items-center justify-between z-40 select-none"
      role="banner"
      aria-label="Simulation Mode Active"
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5 text-amber-900 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-900 font-mono">
          ⚡ SIMULATION MODE ACTIVE
        </span>
        <span className="hidden sm:inline text-[10px] font-mono text-amber-800 border-l border-amber-600 pl-2 ml-1">
          DATA IS NOT REAL PATIENT TELEMETRY — FOR DEMONSTRATION ONLY
        </span>
      </div>

      <div className="flex items-center gap-2">
        {activeScenario && (
          <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded border border-amber-500/40">
            {activeScenario.icon} {activeScenario.shortName}
          </span>
        )}
        <span className="hidden md:inline text-[9px] font-mono text-amber-700 uppercase tracking-wider">
          Press Ctrl+Shift+D for controls
        </span>
      </div>
    </div>
  );
};

export default SimulationBanner;
