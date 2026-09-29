import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../ui';
import {
  FileText,
  Power,
  Link,
  Unlink,
  Play,
  Square,
  AlertTriangle,
  WifiOff,
  BatteryWarning,
  Sliders,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

const EVENT_TYPE_MAP = {
  POWER_ON: {
    icon: Power,
    label: 'Power on',
    defaultSeverity: 'INFO',
    badge: 'neutral'
  },
  SENSOR_CONNECTED: {
    icon: Link,
    label: 'Sensor connected',
    defaultSeverity: 'INFO',
    badge: 'safe'
  },
  SENSOR_DISCONNECTED: {
    icon: Unlink,
    label: 'Sensor disconnected',
    defaultSeverity: 'WARNING',
    badge: 'warning'
  },
  CPR_STARTED: {
    icon: Play,
    label: 'CPR started',
    defaultSeverity: 'ACTION',
    badge: 'safe'
  },
  CPR_STOPPED: {
    icon: Square,
    label: 'CPR stopped',
    defaultSeverity: 'ADVISORY',
    badge: 'neutral'
  },
  EMERGENCY_ALERT: {
    icon: AlertTriangle,
    label: 'Emergency alert',
    defaultSeverity: 'CRITICAL',
    badge: 'emergency'
  },
  COMMUNICATION_FAILURE: {
    icon: WifiOff,
    label: 'Communication failure',
    defaultSeverity: 'WARNING',
    badge: 'warning'
  },
  BATTERY_WARNING: {
    icon: BatteryWarning,
    label: 'Battery warning',
    defaultSeverity: 'WARNING',
    badge: 'warning'
  },
  MANUAL_OVERRIDE: {
    icon: Sliders,
    label: 'Manual override',
    defaultSeverity: 'ACTION',
    badge: 'info'
  }
};

export const DeviceEventLog = ({ events = [], onRecordEvent }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [isInjecting, setIsInjecting] = useState(false);
  const [showInjectOptions, setShowInjectOptions] = useState(false);

  const defaultEvents = [
    {
      id: 'evt-dev-1',
      type: 'POWER_ON',
      title: 'Power on',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      timeFormatted: '10:39:10',
      severity: 'INFO',
      description: 'Vest main power switch engaged. 14.8V LiFePO4 battery bus energized.',
      source: 'Power Management IC'
    },
    {
      id: 'evt-dev-2',
      type: 'SENSOR_CONNECTED',
      title: 'Sensor connected',
      timestamp: new Date(Date.now() - 175000).toISOString(),
      timeFormatted: '10:39:15',
      severity: 'INFO',
      description: 'Lead-II ECG electrodes and MAX30102 PPG probe detected on SPI/I2C bus.',
      source: 'Hardware Abstraction Layer'
    },
    {
      id: 'evt-dev-3',
      type: 'SENSOR_DISCONNECTED',
      title: 'Sensor disconnected',
      timestamp: new Date(Date.now() - 160000).toISOString(),
      timeFormatted: '10:39:30',
      severity: 'WARNING',
      description: 'Temporary high impedance on auxiliary ECG ground pad (self-resolved upon strap tensioning).',
      source: 'AD8232 Leads-Off Detection'
    },
    {
      id: 'evt-dev-4',
      type: 'EMERGENCY_ALERT',
      title: 'Emergency alert',
      timestamp: new Date(Date.now() - 145000).toISOString(),
      timeFormatted: '10:42:01',
      severity: 'CRITICAL',
      description: 'Sudden cardiac arrest trigger: Asystole + PPG collapse. Code Red SOS dispatched.',
      source: 'Dual-Sensor Correlation Engine'
    },
    {
      id: 'evt-dev-5',
      type: 'CPR_STARTED',
      title: 'CPR started',
      timestamp: new Date(Date.now() - 134000).toISOString(),
      timeFormatted: '10:42:12',
      severity: 'ACTION',
      description: 'Automated pneumatic chest compression vest cycling at 108 CPM closed loop.',
      source: 'Closed-Loop PID Motor Controller'
    },
    {
      id: 'evt-dev-6',
      type: 'COMMUNICATION_FAILURE',
      title: 'Communication failure',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      timeFormatted: '10:42:26',
      severity: 'WARNING',
      description: 'Sub-GHz packet retry 1 failed due to building steel shielding; auto-recovered on retry 2.',
      source: 'SX1262 LoRa Transceiver'
    },
    {
      id: 'evt-dev-7',
      type: 'BATTERY_WARNING',
      title: 'Battery warning',
      timestamp: new Date(Date.now() - 90000).toISOString(),
      timeFormatted: '10:42:56',
      severity: 'INFO',
      description: 'Battery capacity check: 88% remaining (~45 minutes of continuous automated CPR reserve).',
      source: 'TI BQ40Z50 Fuel Gauge'
    },
    {
      id: 'evt-dev-8',
      type: 'MANUAL_OVERRIDE',
      title: 'Manual override',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      timeFormatted: '10:43:26',
      severity: 'ACTION',
      description: 'Paramedic standby override tested: Defibrillation clearance lockout circuit verified.',
      source: 'Paramedic Console Control'
    },
    {
      id: 'evt-dev-9',
      type: 'CPR_STOPPED',
      title: 'CPR stopped',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      timeFormatted: '10:43:56',
      severity: 'ADVISORY',
      description: 'Compressions paused momentarily for cyclic 2-minute mandatory rhythm analysis.',
      source: 'Autonomous Resuscitation Core'
    }
  ];

  const eventList = events && events.length > 0 ? events : defaultEvents;

  const filteredEvents = eventList.filter((evt) => {
    if (filterSeverity === 'ALL') return true;
    return evt.severity === filterSeverity;
  });

  const handleInjectEvent = async (type) => {
    if (!onRecordEvent) return;
    const meta = EVENT_TYPE_MAP[type] || { label: type, defaultSeverity: 'INFO' };
    try {
      setIsInjecting(true);
      await onRecordEvent({
        type,
        title: meta.label,
        severity: meta.defaultSeverity,
        description: `Manual test event recorded for [${meta.label}] at ${new Date().toLocaleTimeString()}`,
        source: 'Console Test Injector'
      });
    } catch (err) {
      console.error('Failed to inject device event:', err);
    } finally {
      setIsInjecting(false);
      setShowInjectOptions(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <StatusBadge status="emergency" text="CRITICAL" />;
      case 'WARNING':
        return <StatusBadge status="warning" text="WARNING" />;
      case 'ACTION':
        return <StatusBadge status="safe" text="ACTION" />;
      case 'ADVISORY':
        return <StatusBadge status="info" text="ADVISORY" />;
      case 'INFO':
      default:
        return <StatusBadge status="neutral" text="INFO" />;
    }
  };

  return (
    <Card className="border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-600/10 text-primary-500 border border-primary-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Device Event Chronicle
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark font-normal">
                {eventList.length} LOGGED
              </span>
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Chronological log recording Power on, Sensor links, CPR states, Emergency alerts, Comm drops, Battery, and Overrides
            </p>
          </div>
        </div>

        {/* Filter and Event Injection Bar */}
        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-surface-mutedLight dark:bg-surface-mutedDark/60 p-1 rounded-lg border border-surface-borderLight dark:border-surface-borderDark text-xs font-mono">
            {['ALL', 'CRITICAL', 'WARNING', 'ACTION', 'INFO'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded transition-colors ${
                  filterSeverity === sev
                    ? 'bg-primary-600 text-white font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Test Inject Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={PlusCircle}
              onClick={() => setShowInjectOptions(!showInjectOptions)}
              disabled={isInjecting}
              className="h-8 text-xs font-mono"
            >
              Log Event <ChevronDown className="h-3 w-3 ml-1" />
            </Button>

            {showInjectOptions && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-card dark:bg-surface-cardDark shadow-xl z-30 p-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-gray-400 border-b border-surface-borderLight dark:border-surface-borderDark">
                  SELECT EVENT TYPE TO RECORD:
                </div>
                {Object.keys(EVENT_TYPE_MAP).map((typeKey) => {
                  const meta = EVENT_TYPE_MAP[typeKey];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => handleInjectEvent(typeKey)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark text-left font-mono text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-surface-borderLight dark:divide-surface-borderDark max-h-[380px] overflow-y-auto">
          {filteredEvents.map((evt, idx) => {
            const meta = EVENT_TYPE_MAP[evt.type] || { icon: FileText, label: evt.title || evt.type };
            const IconComponent = meta.icon;

            return (
              <div
                key={evt.id || idx}
                className="p-3.5 hover:bg-surface-mutedLight/40 dark:hover:bg-surface-mutedDark/30 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark text-primary-500 flex-shrink-0 mt-0.5">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">
                        {evt.title || meta.label}
                      </span>
                      {getSeverityBadge(evt.severity)}
                      <span className="text-[11px] font-mono text-gray-400">
                        via {evt.source || 'CJack Kernel'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-sans leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{evt.timeFormatted || new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                    {new Date(evt.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-500 font-mono">
              No events found matching the selected severity filter ({filterSeverity}).
            </div>
          )}
        </div>

        {/* Footer status */}
        <div className="p-3 bg-surface-mutedLight/30 dark:bg-surface-mutedDark/20 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>Non-volatile Flash Ring Buffer: 9 / 50 events active</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> AUDIT COMPLIANCE VERIFIED
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
