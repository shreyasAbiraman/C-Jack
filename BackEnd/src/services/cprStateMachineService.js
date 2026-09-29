/**
 * CPR State Machine Service for CJack
 * 
 * Formal 10-state finite state machine:
 * IDLE, MONITORING, SUSPECTED_ARREST, CONFIRMING, CPR_ACTIVE,
 * PAUSED, STOPPED, RECOVERY, MANUAL_OVERRIDE, ERROR
 */

const CPR_STATES = {
  IDLE: 'IDLE',
  MONITORING: 'MONITORING',
  SUSPECTED_ARREST: 'SUSPECTED_ARREST',
  CONFIRMING: 'CONFIRMING',
  CPR_ACTIVE: 'CPR_ACTIVE',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  RECOVERY: 'RECOVERY',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE',
  ERROR: 'ERROR'
};

// Allowed State Transitions Matrix
const ALLOWED_TRANSITIONS = {
  [CPR_STATES.IDLE]: [CPR_STATES.MONITORING, CPR_STATES.ERROR],
  [CPR_STATES.MONITORING]: [CPR_STATES.IDLE, CPR_STATES.SUSPECTED_ARREST, CPR_STATES.MANUAL_OVERRIDE, CPR_STATES.ERROR],
  [CPR_STATES.SUSPECTED_ARREST]: [CPR_STATES.CONFIRMING, CPR_STATES.MONITORING, CPR_STATES.MANUAL_OVERRIDE, CPR_STATES.ERROR],
  [CPR_STATES.CONFIRMING]: [CPR_STATES.CPR_ACTIVE, CPR_STATES.MONITORING, CPR_STATES.STOPPED, CPR_STATES.ERROR],
  [CPR_STATES.CPR_ACTIVE]: [CPR_STATES.PAUSED, CPR_STATES.STOPPED, CPR_STATES.RECOVERY, CPR_STATES.MANUAL_OVERRIDE, CPR_STATES.ERROR],
  [CPR_STATES.PAUSED]: [CPR_STATES.CPR_ACTIVE, CPR_STATES.STOPPED, CPR_STATES.RECOVERY, CPR_STATES.MANUAL_OVERRIDE, CPR_STATES.ERROR],
  [CPR_STATES.STOPPED]: [CPR_STATES.IDLE, CPR_STATES.MONITORING, CPR_STATES.CPR_ACTIVE, CPR_STATES.ERROR],
  [CPR_STATES.RECOVERY]: [CPR_STATES.MONITORING, CPR_STATES.IDLE, CPR_STATES.SUSPECTED_ARREST, CPR_STATES.ERROR],
  [CPR_STATES.MANUAL_OVERRIDE]: [CPR_STATES.IDLE, CPR_STATES.MONITORING, CPR_STATES.CPR_ACTIVE, CPR_STATES.STOPPED, CPR_STATES.ERROR],
  [CPR_STATES.ERROR]: [CPR_STATES.IDLE, CPR_STATES.MONITORING, CPR_STATES.STOPPED]
};

class CprStateMachineService {
  constructor() {
    this.state = CPR_STATES.IDLE;
    this.previousState = null;
    this.stateEnteredAt = Date.now();
    this.manualOverride = false;
    this.emergencyStopped = false;
    this.feedbackActive = false;

    // Safety Fault Statuses
    this.deviceFault = false;
    this.sensorFault = false;
    this.motorFault = 'Nominal'; // 'Nominal', 'Overheated', 'Stalled'
    this.sensorState = 'Healthy'; // 'Healthy', 'Degraded', 'Fault'

    // Simulator Configurable Parameters
    this.simConfig = {
      compressionRate: 108, // Target 100-120 CPM
      currentDepthMm: 52,    // Target 50-60 mm
      appliedForceNewtons: 410, // Target 350-450 N
      motorSpeedRpm: 3200,
      motorState: 'Nominal',
      sensorState: 'Healthy',
      closedLoopActive: true
    };

    // Resuscitation Targets (AHA 2025 Standard)
    this.targets = {
      rateRange: [100, 120],
      depthRangeMm: [50, 60],
      forceRangeN: [350, 450],
      recoilTargetPct: 95
    };

    // Active Resuscitation Session Tracking
    this.session = {
      active: false,
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      totalCompressions: 0,
      compressionHistory: [], // stores { rate, depth, force, inTarget }
      sensorInterruptions: 0,
      emergencyAlertsCount: 0
    };

    // Last Completed Session Analytics (Preserved for display)
    this.lastCompletedAnalytics = {
      durationSeconds: 148,
      durationFormatted: '02:28',
      totalCompressions: 266,
      averageRate: 108,
      averageDepth: 52.4,
      forceConsistencyPct: 94.7,
      sensorInterruptions: 0,
      emergencyAlerts: 1,
      targetComplianceScore: '96% (AHA Compliant)',
      completedAt: new Date().toISOString()
    };

    // Background timer ticker
    this.tickerInterval = setInterval(() => this._tick(), 1000);
  }

