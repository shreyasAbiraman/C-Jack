import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  User, 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Clock, 
  Check, 
  FileText,
  ShieldCheck,
  Zap,
  Droplet
} from 'lucide-react';

/**
 * HandoverPanel
 * 
 * Contains:
 * 1. Patient summary
 * 2. Vital history
 * 3. CPR session
 * 4. Alerts
 * 5. Device events
 * 6. Timeline
 * 
 * Feature: Allow export of a session summary as a future-ready feature.
 */
export const HandoverPanel = ({
  handoverData,
  onExportSummary
}) => {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PATIENT' | 'VITALS' | 'CPR' | 'ALERTS' | 'EVENTS' | 'TIMELINE'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Fallback defaults
  const patient = handoverData?.patientSummary || {
    id: 'CJ-8829',
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
    medicalHistoryNotes: 'Prior MI (2023); dual-chamber stent; on Warfarin 5mg daily. DNR: NONE.'
  };

  const cpr = handoverData?.cprSession || {
    state: 'CPR_ACTIVE',
    totalCompressions: 48,
    meanRateCPM: 108,
    meanDepthMM: 52,
    meanForceNewtons: 410,
    feedbackStatus: 'ACTIVE_CLOSED_LOOP',
    activeDuration: '02:28'
  };

  const vitalHistory = handoverData?.vitalHistory || [
    { timeFormatted: '10:40:00', heartRate: 76, spo2: 98, etco2: 38, rhythm: 'Sinus Rhythm' },
    { timeFormatted: '10:41:00', heartRate: 78, spo2: 97, etco2: 37, rhythm: 'Sinus Rhythm' },
    { timeFormatted: '10:41:45', heartRate: 142, spo2: 91, etco2: 28, rhythm: 'Ventricular Tachycardia' },
    { timeFormatted: '10:42:01', heartRate: 0, spo2: 78, etco2: 18, rhythm: 'Ventricular Fibrillation' },
    { timeFormatted: '10:42:30', heartRate: 0, spo2: 80, etco2: 20, rhythm: 'Ventricular Fibrillation' },
    { timeFormatted: '10:43:00', heartRate: 0, spo2: 82, etco2: 21, rhythm: 'Ventricular Fibrillation' }
  ];

  const alerts = handoverData?.alerts || [
    { code: 'ALT-VFIB', title: 'Ventricular Fibrillation Confirmed', time: '10:42:01', level: 'CRITICAL' },
    { code: 'ALT-CPR-AUTO', title: 'Automated Vest Compression Started', time: '10:42:12', level: 'ACTION' },
    { code: 'ALT-GPS-3D', title: '3D GNSS Coordinates Locked', time: '10:42:12', level: 'INFO' },
    { code: 'ALT-EMS-ACK', title: 'Central EMS Dispatch Token #ACK-9482', time: '10:42:18', level: 'INFO' }
  ];

  const deviceEvents = handoverData?.deviceEvents || [
    { code: 'DEV-PWR-OK', title: 'Main Battery Engaged', time: '10:41:50', desc: '14.8V nominal bus voltage' },
    { code: 'SENS-SYNC', title: 'ECG + PPG Dual Trigger Verified', time: '10:42:01', desc: 'Asystole verified' },
    { code: 'ACT-ENGAGE', title: 'Pneumatic Actuator Armed', time: '10:42:10', desc: 'Pre-charged to 2.4 bar' }
  ];

  const timeline = handoverData?.timeline || [
    { time: '10:42:01', title: 'Cardiac arrest suspected (Lead-II Asystole + PPG collapse)' },
    { time: '10:42:11', title: 'Emergency confirmed (3s verification countdown expired)' },
    { time: '10:42:12', title: 'Auto-CPR vest engaged @ 108 CPM closed loop' },
    { time: '10:42:18', title: 'EMS Dispatch auto-acknowledged call' },
    { time: '10:42:25', title: 'ALS-MED-04 unit assigned and en route' }
  ];

  const handleExport = async () => {
    let exportPayload = null;
    if (onExportSummary) {
      exportPayload = await onExportSummary();
    }

    const payload = exportPayload || {
      exportTimestamp: new Date().toISOString(),
      handoverId: handoverData?.handoverId || `HND-${Date.now().toString(36).toUpperCase()}`,
      patient,
      cprSession: cpr,
      vitalHistory,
      alerts,
      deviceEvents,
      timeline
    };

    // Trigger local JSON file download
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CJACK_CLINICAL_HANDOVER_${patient.id || 'INCIDENT'}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              Clinical Handover & Audit Record
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-mono">
              ST. JOHN ED READY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Standardized clinical handoff package for emergency department and trauma catheterization teams.
          </p>
        </div>

        {/* Future-Ready Export Session Summary Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border transition-all shadow-md ${
              downloadSuccess
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
            }`}
          >
            {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'Summary Exported!' : 'Export Session Summary (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Tab Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'PATIENT', 'VITALS', 'CPR', 'ALERTS', 'EVENTS', 'TIMELINE'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded-md font-mono font-medium transition-colors shrink-0 ${
              activeTab === t 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panel Content Sections */}
      <div className="space-y-4">
        {/* SECTION 1: PATIENT SUMMARY */}
        {(activeTab === 'ALL' || activeTab === 'PATIENT') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
              <User className="w-4 h-4 text-purple-400" />
              <span>1. Patient Clinical Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">PATIENT IDENTITY</span>
                <span className="text-white font-bold">{patient.name} ({patient.id})</span>
                <span className="text-slate-400 block text-[11px]">{patient.age}y {patient.gender}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">BLOOD GROUP</span>
                <span className="text-red-400 font-bold text-sm">{patient.bloodGroup}</span>
                <span className="text-slate-400 block text-[11px]">Type Tested</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">ALLERGIES</span>
                <span className="text-amber-300 font-bold">{patient.allergies?.join(', ')}</span>
                <span className="text-slate-400 block text-[11px]">Strict Contraindications</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">RESUSCITATION DIRECTIVE</span>
                <span className="text-emerald-400 font-bold">FULL CODE (NO DNR)</span>
                <span className="text-slate-400 block text-[11px]">Full Advanced Life Support</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 font-mono block mb-0.5">CARDIOLOGY NOTES & MEDICATIONS</span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {patient.medicalHistoryNotes}
              </p>
            </div>
          </div>
        )}

        {/* SECTION 2: VITAL HISTORY */}
        {(activeTab === 'ALL' || activeTab === 'VITALS') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <span>2. Chronological Vital History Log</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Sampling Cadence: 30s</span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Heart Rate</th>
                    <th className="p-2">SpO2</th>
                    <th className="p-2">EtCO2</th>
                    <th className="p-2">ECG Rhythm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/80 text-[11px]">
                  {vitalHistory.map((v, i) => (
                    <tr key={i} className={v.heartRate === 0 ? 'bg-red-950/20' : ''}>
                      <td className="p-2 text-slate-300">{v.timeFormatted}</td>
                      <td className="p-2 font-bold text-red-400">{v.heartRate} bpm</td>
                      <td className="p-2 text-cyan-300">{v.spo2}%</td>
                      <td className="p-2 text-purple-300">{v.etco2} mmHg</td>
                      <td className="p-2 text-amber-300">{v.rhythm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: CPR SESSION */}
        {(activeTab === 'ALL' || activeTab === 'CPR') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>3. CPR Compression Session Metrics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TOTAL COMPRESSIONS</span>
                <span className="text-base font-bold text-white">{cpr.totalCompressions} Cycles</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CADENCE RATE</span>
                <span className="text-base font-bold text-cyan-400">{cpr.meanRateCPM} CPM</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MEAN DEPTH</span>
                <span className="text-base font-bold text-emerald-400">{cpr.meanDepthMM} mm</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ACTIVE DURATION</span>
                <span className="text-base font-bold text-amber-300">{cpr.activeDuration}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ALERTS */}
        {(activeTab === 'ALL' || activeTab === 'ALERTS') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4. Safety Alerts & Incident Flags</span>
            </div>

            <div className="space-y-1.5">
              {alerts.map((alt, i) => (
                <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/40">
                      {alt.code}
                    </span>
                    <span className="text-white">{alt.title}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: DEVICE EVENTS */}
        {(activeTab === 'ALL' || activeTab === 'EVENTS') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>5. Smart Vest Hardware & Actuator Events</span>
            </div>

            <div className="space-y-1.5">
              {deviceEvents.map((dev, i) => (
                <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {dev.code}
                    </span>
                    <span className="text-slate-200">{dev.title}</span>
                    <span className="text-slate-500 text-[10px] hidden sm:inline">— {dev.desc}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{dev.time || '10:42:01'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: TIMELINE */}
        {(activeTab === 'ALL' || activeTab === 'TIMELINE') && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>6. Incident Event Chronology</span>
            </div>

            <div className="space-y-1.5 pl-2 border-l border-slate-800 text-xs font-mono">
              {timeline.map((evt, i) => (
                <div key={i} className="flex items-start gap-3 py-1">
                  <span className="text-amber-400 font-bold shrink-0">{evt.time}</span>
                  <span className="text-slate-300">{evt.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
