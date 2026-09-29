import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSystem } from '../../context/SystemContext';
import {
  Moon,
  Sun,
  Menu,
  Radio,
  BatteryCharging,
  AlertTriangle,
  HeartPulse,
  Wifi,
  WifiOff,
  RotateCcw
} from 'lucide-react';
import { StatusBadge, Button } from '../ui';

const Header = ({ setMobileOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    systemStatus,
    connectivity,
    changeEmergencyState,
    backendOnline,
    connectionStatus,
    lastSuccessfulUpdateFormatted,
    reconnect
  } = useSystem();

  const status = systemStatus?.systemState?.status || 'Normal';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active';
  const batteryPct = systemStatus?.deviceHealth?.batteryLevel ?? 88;
  const loraConnected = connectivity?.lora?.connected ?? true;

  const handleQuickToggle = () => {
    if (isEmergency) {
      changeEmergencyState('Normal');
    } else {
      changeEmergencyState('Suspected Arrest');
    }
  };

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
      {/* Left side: Mobile Toggle & Patient Code */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-700 dark:text-gray-300 border border-surface-borderLight dark:border-surface-borderDark">
            PATIENT: {systemStatus?.systemState?.patientId || 'CJ-PATIENT-8829'}
          </span>
          <StatusBadge
            status={isEmergency ? 'emergency' : 'safe'}
            text={isEmergency ? `EMERGENCY: ${status}` : 'PATIENT SAFE'}
            pulse={isEmergency}
          />

          {/* Real-time Connection Status Indicator */}
          {!backendOnline ? (
            <button
              onClick={reconnect}
              title={`Server offline. Last updated: ${lastSuccessfulUpdateFormatted}. Click to reconnect.`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <WifiOff className="h-3 w-3 animate-pulse text-amber-600 dark:text-amber-400" />
              <span className="text-[10px]">OFFLINE ({lastSuccessfulUpdateFormatted})</span>
            </button>
          ) : (
            <div
              title="Backend connected: Live Telemetry Active"
              className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Hardware telemetry indicators + Theme toggle + Simulation Trigger */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* LoRa Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          <Radio className={`h-3.5 w-3.5 ${loraConnected ? 'text-status-info' : 'text-gray-400'}`} />
          <span className="text-[11px]">LoRa {connectivity?.lora?.rssi ? `${connectivity.lora.rssi}dBm` : '868MHz'}</span>
        </div>

        {/* Battery Indicator */}
        <div className="flex items-center gap-1 text-xs font-mono text-gray-600 dark:text-gray-400 px-2 py-1 rounded bg-surface-mutedLight/60 dark:bg-surface-mutedDark/60 border border-surface-borderLight dark:border-surface-borderDark">
          <BatteryCharging className="h-3.5 w-3.5 text-status-safe" />
          <span className="text-[11px] font-bold">{batteryPct}%</span>
        </div>

        {/* Simulation Emergency Quick Tester */}
        <button
          onClick={handleQuickToggle}
          title="Toggle Simulated Cardiac Arrest for testing"
          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            isEmergency
              ? 'bg-status-safe text-white hover:bg-emerald-600'
              : 'bg-status-emergency text-white hover:bg-red-600 animate-pulse'
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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
