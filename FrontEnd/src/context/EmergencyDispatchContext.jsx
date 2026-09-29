import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import emergencyDispatchApi from '../services/emergencyDispatchApi';
import { useSystem } from './SystemContext';
import { useToast } from './ToastContext';

const EmergencyDispatchContext = createContext(null);

export const EmergencyDispatchProvider = ({ children }) => {
  const { vitals, location, patient } = useSystem();
  const { addToast } = useToast();

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [activeResponders, setActiveResponders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal controls
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDispatchTracker, setShowDispatchTracker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize and poll
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [ambRes, activeRes, emgRes, histRes] = await Promise.all([
        emergencyDispatchApi.getAllAmbulances().catch(() => ({ data: { data: [] } })),
        emergencyDispatchApi.getActiveResponders().catch(() => ({ data: { data: [] } })),
        emergencyDispatchApi.getActiveEmergency().catch(() => ({ data: { data: null } })),
        emergencyDispatchApi.getEmergencyHistory().catch(() => ({ data: { data: [] } })),
      ]);

      if (ambRes.data?.data) setAmbulances(ambRes.data.data);
      if (activeRes.data?.data) setActiveResponders(activeRes.data.data);
      if (histRes.data?.data) setHistory(histRes.data.data);
      
      if (emgRes.data?.hasActiveEmergency) {
        setActiveEmergency(emgRes.data.data);
      } else {
        setActiveEmergency(null);
        if (showDispatchTracker && !emgRes.data?.hasActiveEmergency) {
          // If we were showing tracker but emergency ended, keep it open but update state
        }
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch emergency dispatch data:', err);
      setError('Failed to connect to dispatch service');
    } finally {
      setLoading(false);
    }
  }, [showDispatchTracker]);

  useEffect(() => {
    refreshData();
    // Poll every 3 seconds for live updates during active dispatch
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const initiateEmergencyCall = () => {
    setShowConfirmation(true);
  };

  const confirmAndDispatch = async () => {
    setShowConfirmation(false);
    setShowDispatchTracker(true);
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
      
      if (res.data?.success || res.response?.status === 409) {
        if (res.data?.code === 'DUPLICATE_ACTIVE_EMERGENCY' || res.response?.status === 409) {
          addToast('INFO', 'An emergency dispatch is already active.');
        } else {
          addToast('SUCCESS', 'Emergency dispatch initiated. Calling ambulances...');
        }
        await refreshData();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      // Even on error (like 409), refresh to get active state
      await refreshData();
      if (err.response?.status === 409) {
        addToast('INFO', 'An emergency dispatch is already active.');
      } else {
        addToast('ERROR', err.response?.data?.message || 'Failed to dispatch emergency.');
      }
    }
  };

  const cancelEmergency = async (reason = 'ACCIDENTAL_TRIGGER') => {
    if (!activeEmergency?.emergencyId) return;
    try {
      await emergencyDispatchApi.cancelDispatch(activeEmergency.emergencyId, reason);
      addToast('INFO', 'Emergency dispatch cancelled.');
      await refreshData();
      setShowDispatchTracker(false);
    } catch (err) {
      addToast('ERROR', 'Failed to cancel emergency.');
    }
  };

  // Responder Actions
  const acceptEmergency = async (emergencyId, ambulanceId) => {
    try {
      const res = await emergencyDispatchApi.acceptDispatch(emergencyId, ambulanceId);
      addToast('SUCCESS', 'Emergency Accepted. You are now the assigned responder.');
      await refreshData();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept emergency.';
      addToast('ERROR', msg);
      throw err;
    }
  };

  const rejectEmergency = async (emergencyId, ambulanceId, reason = 'RESPONDER_BUSY') => {
    try {
      await emergencyDispatchApi.rejectDispatch(emergencyId, ambulanceId, reason);
      addToast('INFO', 'Emergency rejected.');
      await refreshData();
    } catch (err) {
      addToast('ERROR', 'Failed to reject emergency.');
    }
  };

  const progressStatus = async (emergencyId, status) => {
    try {
      await emergencyDispatchApi.progressAssignment(emergencyId, status);
      addToast('SUCCESS', `Status updated to ${status.replace(/_/g, ' ')}`);
      await refreshData();
    } catch (err) {
      addToast('ERROR', 'Failed to update status.');
    }
  };

  // Settings Actions
  const saveAmbulanceSelection = async (selectedIds) => {
    try {
      await emergencyDispatchApi.updateActiveSelection(selectedIds);
      addToast('SUCCESS', 'Active emergency responders updated.');
      await refreshData();
    } catch (err) {
      addToast('ERROR', err.response?.data?.message || 'Failed to update selection.');
    }
  };

  const createAmbulance = async (data) => {
    try {
      await emergencyDispatchApi.createAmbulance(data);
      addToast('SUCCESS', 'Ambulance contact added.');
      await refreshData();
    } catch (err) {
      addToast('ERROR', 'Failed to add ambulance.');
    }
  };

  const deleteAmbulance = async (id) => {
    try {
      await emergencyDispatchApi.deleteAmbulance(id);
      addToast('SUCCESS', 'Ambulance contact removed.');
      await refreshData();
    } catch (err) {
      addToast('ERROR', 'Failed to remove ambulance.');
    }
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
