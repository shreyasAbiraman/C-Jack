import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { SectionHeader, StatusBadge, Button, PageStateWrapper } from '../components/ui';
import { NetworkStateMatrix } from '../components/connectivity/NetworkStateMatrix';
import { ResponsiveTacticalMap } from '../components/connectivity/ResponsiveTacticalMap';
import { OfflineQueueVisualizer } from '../components/connectivity/OfflineQueueVisualizer';
import { CommunicationPacketInspector } from '../components/connectivity/CommunicationPacketInspector';
import {
  Radio,
  MapPin,
  Navigation,
  Server,
  Wifi,
  Package,
  Clock,
  Activity,
  Signal,
  Satellite,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
const ConnectivityPage = () => {
  const {
    connectivityStatus,
    sendCommunicationPacket,
    simulateOfflineQueue,
    setNetworkStates,
    getCommunicationPackets,
    refreshData,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate
  } = useSystem();

  const [recentPackets, setRecentPackets] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract structured status fields with sensible fallbacks
  const gps = connectivityStatus?.gps || {
    status: '3D GNSS LOCK (OPTIMAL)',
    locked: true,
    latitude: 12.9716,
    longitude: 77.5946,
    accuracyMeters: 2.8,
    satellites: 11,
    isSimulated: true
  };

  const lora = connectivityStatus?.lora || {
    status: 'ACTIVE_TRANSMITTING',
    transceiver: 'Semtech SX1262',
    frequency: '868.1 MHz',
    gateway: {
      id: 'GW-BLR-041',
      status: 'ONLINE_REACHABLE',
      distanceKm: 0.62
    },
    signal: {
      rssi: -72,
      snr: 9.5,
      packetLossRate: '0.2%'
    }
  };

  const networkStates = connectivityStatus?.networkStates || {
    deviceConnected: true,
    loraAvailable: true,
    gatewayReachable: true,
    backendReachable: true,
    internetUnavailable: false
  };

  const offlineQueue = connectivityStatus?.offlineQueue || {
    currentStep: 'PACKET_GENERATED',
    stepIndex: 0,
    queueCount: 0,
    bufferedPackets: [],
    maxBufferCapacity: 256
  };

  const backend = connectivityStatus?.backend || {
    status: 'ONLINE',
    latencyMs: 14,
    lastPingTimestamp: new Date().toISOString()
  };

  const lastPacket = connectivityStatus?.lastPacket || {
    packetId: 'PKT-9483',
    timestamp: new Date().toISOString(),
    sizeBytes: 64,
    digest: '0xFE88102A'
  };

  const responder = connectivityStatus?.responder || {
    callsign: 'ALS-MED-04',
    latitude: 12.9810,
    longitude: 77.6015,
    distanceKm: 1.8,
    etaMinutes: 4,
    speedKmh: 48
  };

  // Fetch recent packet stream
  const fetchRecentPackets = async () => {
    try {
      if (getCommunicationPackets) {
        const res = await getCommunicationPackets(25);
        if (res && res.packets) {
          setRecentPackets(res.packets);
        }
      }
    } catch (err) {
      console.error('Error fetching packets:', err);
    }
  };

  useEffect(() => {
    fetchRecentPackets();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    await fetchRecentPackets();
    setIsRefreshing(false);
  };

  const handleToggleState = async (stateKey, newValue) => {
    const updated = {
      ...networkStates,
      [stateKey]: newValue
    };
    if (setNetworkStates) {
      await setNetworkStates(updated);
    }
  };

  const handleResetNetworkStates = async () => {
    if (setNetworkStates) {
      await setNetworkStates({
        deviceConnected: true,
        loraAvailable: true,
        gatewayReachable: true,
        backendReachable: true,
        internetUnavailable: false
      });
    }
  };

  const handleOfflineAction = async (action) => {
    if (simulateOfflineQueue) {
      await simulateOfflineQueue(action);
      await fetchRecentPackets();
    }
  };

  const handleSendPacket = async (packet) => {
    if (sendCommunicationPacket) {
      const res = await sendCommunicationPacket(packet);
      await fetchRecentPackets();
      return res;
    }
  };

  return (
    <PageStateWrapper
      loading={loading && !connectivityStatus}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      onRetry={handleRefresh}
      screenTitle="Connectivity & LoRa RF Telemetry"
      hasData={Boolean(connectivityStatus)}
      emptyMessage="No RF telemetry packets available."
    >
      <div className="space-y-6 pb-12">
        {/* Header with Title & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SectionHeader
            title="Connectivity & Geospatial Telemetry"
            question="What is the real-time transmission path, GPS accuracy, and network queue state?"
            statusBadge={
              <StatusBadge
                status={networkStates.backendReachable ? 'safe' : 'danger'}
                text={networkStates.backendReachable ? 'TELEMETRY ONLINE' : 'OFFLINE BUFFERING'}
              />
            }
          />

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
          SECTION 1: CONNECTIVITY DASHBOARD (11 EXACT REQUIRED PARAMETERS)
          ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Live RF & Geospatial Telemetry Dashboard (11 Metrics)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Cadence: 3s Uplink Polling
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {/* 1. GPS Status */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>1. GPS Status</span>
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold font-mono text-emerald-400 block truncate">
                  {gps.status || '3D GNSS LOCK'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Multi-Constellation Fix
                </span>
              </div>
            </div>

            {/* 2. Latitude */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>2. Latitude</span>
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {gps.latitude ? `${Number(gps.latitude).toFixed(5)}° N` : '12.97160° N'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  WGS84 Reference
                </span>
              </div>
            </div>

            {/* 3. Longitude */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>3. Longitude</span>
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {gps.longitude ? `${Number(gps.longitude).toFixed(5)}° E` : '77.59460° E'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Altitude: 920m ASL
                </span>
              </div>
            </div>

            {/* 4. Accuracy */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>4. Accuracy</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5">
                <span className="text-sm font-bold font-mono text-cyan-400">
                  ±{gps.accuracyMeters || 2.8} m
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  HDOP: 0.9 (Optimal)
                </span>
              </div>
            </div>

            {/* 5. Satellites */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>5. Satellites</span>
                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="my-1.5">
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {gps.satellites || 11} SVDs
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  GPS + GLONASS
                </span>
              </div>
            </div>

            {/* 6. LoRa Status */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>6. LoRa Status</span>
                <Radio className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="my-1.5">
                <span className={`text-xs font-bold font-mono block truncate ${networkStates.loraAvailable ? 'text-blue-400' : 'text-red-400'
                  }`}>
                  {networkStates.loraAvailable ? 'TRANSMITTING' : 'RF MUTED'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  868.1 MHz SF7
                </span>
              </div>
            </div>

            {/* 7. Gateway Status */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>7. Gateway Status</span>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5">
                <span className={`text-xs font-bold font-mono block truncate ${networkStates.gatewayReachable ? 'text-cyan-400' : 'text-red-400'
                  }`}>
                  {networkStates.gatewayReachable ? 'GW-BLR-041' : 'NO ACK'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {lora.gateway?.distanceKm || 0.62} km Line-of-Sight
                </span>
              </div>
            </div>

            {/* 8. Last Packet */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>8. Last Packet</span>
                <Package className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold font-mono text-purple-300 block truncate">
                  {lastPacket.packetId || 'PKT-9483'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Size: {lastPacket.sizeBytes || 64} Bytes
                </span>
              </div>
            </div>

            {/* 9. Packet Timestamp */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>9. Packet Timestamp</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold font-mono text-slate-200 block truncate">
                  {lastPacket.timestamp ? new Date(lastPacket.timestamp).toLocaleTimeString() : '10:42:13'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate block">
                  {lastPacket.digest || '0xFE88102A'}
                </span>
              </div>
            </div>

            {/* 10. Signal Information */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>10. Signal Info</span>
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold font-mono text-emerald-400 block truncate">
                  RSSI: {lora.signal?.rssi ?? -72} dBm
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  SNR: {lora.signal?.snr ?? 9.5} dB • Loss: {lora.signal?.packetLossRate || '0.2%'}
                </span>
              </div>
            </div>

            {/* 11. Backend Connectivity */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>11. Backend Connectivity</span>
                <Server className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5 flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold font-mono block ${networkStates.backendReachable ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {networkStates.backendReachable ? 'DISPATCH API ONLINE' : 'BACKEND OFFLINE'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Latency: {backend.latencyMs || 14}ms • Cluster BLR-REST-01
                  </span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
          SECTION 2: 5-STATE NETWORK MATRIX (TECHNICAL DECOUPLING & LORA REALISM)
          ========================================================================= */}
        <NetworkStateMatrix
          networkStates={networkStates}
          onToggleState={handleToggleState}
          onResetAll={handleResetNetworkStates}
        />

        {/* =========================================================================
          SECTION 3: RESPONSIVE TACTICAL MAP (PATIENT, CJACK, RESPONDER, GATEWAY)
          ========================================================================= */}
        <ResponsiveTacticalMap
          patientLocation={{
            latitude: Number(gps?.latitude) || 12.9716,
            longitude: Number(gps?.longitude) || 77.5946,
            accuracyMeters: Number(gps?.accuracyMeters) || 2.8,
            isSimulated: gps?.isSimulated ?? true
          }}
          responder={responder}
          gateway={lora.gateway}
          device={{
            id: lastPacket.deviceId || 'CJACK-UNIT-TX104',
            status: 'OPERATIONAL',
            battery: 88
          }}
          isSimulatedMode={true}
        />

        {/* =========================================================================
          SECTION 4: OFFLINE QUEUE SIMULATION (5-STAGE LIFECYCLE)
          ========================================================================= */}
        <OfflineQueueVisualizer
          offlineQueue={offlineQueue}
          onSimulateAction={handleOfflineAction}
        />

        {/* =========================================================================
          SECTION 5: STRUCTURED COMMUNICATION PACKET MODEL & INGESTION
          ========================================================================= */}
        <CommunicationPacketInspector
          latestPacket={lastPacket}
          recentPackets={recentPackets}
          onSendPacket={handleSendPacket}
          onRefreshPackets={fetchRecentPackets}
        />
      </div>
    </PageStateWrapper>
  );
};

export default ConnectivityPage;
