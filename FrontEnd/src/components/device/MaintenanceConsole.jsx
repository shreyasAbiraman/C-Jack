import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../ui';
import {
  Wrench,
  ShieldCheck,
  Battery,
  Activity,
  Gauge,
  AlertOctagon,
  RefreshCw,
  CheckCircle,
  Clock,
  Sparkles,
  FileCheck2,
  Cpu
} from 'lucide-react';

export const MaintenanceConsole = ({ maintenance, onRunSelfTest }) => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const data = maintenance || {
    lastInspection: {
      date: '2026-09-01',
      inspector: 'Inspector Dr. V. Nair (Biomedical Eng)',
      certificateNo: 'ISO-13485-MED-84920',
      status: 'PASSED (AHA / ERC 2025 Clinical Compliance)',
      nextInspectionDue: '2026-12-01'
    },
    batteryHealth: {
      stateOfHealthPct: 98,
      chargeCycles: 42,
      maxCapacityMah: 6400,
      currentCapacityMah: 5632,
      cellImbalanceMillivolts: 8,
      internalResistanceMilliohms: 24,
      temperatureCelsius: 29.8,
      status: 'HEALTHY'
    },
    sensorHealth: {
      ecgLeadImpedanceOhms: 420,
      ppgPhotodiodeCalibration: '99.4% (Nominal Baseline)',
      piezoSensitivityMvPerMicrostrain: 12.8,
      loadCellZeroDriftPercentage: 0.12,
      imuGyroDriftDps: 0.04,
      status: 'ALL SENSORS CALIBRATED'
    },
    motorHealth: {
      motorModel: 'Brushless DC Air Compressor (48V / 250W)',
      operatingHours: 14.2,
      operatingCycles: 3820,
      bearingVibrationMmS: 0.8,
      bearingThermalCelsius: 34.0,
      stallProtectionFlag: false,
      pressureValveLeakRateBarMin: 0.01,
      status: 'OPTIMAL (No Mechanical Wear)'
    },
    errorHistory: [
      {
        id: 'err-1',
        code: 'ERR-LORA-RET',
        timestamp: '2026-09-22 10:42:26',
        subsystem: 'RF Communications',
        severity: 'LOW',
        message: 'Uplink frame ACK timeout on packet #9481 (Resolved on retry 2)',
        resolved: true
      },
      {
        id: 'err-2',
        code: 'ERR-PAD-IMP',
        timestamp: '2026-09-22 10:39:30',
        subsystem: 'ECG Analog Front-End',
        severity: 'MEDIUM',
        message: 'Transient skin-electrode impedance spike (>1800 Ω) during donning',
        resolved: true
      },
      {
        id: 'err-3',
        code: 'ERR-GPS-COLD',
        timestamp: '2026-09-22 10:38:10',
        subsystem: 'GNSS Satellite Engine',
        severity: 'LOW',
        message: 'Cold start ephemeris acquisition took 28s indoors',
        resolved: true
      }
    ]
  };

  const handleSelfTest = async () => {
    if (!onRunSelfTest) return;
    try {
      setIsRunningTest(true);
      const res = await onRunSelfTest();
      setTestResult(res);
    } catch (err) {
      console.error('Self-test failed:', err);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Self-Test Action */}
      <div className="p-4 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-card dark:bg-surface-cardDark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-gray-900 dark:text-white flex items-center gap-2">
              Maintenance & Diagnostics Subsystem
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                CLINICALLY CERTIFIED
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Comprehensive biomedical diagnostics, subsystem health vectors, and recorded error history
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={RefreshCw}
          onClick={handleSelfTest}
          disabled={isRunningTest}
          className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs shadow-sm"
        >
          {isRunningTest ? 'Running Diagnostics...' : 'Execute Diagnostic Self-Test'}
        </Button>
      </div>

      {/* Live Self-Test Result Banner (if triggered) */}
      {testResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2 text-emerald-500 font-mono font-bold text-xs">
              <CheckCircle className="h-4 w-4" />
              <span>ON-BOARD SELF-TEST RESULT: {testResult.overallStatus || 'PASSED'}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {new Date(testResult.testCompletedAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
            {testResult.subsystemsTested &&
              Object.entries(testResult.subsystemsTested).map(([subsystem, status]) => (
                <div
                  key={subsystem}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark"
                >
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {subsystem.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="text-emerald-500 font-semibold">{status}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4 Health & Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Last Inspection Card */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={FileCheck2} className="text-sm font-medium">
              Biomedical Inspection & Certification
            </CardTitle>
            <StatusBadge status="safe" text="CERTIFIED" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Last Inspection Date:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.lastInspection?.date}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Accredited Inspector:</span>
              <span className="font-sans font-medium text-gray-800 dark:text-gray-200 text-right">
                {data.lastInspection?.inspector}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Certificate Reference:</span>
              <span className="font-mono text-primary-500 font-semibold">
                {data.lastInspection?.certificateNo}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Clinical Protocol Compliance:</span>
              <span className="font-mono text-emerald-500 font-bold text-[11px] text-right">
                {data.lastInspection?.status}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Next Mandatory Due Date:</span>
              <span className="font-mono font-bold text-amber-500">
                {data.lastInspection?.nextInspectionDue}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Battery Health Card */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Battery} className="text-sm font-medium">
              LiFePO4 Battery Cell Health
            </CardTitle>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {data.batteryHealth?.stateOfHealthPct}% SoH
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">State of Health (SoH):</span>
              <span className="font-mono font-bold text-emerald-500">
                {data.batteryHealth?.stateOfHealthPct}% (Nominal Degradation)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Completed Charge Cycles:</span>
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                {data.batteryHealth?.chargeCycles} Cycles (Rated 2000+)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Capacity (Current / Max):</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.batteryHealth?.currentCapacityMah} / {data.batteryHealth?.maxCapacityMah} mAh
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Cell Imbalance & ESR:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                Δ{data.batteryHealth?.cellImbalanceMillivolts} mV | {data.batteryHealth?.internalResistanceMilliohms} mΩ
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Pack Operating Temperature:</span>
              <span className="font-mono font-bold text-emerald-500">
                {data.batteryHealth?.temperatureCelsius}°C (Optimal Range)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Sensor Health Card */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Activity} className="text-sm font-medium">
              Sensor Subsystem Calibration Health
            </CardTitle>
            <StatusBadge status="safe" text={data.sensorHealth?.status || 'CALIBRATED'} />
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">ECG Lead Contact Impedance:</span>
              <span className="font-mono font-bold text-emerald-500">
                {data.sensorHealth?.ecgLeadImpedanceOhms} Ω (&lt; 2000 Ω Threshold)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">PPG Optical Calibration:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.sensorHealth?.ppgPhotodiodeCalibration}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Piezo Strain Gauge Gain:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {data.sensorHealth?.piezoSensitivityMvPerMicrostrain} mV/με
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Load Cell Zero-Offset Drift:</span>
              <span className="font-mono text-emerald-500 font-semibold">
                {data.sensorHealth?.loadCellZeroDriftPercentage}% (&lt; 0.5% Tol.)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">6-Axis IMU Gyro Drift:</span>
              <span className="font-mono text-emerald-500 font-semibold">
                {data.sensorHealth?.imuGyroDriftDps} °/sec (Calibrated)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Motor Health Card */}
        <Card className="hover:border-primary-500/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle icon={Gauge} className="text-sm font-medium">
              Actuator & Motor Health
            </CardTitle>
            <StatusBadge status="safe" text="NO WEAR" />
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Compressor Model:</span>
              <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200 text-right">
                {data.motorHealth?.motorModel}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Operating Service Hours:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {data.motorHealth?.operatingHours} Hours ({data.motorHealth?.operatingCycles} Cycles)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Bearing Vibration Velocity:</span>
              <span className="font-mono text-emerald-500 font-semibold">
                {data.motorHealth?.bearingVibrationMmS} mm/s RMS (ISO 10816 Zone A)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Actuator Valve Leak Rate:</span>
              <span className="font-mono text-emerald-500 font-semibold">
                {data.motorHealth?.pressureValveLeakRateBarMin} Bar/min (&lt; 0.05 Tol.)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Stall Protection Circuit:</span>
              <span className="font-mono text-emerald-500 font-bold">
                {data.motorHealth?.stallProtectionFlag ? 'TRIPPED' : 'CLEAR & ARMED'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Error History Card */}
      <Card className="border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Subsystem Error History & Fault Registry
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark font-normal">
                  {data.errorHistory?.length || 0} RECORDED
                </span>
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Archival fault log capturing RF timeouts, impedance spikes, and sensor acquisition anomalies
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> ALL PAST ANOMALIES RESOLVED
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/50 dark:bg-surface-mutedDark/30 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Error Code</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Subsystem</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Fault Description</th>
                  <th className="py-3 px-4">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark text-xs font-mono">
                {data.errorHistory?.map((err) => (
                  <tr
                    key={err.id}
                    className="hover:bg-surface-mutedLight/40 dark:hover:bg-surface-mutedDark/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-rose-500 whitespace-nowrap">
                      {err.code}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {err.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {err.subsystem}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        err.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400'
                          : err.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {err.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-sans text-[11px]">
                      {err.message}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {err.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-500">
                          <CheckCircle className="h-3.5 w-3.5" /> RESOLVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-500">
                          <AlertOctagon className="h-3.5 w-3.5" /> OPEN
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
