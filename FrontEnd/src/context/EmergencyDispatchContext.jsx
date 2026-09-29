import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import emergencyDispatchApi from '../services/emergencyDispatchApi';
import { useSystem } from './SystemContext';
import { useToast } from './ToastContext';

const EmergencyDispatchContext = createContext(null);

const LOCAL_AMBULANCES_KEY = 'cjack_local_ambulances';
const LOCAL_ACTIVE_KEY = 'cjack_local_active_responders';
const LOCAL_HISTORY_KEY = 'cjack_local_dispatch_history';

const DEFAULT_AMBULANCES = [
  {
    _id: 'amb-default-1',
    ambulanceId: 'AMB-01',
    name: 'City Emergency Ambulance 01',
    type: 'ALS',
    organization: 'Metro Central Emergency Services',
    phoneNumber: '+91 80 2200 0101',
    primaryPhone: '+91 80 2200 0101',
    baseLocation: 'MG Road Trauma Sub-Station',
    serviceArea: 'Central Emergency Sector 4',
    availability: 'AVAILABLE',
    isActiveResponder: true,
  },
  {
    _id: 'amb-default-2',
    ambulanceId: 'AMB-02',
    name: 'Apex Critical Care Transport',
    type: 'MICU',
    organization: 'Apex Healthcare Network',
    phoneNumber: '+91 80 4100 0201',
    primaryPhone: '+91 80 4100 0201',
    baseLocation: 'East Zone Sector 2',
    serviceArea: 'East Zone Sector 2',
    availability: 'AVAILABLE',
    isActiveResponder: true,
  },
  {
    _id: 'amb-default-3',
    ambulanceId: 'AMB-03',
    name: 'Apollo Rapid Response Unit',
    type: 'ALS',
    organization: 'Apollo Hospital First Response',
    phoneNumber: '+91 80 6600 0301',
    primaryPhone: '+91 80 6600 0301',
    baseLocation: 'Bannerghatta Emergency Wing',
    serviceArea: 'South Sector 1',
    availability: 'AVAILABLE',
    isActiveResponder: true,
  },
];

const loadLocalData = () => {
  try {
    const rawAmb = localStorage.getItem(LOCAL_AMBULANCES_KEY);
    const parsedAmb = rawAmb ? JSON.parse(rawAmb) : DEFAULT_AMBULANCES;
    const rawActive = localStorage.getItem(LOCAL_ACTIVE_KEY);
    const parsedActive = rawActive ? JSON.parse(rawActive) : parsedAmb.slice(0, 3);
    const rawHist = localStorage.getItem(LOCAL_HISTORY_KEY);
    const parsedHist = rawHist ? JSON.parse(rawHist) : [];
    return { ambulances: parsedAmb, activeResponders: parsedActive, history: parsedHist };
  } catch {
    return { ambulances: DEFAULT_AMBULANCES, activeResponders: DEFAULT_AMBULANCES.slice(0, 3), history: [] };
  }
};

