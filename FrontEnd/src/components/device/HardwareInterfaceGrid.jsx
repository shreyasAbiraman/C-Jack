import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../ui';
import {
  Cpu,
  Heart,
  Droplet,
  Compass,
  Wind,
  Gauge,
  Zap,
  MapPin,
  Radio,
  Battery,
  Monitor,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Code2,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';

const MODULE_ICONS = {
  ecg: Heart,
  spo2: Droplet,
  motion: Compass,
  respiration: Wind,
  loadCell: Gauge,
  motor: Zap,
  gps: MapPin,
  lora: Radio,
  battery: Battery,
  display: Monitor,
  speaker: Volume2
};

const MODULE_TARGETS = {
  ecg: 'Analog Devices AD8232 / ADS1292R',
  spo2: 'Maxim MAX30102 Optical PPG',
  motion: 'TDK InvenSense MPU6050 6-Axis',
  respiration: 'Thoracic Piezo Strain Transducer',
  loadCell: 'Avia Semi HX711 24-Bit ADC (Dual 500N)',
  motor: 'TI DRV8825 / BTS7960 43A Driver',
  gps: 'u-blox NEO-6M High-Sensitivity GNSS',
  lora: 'Semtech SX1262 Long-Range Transceiver',
  battery: 'LiFePO4 4S2P / TI BQ27441 BMS',
  display: '3.5" 480x320 TFT LCD (UTFTGLUE / MCUFRIEND)',
  speaker: 'Maxim MAX98357A I2S Class-D DAC'
};

const MODULE_BUS = {
  ecg: 'ADC1_CH0 (GPIO36) + LO+/LO-',
  spo2: 'I2C 0x57 (SDA:21, SCL:22)',
  motion: 'I2C 0x68 (SDA:21, SCL:22)',
  respiration: 'ADC1_CH3 (GPIO39)',
  loadCell: '2-Wire (DOUT:16, SCK:4)',
  motor: 'PWM (GPIO25) + DIR (GPIO26)',
  gps: 'UART1 9600 (RX:34, TX:12)',
  lora: 'SPI (CS:18, SCK:5, MISO:19, MOSI:27)',
  battery: 'I2C 0x55 (SDA:21, SCL:22)',
  display: '8-Bit Parallel (UTFTGLUE 0,13,12,33,32,15)',
  speaker: 'I2S (BCLK:26, LRC:25, DIN:22)'
};

export const HardwareInterfaceGrid = ({
  hardwareStatus,
  hardwareState = 'SIMULATED',
  onSetMode,
  onSimulatePacket,
  onRefresh
}) => {
  const [showContract, setShowContract] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [injectStatus, setInjectStatus] = useState(null);

  const modules = hardwareStatus?.modules || [];
  const overallState = hardwareStatus?.overallState || hardwareState || 'SIMULATED';
  const isPhysical = overallState === 'CONNECTED';
  const isSimulated = overallState === 'SIMULATED';
  const isDisconnected = overallState === 'DISCONNECTED';
  const isFault = overallState === 'FAULT';

  const handleModeToggle = async () => {
    try {
      setActionLoading(true);
      const nextMode = overallState === 'SIMULATED' ? 'PHYSICAL' : 'SIMULATION';
      await onSetMode?.(nextMode);
    } catch (err) {
      console.error('Mode toggle failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulatePhysicalPacket = async (faultType = null) => {
    try {
      setActionLoading(true);
      await onSimulatePacket?.({ asPhysical: true, faultType });
      setInjectStatus(faultType ? `Injected Physical Packet with [${faultType}] fault` : 'Injected Live ESP32 Physical Packet');
      setTimeout(() => setInjectStatus(null), 4000);
    } catch (err) {
      setInjectStatus(`Injection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for rendering state badge
  const renderStateBadge = (state) => {
    switch (state) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> CONNECTED (PHYSICAL)
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="h-3 w-3" /> SIMULATED (DEMO)
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <XCircle className="h-3 w-3" /> DISCONNECTED
          </span>
        );
      case 'FAULT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
            <AlertTriangle className="h-3 w-3" /> FAULT DETECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="h-3 w-3" /> UNKNOWN
          </span>
        );
    }
  };

  // Extract primary metric snippet for each module
  const getModuleMetric = (mod) => {
    const t = mod.telemetry || {};
    switch (mod.id) {
      case 'ecg':
        return `HR: ${t.heartRate ?? '--'} BPM • ${t.leadsConnected ? 'Leads OK' : 'Leads Off'} • ${t.signalQuality ?? 0}% SNR`;
      case 'spo2':
        return `SpO2: ${t.percentage ?? '--'}% • PI: ${t.perfusionIndex ?? '--'} • ${t.fingerDetected ? 'Contact OK' : 'No Probe Contact'}`;
      case 'motion':
        return `Posture: ${t.posture || 'SUPINE'} • Accel: ${t.totalG ?? '1.0'}g • ${t.fallDetected ? 'FALL DETECTED' : 'Stable'}`;
      case 'respiration':
        return `Resp: ${t.rate ?? '--'} BrPM • ${t.pattern || 'EUPNEA'} • Amplitude: ${t.amplitude ?? '--'}`;
      case 'loadCell':
        return `Force: ${t.forceNewtons ?? 0} N • Depth: ${t.depthMm ?? 0} mm • ${t.sternalContact ? 'Contact ON' : 'Resting'}`;
      case 'motor':
        return `State: ${t.motorState || 'STANDBY'} • Rate: ${t.rate ?? 0} CPM • Temp: ${t.driverTempC ?? 32}°C`;
      case 'gps':
        return `Fix: ${t.fixType || '3D_FIX'} • Sats: ${t.satellites ?? 11} • Acc: ±${t.accuracy ?? 2.5}m`;
      case 'lora':
        return `SX1262: ${t.joined ? 'CARRIER LOCK' : 'SEARCHING'} • RSSI: ${t.rssi ?? -72} dBm • SNR: ${t.snr ?? 9.5} dB`;
      case 'battery':
        return `Charge: ${t.percentage ?? 88}% • ${t.voltage ?? 14.8}V • Status: ${t.status || 'NOMINAL'}`;
      case 'display':
        return `SSD1306: ${t.resolution || '128x64'} • Screen: ${t.activeScreen || 'STATUS'} • Ready`;
      case 'speaker':
        return `MAX98357A: Vol ${t.volume ?? 80}% • Metronome: ${t.metronomeActive ? `${t.metronomeBpm} BPM` : 'OFF'}`;
      default:
        return 'Telemetry Active';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hardware Overview Header Card */}
      <Card className="border border-slate-700/60 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-wide">
                      Hardware Abstraction & Physical Interfaces
                    </h2>
                    {renderStateBadge(overallState)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Platforms: <span className="font-mono text-slate-300">ESP32-WROOM-32</span> &amp; <span className="font-mono text-slate-300">LILYGO T-Beam v1.1 (LoRa + GNSS)</span>
                  </p>
                </div>
              </div>

              {/* Zero-Pretense Invariant Banner */}
              <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-200">Strict Zero-Pretense Invariant:</strong>{' '}
                  {isPhysical && (
                    <span className="text-emerald-400 font-semibold">
                      Authentic physical hardware packet received within heartbeat window. Live MCU telemetry active.
                    </span>
                  )}
                  {isSimulated && (
                    <span className="text-sky-400">
                      Running in software simulation mode. No physical microcontroller is linked; test vectors are synthesized.
                    </span>
                  )}
                  {isDisconnected && (
                    <span className="text-rose-400 font-semibold">
                      Hardware disconnected! No physical telemetry received within 8.0s timeout window. Hardware is NOT pretend-connected.
                    </span>
                  )}
                  {isFault && (
                    <span className="text-rose-400 font-semibold">
                      Hardware Fault Detected! One or more peripheral sensors reported lead-off or communication failure.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Controls */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant={overallState === 'SIMULATED' ? 'primary' : 'outline'}
                size="sm"
                icon={Sparkles}
                onClick={handleModeToggle}
                disabled={actionLoading}
                className="text-xs font-mono"
              >
                {overallState === 'SIMULATED' ? 'Mode: Simulated' : 'Mode: Physical'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Code2}
                onClick={() => setShowContract(!showContract)}
                className="text-xs font-mono"
              >
                {showContract ? 'Hide Contract' : 'Data Contract'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={onRefresh}
                className="text-xs font-mono"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Test Injection Bar for Developer / Demo Validation */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-mono">
              <span className="text-slate-300 font-semibold">Hardware Dev Tools:</span>
              <span>Device ID: <strong className="text-white">{hardwareStatus?.deviceId || 'CJACK-ESP32-01'}</strong></span>
              <span>•</span>
              <span>Firmware: <strong className="text-white">{hardwareStatus?.firmwareVersion || 'v1.0.0-hw'}</strong></span>
              <span>•</span>
              <span>Heartbeat Timeout: <strong className="text-white">8.0s</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulatePhysicalPacket(null)}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] transition-colors"
                title="Send a sample physical ESP32 telemetry packet to test CONNECTED state transition"
              >
                Test Ingest ESP32 Packet
              </button>

              <button
                onClick={() => handleSimulatePhysicalPacket('ECG_LEAD_OFF')}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-mono text-[11px] transition-colors"
                title="Simulate ECG lead detachment fault"
              >
                Inject ECG Fault
              </button>

              <button
                onClick={() => handleSimulatePhysicalPacket('MOTOR_FAULT')}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-mono text-[11px] transition-colors"
                title="Simulate CPR motor driver thermal fault"
              >
                Inject Motor Fault
              </button>
            </div>
          </div>

          {injectStatus && (
            <div className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded px-2.5 py-1">
              ✓ {injectStatus}
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Contract Inspector (Collapsible) */}
      {showContract && (
        <Card className="border border-sky-500/30 bg-slate-950 shadow-2xl">
          <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono text-sky-400 flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Firmware JSON Contract Specification (v1.0.0-hw)
            </CardTitle>
            <span className="text-[11px] font-mono text-slate-400">
              Contract Endpoint: <code className="text-slate-200">POST /api/hardware/telemetry</code>
            </span>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto border border-slate-800 max-h-72">
{`// CJack Hardware JSON Data Contract (ESP32 / LILYGO T-Beam -> Backend)
{
  "deviceId": "CJACK-ESP32-01",
  "firmwareVersion": "v1.0.0-hw",
  "timestamp": ${Date.now()},
  "hardwareSource": "${isPhysical ? 'PHYSICAL' : 'SIMULATED'}",
  "sensors": {
    "ecg": { "leadsConnected": true, "rawMv": 1.24, "signalQuality": 96 },
    "heartRate": 74,
    "spo2": { "percentage": 98, "perfusionIndex": 4.2, "fingerDetected": true },
    "motion": { "ax": 0.02, "ay": 0.01, "az": 0.98, "fallDetected": false, "posture": "SUPINE" },
    "respiration": { "rate": 16, "amplitude": 45, "pattern": "NORMAL" }
  },
  "cpr": {
    "active": false,
    "rate": 0,
    "depth": 0,
    "force": 0,
    "compressionCount": 0,
    "motorStatus": "STANDBY",
    "driverTempC": 31.8
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 2.5,
    "fixType": "3D_FIX",
    "satellites": 11
  },
  "connectivity": {
    "gps": "LOCKED",
    "lora": "JOINED",
    "backend": "CONNECTED",
    "loraRssi": -72,
    "loraSnr": 9.5
  },
  "battery": {
    "percentage": 88,
    "voltage": 14.8,
    "isCharging": false
  }
}`}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 11 Hardware Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.id] || Cpu;
          const targetIc = MODULE_TARGETS[mod.id] || mod.targetChip || 'Embedded Peripheral';
          const busInfo = MODULE_BUS[mod.id] || mod.busType || 'I2C Bus';
          const hasFault = mod.state === 'FAULT';

          return (
            <Card
              key={mod.id}
              className={`border transition-all duration-200 ${
                hasFault
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : mod.state === 'CONNECTED'
                  ? 'border-emerald-500/40 bg-slate-900/90'
                  : mod.state === 'DISCONNECTED'
                  ? 'border-slate-800 bg-slate-950/70 opacity-80'
                  : 'border-slate-800 bg-slate-900/70'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${
                      hasFault
                        ? 'bg-rose-500/20 text-rose-400'
                        : mod.state === 'CONNECTED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {mod.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        {targetIc}
                      </p>
                    </div>
                  </div>
                  <div>
                    {renderStateBadge(mod.state)}
                  </div>
                </div>

                {/* Live Metric Snippet */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 font-mono text-xs">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                    Live Telemetry
                  </div>
                  <div className="text-slate-200 font-semibold">
                    {getModuleMetric(mod)}
                  </div>
                </div>

                {/* Fault Alert Box if FAULT */}
                {hasFault && (
                  <div className="bg-rose-950/50 border border-rose-800/60 rounded p-2 text-xs text-rose-300 font-mono flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{mod.faultMessage || mod.faultCode || 'Hardware fault reported'}</span>
                  </div>
                )}

                {/* Bus and Hardware Pin Mapping */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="truncate" title={busInfo}>
                    Bus: <span className="text-slate-400">{busInfo}</span>
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {mod.lastPacketTime ? new Date(mod.lastPacketTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Ready'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HardwareInterfaceGrid;
