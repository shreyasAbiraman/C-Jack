import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  Server, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Sliders, 
  RefreshCw,
  Cpu
} from 'lucide-react';

/**
 * NetworkStateMatrix
 * 
 * Explicitly distinguishes:
 * 1. Device connected (Jacket microcontroller to on-board hub/transceiver)
 * 2. LoRa available (Sub-GHz SX1262 RF link active)
 * 3. Gateway reachable (Tower base station acknowledging uplinks)
 * 4. Backend reachable (Emergency dispatch cloud API receiving telemetry)
 * 5. Internet unavailable (Backhaul WAN link status)
 * 
 * IMPORTANT: Enforces the engineering reality that LoRa does not work everywhere
 * (multipath reflections, concrete penetration limits, duty cycle caps).
 */
export const NetworkStateMatrix = ({ networkStates = {}, onToggleState, onResetAll }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const states = {
    deviceConnected: networkStates?.deviceConnected ?? true,
    loraAvailable: networkStates?.loraAvailable ?? true,
    gatewayReachable: networkStates?.gatewayReachable ?? true,
    backendReachable: networkStates?.backendReachable ?? true,
    internetUnavailable: networkStates?.internetUnavailable ?? false
  };

  const layers = [
    {
      key: 'deviceConnected',
      name: 'Device Connected',
      subtitle: 'On-Jacket Hub & Microcontroller',
      protocol: 'SPI / UART Bus (Internal)',
      status: states.deviceConnected ? 'ONLINE' : 'DISCONNECTED',
      active: states.deviceConnected,
      icon: Cpu,
      color: 'emerald',
      activeDesc: 'CJack wearable host controller (STM32/ESP32) is actively polling biometric and compression sensors.',
      inactiveDesc: 'CRITICAL: Host controller offline or physical cable disconnected from vest telemetry core.'
    },
    {
      key: 'loraAvailable',
      name: 'LoRa Available',
      subtitle: 'Sub-GHz RF Physical Layer',
      protocol: '868.1 MHz (SF7 / BW 125kHz)',
      status: states.loraAvailable ? 'CARRIER LOCK' : 'NO RF CARRIER',
      active: states.loraAvailable,
      icon: Radio,
      color: 'blue',
      activeDesc: 'Semtech SX1262 transceiver is tuned and radiating at +14 dBm within regulatory duty cycles.',
      inactiveDesc: 'RF transceiver disabled, extreme shielding/faraday cage attenuation, or frequency mismatch.'
    },
    {
      key: 'gatewayReachable',
      name: 'Gateway Reachable',
      subtitle: 'Local Base Station Link',
      protocol: 'LoRaWAN Uplink / Downlink',
      status: states.gatewayReachable ? 'ACK CONFIRMED' : 'NO GATEWAY ACK',
      active: states.gatewayReachable,
      icon: Wifi,
      color: 'cyan',
      activeDesc: 'Uplink frames acknowledged by nearby base station (GW-BLR-041, distance 0.62 km).',
      inactiveDesc: 'Vest is outside line-of-sight gateway radius (>5km) or deep underground/basement structure.'
    },
    {
      key: 'backendReachable',
      name: 'Backend Reachable',
      subtitle: 'Emergency Dispatch Cloud API',
      protocol: 'REST / WebSocket / MQTT',
      status: states.backendReachable ? 'CONNECTED' : 'DISPATCH OFFLINE',
      active: states.backendReachable,
      icon: Server,
      color: 'purple',
      activeDesc: 'Dispatch cloud cluster receiving continuous telemetry stream (14ms latency).',
      inactiveDesc: 'Cloud backend unreachable or API gateway failing health probes; local offline buffer active.'
    },
    {
      key: 'internetUnavailable',
      name: 'Internet Status',
      subtitle: 'Public WAN Backhaul',
      protocol: 'Cellular WAN / Fiber Backhaul',
      status: states.internetUnavailable ? 'INTERNET DOWN' : 'INTERNET AVAILABLE',
      active: !states.internetUnavailable,
      isReversed: true,
      icon: states.internetUnavailable ? WifiOff : Globe,
      color: states.internetUnavailable ? 'amber' : 'emerald',
      activeDesc: 'Full public internet backhaul operational for high-speed cloud sync and remote paramedic video.',
      inactiveDesc: 'Public internet offline. CJack relies strictly on direct peer-to-peer Sub-GHz LoRa mesh to gateway.'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              5-Layer Network State Matrix
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              PHYSICAL TO CLOUD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent diagnostic verification. These 5 technical states are strictly decoupled.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-950/40 text-amber-300 border border-amber-700/50 hover:bg-amber-900/40 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {showDisclaimer ? 'Hide LoRa Realism Note' : 'LoRa Realism Note'}
          </button>
        </div>
      </div>

      {/* Mandatory LoRa Propagation Realism Disclaimer */}
      {showDisclaimer && (
        <div className="mb-5 p-4 rounded-lg bg-amber-950/20 border border-amber-700/40 text-amber-200 text-xs leading-relaxed space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wide">
            <Info className="w-4 h-4" />
            Engineering Reality: LoRa Does Not Guarantee Universal Coverage
          </div>
          <p>
            Sub-GHz LoRa (868/915 MHz) provides superior line-of-sight propagation over conventional Wi-Fi/Bluetooth, but it <strong className="text-white underline">does NOT work everywhere</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
            <li><strong className="text-amber-200">Basements & Underground:</strong> Sub-GHz signals suffer 30–50 dB attenuation through reinforced concrete foundation walls and steel rebars.</li>
            <li><strong className="text-amber-200">Dense Urban Multipath:</strong> Tall glass-and-steel high-rises cause Fresnel zone diffraction, requiring redundant dual-bearer cellular (NB-IoT/LTE-M) failover.</li>
            <li><strong className="text-amber-200">Duty-Cycle Limits:</strong> Regional RF compliance (1% duty cycle) restricts airtime to small telemetry packets, making local offline storage buffers mandatory.</li>
          </ul>
        </div>
      )}

      {/* 5 Distinct State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isOperational = layer.active;

          return (
            <div
              key={layer.key}
              className={`relative rounded-lg p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                isOperational
                  ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 shadow-sm'
                  : 'bg-red-950/20 border-red-800/50 text-red-200'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-md ${
                    isOperational ? 'bg-slate-700/50 text-cyan-400' : 'bg-red-900/40 text-red-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isOperational ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      OK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 animate-pulse">
                      <XCircle className="w-3.5 h-3.5" />
                      OFFLINE
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white tracking-wide">
                  {layer.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {layer.subtitle}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono mt-0.5">
                  {layer.protocol}
                </div>

                <div className="my-2.5 py-1 px-2 rounded bg-slate-950/60 border border-slate-800/80 text-center">
                  <span className={`text-[11px] font-bold tracking-wider font-mono ${
                    isOperational ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {layer.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                  {isOperational ? layer.activeDesc : layer.inactiveDesc}
                </p>
              </div>

              {/* State Toggle Button */}
              {onToggleState && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">SIMULATION</span>
                  <button
                    onClick={() => {
                      if (layer.key === 'internetUnavailable') {
                        onToggleState('internetUnavailable', !states.internetUnavailable);
                      } else {
                        onToggleState(layer.key, !states[layer.key]);
                      }
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                      isOperational 
                        ? 'bg-slate-700/60 text-slate-300 hover:bg-red-900/60 hover:text-red-200' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900'
                    }`}
                  >
                    {isOperational ? 'Simulate Fault' : 'Restore'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Matrix Strip */}
      <div className="mt-4 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Diagnostic Mode:</span>
          <span className="text-slate-200 font-mono font-medium">
            {states.backendReachable && !states.internetUnavailable
              ? 'DIRECT CLOUD + LORA MESH (REDUNDANT)'
              : states.gatewayReachable
              ? 'LORA STANDALONE GATEWAY FORWARDING (NO WAN)'
              : 'OFFLINE BUFFERING MODE (NON-VOLATILE FLASH)'}
          </span>
        </div>

        {onResetAll && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset All to Nominal
          </button>
        )}
      </div>
    </div>
  );
};
