import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '../ui';
import {
  Cpu,
  BatteryCharging,
  Gauge,
  Thermometer,
  Radio,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export const DeviceOverviewGrid = ({ overview }) => {
  const data = overview || {
    deviceId: 'CJACK-UNIT-TX104',
    firmwareVersion: 'v0.9.4-alpha-rev3',
    hardwareVersion: 'CJack Wearable Vest Mk-II (Rev 3.2)',
    battery: {
      levelPercentage: 88,
      voltageVolts: 14.8,
      chemistry: 'LiFePO4 (4S2P / 6400mAh)',
      healthStatus: 'Optimal (98% SoH)',
      chargeState: 'Discharging (Nominal)'
    },
    temperature: {
      enclosureCelsius: 32.4,
      mcuCoreCelsius: 34.2,
      skinThermalCelsius: 36.8,
      status: 'NOMINAL (< 42°C Threshold)'
    },
    motorStatus: {
      state: 'STANDBY_READY',
      speedRPM: 0,
      targetSpeedRPM: 2850,
      compressorPressureBar: 2.4,
      motorCurrentAmperes: 0.1,
      thermalProtection: 'Active OK'
    },
    sensorStatus: {
      totalChannels: 7,
      activeChannels: 7,
      healthPercentage: 100,
      status: 'ALL 7 CHANNELS OPTIMAL'
    },
    gps: {
      status: '3D GNSS LOCK (OPTIMAL)',
      satellites: 11,
      accuracyMeters: 2.8,
      latitude: 12.9716,
      longitude: 77.5946
    },
    lora: {
      status: 'ACTIVE_TRANSMITTING',
      frequency: '868.1 MHz',
      gatewayId: 'GW-BLR-041',
      rssi: -72,
      snr: 9.5
    },
    lastSynchronization: {
      timestamp: new Date().toISOString(),
      timeFormatted: '10:42:18 UTC',
      latencyMs: 14,
      protocol: 'LoRa Sub-GHz + REST Backup'
    },
    operatingMode: 'MONITORING'
  };

  const getModeBadgeColor = (mode) => {
    switch (mode) {
      case 'EMERGENCY':
      case 'CPR':
        return 'emergency';
      case 'MAINTENANCE':
        return 'warning';
      case 'OFFLINE':
        return 'neutral';
      case 'SIMULATION':
        return 'info';
      case 'STANDBY':
        return 'neutral';
      case 'MONITORING':
      default:
        return 'safe';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Primary Identifiers & Operating Mode */}
      <div className="p-4 rounded-xl border border-primary-500/20 bg-gradient-to-r from-primary-950/20 via-surface-card to-primary-950/10 dark:from-primary-950/40 dark:via-surface-cardDark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-primary-600/10 text-primary-500 border border-primary-500/30">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">FIELD UNIT IDENTIFIER</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                ONLINE
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight font-mono text-gray-900 dark:text-white flex items-center gap-2">
              {data.deviceId}
              <span className="text-xs font-sans font-normal text-gray-500 dark:text-gray-400">
                ({data.hardwareVersion})
              </span>
            </h2>
          </div>
        </div>

        {/* Operating Mode Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Current Operating Mode</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              State Engine Enforced
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight dark:bg-surface-mutedDark/60 shadow-inner">
            <StatusBadge
              status={getModeBadgeColor(data.operatingMode)}
              text={`MODE: ${data.operatingMode}`}
            />
          </div>
        </div>
      </div>

      {/* Grid of the 11 Overview Telemetry Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Device ID & Versions */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Cpu} className="text-sm font-medium">
              Device Hardware & Firmware
            </CardTitle>
            <span className="text-[10px] font-mono text-gray-500">PARAM 1-3</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Device ID:</span>
              <span className="font-mono font-bold text-primary-500">{data.deviceId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Firmware Version:</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{data.firmwareVersion}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Hardware Version:</span>
              <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200 text-right">{data.hardwareVersion}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Battery Telemetry */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={BatteryCharging} className="text-sm font-medium">
              Battery & Power Reserve
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">
              {data.battery?.levelPercentage}%
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  data.battery?.levelPercentage > 50
                    ? 'bg-emerald-500'
                    : data.battery?.levelPercentage > 20
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${data.battery?.levelPercentage}%` }}
              />
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Voltage & Chemistry:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.battery?.voltageVolts}V ({data.battery?.chemistry?.split(' ')[0] || 'LiFePO4'})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Health Status:</span>
              <span className="font-mono text-emerald-500 font-semibold">{data.battery?.healthStatus}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Charge State:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">{data.battery?.chargeState}</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Temperature Sensors */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Thermometer} className="text-sm font-medium">
              Thermal Monitoring
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500">NOMINAL</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Enclosure Temp:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.temperature?.enclosureCelsius}°C
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">MCU Core Temp:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.temperature?.mcuCoreCelsius}°C
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Skin Contact Thermal:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.temperature?.skinThermalCelsius}°C
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Thermal Threshold:</span>
              <span className="font-mono text-emerald-500 text-[11px]">{data.temperature?.status}</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Motor Status */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Gauge} className="text-sm font-medium">
              Compressor Motor Status
            </CardTitle>
            <span className={`text-[10px] font-mono font-bold ${
              data.motorStatus?.state === 'ACTIVE_COMPRESSING' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {data.motorStatus?.state}
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Speed (Current / Target):</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.motorStatus?.speedRPM} / {data.motorStatus?.targetSpeedRPM} RPM
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Pneumatic Pressure:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.motorStatus?.compressorPressureBar} BAR
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Motor Current Draw:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.motorStatus?.motorCurrentAmperes} A
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Thermal Protection:</span>
              <span className="font-mono text-emerald-500 font-semibold">{data.motorStatus?.thermalProtection}</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Sensor Array Health Status */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Activity} className="text-sm font-medium">
              Sensor Subsystem Status
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">
              {data.sensorStatus?.activeChannels}/{data.sensorStatus?.totalChannels} CHANNELS
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Active Sensor Channels:</span>
              <span className="font-mono font-bold text-emerald-500">
                {data.sensorStatus?.activeChannels} of {data.sensorStatus?.totalChannels} Operational
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Array Health Score:</span>
              <span className="font-mono text-emerald-500 font-bold">
                {data.sensorStatus?.healthPercentage}% Optimal
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Diagnostic Verdict:</span>
              <span className="font-mono text-emerald-500 font-semibold text-[11px]">
                {data.sensorStatus?.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 6. GPS Positioning */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={MapPin} className="text-sm font-medium">
              GPS Positioning Engine
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500">3D FIX</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">GNSS Status:</span>
              <span className="font-mono font-bold text-emerald-500 text-[11px]">{data.gps?.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Locked Satellites:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.gps?.satellites} Satellites (±{data.gps?.accuracyMeters}m CEP)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Coordinates:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.gps?.latitude?.toFixed(4)}° N, {data.gps?.longitude?.toFixed(4)}° E
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 7. LoRa Radio Telemetry */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Radio} className="text-sm font-medium">
              LoRa Sub-GHz RF Link
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">TRANSMITTING</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Carrier Frequency:</span>
              <span className="font-mono font-bold text-primary-500">{data.lora?.frequency} (IN865)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Target Gateway:</span>
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{data.lora?.gatewayId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Link Margin (RSSI / SNR):</span>
              <span className="font-mono text-emerald-500 font-bold">
                {data.lora?.rssi} dBm / +{data.lora?.snr} dB
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 8. Last Synchronization */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Clock} className="text-sm font-medium">
              Cloud & Mesh Sync
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500">SYNCED</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Last Telemetry Sync:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.lastSynchronization?.timeFormatted || 'Just now'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Packet Roundtrip Latency:</span>
              <span className="font-mono font-bold text-emerald-500">
                {data.lastSynchronization?.latencyMs} ms
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Sync Pipeline:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200 text-[11px]">
                {data.lastSynchronization?.protocol}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 9. Vest Architecture Summary */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Layers} className="text-sm font-medium">
              Autonomous Systems Integrity
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500">STANDBY OK</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Operating Mode:</span>
              <span className="font-mono font-bold text-primary-500">{data.operatingMode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Self-Diagnosis:</span>
              <span className="font-mono text-emerald-500 font-bold">ALL SUBSYSTEMS NOMINAL</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Fail-Safe Override:</span>
              <span className="font-mono text-emerald-500 font-bold">HARDWARE CLEARANCE OK</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
