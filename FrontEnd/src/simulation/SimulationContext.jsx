/**
 * CJack Simulation Context
 * Provides simulation engine state to all React components.
 * NOTICE: All simulation data is synthetic — not real patient telemetry.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { simulationEngine } from './simulationEngine';
import { SCENARIOS, getScenarioById } from './simulationScenarios';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [simState, setSimState] = useState(() => simulationEngine._state);

  useEffect(() => {
    // Subscribe to engine state changes
    const unsub = simulationEngine.subscribe((state) => {
      setSimState({ ...state });
    });

    // Auto-activate simulation mode on mount (CJack is always in sim mode)
    if (!simulationEngine._state.simulationMode) {
      simulationEngine.applyScenario(1);
    }

    // Keyboard shortcut: Ctrl+Shift+D toggles dev panel (handled in SimulationControlPanel)
    return () => {
      unsub();
    };
  }, []);

  const startScenario = useCallback((scenarioId, withTimeline = true) => {
    if (withTimeline) {
      simulationEngine.startTimeline(scenarioId);
    } else {
      simulationEngine.applyScenario(scenarioId);
    }
  }, []);

  const triggerInstant = useCallback((scenarioId) => {
    simulationEngine.triggerInstant(scenarioId);
  }, []);

  const pause = useCallback(() => simulationEngine.pause(), []);
  const resume = useCallback(() => simulationEngine.resume(), []);
  const reset = useCallback(() => simulationEngine.reset(), []);
  const startDemoLoop = useCallback((opts) => simulationEngine.startDemoLoop(opts), []);

  const setParameter = useCallback((key, value) => {
    simulationEngine.setParameter(key, value);
  }, []);

  const setTimelineSpeed = useCallback((speed) => {
    simulationEngine.setTimelineSpeed(speed);
  }, []);

  // Convenience quick-action helpers
  const triggerEmergency = useCallback(() => simulationEngine.triggerInstant(3), []);
  const triggerSensorFailure = useCallback(() => simulationEngine.triggerInstant(10), []);
  const triggerNetworkFailure = useCallback(() => simulationEngine.triggerInstant(9), []);
  const restoreNetwork = useCallback(() => simulationEngine.triggerInstant(8), []);
  const triggerBatteryLow = useCallback(() => simulationEngine.triggerInstant(11), []);
  const triggerROSC = useCallback(() => simulationEngine.triggerInstant(12), []);

  return (
    <SimulationContext.Provider
      value={{
        // State
        simulationMode: simState.simulationMode,
        activeScenario: simState.activeScenario,
        currentSystemState: simState.currentSystemState,
        isPaused: simState.isPaused,
        isRunningDemo: simState.isRunningDemo,
        timelineProgress: simState.timelineProgress,
        timelineTotalSeconds: simState.timelineTotalSeconds,
        timelineElapsedSeconds: simState.timelineElapsedSeconds,
        timelineSpeed: simState.timelineSpeed,
        tick: simState.tick,
        lastAppliedAt: simState.lastAppliedAt,
        scenarios: SCENARIOS,

        // Actions
        startScenario,
        triggerInstant,
        pause,
        resume,
        reset,
        startDemoLoop,
        setParameter,
        setTimelineSpeed,

        // Quick actions
        triggerEmergency,
        triggerSensorFailure,
        triggerNetworkFailure,
        restoreNetwork,
        triggerBatteryLow,
        triggerROSC,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
};

export default SimulationContext;
