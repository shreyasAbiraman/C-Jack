import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Cpu,
  HeartPulse,
  Activity,
  AlertOctagon,
  Navigation,
  Radio,
  Ambulance,
  Volume2,
  Sliders,
  FileText,
  Shield,
  Layers,
  FlaskConical,
  X
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../ui';

export const navItems = [
  { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patient', path: '/patient', icon: User },
  { name: 'CJack Device', path: '/device', icon: Cpu },
  { name: 'Vitals', path: '/vitals', icon: HeartPulse },
  { name: 'CPR Control Center', path: '/cpr', icon: Activity },
  { name: 'Emergency Response', path: '/emergency', icon: AlertOctagon, isEmergency: true },
  { name: 'Live Location', path: '/location', icon: Navigation },
  { name: 'Connectivity', path: '/connectivity', icon: Radio },
  { name: 'Ambulance / Responder', path: '/responder', icon: Ambulance },
  { name: 'Voice Guidance', path: '/voice', icon: Volume2 },
  { name: 'Device Settings', path: '/settings', icon: Sliders },
  { name: 'System Logs', path: '/logs', icon: FileText },
  { name: 'Simulation Engine', path: '/simulation', icon: FlaskConical, isSpecial: true },
  { name: 'Design System', path: '/design-system', icon: Layers, isSpecial: true },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { systemStatus } = useSystem();
  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active' || status === 'CRITICAL';

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-cjack-primary flex items-center justify-center text-white shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-gray-950 dark:text-white">
              CJack
            </span>
            <span className="text-[10px] block font-mono text-gray-500 uppercase tracking-wider">
              Smart First-Aid Vest
            </span>
          </div>
        </div>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Navigation Areas
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => mobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? item.isEmergency && isEmergency
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-cjack-primary text-white shadow-xs'
                  : item.isEmergency && isEmergency
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold animate-pulse'
                  : item.isSpecial
                  ? 'text-cjack-accent hover:bg-sky-50 dark:hover:bg-sky-950/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.name}</span>
            {item.isEmergency && isEmergency && (
              <span className="ml-auto h-2 w-2 rounded-full bg-red-600 animate-ping" />
            )}
            {item.isSpecial && (
              <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-sky-500/20 text-sky-600 dark:text-sky-300">
                UI KIT
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Hardware / Vest Quick Status Footer */}
      <div className="p-3 border-t border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <span className="text-gray-500">VEST:</span>
          <StatusBadge
            status={isEmergency ? 'CRITICAL' : 'NORMAL'}
            text={status}
            pulse={isEmergency}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>ESP32 HW NODE:</span>
          <span className="text-emerald-500 font-bold">ONLINE</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-surface-borderLight dark:border-surface-borderDark hidden md:flex flex-col shrink-0 z-10">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80%] bg-surface-light dark:bg-surface-dark z-50 flex flex-col shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