  _tick() {
    if (this.state === CPR_STATES.CPR_ACTIVE) {
      this.session.elapsedSeconds += 1;
      // Increment compressions dynamically based on simulated rate (~1.8 compressions/sec at 108 CPM)
      const compressionsThisSecond = Math.round(this.simConfig.compressionRate / 60);
      this.session.totalCompressions += compressionsThisSecond;

      // Log point for consistency analysis
      const inTarget = (
        this.simConfig.appliedForceNewtons >= this.targets.forceRangeN[0] &&
        this.simConfig.appliedForceNewtons <= this.targets.forceRangeN[1]
      );
      this.session.compressionHistory.push({
        rate: this.simConfig.compressionRate,
        depth: this.simConfig.currentDepthMm,
        force: this.simConfig.appliedForceNewtons,
        inTarget
      });
    }
  }

  getState() {
    const isCprActive = this.state === CPR_STATES.CPR_ACTIVE;

    // Calculate live session duration
    const durationSec = this.session.elapsedSeconds;
    const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
    const secs = String(durationSec % 60).padStart(2, '0');
    const sessionDurationFormatted = `${mins}:${secs}`;

    return {
      cprState: this.state,
      previousState: this.previousState,
      stateEnteredAt: new Date(this.stateEnteredAt).toISOString(),
      allowedTransitions: ALLOWED_TRANSITIONS[this.state] || [],
      
      // Live Metrics
      compressionRate: isCprActive ? this.simConfig.compressionRate : 0,
      compressionCount: this.session.totalCompressions,
      compressionDepthMm: isCprActive ? this.simConfig.currentDepthMm : 0,
      appliedForceNewtons: isCprActive ? this.simConfig.appliedForceNewtons : 0,
      motorSpeedRpm: isCprActive ? this.simConfig.motorSpeedRpm : 0,
      
      // Closed Loop & Targets
      feedbackStatus: isCprActive && this.simConfig.closedLoopActive
        ? 'ACTIVE_CLOSED_LOOP'
        : isCprActive ? 'OPEN_LOOP_DIRECT' : 'INACTIVE',
      closedLoopActive: isCprActive && this.simConfig.closedLoopActive,
      targets: this.targets,
      sessionDuration: sessionDurationFormatted,
      sessionDurationSeconds: durationSec,

      // Safety & Fault Statuses
      safety: {
        manualOverride: this.manualOverride,
        emergencyStopped: this.emergencyStopped,
        deviceFault: this.deviceFault,
        sensorFault: this.sensorFault || this.simConfig.sensorState === 'Fault',
        motorFault: this.motorFault
      },

      // Simulator Config & Attribution
      isSimulated: true,
      dataSource: 'Simulation',
      timestamp: new Date().toISOString()
    };
  }

  transitionTo(targetState, metadata = {}) {
    const validStates = Object.values(CPR_STATES);
    const upperTarget = String(targetState).toUpperCase();

    if (!validStates.includes(upperTarget)) {
      throw new Error(`Invalid CPR state requested: ${targetState}`);
    }

    // Check transition validity (Emergency stop and manual override can break rules safely)
    const allowed = ALLOWED_TRANSITIONS[this.state] || [];
    const isOverridden = metadata.force || upperTarget === CPR_STATES.ERROR || upperTarget === CPR_STATES.STOPPED;

    if (!allowed.includes(upperTarget) && !isOverridden) {
      throw new Error(`Transition from ${this.state} to ${upperTarget} is not permitted.`);
    }

    const fromState = this.state;
    this.previousState = fromState;
    this.state = upperTarget;
    this.stateEnteredAt = Date.now();

    // State entry actions
    if (upperTarget === CPR_STATES.CPR_ACTIVE) {
      if (!this.session.active) {
        this.session.active = true;
        this.session.startTime = Date.now();
      }
      this.feedbackActive = this.simConfig.closedLoopActive;
      this.emergencyStopped = false;
    } else if (upperTarget === CPR_STATES.STOPPED || upperTarget === CPR_STATES.RECOVERY) {
      this._finalizeSession();
    } else if (upperTarget === CPR_STATES.MANUAL_OVERRIDE) {
      this.manualOverride = true;
    }

    if (upperTarget !== CPR_STATES.MANUAL_OVERRIDE) {
      this.manualOverride = false;
    }

    // Synchronize overall simulation state
    try {
      const simulationService = require('./simulationService');
      if (simulationService) {
        if (upperTarget === CPR_STATES.CPR_ACTIVE) {
          simulationService.triggerSimulatedEmergency('CPR ACTIVE');
        } else if (upperTarget === CPR_STATES.SUSPECTED_ARREST || upperTarget === CPR_STATES.CONFIRMING) {
          simulationService.triggerSimulatedEmergency('CARDIAC ARREST SUSPECTED');
        } else if (upperTarget === CPR_STATES.STOPPED || upperTarget === CPR_STATES.IDLE) {
          simulationService.triggerSimulatedEmergency('NORMAL');
        } else if (upperTarget === CPR_STATES.RECOVERY) {
          simulationService.triggerSimulatedEmergency('PATIENT STABLE');
        }
      }
    } catch (e) {
      // Ignore circular reference if any
    }

    return this.getState();
  }

