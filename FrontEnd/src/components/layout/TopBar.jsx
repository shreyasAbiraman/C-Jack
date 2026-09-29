import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSystem } from '../../context/SystemContext';
import { useToast } from '../../context/ToastContext';
import {
  Moon,
  Sun,
  Menu,
  Radio,
  BatteryCharging,
  AlertTriangle,
  HeartPulse,
  Navigation,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../ui';

export const TopBar = ({ onOpenMobileNav }) => {
  const { theme, toggleTheme } = useTheme();
  const { systemStatus, connectivity, hardwareState, changeEmergencyState } = useSystem();
  const { addToast } = useToast();

  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active' || status === 'CRITICAL';
  const batteryPct = systemStatus?.deviceHealth?.batteryLevel ?? 88;
  const loraRssi = connectivity?.lora?.rssi ?? -72;
  const gpsLocked = connectivity?.gps?.locked ?? true;

  const handleSimulateToggle = () => {
    if (isEmergency) {
      changeEmergencyState('Normal');
      addToast({
        title: 'System Normal',
        message: 'Simulated emergency state reset to Normal Sinus Rhythm.',
        type: 'success'
      });
    } else {
      changeEmergencyState('Suspected Arrest');
      addToast({
        title: 'Cardiac Arrest Triggered',
        message: 'Simulated ventricular fibrillation detected. Auto-CPR armed.',
        type: 'critical'
      });
    }
  };

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between px-3 sm:px-6 z-20 shrink-0">
      {/* Left: Mobile Trigger & Patient Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-700 dark:text-gray-300 border border-surface-borderLight dark:border-surface-borderDark">
            {systemStatus?.systemState?.patientId || 'CJ-8829'}
          </span>
          <StatusBadge
            status={isEmergency ? 'CRITICAL' : 'NORMAL'}
            text={isEmergency ? 'ARREST ALERT' : 'PATIENT SAFE'}
            pulse={isEmergency}
            size="sm"
          />
        </div>
      </div>

      {/* Right: Telemetry Quick Pills, Simulation Trigger, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hardware State Indicator Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          {hardwareState === 'CONNECTED' ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> HW: CONNECTED
            </span>
          ) : hardwareState === 'DISCONNECTED' ? (
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <XCircle className="h-3 w-3" /> HW: DISCONNECTED
            </span>
          ) : hardwareState === 'FAULT' ? (
            <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="h-3 w-3" /> HW: FAULT
            </span>
          ) : (
            <span className="text-sky-400 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> HW: SIMULATED
            </span>
          )}
        </div>

        {/* LoRa Pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          <Radio className="h-3.5 w-3.5 text-cjack-accent" aria-hidden="true" />
          <span className="text-[11px] font-bold">{loraRssi} dBm</span>
        </div>

        {/* GPS Fix Pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          <Navigation className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          <span className="text-[11px] font-bold">{gpsLocked ? 'GPS 3D FIX' : 'NO FIX'}</span>
        </div>

        {/* Battery Indicator Pill */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          <span className="text-[11px] font-bold">{batteryPct}%</span>
        </div>

        {/* Simulation Emergency Quick Tester */}
        <button
          onClick={handleSimulateToggle}
          title="Toggle Simulated Cardiac Arrest condition"
          className={`text-xs px-2.5 py-1 rounded font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs ${
            isEmergency
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isEmergency ? (
            <>
              <HeartPulse className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reset Normal</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Simulate Arrest</span>
            </>
          )}
        </button>

        {/* Light/Dark Theme Toggle with Persistence */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