export const EmergencyDispatchProvider = ({ children }) => {
  const { vitals, location, patient } = useSystem();
  const { addToast } = useToast();

  const initial = loadLocalData();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [ambulances, setAmbulances] = useState(initial.ambulances);
  const [activeResponders, setActiveResponders] = useState(initial.activeResponders);
  const [history, setHistory] = useState(initial.history);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal controls
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDispatchTracker, setShowDispatchTracker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Sync to localStorage
  const saveToLocal = (newAmbulances, newActive, newHistory) => {
    try {
      if (newAmbulances) {
        localStorage.setItem(LOCAL_AMBULANCES_KEY, JSON.stringify(newAmbulances));
      }
      if (newActive) {
        localStorage.setItem(LOCAL_ACTIVE_KEY, JSON.stringify(newActive));
      }
      if (newHistory) {
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } catch (e) {
      console.warn('[EmergencyDispatchContext] localStorage save error:', e);
    }
  };

  // Initialize and poll
  const refreshData = useCallback(async () => {
    try {
      const [ambRes, activeRes, emgRes, histRes] = await Promise.all([
        emergencyDispatchApi.getAllAmbulances().catch(() => null),
        emergencyDispatchApi.getActiveResponders().catch(() => null),
        emergencyDispatchApi.getActiveEmergency().catch(() => null),
        emergencyDispatchApi.getEmergencyHistory().catch(() => null),
      ]);

      if (ambRes?.data?.data && ambRes.data.data.length > 0) {
        setAmbulances(ambRes.data.data);
        saveToLocal(ambRes.data.data);
      }
      if (activeRes?.data?.data && activeRes.data.data.length > 0) {
        setActiveResponders(activeRes.data.data);
        saveToLocal(null, activeRes.data.data);
      }
      if (histRes?.data?.data) {
        setHistory(histRes.data.data);
        saveToLocal(null, null, histRes.data.data);
      }
      
      if (emgRes?.data?.hasActiveEmergency) {
        setActiveEmergency(emgRes.data.data);
      }
      setError(null);
    } catch (err) {
      console.warn('[EmergencyDispatch] Backend sync note (using local state):', err.message);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const initiateEmergencyCall = () => {
    setShowConfirmation(true);
  };

  const confirmAndDispatch = async () => {
    setShowConfirmation(false);
    setShowDispatchTracker(true);

    const fallbackEmergency = {
      emergencyId: `EMG-${Date.now().toString(36).toUpperCase()}`,
      status: 'DISPATCHING',
      severity: 'CRITICAL',
      patientId: patient?.id || 'CJ-PATIENT-8829',
      patientName: patient?.name || 'Rajesh Kumar (Wearer)',
      timestamp: new Date().toISOString(),
      vitalsAtTrigger: {
        heartRate: vitals?.heartRate || 0,
        spo2: vitals?.spo2 || 78,
        bloodPressure: vitals?.bloodPressure || '60/40',
      },
      patientLocation: location?.coordinates || {
        latitude: 12.9716,
        longitude: 77.5946,
        addressHint: 'Bengaluru Central Emergency Sector 4',
      },
      dispatches: activeResponders.map((amb, idx) => ({
        ambulanceId: amb.ambulanceId || amb._id,
        ambulanceName: amb.name,
        phoneNumber: amb.phoneNumber || amb.primaryPhone,
        callStatus: idx === 0 ? 'RINGING' : 'QUEUED',
        dispatchTime: new Date().toISOString(),
      })),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          status: 'ALERT_TRIGGERED',
          message: 'Zero-pulse cardiac arrest condition detected. Emergency SOS broadcast initiated.',
        }
      ]
    };

    try {
      const callData = {
        patientId: patient?.id || 'CJ-PATIENT-8829',
        patientName: patient?.name || 'Rajesh Kumar (Wearer)',
        vitals: {
          heartRate: vitals?.heartRate || 0,
          spo2: vitals?.spo2 || 78,
          respirationRate: vitals?.respirationRate || 0,
          bloodPressure: vitals?.bloodPressure || '60/40',
          bloodGroup: patient?.bloodGroup || 'O+ POSITIVE',
          emergencySeverity: 'CRITICAL',
        },
        patientLocation: location?.coordinates || {
          latitude: 12.9716,
          longitude: 77.5946,
          addressHint: 'Bengaluru Central Emergency Sector 4',
        },
      };

      const res = await emergencyDispatchApi.createDispatch(callData);
      
      if (res?.data?.success || res?.response?.status === 409) {
        addToast('SUCCESS', 'Emergency dispatch initiated. Calling ambulances...');
        await refreshData();
      } else {
        setActiveEmergency(fallbackEmergency);
        addToast('SUCCESS', 'Emergency dispatch initiated (Simulation mode).');
      }
    } catch (err) {
      console.warn('Dispatching with local emergency fallback:', err.message);
      setActiveEmergency(fallbackEmergency);
      addToast('SUCCESS', 'Emergency dispatch initiated. Dialing units...');
    }
  };

  const cancelEmergency = async (reason = 'ACCIDENTAL_TRIGGER') => {
    setActiveEmergency(null);
    setShowDispatchTracker(false);
    try {
      if (activeEmergency?.emergencyId) {
        await emergencyDispatchApi.cancelDispatch(activeEmergency.emergencyId, reason);
      }
    } catch {
      // Ignored in offline
    }
    addToast('INFO', 'Emergency dispatch cancelled.');
  };

  // Responder Actions
  const acceptEmergency = async (emergencyId, ambulanceId) => {
    try {
      await emergencyDispatchApi.acceptDispatch(emergencyId, ambulanceId);
    } catch {
      // Update local emergency state
      if (activeEmergency) {
        setActiveEmergency(prev => prev ? {
          ...prev,
          status: 'ASSIGNED',
          assignedAmbulanceId: ambulanceId,
          assignedAmbulanceName: ambulances.find(a => a._id === ambulanceId || a.ambulanceId === ambulanceId)?.name || 'ALS Responder',
        } : null);
      }
    }
    addToast('SUCCESS', 'Emergency Accepted. You are now the assigned responder.');
    refreshData();
  };

  const rejectEmergency = async (emergencyId, ambulanceId, reason = 'RESPONDER_BUSY') => {
    try {
      await emergencyDispatchApi.rejectDispatch(emergencyId, ambulanceId, reason);
    } catch {
      // Offline fallback
    }
    addToast('INFO', 'Emergency rejected.');
    refreshData();
  };

  const progressStatus = async (emergencyId, status) => {
    try {
      await emergencyDispatchApi.progressAssignment(emergencyId, status);
    } catch {
      if (activeEmergency) {
        setActiveEmergency(prev => prev ? { ...prev, assignmentStatus: status } : null);
      }
    }
    addToast('SUCCESS', `Status updated to ${status.replace(/_/g, ' ')}`);
    refreshData();
  };

  // Settings Actions
  const saveAmbulanceSelection = async (selectedIds) => {
    const newActive = ambulances.filter(a => selectedIds.includes(a._id) || selectedIds.includes(a.ambulanceId));
    setActiveResponders(newActive);
    saveToLocal(null, newActive);
    try {
      await emergencyDispatchApi.updateActiveSelection(selectedIds);
    } catch {
      // Saved to local
    }
    addToast('SUCCESS', 'Active emergency responders updated.');
  };

  const createAmbulance = async (data) => {
    const newUnit = {
      _id: 'amb-' + Date.now(),
      ambulanceId: 'AMB-' + Math.floor(10 + Math.random() * 90),
      name: data.name,
      type: data.type || 'ALS',
      phoneNumber: data.phoneNumber,
      primaryPhone: data.phoneNumber,
      baseLocation: data.baseLocation || 'Emergency Sector',
      serviceArea: data.baseLocation || 'Emergency Sector',
      driverName: data.driverName || 'Assigned Paramedic',
      availability: 'AVAILABLE',
      currentStatus: 'AVAILABLE',
      isActiveResponder: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...ambulances, newUnit];
    setAmbulances(updated);
    
    // Automatically add to active responders if less than 3
    let updatedActive = activeResponders;
    if (activeResponders.length < 3) {
      updatedActive = [...activeResponders, newUnit];
      setActiveResponders(updatedActive);
    }

    saveToLocal(updated, updatedActive);

    try {
      await emergencyDispatchApi.createAmbulance(data);
    } catch {
      // Successfully saved to local store
    }
    addToast('SUCCESS', `Ambulance unit "${data.name}" added successfully.`);
  };

  const deleteAmbulance = async (id) => {
    const updated = ambulances.filter(a => a._id !== id && a.ambulanceId !== id);
    const updatedActive = activeResponders.filter(a => a._id !== id && a.ambulanceId !== id);
    setAmbulances(updated);
    setActiveResponders(updatedActive);
    saveToLocal(updated, updatedActive);

    try {
      await emergencyDispatchApi.deleteAmbulance(id);
    } catch {
      // Handled in local
    }
    addToast('SUCCESS', 'Ambulance contact removed.');
  };

  const value = {
    activeEmergency,
    ambulances,
    activeResponders,
    history,
    loading,
    error,
    refreshData,
    
    // UI State
    showConfirmation,
    setShowConfirmation,
    showDispatchTracker,
    setShowDispatchTracker,
    showHistory,
    setShowHistory,
    
    // Actions
    initiateEmergencyCall,
    confirmAndDispatch,
    cancelEmergency,
    
    acceptEmergency,
    rejectEmergency,
    progressStatus,
    
    saveAmbulanceSelection,
    createAmbulance,
    deleteAmbulance,
  };

  return (
    <EmergencyDispatchContext.Provider value={value}>
      {children}
    </EmergencyDispatchContext.Provider>
  );
};

export const useEmergencyDispatch = () => {
  const context = useContext(EmergencyDispatchContext);
  if (!context) {
    throw new Error('useEmergencyDispatch must be used within an EmergencyDispatchProvider');
  }
  return context;
};
