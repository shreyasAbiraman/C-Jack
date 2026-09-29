import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  WifiOff, 
  Database, 
  Wifi, 
  Send, 
  ArrowRight, 
  Play, 
  Pause, 
  RefreshCw, 
  HardDrive, 
  CheckCircle2, 
  AlertOctagon,
  Clock,
  Layers
} from 'lucide-react';

/**
 * OfflineQueueVisualizer
 * 
 * Implements the required 5-stage offline queue lifecycle:
 * Packet generated -> Network unavailable -> Packet queued -> Network restored -> Packet transmitted
 */
export const OfflineQueueVisualizer = ({
  offlineQueue = {},
  onSimulateAction
}) => {
  const [autoPlay, setAutoPlay] = useState(false);

  const steps = [
    {
      id: 'PACKET_GENERATED',
      label: 'Packet generated',
      icon: FileText,
      color: 'blue',
      desc: 'Telemetry & biometric payload formatted in RAM buffer',
      indicator: 'Payload Ready (64 B)'
    },
    {
      id: 'NETWORK_UNAVAILABLE',
      label: 'Network unavailable',
      icon: WifiOff,
      color: 'red',
      desc: 'LoRa carrier fade / RF attenuation / Gateway link lost',
      indicator: 'Carrier Lost (0 dBm)'
    },
    {
      id: 'PACKET_QUEUED',
      label: 'Packet queued',
      icon: Database,
      color: 'amber',
      desc: 'Written to non-volatile SPI Flash FIFO ring buffer',
      indicator: 'Persisted to Flash'
    },
    {
      id: 'NETWORK_RESTORED',
      label: 'Network restored',
      icon: Wifi,
      color: 'cyan',
      desc: 'Gateway carrier reacquired; handshake ACK established',
      indicator: 'Link Re-established'
    },
    {
      id: 'PACKET_TRANSMITTED',
      label: 'Packet transmitted',
      icon: Send,
      color: 'emerald',
      desc: 'Buffered packets burst-transmitted to cloud dispatch',
      indicator: 'Delivered & Acked'
    }
  ];

  const currentStepId = offlineQueue?.currentStep || 'PACKET_GENERATED';
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  const activeStepIndex = currentIndex !== -1 ? currentIndex : 0;
  const bufferedPackets = offlineQueue?.bufferedPackets || [];
  const queueCount = offlineQueue?.queueCount ?? bufferedPackets.length;
  const maxCapacity = offlineQueue?.maxBufferCapacity || 256;

  // Auto-play timer effect
  useEffect(() => {
    let interval = null;
    if (autoPlay) {
      interval = setInterval(() => {
        if (onSimulateAction) {
          onSimulateAction('NEXT_STEP');
        }
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, onSimulateAction]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              Store-and-Forward Offline Queue Pipeline
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-mono">
              FIFO SPI-FLASH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Guarantees zero biometric telemetry loss during subterranean transit, elevators, or RF dead-zones.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              autoPlay 
                ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoPlay ? 'Pause Auto-Cycle' : 'Auto-Cycle Demo'}
          </button>

          <button
            onClick={() => onSimulateAction && onSimulateAction('NEXT_STEP')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSimulateAction && onSimulateAction('SIMULATE_DROP')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 transition-colors"
          >
            <WifiOff className="w-3.5 h-3.5" />
            Drop Network
          </button>

          <button
            onClick={() => onSimulateAction && onSimulateAction('RESTORE_AND_FLUSH')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Restore & Flush
          </button>

          <button
            onClick={() => onSimulateAction && onSimulateAction('RESET')}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Reset Pipeline"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Stage Visual Stepper Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === activeStepIndex;
          const isPast = idx < activeStepIndex;
          const isFuture = idx > activeStepIndex;

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50 scale-[1.02]'
                  : isPast
                  ? 'bg-slate-900/90 border-slate-700/60 opacity-90'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-50'
              }`}
            >
              {/* Step Top Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isCurrent 
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' 
                      : isPast
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    STEP 0{idx + 1}
                  </span>

                  {isCurrent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                {/* Icon & Label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${
                    isCurrent 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : isPast 
                      ? 'bg-slate-800 text-emerald-400' 
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {step.label}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {step.desc}
                </p>
              </div>

              {/* Step Sub-pill */}
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <span className={`text-[10px] font-mono block truncate ${
                  isCurrent ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                }`}>
                  {step.indicator}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Flash Storage Buffer Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Memory Buffer Gauge */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-mono">NON-VOLATILE FLASH RING BUFFER</span>
            <span className="text-amber-400 font-bold font-mono">
              {queueCount} / {maxCapacity} PACKETS
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 ${
                queueCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (queueCount / maxCapacity) * 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Buffer Occupancy: {((queueCount / maxCapacity) * 100).toFixed(1)}%</span>
            <span>Flash Chip: Winbond W25Q128 (16MB)</span>
          </div>
        </div>

        {/* Pending Queue List or Nominal Transmission Message */}
        <div className="lg:col-span-2 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFLINE BUFFER CONTENTS</span>
            </div>
            {queueCount > 0 && (
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                PENDING UPLINK SYNC
              </span>
            )}
          </div>

          {queueCount === 0 ? (
            <div className="flex items-center gap-2 py-2 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Buffer clear. All generated packets transmitted to LoRa gateway in real-time.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {bufferedPackets.map((pkt, i) => (
                <div 
                  key={pkt.packetId || i}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{pkt.packetId}</span>
                    <span className="text-slate-400 text-[10px]">[{pkt.emergencyStatus}]</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                    <span>HR: {pkt.heartRate} bpm</span>
                    <span>SpO2: {pkt.spo2}%</span>
                    <span>{pkt.sizeBytes || 64} B</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
