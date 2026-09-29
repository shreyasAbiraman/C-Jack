/**
 * CJack Simulation Engine
 * 
 * In-browser state machine for software demonstration scenarios.
 * NOTICE: All data is synthetic simulation data, not real patient telemetry.
 *
 * Architecture:
 * - Pub/sub singleton — any component can subscribe() for state changes
 * - Timeline playback using setTimeout-based scheduling
 * - Parameter overrides for interactive sliders
 * - Optional backend sync via /api/simulation/scenario
 */

import { SCENARIOS, FULL_DEMO_TIMELINE, getScenarioById } from './simulationScenarios';

class SimulationEngine {
  constructor() {
    this._subscribers = new Set();
    this._state = this._getInitialState();
    this._timelineTimers = [];
    this._demoLoopTimer = null;
    this._tickInterval = null;
    this._pausedAt = null;
    this._pausedTimelineMs = 0;
    this._timelineStartMs = null;
    this._demoScenarioIndex = 0;
  }

  _getInitialState() {
    return {
      simulationMode: false,
      activeScenario: null,
      isPaused: false,
      isRunningDemo: false,
      timelineProgress: 0,        // 0–100
      timelineTotalSeconds: 0,
      timelineElapsedSeconds: 0,
      tick: 0,
      currentSystemState: null,
      lastAppliedAt: null,
      // Configurable timeline speed (multiplier; 1.0 = real-time, 2.0 = 2x speed)
      timelineSpeed: 1.0,
    };
  }

  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(callback) {
    this._subscribers.add(callback);
    // Immediately deliver current state to new subscriber
    callback({ ...this._state });
    return () => this._subscribers.delete(callback);
  }

  _emit() {
    const snapshot = { ...this._state };
    this._subscribers.forEach(cb => {
      try { cb(snapshot); } catch (e) { console.warn('[SimEngine] Subscriber error:', e); }
    });
  }

  _setState(partial) {
    this._state = { ...this._state, ...partial };
    this._emit();
  }

  /** Load and immediately apply a scenario (no timeline playback). */
  applyScenario(scenarioId) {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;
    this._setState({
      simulationMode: true,
      activeScenario: scenario,
      currentSystemState: { ...scenario.state },
      lastAppliedAt: new Date().toISOString(),
      timelineProgress: 100,
      timelineTotalSeconds: 0,
      timelineElapsedSeconds: 0,
      isPaused: false,
    });
    this._syncToBackend(scenarioId);
  }

  /** Start timeline playback for a scenario. */
  startTimeline(scenarioId, options = {}) {
    this._clearAllTimers();
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;

    const speed = options.speed || this._state.timelineSpeed;
    const events = scenario.timelineEvents || [];
    const totalSeconds = events.length > 0
      ? Math.max(...events.map(e => e.offsetSeconds)) + 5
      : 10;

    this._timelineStartMs = Date.now();
    this._pausedAt = null;
    this._pausedTimelineMs = 0;

    // Apply initial state immediately
    this._setState({
      simulationMode: true,
      activeScenario: scenario,
      currentSystemState: { ...scenario.state },
      lastAppliedAt: new Date().toISOString(),
      isPaused: false,
      isRunningDemo: false,
      timelineProgress: 0,
      timelineTotalSeconds: totalSeconds,
      timelineElapsedSeconds: 0,
    });

    // Schedule each timeline event
    events.forEach(event => {
      const delayMs = (event.offsetSeconds / speed) * 1000;
      const timer = setTimeout(() => {
        if (this._state.isPaused) return;
        this._setState({
          lastAppliedAt: new Date().toISOString(),
          timelineElapsedSeconds: event.offsetSeconds,
        });
      }, delayMs);
      this._timelineTimers.push(timer);
    });

    // Progress tick (every 500ms)
    this._tickInterval = setInterval(() => {
      if (this._state.isPaused) return;
      const elapsed = (Date.now() - this._timelineStartMs - this._pausedTimelineMs) / 1000;
      const progress = Math.min(100, (elapsed / totalSeconds) * 100);
      this._setState({
        tick: this._state.tick + 1,
        timelineProgress: progress,
        timelineElapsedSeconds: Math.min(elapsed, totalSeconds),
      });
      if (progress >= 100) {
        clearInterval(this._tickInterval);
      }
    }, 500);
  }

  pause() {
    if (this._state.isPaused) return;
    this._pausedAt = Date.now();
    this._setState({ isPaused: true });
  }

  resume() {
    if (!this._state.isPaused || !this._pausedAt) return;
    this._pausedTimelineMs += Date.now() - this._pausedAt;
    this._pausedAt = null;
    this._setState({ isPaused: false });
  }

