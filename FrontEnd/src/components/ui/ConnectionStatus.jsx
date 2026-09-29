import React from 'react';
import { Radio, Signal, Wifi, Network } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ConnectionStatus = ({
  lora = {
    connected: true,
    frequency: '868.1 MHz',
    rssi: -72,
    snr: 9.5,
    gatewayId: 'GW-BLR-041',
    packetLossRate: '0.2%'
  },
  cellular = {
    connected: true,
    technology: '4G LTE-M',
    signalDbm: -68
  },
  className = ''
}) => {
  const loraStatus = !lora.connected ? 'OFFLINE' : lora.rssi < -105 ? 'WARNING' : 'NORMAL';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Radio className="h-4 w-4 text-cjack-accent" />
          <span>Telemetry & IoT Infrastructure</span>
        </div>
        <StatusBadge status={loraStatus} size="sm" text={lora.connected ? 'DUAL-LINK' : 'OFFLINE'} />
      </div>

      <div className="space-y-2.5 text-xs font-mono">
        {/* LoRa Channel */}
        <div className="flex items-center justify-between p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-cjack-accent" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">LoRaWAN Mesh</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-500">{lora.frequency}</span>
            <span className="font-bold text-cjack-accent">{lora.rssi} dBm</span>
            <span className="text-gray-400">({lora.snr} dB)</span>
          </div>
        </div>

        {/* Cellular Channel */}
        <div className="flex items-center justify-between p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <div className="flex items-center gap-2">
            <Signal className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">Cellular (Direct)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-500">{cellular.technology}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{cellular.signalDbm} dBm</span>
          </div>
        </div>

        {/* Gateway Meta */}
        <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500">
          <span>GATEWAY: <strong className="text-gray-700 dark:text-gray-300">{lora.gatewayId}</strong></span>
          <span>PACKET LOSS: <strong className="text-emerald-600 dark:text-emerald-400">{lora.packetLossRate}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