  emergencyStop() {
    this.emergencyStopped = true;
    this.previousState = this.state;
    this.state = CPR_STATES.STOPPED;
    this.stateEnteredAt = Date.now();
    this.feedbackActive = false;
    this.simConfig.motorSpeedRpm = 0;
    this.session.emergencyAlertsCount += 1;
    this._finalizeSession();

    try {
      const simulationService = require('./simulationService');
      if (simulationService) {
        simulationService.triggerSimulatedEmergency('NORMAL');
        if (simulationService.deviceHealth) {
          simulationService.deviceHealth.systemHealth = 'EMERGENCY CUTOFF ENGAGED';
        }
      }
    } catch (e) {}

    return this.getState();
  }

  updateSimulator(config = {}) {
    if (config.compressionRate !== undefined) {
      this.simConfig.compressionRate = Number(config.compressionRate);
      this.simConfig.motorSpeedRpm = Math.round(this.simConfig.compressionRate * 29.6);
    }
    if (config.currentDepthMm !== undefined) {
      this.simConfig.currentDepthMm = Number(config.currentDepthMm);
    }
    if (config.appliedForceNewtons !== undefined) {
      this.simConfig.appliedForceNewtons = Number(config.appliedForceNewtons);
    }
    if (config.sensorState !== undefined) {
      this.simConfig.sensorState = config.sensorState;
      if (config.sensorState === 'Fault') {
        this.sensorFault = true;
        this.session.sensorInterruptions += 1;
      } else {
        this.sensorFault = false;
      }
    }
    if (config.motorState !== undefined) {
      this.simConfig.motorState = config.motorState;
      this.motorFault = config.motorState;
      if (config.motorState === 'Stalled' && this.state === CPR_STATES.CPR_ACTIVE) {
        this.transitionTo(CPR_STATES.ERROR, { force: true });
      }
    }
    if (config.closedLoopActive !== undefined) {
      this.simConfig.closedLoopActive = Boolean(config.closedLoopActive);
    }

    return this.getState();
  }

  _finalizeSession() {
    if (this.session.active || this.session.elapsedSeconds > 0) {
      const durationSec = Math.max(1, this.session.elapsedSeconds);
      const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
      const secs = String(durationSec % 60).padStart(2, '0');

      const history = this.session.compressionHistory;
      let avgRate = this.simConfig.compressionRate;
      let avgDepth = this.simConfig.currentDepthMm;
      let consistency = 94.7;

      if (history.length > 0) {
        const sumRate = history.reduce((acc, h) => acc + h.rate, 0);
        const sumDepth = history.reduce((acc, h) => acc + h.depth, 0);
        const inTargetCount = history.filter(h => h.inTarget).length;
        avgRate = Math.round(sumRate / history.length);
        avgDepth = Number((sumDepth / history.length).toFixed(1));
        consistency = Number(((inTargetCount / history.length) * 100).toFixed(1));
      }

      this.lastCompletedAnalytics = {
        durationSeconds: durationSec,
        durationFormatted: `${mins}:${secs}`,
        totalCompressions: this.session.totalCompressions,
        averageRate: avgRate,
        averageDepth: avgDepth,
        forceConsistencyPct: consistency,
        sensorInterruptions: this.session.sensorInterruptions,
        emergencyAlerts: this.session.emergencyAlertsCount,
        targetComplianceScore: consistency > 90 ? 'Optimal (AHA Compliant)' : 'Suboptimal (Variance Detected)',
        completedAt: new Date().toISOString()
      };

      this.session.active = false;
    }
  }

  getAnalytics() {
    // If currently running, generate live provisional analytics
    if (this.state === CPR_STATES.CPR_ACTIVE && this.session.elapsedSeconds > 0) {
      const durationSec = this.session.elapsedSeconds;
      const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
      const secs = String(durationSec % 60).padStart(2, '0');
      return {
        ...this.lastCompletedAnalytics,
        isLive: true,
        durationSeconds: durationSec,
        durationFormatted: `${mins}:${secs}`,
        totalCompressions: this.session.totalCompressions,
        averageRate: this.simConfig.compressionRate,
        averageDepth: this.simConfig.currentDepthMm
      };
    }
    return {
      ...this.lastCompletedAnalytics,
      isLive: false
    };
  }

  resetSession() {
    this.session = {
      active: false,
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      totalCompressions: 0,
      compressionHistory: [],
      sensorInterruptions: 0,
      emergencyAlertsCount: 0
    };
    this.emergencyStopped = false;
    return this.getState();
  }
}

module.exports = new CprStateMachineService();