  reset() {
    this._clearAllTimers();
    const initial = this._getInitialState();
    // Reapply scenario 1 (Normal Monitoring) as baseline
    const scenario1 = getScenarioById(1);
    this._state = {
      ...initial,
      simulationMode: true,
      activeScenario: scenario1,
      currentSystemState: scenario1 ? { ...scenario1.state } : null,
      lastAppliedAt: new Date().toISOString(),
      timelineProgress: 100,
    };
    this._emit();
    this._syncToBackend(1);
  }

  setTimelineSpeed(multiplier) {
    this._setState({ timelineSpeed: Math.max(0.25, Math.min(10, multiplier)) });
  }

  /** Apply a parameter override (e.g. heartRate: 120). Notifies all subscribers. */
  setParameter(key, value) {
    const current = this._state.currentSystemState;
    if (!current) return;

    const numVal = parseFloat(value);
    let updated = { ...current };

    switch (key) {
      case 'heartRate':
        updated.vitals = { ...updated.vitals, heartRate: Math.max(0, Math.min(300, numVal)) };
        break;
      case 'spo2':
        updated.vitals = { ...updated.vitals, spo2: Math.max(0, Math.min(100, numVal)) };
        break;
      case 'respirationRate':
        updated.vitals = { ...updated.vitals, respirationRate: Math.max(0, Math.min(60, numVal)) };
        break;
      case 'etco2':
        updated.vitals = { ...updated.vitals, etco2: Math.max(0, Math.min(80, numVal)) };
        break;
      case 'batteryLevel':
        updated.device = { ...updated.device, batteryLevel: Math.max(0, Math.min(100, numVal)) };
        break;
      case 'compressionRate':
        updated.cpr = { ...updated.cpr, compressionRate: Math.max(0, Math.min(200, numVal)) };
        break;
      case 'compressionDepth':
        updated.cpr = { ...updated.cpr, currentDepthMm: Math.max(0, Math.min(80, numVal)) };
        break;
      default:
        return;
    }
    this._setState({ currentSystemState: updated, lastAppliedAt: new Date().toISOString() });
    // Sync override to backend
    this._syncParameterToBackend(key, numVal);
  }

  /** Instant state override (no timeline) — for quick-action buttons. */
  triggerInstant(scenarioId) {
    this._clearAllTimers();
    this.applyScenario(scenarioId);
  }

  /**
   * Full Demo Loop: chains all 12 scenarios in order,
   * with configurable delay between transitions.
   */
  startDemoLoop(options = {}) {
    this._clearAllTimers();
    this._demoScenarioIndex = 0;
    const totalDurationSeconds = options.totalSeconds || 55;
    const events = FULL_DEMO_TIMELINE;

    this._timelineStartMs = Date.now();
    this._setState({
      simulationMode: true,
      isPaused: false,
      isRunningDemo: true,
      timelineTotalSeconds: totalDurationSeconds,
      timelineProgress: 0,
    });

    events.forEach(entry => {
      const delayMs = entry.offsetSeconds * 1000;
      const timer = setTimeout(() => {
        if (this._state.isPaused) return;
        this.applyScenario(entry.scenarioId);
      }, delayMs);
      this._timelineTimers.push(timer);
    });

    // End demo loop
    const endTimer = setTimeout(() => {
      this._setState({ isRunningDemo: false, timelineProgress: 100 });
    }, totalDurationSeconds * 1000);
    this._timelineTimers.push(endTimer);

    // Progress tick
    this._tickInterval = setInterval(() => {
      if (this._state.isPaused) return;
      const elapsed = (Date.now() - this._timelineStartMs) / 1000;
      const progress = Math.min(100, (elapsed / totalDurationSeconds) * 100);
      this._setState({ tick: this._state.tick + 1, timelineProgress: progress });
      if (progress >= 100) clearInterval(this._tickInterval);
    }, 500);
  }

  _clearAllTimers() {
    this._timelineTimers.forEach(t => clearTimeout(t));
    this._timelineTimers = [];
    if (this._tickInterval) clearInterval(this._tickInterval);
    this._tickInterval = null;
    if (this._demoLoopTimer) clearTimeout(this._demoLoopTimer);
    this._demoLoopTimer = null;
  }

  /** Sync scenario to backend (fire-and-forget, non-blocking). */
  async _syncToBackend(scenarioId) {
    try {
      await fetch('/api/simulation/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
    } catch {
      // Backend sync failure is non-fatal; in-browser state is ground truth
    }
  }

  /** Sync parameter override to backend (fire-and-forget). */
  async _syncParameterToBackend(key, value) {
    try {
      await fetch('/api/simulation/parameter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } catch {
      // Non-fatal
    }
  }

  destroy() {
    this._clearAllTimers();
    this._subscribers.clear();
  }
}

// Singleton instance
export const simulationEngine = new SimulationEngine();
export default simulationEngine;
