import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Activity, 
  Ambulance, 
  Building2, 
  ShieldCheck, 
  Sliders 
} from 'lucide-react';

/**
 * Multi-Role Support Architecture
 * 
 * Supports 5 distinct stakeholder roles without code duplication:
 * 1. RIDER_PATIENT (Wearer)
 * 2. RESPONDER (First Responder on-scene)
 * 3. AMBULANCE (Paramedic unit in-transit)
 * 4. HOSPITAL (Emergency Department / Trauma Bay)
 * 5. ADMINISTRATOR (System / Fleet supervisor)
 */

export const CJACK_ROLES = {
  RIDER_PATIENT: {
    id: 'RIDER_PATIENT',
    label: 'Rider / Patient',
    badge: 'PATIENT-WEARER',
    icon: User,
    color: 'emerald',
    description: 'Personal smart jacket telemetry, battery monitor, and emergency SOS trigger',
    focusMetrics: ['Vitals', 'Battery', 'Emergency Alert', 'Audio Guidance'],
    capabilities: {
      canTriggerSos: true,
      canViewOwnVitals: true,
      canViewBattery: true,
      canClearDefib: false,
      canChangeResponderState: false,
      canExportClinicalAudit: false,
      canModifyHardware: false
    }
  },
  RESPONDER: {
    id: 'RESPONDER',
    label: 'First Responder',
    badge: 'FIRST-AID EMT',
    icon: Activity,
    color: 'blue',
    description: 'Immediate scene safety, defibrillator clearance, CPR rhythm cadence, and rapid triage',
    focusMetrics: ['Immediate Vitals', 'CPR Cadence', 'Defibrillator Clearance', 'Triage Checklist'],
    capabilities: {
      canTriggerSos: false,
      canViewOwnVitals: true,
      canViewBattery: true,
      canClearDefib: true,
      canChangeResponderState: true,
      canExportClinicalAudit: false,
      canModifyHardware: false
    }
  },
  AMBULANCE: {
    id: 'AMBULANCE',
    label: 'Ambulance Paramedic',
    badge: 'ALS-MED-04',
    icon: Ambulance,
    color: 'amber',
    description: 'In-transit Advanced Life Support crew monitoring live vitals stream, route vector, and staging clinical handover',
    focusMetrics: ['Distance & ETA', 'Live ECG & SpO2', 'CPR Closed-Loop', 'Route Vector', 'Handover Packet'],
    capabilities: {
      canTriggerSos: false,
      canViewOwnVitals: true,
      canViewBattery: true,
      canClearDefib: true,
      canChangeResponderState: true,
      canExportClinicalAudit: true,
      canModifyHardware: false
    }
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    label: 'Hospital Trauma Bay',
    badge: 'ED TRAUMA-1',
    icon: Building2,
    color: 'purple',
    description: 'Emergency department catheterization lab pre-activation, bed allocation, and clinical telemetry import',
    focusMetrics: ['Pre-Arrival ETA', '12-Lead / Lead-II Trend', 'Total Down-Time', 'Clinical Handover Audit'],
    capabilities: {
      canTriggerSos: false,
      canViewOwnVitals: true,
      canViewBattery: true,
      canClearDefib: false,
      canChangeResponderState: true,
      canExportClinicalAudit: true,
      canModifyHardware: false
    }
  },
  ADMINISTRATOR: {
    id: 'ADMINISTRATOR',
    label: 'Administrator',
    badge: 'SYS-OVERRIDE',
    icon: ShieldCheck,
    color: 'red',
    description: 'Platform supervisor managing device firmware, LoRa gateways, calibration overrides, and system logs',
    focusMetrics: ['RF Gateways', 'Sensor Calibration', 'Firmware Bus', 'Global Audit Trail'],
    capabilities: {
      canTriggerSos: true,
      canViewOwnVitals: true,
      canViewBattery: true,
      canClearDefib: true,
      canChangeResponderState: true,
      canExportClinicalAudit: true,
      canModifyHardware: true
    }
  }
};

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  // Default to AMBULANCE or load from localStorage
  const [activeRoleKey, setActiveRoleKey] = useState(() => {
    try {
      const saved = localStorage.getItem('cjack_active_role');
      return saved && CJACK_ROLES[saved] ? saved : 'AMBULANCE';
    } catch (e) {
      return 'AMBULANCE';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cjack_active_role', activeRoleKey);
    } catch (e) {
      // ignore
    }
  }, [activeRoleKey]);

  const activeRole = CJACK_ROLES[activeRoleKey] || CJACK_ROLES.AMBULANCE;

  const setRole = (roleKey) => {
    if (CJACK_ROLES[roleKey]) {
      setActiveRoleKey(roleKey);
    }
  };

  const hasCapability = (capKey) => {
    return Boolean(activeRole?.capabilities?.[capKey]);
  };

  const isRole = (roleKey) => {
    return activeRoleKey === roleKey;
  };

  return (
    <RoleContext.Provider
      value={{
        activeRoleKey,
        activeRole,
        roles: CJACK_ROLES,
        setRole,
        hasCapability,
        isRole
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
