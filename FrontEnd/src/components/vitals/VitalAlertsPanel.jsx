import React from 'react';
import { AlertTriangle, AlertOctagon, Info, WifiOff, Activity, Zap, CheckCircle2 } from 'lucide-react';

export const VitalAlertsPanel = ({
  alerts = [],
  className = ''
}) => {
  // Built-in advisory alerts evaluation
  const defaultAlertRules = [
    {
      id: 'sensor_disc',
      category: 'HARDWARE LINK',
      title: 'Sensor Disconnection Warning',
      condition: 'Triggered when electrode contact impedance exceeds 150 kΩ or lead-off register fires.',
      severity: 'WARNING',
      icon: WifiOff
    },
    {
      id: 'invalid_ecg',
      category: 'SIGNAL INTEGRITY',
      title: 'Invalid / Inconclusive ECG Rhythm',
      condition: 'Triggered when signal saturation or high-frequency baseline wander prevents R-peak detection.',
      severity: 'WARNING',
      icon: AlertTriangle
    },
    {
      id: 'low_spo2',
      category: 'OXYGENATION ALERT',
      title: 'Low Oxygen Saturation (SpO2 < 90%)',
      condition: 'Triggered when photoplethysmogram AC/DC ratio indicates acute arterial hypoxemia.',
      severity: 'CRITICAL',
      icon: AlertOctagon
    },
    {
      id: 'abnormal_hr',
      category: 'CARDIAC THRESHOLD',
      title: 'Abnormal Heart Rate (< 45 or > 130 BPM)',
      condition: 'Triggered when persistent extreme bradycardia or tachyarrhythmia is calculated.',
      severity: 'CRITICAL',
      icon: Activity
    },
    {
      id: 'motion_interf',
      category: 'ARTIFACT INTERFERENCE',
      title: 'Excessive Motion Interference',
      condition: 'Triggered when 6-axis accelerometer confirms patient ambulatory movement causing optical noise.',
      severity: 'WARNING',
      icon: Zap
    },
    {
      id: 'comm_failure',
      category: 'TELEMETRY BRIDGE',
      title: 'LoRa / IoT Telemetry Link Timeout',
      condition: 'Triggered when gateway handshake packet acknowledgment drops for > 3 consecutive cycles.',
      severity: 'WARNING',
      icon: WifiOff
    }
  ];

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Clinical Telemetry Warning Matrix
          </h3>
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase">
          AUTOMATED SAFETY THRESHOLDS
        </span>
      </div>

      {/* Monitoring Disclaimer Box */}
      <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 mb-4 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-cjack-accent shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans">
          <strong>Advisory Notice:</strong> This software is a remote biometric telemetry monitoring interface. It displays physiological sensor data and threshold alerts, but does <em>not</em> automatically formulate definitive medical diagnoses. Clinical treatment decisions must be made by qualified medical personnel.
        </div>
      </div>

      {/* Grid of Standard Alarm Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultAlertRules.map((rule) => {
          const Icon = rule.icon;
          const isCritical = rule.severity === 'CRITICAL';
          return (
            <div
              key={rule.id}
              className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                isCritical
                  ? 'border-red-200 dark:border-red-950 bg-red-50/30 dark:bg-red-950/20'
                  : 'border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30'
              }`}
            >
              <div className={`p-1.5 rounded mt-0.5 shrink-0 ${
                isCritical
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">
                    {rule.category}
                  </span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1 py-0.1 rounded border ${
                    isCritical
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                  }`}>
                    {rule.severity}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                  {rule.title}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-sans leading-relaxed">
                  {rule.condition}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VitalAlertsPanel;
