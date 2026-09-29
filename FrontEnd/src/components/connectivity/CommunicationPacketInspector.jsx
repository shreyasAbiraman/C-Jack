import React, { useState } from 'react';
import { 
  Package, 
  Send, 
  Check, 
  Copy, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Eye,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

/**
 * CommunicationPacketInspector
 * 
 * Inspects and validates the required structured communication data model:
 * {
 *   deviceId,
 *   timestamp,
 *   emergencyStatus,
 *   latitude,
 *   longitude,
 *   heartRate,
 *   spo2,
 *   cprStatus,
 *   battery,
 *   sensorStatus
 * }
 */
export const CommunicationPacketInspector = ({
  latestPacket,
  recentPackets = [],
  onSendPacket,
  onRefreshPackets
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('SCHEMA'); // 'SCHEMA' | 'HISTORY' | 'TRANSMIT'
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState(null);

  // Form state for custom packet transmission
  const [formState, setFormState] = useState({
    deviceId: 'CJACK-UNIT-TX104',
    emergencyStatus: 'CPR_ACTIVE',
    latitude: 12.9716,
    longitude: 77.5946,
    heartRate: 110,
    spo2: 88,
    cprStatus: 'ACTIVE_CLOSED_LOOP',
    battery: 87,
    sensorStatus: 'NOMINAL'
  });

  // Default structured packet matching exact requirements
  const samplePacket = latestPacket || {
    deviceId: 'CJACK-UNIT-TX104',
    timestamp: new Date().toISOString(),
    emergencyStatus: 'CPR_ACTIVE',
    latitude: 12.9716,
    longitude: 77.5946,
    heartRate: 108,
    spo2: 86,
    cprStatus: 'ACTIVE_CLOSED_LOOP',
    battery: 87,
    sensorStatus: 'NOMINAL'
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!onSendPacket) return;

    setIsSending(true);
    setSendSuccessMessage(null);
    try {
      const packetToSend = {
        ...formState,
        timestamp: new Date().toISOString(),
        latitude: Number(formState.latitude),
        longitude: Number(formState.longitude),
        heartRate: Number(formState.heartRate),
        spo2: Number(formState.spo2),
        battery: Number(formState.battery)
      };

      const result = await onSendPacket(packetToSend);
      setSendSuccessMessage(result?.message || 'Packet transmitted successfully to LoRa transceiver & backend.');
      setTimeout(() => setSendSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to transmit packet:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Package className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                Structured Communication Packet Model
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-mono">
                10-FIELD RFC-STANDARD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Binary & JSON formatted emergency telemetry frame ingested by CJack backend API.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'SCHEMA' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payload Inspector
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'HISTORY' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Stream ({recentPackets.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSMIT')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'TRANSMIT' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Send Test Frame
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sendSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{sendSuccessMessage}</span>
        </div>
      )}

      {/* TAB 1: SCHEMA INSPECTOR */}
      {activeTab === 'SCHEMA' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Key-Value Breakdown Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Structured Field Schema</span>
              <span className="text-[10px] text-slate-500 font-mono">Total Payload: 64 Bytes</span>
            </div>

            <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase">
                  <tr>
                    <th className="p-2 border-b border-slate-800">Field Key</th>
                    <th className="p-2 border-b border-slate-800">Data Type</th>
                    <th className="p-2 border-b border-slate-800">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono text-[11px]">
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">deviceId</td>
                    <td className="p-2 text-slate-500">String</td>
                    <td className="p-2 text-slate-200">{samplePacket.deviceId}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">timestamp</td>
                    <td className="p-2 text-slate-500">ISO-8601 String</td>
                    <td className="p-2 text-slate-300 truncate max-w-[140px]">{samplePacket.timestamp}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">emergencyStatus</td>
                    <td className="p-2 text-slate-500">Enum String</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/50">
                        {samplePacket.emergencyStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">latitude</td>
                    <td className="p-2 text-slate-500">Float64</td>
                    <td className="p-2 text-slate-200">{samplePacket.latitude}° N</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">longitude</td>
                    <td className="p-2 text-slate-500">Float64</td>
                    <td className="p-2 text-slate-200">{samplePacket.longitude}° E</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">heartRate</td>
                    <td className="p-2 text-slate-500">Uint8 (BPM)</td>
                    <td className="p-2 text-emerald-400 font-bold">{samplePacket.heartRate} bpm</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">spo2</td>
                    <td className="p-2 text-slate-500">Uint8 (%)</td>
                    <td className="p-2 text-cyan-300 font-bold">{samplePacket.spo2}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">cprStatus</td>
                    <td className="p-2 text-slate-500">Enum String</td>
                    <td className="p-2 text-amber-300">{samplePacket.cprStatus}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">battery</td>
                    <td className="p-2 text-slate-500">Uint8 (%)</td>
                    <td className="p-2 text-emerald-300 font-bold">{samplePacket.battery}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400 font-bold">sensorStatus</td>
                    <td className="p-2 text-slate-500">String</td>
                    <td className="p-2 text-emerald-400">{samplePacket.sensorStatus}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw JSON Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                Raw Telemetry Ingestion JSON
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="flex-1 bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto relative">
              <pre className="leading-relaxed">
{`{
  "deviceId": "${samplePacket.deviceId}",
  "timestamp": "${samplePacket.timestamp}",
  "emergencyStatus": "${samplePacket.emergencyStatus}",
  "latitude": ${samplePacket.latitude},
  "longitude": ${samplePacket.longitude},
  "heartRate": ${samplePacket.heartRate},
  "spo2": ${samplePacket.spo2},
  "cprStatus": "${samplePacket.cprStatus}",
  "battery": ${samplePacket.battery},
  "sensorStatus": "${samplePacket.sensorStatus}"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECENT INGESTED PACKETS STREAM */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stored communication packets logged by backend ingestion pipeline:</span>
            {onRefreshPackets && (
              <button
                onClick={onRefreshPackets}
                className="flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentPackets.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono bg-slate-950/40 rounded-lg">
                No communication packets in memory log yet.
              </div>
            ) : (
              recentPackets.map((pkt, idx) => (
                <div
                  key={pkt.packetId || idx}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                      {pkt.packetId || `PKT-${idx + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{pkt.deviceId}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300">
                          {pkt.emergencyStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(pkt.timestamp).toLocaleTimeString()} • {pkt.latitude?.toFixed(4)}°N, {pkt.longitude?.toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">VITALS</span>
                      <span className="text-emerald-400 font-bold">{pkt.heartRate} bpm</span> | <span className="text-cyan-300">{pkt.spo2}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">CPR</span>
                      <span className="text-amber-300">{pkt.cprStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">BATTERY</span>
                      <span className="text-slate-200">{pkt.battery}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSMIT TEST PACKET */}
      {activeTab === 'TRANSMIT' && (
        <form onSubmit={handleTransmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Manually inject a structured packet into the backend endpoint <code className="text-cyan-400">POST /api/connectivity/packet</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">deviceId</label>
              <input
                type="text"
                value={formState.deviceId}
                onChange={(e) => setFormState({ ...formState, deviceId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">emergencyStatus</label>
              <select
                value={formState.emergencyStatus}
                onChange={(e) => setFormState({ ...formState, emergencyStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              >
                <option value="MONITORING">MONITORING</option>
                <option value="SUSPECTED_ARREST">SUSPECTED_ARREST</option>
                <option value="CONFIRMING">CONFIRMING</option>
                <option value="CPR_ACTIVE">CPR_ACTIVE</option>
                <option value="RECOVERY">RECOVERY</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">cprStatus</label>
              <select
                value={formState.cprStatus}
                onChange={(e) => setFormState({ ...formState, cprStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              >
                <option value="IDLE">IDLE</option>
                <option value="ACTIVE_CLOSED_LOOP">ACTIVE_CLOSED_LOOP</option>
                <option value="PAUSED">PAUSED</option>
                <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formState.latitude}
                onChange={(e) => setFormState({ ...formState, latitude: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formState.longitude}
                onChange={(e) => setFormState({ ...formState, longitude: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">heartRate (bpm)</label>
              <input
                type="number"
                value={formState.heartRate}
                onChange={(e) => setFormState({ ...formState, heartRate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">spo2 (%)</label>
              <input
                type="number"
                value={formState.spo2}
                onChange={(e) => setFormState({ ...formState, spo2: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">battery (%)</label>
              <input
                type="number"
                value={formState.battery}
                onChange={(e) => setFormState({ ...formState, battery: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-mono">sensorStatus</label>
              <input
                type="text"
                value={formState.sensorStatus}
                onChange={(e) => setFormState({ ...formState, sensorStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Transmitting Over RF...' : 'Transmit Structured Packet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
