import { CheckCircle2, AlertTriangle, AlertOctagon, WifiOff, HelpCircle, Activity } from 'lucide-react';

/**
 * CJack Canonical Semantic Status Definitions
 * 
 * Clinical Rule: Never rely on color alone.
 * Every semantic state includes:
 *   1. Icon
 *   2. Label (Uppercase)
 *   3. Color Tokens
 *   4. Text Explanation
 */
export const SEMANTIC_STATUS = {
  NORMAL: {
    key: 'NORMAL',
    label: 'NORMAL',
    defaultText: 'Nominal — Patient Safe & Within Clinical Range',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/40',
    ariaLabel: 'Status: Normal. All vitals and hardware within safe thresholds.'
  },
  WARNING: {
    key: 'WARNING',
    label: 'WARNING',
    defaultText: 'Warning — Parameter Approaching Threshold Limits',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-500/50',
    ariaLabel: 'Status: Warning. Requires observation or parameter check.'
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'CRITICAL',
    defaultText: 'Critical — Emergency Arrest or Failure Condition',
    icon: AlertOctagon,
    badgeClass: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    textClass: 'text-red-600 dark:text-red-400',
    dotClass: 'bg-red-500 animate-pulse',
    borderClass: 'border-red-500 shadow-md shadow-red-500/10',
    ariaLabel: 'Status: Critical emergency. Immediate intervention required.'
  },
  OFFLINE: {
    key: 'OFFLINE',
    label: 'OFFLINE',
    defaultText: 'Offline — Hardware Disconnected or No Signal',
    icon: WifiOff,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
    textClass: 'text-slate-500 dark:text-slate-400',
    dotClass: 'bg-slate-400',
    borderClass: 'border-slate-400/40',
    ariaLabel: 'Status: Offline. Hardware or telemetry link unavailable.'
  },
  UNKNOWN: {
    key: 'UNKNOWN',
    label: 'UNKNOWN',
    defaultText: 'Unknown — Uncalibrated Sensor or Inconclusive',
    icon: HelpCircle,
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    textClass: 'text-purple-600 dark:text-purple-400',
    dotClass: 'bg-purple-500',
    borderClass: 'border-purple-500/40',
    ariaLabel: 'Status: Unknown. Sensor requires initialization or calibration.'
  },
  SIMULATED: {
    key: 'SIMULATED',
    label: 'SIMULATED',
    defaultText: 'Synthetic Research Data — Non-Clinical Prototype',
    icon: Activity,
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    textClass: 'text-sky-600 dark:text-sky-400',
    dotClass: 'bg-sky-500',
    borderClass: 'border-sky-500/40',
    ariaLabel: 'Status: Simulated. Software-generated data for testing.'
  }
};

/**
 * Normalizes input status strings (e.g. 'safe', 'emergency', 'CRITICAL') to canonical keys
 */
export function normalizeStatus(status) {
  if (!status) return SEMANTIC_STATUS.NORMAL;
  const upper = String(status).toUpperCase();
  if (upper === 'SAFE' || upper === 'OK' || upper === 'NORMAL') return SEMANTIC_STATUS.NORMAL;
  if (upper === 'WARN' || upper === 'WARNING' || upper === 'ATTENTION') return SEMANTIC_STATUS.WARNING;
  if (upper === 'EMERGENCY' || upper === 'CRITICAL' || upper === 'ALERT' || upper === 'SUSPECTED ARREST' || upper === 'CPR ACTIVE') return SEMANTIC_STATUS.CRITICAL;
  if (upper === 'OFFLINE' || upper === 'DISCONNECTED') return SEMANTIC_STATUS.OFFLINE;
  if (upper === 'UNKNOWN' || upper === 'UNCALIBRATED') return SEMANTIC_STATUS.UNKNOWN;
  if (upper === 'SIMULATED' || upper === 'PROTOTYPE') return SEMANTIC_STATUS.SIMULATED;
  return SEMANTIC_STATUS[upper] || SEMANTIC_STATUS.NORMAL;
}
