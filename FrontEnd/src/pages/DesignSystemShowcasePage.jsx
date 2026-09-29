import React, { useState } from 'react';
import {
  StatusBadge,
  VitalCard,
  EmergencyBanner,
  PatientCard,
  DeviceStatus,
  ConnectionStatus,
  BatteryIndicator,
  GPSIndicator,
  CPRStatus,
  CompressionCounter,
  HeartRateDisplay,
  SpO2Display,
  CompressionRateDisplay,
  CompressionDepthDisplay,
  AlertCard,
  Timeline,
  MapContainer,
  SensorStatus,
  VoiceGuidancePanel,
  Modal,
  ConfirmationDialog,
  LoadingState,
  EmptyState,
  ErrorState,
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SEMANTIC_STATUS
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { Heart, Activity, Sliders, BellRing, Layers, CheckCircle } from 'lucide-react';

export const DesignSystemShowcasePage = () => {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cprActive, setCprActive] = useState(false);
  const [compressionCount, setCompressionCount] = useState(142);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});

  const handleAcknowledge = (id) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [id]: true }));
    addToast({
      title: 'Alert Acknowledged',
      message: `Alarm event #${id} logged as verified by clinician.`,
      type: 'info'
    });
  };

  const sampleTimeline = [
    { id: 1, title: 'Sudden Cardiac Arrest Detection', time: '14:32:01', status: 'CRITICAL', description: 'Dual-lead ECG registered ventricular fibrillation. Zero pulse wave on MAX30102.' },
    { id: 2, title: 'Voice Warning Broadcast', time: '14:32:04', status: 'WARNING', description: 'Multilingual audio prompt broadcast at 85 dBA instructing bystanders to stand clear.' },
    { id: 3, title: 'LoRa Emergency SOS Dispatched', time: '14:32:06', status: 'NORMAL', description: 'Encrypted telemetry packet received by Gateway GW-BLR-041 (RSSI -72dBm).' },
    { id: 4, title: 'Automated CPR Initiated', time: '14:32:10', status: 'NORMAL', description: 'Pneumatic harness cycling at 108 CPM. Depth regulated at 52mm.' }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="CJack Design System & Component Catalog"
        question="Are all 28 design system components compliant with clinical IoT specifications?"
        statusBadge={<StatusBadge status="NORMAL" text="DESIGN SYSTEM VERIFIED" />}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Telemetry Synced',
                  message: 'Design token parameters verified across light/dark themes.',
                  type: 'success'
                });
              }}
            >
              Trigger Test Toast
            </Button>
            <Button
              variant="emergency"
              size="sm"
              onClick={() => setConfirmOpen(true)}
            >
              Test Critical Dialog
            </Button>
          </div>
        }
      />

      {/* 1. SEMANTIC STATUS SYSTEM */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-cjack-accent" />
            1. Strict Semantic Status System
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Clinical Rule: Never rely on color alone. Every status element pairs an SVG icon, uppercase label, color token, and explanatory text.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(SEMANTIC_STATUS).map((statusDef) => (
            <Card key={statusDef.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={statusDef.key} size="md" pulse={statusDef.key === 'CRITICAL'} />
                <span className="text-[10px] font-mono text-gray-400">KEY: {statusDef.key}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-sans">
                {statusDef.defaultText}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. EMERGENCY ALERTS & BANNER */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BellRing className="h-4 w-4 text-red-500" />
            2. Emergency Banners & Clinical Alarm Cards
          </h2>
        </div>

        <EmergencyBanner
          active={true}
          title="DEMO CRITICAL ALARM: VENTRICULAR FIBRILLATION DETECTED"
          message="Multi-sensor cross-validation confirmed collapse of pulsatile flow. Auto-CPR harness pre-charged."
          actionText="Review Handoff"
          onAction={() => addToast({ title: 'Handoff Opened', message: 'Paramedic console focused.', type: 'info' })}
          secondaryActionText="Silence Audio"
          onSecondaryAction={() => addToast({ title: 'Alarm Muted', message: 'Audio horn paused for 60 seconds.', type: 'warning' })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AlertCard
            id="al-01"
            title="Loss of Lead-II Electrode Impedance"
            message="Right mid-clavicular electrode impedance exceeded 120 kOhm. Verify vest strapping tension."
            severity="WARNING"
            category="ELECTRODES"
            timestamp={new Date().toISOString()}
            acknowledged={acknowledgedAlerts['al-01']}
            onAcknowledge={handleAcknowledge}
          />

          <AlertCard
            id="al-02"
            title="LoRa Link Degraded (RSSI < -115 dBm)"
            message="Primary gateway GW-BLR-041 dropped. Switching automated failover to cellular NB-IoT."
            severity="CRITICAL"
            category="NETWORK"
            timestamp={new Date().toISOString()}
            acknowledged={acknowledgedAlerts['al-02']}
            onAcknowledge={handleAcknowledge}
          />
        </div>
      </section>

      {/* 3. RESUSCITATION & VITAL DISPLAYS */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-cjack-accent" />
            3. Resuscitation & Physiological Vital Displays
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <HeartRateDisplay
            heartRate={cprActive ? 112 : 74}
            rhythm={cprActive ? 'CPR Induced Waveform' : 'Normal Sinus Rhythm'}
          />

          <SpO2Display
            spo2={98}
            perfusionIndex={4.2}
          />

          <CompressionRateDisplay
            rate={cprActive ? 108 : 0}
            targetMin={100}
            targetMax={120}
          />

          <CompressionDepthDisplay
            depthMm={cprActive ? 54 : 0}
            appliedForceNewtons={cprActive ? 410 : 0}
            chestRecoilPct={96}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CPRStatus
            active={cprActive}
            elapsedSeconds={cprActive ? 184 : 0}
            compressionFraction={92}
            onToggleActive={() => setCprActive(!cprActive)}
          />

          <CompressionCounter
            count={compressionCount}
            cycles={2}
            onReset={() => {
              setCompressionCount(0);
              addToast({ title: 'Counter Reset', message: 'Compression cycle zeroed.', type: 'info' });
            }}
          />

          <VitalCard
            title="End-Tidal CO2 (EtCO2)"
            value={38}
            unit="mmHg"
            status="NORMAL"
            targetRange="35 - 45 mmHg"
            source="Capnography Proxy"
            trend="+1.2 vs prev min"
          />
        </div>
      </section>

      {/* 4. HARDWARE, IOT & TELEMETRY */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cjack-accent" />
            4. Hardware, Power & IoT Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <BatteryIndicator
            level={88}
            voltage={14.8}
            health="Optimal"
            estimatedHours={4.2}
          />

          <GPSIndicator
            latitude={12.9716}
            longitude={77.5946}
            altitude={920}
            accuracy={2.8}
            satellites={11}
            locked={true}
          />

          <DeviceStatus />

          <ConnectionStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SensorStatus />
          <MapContainer height="h-64" />
        </div>
      </section>

      {/* 5. PATIENT & VOICE GUIDANCE */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            5. Patient Clinical Profile & Multilingual Voice Guidance
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PatientCard status="NORMAL" />
          <VoiceGuidancePanel isEmergency={cprActive} />
        </div>
      </section>

      {/* 6. TIMELINE & FEEDBACK STATES */}
      <section className="space-y-3">
        <div className="border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            6. Event Timelines & System Feedback States
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle icon={Activity}>Escalation Event Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={sampleTimeline} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle icon={Sliders}>Interactive Modals & Dialogs</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                  Open Telemetry Modal
                </Button>
                <Button variant="emergency" size="sm" onClick={() => setConfirmOpen(true)}>
                  Open Critical Confirmation
                </Button>
              </CardContent>
            </Card>

            <LoadingState
              label="Demonstrating Telemetry Stream Loading..."
              subtext="Awaiting packet handshake from ESP32 node"
            />

            <EmptyState
              title="Capnography Channel Inactive"
              description="Plug secondary EtCO2 airway adapter into vest auxiliary port J3."
              actionText="Scan Auxiliary Ports"
              onAction={() => addToast({ title: 'Scanning', message: 'Probing vest port J3...', type: 'info' })}
            />

            <ErrorState
              title="Electrode Lead Disconnection"
              message="Lead-II analog front-end lost impedance lock on right thorax. Check chest band."
              onRetry={() => addToast({ title: 'Calibrating', message: 'Re-zeroing electrode bridge...', type: 'warning' })}
            />
          </div>
        </div>
      </section>

      {/* Modal Dialog Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="CJack Firmware & Telemetry Register Inspect"
        footer={
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
            Close Inspector
          </Button>
        }
      >
        <div className="space-y-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark">
            <span className="text-gray-500 block">DEVICE SERIAL:</span>
            <span className="font-bold text-gray-900 dark:text-white">CJACK-ESP32-TX104</span>
          </div>
          <div className="p-2.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark">
            <span className="text-gray-500 block">LORA SYNC WORD:</span>
            <span className="font-bold text-cjack-accent">0x34 (Public Emergency Mesh)</span>
          </div>
          <div className="p-2.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark">
            <span className="text-gray-500 block">ACTUATOR PRESSURE CALIBRATION:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">5.20 BAR @ 24°C</span>
          </div>
        </div>
      </Modal>

      {/* Critical Confirmation Dialog Instance */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          addToast({
            title: 'Action Authenticated',
            message: 'Emergency actuator vent command transmitted.',
            type: 'critical'
          });
        }}
        title="Vent Actuators for Defibrillation?"
        message="This command will immediately vent pressure from the chest bladder to allow external defibrillator pads to analyze rhythm without mechanical artifact. Ensure bystander clears patient."
        confirmText="Confirm Venting"
        severity="CRITICAL"
      />
    </div>
  );
};

export default DesignSystemShowcasePage;
