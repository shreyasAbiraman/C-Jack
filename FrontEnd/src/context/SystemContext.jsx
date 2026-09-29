import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  patientService,
  vitalService,
  cprService,
  emergencyService,
  locationService,
  deviceService,
  responderService,
  eventService,
  communicationService,
  realtimeClient,
  systemService,
  hardwareService
} from '../services';
import { simulationEngine } from '../simulation/simulationEngine';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [cprMetrics, setCprMetrics] = useState(null);
  const [deviceHealth, setDeviceHealth] = useState(null);
  const [emergencyCommunication, setEmergencyCommunication] = useState(null);
  const [location, setLocation] = useState(null);
  const [connectivity, setConnectivity] = useState(null);
  const [cprMachineState, setCprMachineState] = useState(null);
  const [emergencyResponse, setEmergencyResponse] = useState(null);
  const [connectivityStatus, setConnectivityStatus] = useState(null);
  const [responderStatus, setResponderStatus] = useState(null);
  const [deviceOverview, setDeviceOverview] = useState(null);
  const [deviceSensors, setDeviceSensors] = useState([]);
  const [deviceModes, setDeviceModes] = useState(null);
  const [deviceEvents, setDeviceEvents] = useState([]);
  const [deviceMaintenance, setDeviceMaintenance] = useState(null);
  const [hardwareStatus, setHardwareStatus] = useState(null);
  const [hardwareState, setHardwareState] = useState('SIMULATED');

  // Connection & Offline Resilience States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'ONLINE' | 'OFFLINE' | 'CONNECTING'
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Simulation state overlay — when the engine is active its state supersedes backend telemetry
  const [simOverlay, setSimOverlay] = useState(null);

  // Cached state tracker ref to ensure we retain existing data upon temporary network drop
  const stateCacheRef = useRef({ hasReceivedData: false });

  // Subscribe to the simulation engine
  useEffect(() => {
    const unsub = simulationEngine.subscribe((engineState) => {
      if (engineState.simulationMode && engineState.currentSystemState) {
        setSimOverlay(engineState.currentSystemState);
      } else {
        setSimOverlay(null);
      }
    });
    return () => unsub();
  }, []);

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    } catch {
      return String(ts);
    }
  };

  /**
   * Primary comprehensive synchronization
   */
  const fetchAllTelemetry = useCallback(async () => {
    try {
      const [
        sysRes,
        vitalsRes,
        cprRes,
        locRes,
        cprStateRes,
        emerRes,
        connStatusRes,
        respStatusRes,
        devOverviewRes,
        devSensorsRes,
        devModesRes,
        devEventsRes,
        devMaintRes,
        patientRes,
        hwStatusRes
      ] = await Promise.all([
        systemService.getSystemStatus().catch(() => null),
        vitalService.getLiveVitals().catch(() => null),
        systemService.getCprMetrics().catch(() => null),
        locationService.getLocation().catch(() => null),
        cprService.getCprState().catch(() => null),
        emergencyService.getEmergencyStatus().catch(() => null),
        communicationService.getStatus().catch(() => null),
        responderService.getResponderStatus().catch(() => null),
        deviceService.getDeviceOverview().catch(() => null),
        deviceService.getSensors().catch(() => null),
        deviceService.getModes().catch(() => null),
        eventService.getEvents(30).catch(() => null),
        deviceService.getMaintenance().catch(() => null),
        patientService.getPatient().catch(() => null),
        hardwareService.getStatus().catch(() => null)
      ]);

      const isServerResponding = Boolean(sysRes || vitalsRes || devOverviewRes || emerRes);

      if (isServerResponding) {
        const baseSys = sysRes?.data || sysRes;
        if (baseSys) {
          setSystemStatus(baseSys);
          setDeviceHealth(baseSys.deviceHealth || null);
          setEmergencyCommunication(baseSys.emergencyCommunication || null);
          setConnectivity(baseSys.connectivity || null);
        }

        if (patientRes) {
          setPatient(patientRes?.data || patientRes);
        } else if (baseSys?.patient) {
          setPatient(baseSys.patient);
        }

        if (vitalsRes) {
          setVitals(vitalsRes?.data?.vitals || vitalsRes?.vitals || vitalsRes?.data || vitalsRes);
        }

        if (cprRes) {
          setCprMetrics(cprRes?.data?.cpr || cprRes?.cpr || cprRes);
        }

        if (locRes) {
          setLocation(locRes?.data?.location || locRes?.location || locRes?.data || locRes);
        }

        if (cprStateRes) setCprMachineState(cprStateRes?.data || cprStateRes);
        if (emerRes) setEmergencyResponse(emerRes?.data || emerRes);
        if (connStatusRes) setConnectivityStatus(connStatusRes?.data || connStatusRes);
        if (respStatusRes) setResponderStatus(respStatusRes?.data || respStatusRes);

        if (devOverviewRes) setDeviceOverview(devOverviewRes?.data || devOverviewRes);
        if (devSensorsRes) setDeviceSensors(devSensorsRes?.data?.channels || devSensorsRes?.sensors || devSensorsRes || []);
        if (devModesRes) setDeviceModes(devModesRes?.data || devModesRes);
        if (devEventsRes) setDeviceEvents(devEventsRes?.data || devEventsRes || []);
        if (devMaintRes) setDeviceMaintenance(devMaintRes?.data || devMaintRes);
        if (hwStatusRes) {
          const hwData = hwStatusRes?.data || hwStatusRes;
          setHardwareStatus(hwData);
          if (hwData.overallState) setHardwareState(hwData.overallState);
        }

        const nowIso = new Date().toISOString();
        setLastSuccessfulUpdate(nowIso);
        setBackendOnline(true);
        setConnectionStatus('ONLINE');
        setIsStale(false);
        setError(null);
        stateCacheRef.current.hasReceivedData = true;
      } else {
        // Backend did not respond properly
        setBackendOnline(false);
        setConnectionStatus('OFFLINE');
        if (stateCacheRef.current.hasReceivedData) {
          setIsStale(true);
        }
      }
    } catch (err) {
      console.warn('[SystemContext] Telemetry synchronization issue:', err.message);
      setBackendOnline(false);
      setConnectionStatus('OFFLINE');
      if (stateCacheRef.current.hasReceivedData) {
        setIsStale(true);
      } else {
        setError(err.message || 'Telemetry connection failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time stream subscription & polling fallback
  useEffect(() => {
    fetchAllTelemetry();

    // Subscribe to status changes on realtimeClient
    const unsubStatus = realtimeClient.onStatusChange(({ status, lastSuccessfulUpdate: lsu }) => {
      setConnectionStatus(status);
      if (status === 'ONLINE') {
        setBackendOnline(true);
        setIsStale(false);
        if (lsu) setLastSuccessfulUpdate(lsu);
      } else if (status === 'OFFLINE') {
        setBackendOnline(false);
        if (stateCacheRef.current.hasReceivedData) {
          setIsStale(true);
        }
      }
    });

    // Wire real-time channel updates directly into React state
    const unsubVitals = realtimeClient.subscribe('vitals', (data) => {
      if (data) {
        setVitals(data.vitals || data.data || data);
        setIsStale(false);
      }
    });

    const unsubCpr = realtimeClient.subscribe('cpr', (data) => {
      if (data) {
        setCprMachineState(data.data || data);
      }
    });

    const unsubEmer = realtimeClient.subscribe('emergency', (data) => {
      if (data) {
        setEmergencyResponse(data.data || data);
      }
    });

    const unsubLoc = realtimeClient.subscribe('location', (data) => {
      if (data) {
        setLocation(data.location || data.data || data);
      }
    });

    const unsubDev = realtimeClient.subscribe('device', (data) => {
      if (data) {
        setDeviceOverview(data.data || data);
      }
    });

    const unsubResp = realtimeClient.subscribe('responder', (data) => {
      if (data) {
        setResponderStatus(data.data || data);
      }
    });

    // Regular polling fallback interval (every 3 seconds)
    const interval = setInterval(fetchAllTelemetry, 3000);

    return () => {
      clearInterval(interval);
      unsubStatus();
      unsubVitals();
      unsubCpr();
      unsubEmer();
      unsubLoc();
      unsubDev();
      unsubResp();
      realtimeClient.stop();
    };
  }, [fetchAllTelemetry]);

  // Actions delegated to centralized services
  const changeEmergencyState = async (newState) => {
    try {
      await systemService.setSimulatedState(newState);
      await fetchAllTelemetry();
    } catch (err) {
      console.error('Error updating state:', err);
    }
  };

  const transitionCprState = async (targetState, metadata = {}) => {
    try {
      const res = await cprService.transitionCprState(targetState, metadata);
      setCprMachineState(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error transitioning CPR state:', err);
      throw err;
    }
  };

  const emergencyStopCpr = async () => {
    try {
      const res = await cprService.emergencyStop();
      setCprMachineState(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error in emergency stop:', err);
      throw err;
    }
  };

  const updateCprSimulator = async (config) => {
    try {
      const res = await cprService.updateSimulator(config);
      setCprMachineState(res);
      return res;
    } catch (err) {
      console.error('Error updating simulator:', err);
      throw err;
    }
  };

  const transitionAlertState = async (targetState) => {
    try {
      const res = await emergencyService.transitionAlertState(targetState);
      setEmergencyResponse(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error transitioning alert state:', err);
      throw err;
    }
  };

  const advanceFlowStage = async (stageIndexOrKey) => {
    try {
      const res = await emergencyService.advanceFlowStage(stageIndexOrKey);
      setEmergencyResponse(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error advancing emergency flow:', err);
      throw err;
    }
  };

  const triggerEmergency = async () => {
    try {
      const res = await emergencyService.triggerEmergency();
      setEmergencyResponse(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error triggering emergency:', err);
      throw err;
    }
  };

  const resetEmergency = async () => {
    try {
      const res = await emergencyService.resetEmergency();
      setEmergencyResponse(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error resetting emergency:', err);
      throw err;
    }
  };

  const notifyEmergencyContact = async (options) => {
    try {
      const res = await emergencyService.notifyContact(options);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error notifying emergency contact:', err);
      throw err;
    }
  };

  const sendCommunicationPacket = async (packet) => {
    try {
      const res = await communicationService.sendPacket(packet);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error sending communication packet:', err);
      throw err;
    }
  };

  const simulateOfflineQueue = async (action) => {
    try {
      const res = await communicationService.simulateOfflineQueue(action);
      if (res) {
        setConnectivityStatus(res);
      }
      return res;
    } catch (err) {
      console.error('Error in offline queue simulation:', err);
      throw err;
    }
  };

  const setNetworkStates = async (states) => {
    try {
      const res = await communicationService.setNetworkStates(states);
      if (res) {
        setConnectivityStatus(res);
      }
      return res;
    } catch (err) {
      console.error('Error setting network states:', err);
      throw err;
    }
  };

  const transitionResponderState = async (targetState) => {
    try {
      const res = await responderService.setResponderState(targetState);
      if (res) {
        setResponderStatus(res);
      }
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error updating responder state:', err);
      throw err;
    }
  };

  const changeDeviceMode = async (mode) => {
    try {
      const res = await deviceService.setMode(mode);
      setDeviceModes(res);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error changing device mode:', err);
      throw err;
    }
  };

  const recordDeviceEvent = async (eventData) => {
    try {
      const res = await eventService.recordEvent(eventData);
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error recording device event:', err);
      throw err;
    }
  };

  const runDeviceDiagnosticTest = async () => {
    try {
      const res = await deviceService.runSelfTest();
      await fetchAllTelemetry();
      return res;
    } catch (err) {
      console.error('Error running device diagnostic test:', err);
      throw err;
    }
  };

  const manualReconnect = async () => {
    setConnectionStatus('CONNECTING');
    await fetchAllTelemetry();
    await realtimeClient.reconnect();
  };

  return (
    <SystemContext.Provider
      value={{
        // When simulation is active, overlay its state on top of backend telemetry
        systemStatus: simOverlay
          ? { ...systemStatus, systemState: simOverlay.systemState, simulationMode: true }
          : systemStatus,
        patient,
        vitals: simOverlay?.vitals || vitals,
        cprMetrics: simOverlay?.cpr || cprMetrics,
        cprMachineState: simOverlay?.cpr || cprMachineState,
        emergencyResponse: simOverlay
          ? { ...emergencyResponse, alertStatus: simOverlay.communication?.alertStatus, simulationMode: true }
          : emergencyResponse,
        connectivityStatus: simOverlay?.connectivity || connectivityStatus,
        responderStatus,
        deviceHealth: simOverlay?.device || deviceHealth || systemStatus?.deviceHealth,
        emergencyCommunication: simOverlay?.communication || emergencyCommunication || systemStatus?.emergencyCommunication,
        location: simOverlay?.location ? { ...location, ...simOverlay.location } : location,
        connectivity: simOverlay?.connectivity || connectivity,
        deviceOverview: simOverlay?.device || deviceOverview,
        deviceSensors,
        deviceModes,
        deviceEvents,
        deviceMaintenance,
        loading,
        error,
        backendOnline,
        connectionStatus,
        isStale,
        lastSuccessfulUpdate,
        lastSuccessfulUpdateFormatted: formatTime(lastSuccessfulUpdate),
        // Simulation mode flag for UI banners
        simulationMode: Boolean(simOverlay),
        reconnect: manualReconnect,
        refreshData: fetchAllTelemetry,
        refreshDeviceData: fetchAllTelemetry,
        changeEmergencyState,
        transitionCprState,
        emergencyStopCpr,
        updateCprSimulator,
        getCprAnalytics: cprService.getAnalytics,
        resetCprSession: cprService.resetSession,
        transitionAlertState,
        advanceFlowStage,
        triggerEmergency,
        resetEmergency,
        notifyEmergencyContact,
        sendCommunicationPacket,
        simulateOfflineQueue,
        setNetworkStates,
        getCommunicationPackets: communicationService.getPackets,
        transitionResponderState,
        getHandoverData: responderService.getHandoverData,
        exportSessionSummary: responderService.exportSessionSummary,
        changeDeviceMode,
        recordDeviceEvent,
        runDeviceDiagnosticTest,
        // Hardware Abstraction Layer
        hardwareStatus,
        hardwareState,
        hardwareModules: hardwareStatus?.modules || [],
        sendHardwareCommand: hardwareService.sendCommand,
        setHardwareOperatingMode: async (mode) => {
          const res = await hardwareService.setOperatingMode(mode);
          await fetchAllTelemetry();
          return res;
        },
        simulateHardwarePacket: async (options) => {
          const res = await hardwareService.simulatePacket(options);
          await fetchAllTelemetry();
          return res;
        }
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};


export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export default SystemContext;
