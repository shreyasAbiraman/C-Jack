import React from 'react';
import { NavLink } from 'react-router-dom';
import { AlertOctagon, HeartPulse, Activity, Navigation, Radio, Menu } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

/**
 * MobileNavigation Component
 * Strictly prioritizes mobile emergency flows:
 * 1. Emergency state
 * 2. Patient vitals
 * 3. CPR status
 * 4. Location
 * 5. Emergency communication
 */
export const MobileNavigation = ({ onOpenDrawer }) => {
  const { systemStatus } = useSystem();
  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active';

  const mobileLinks = [
    { name: 'Emergency', path: '/emergency', icon: AlertOctagon, isCritical: true },
    { name: 'Vitals', path: '/vitals', icon: HeartPulse },
    { name: 'CPR', path: '/cpr', icon: Activity },
    { name: 'Location', path: '/location', icon: Navigation },
    { name: 'LoRa/IoT', path: '/connectivity', icon: Radio },
  ];

  return (
    <nav
      aria-label="Mobile Emergency Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-light dark:bg-surface-dark border-t border-surface-borderLight dark:border-surface-borderDark px-2 py-1 flex items-center justify-around shadow-lg"
    >
      {mobileLinks.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-2 rounded text-[10px] font-mono font-bold transition-all relative ${
              isActive
                ? item.isCritical && isEmergency
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                  : 'text-cjack-primary dark:text-sky-400 bg-cjack-primary/10'
                : item.isCritical && isEmergency
                ? 'text-red-600 animate-pulse font-extrabold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0 mb-0.5" />
          <span>{item.name}</span>
          {item.isCritical && isEmergency && (
            <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
          )}
        </NavLink>
      ))}

      {/* More / Menu button */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center py-1.5 px-2 rounded text-[10px] font-mono font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        aria-label="Open Full Navigation Menu"
      >
        <Menu className="h-4 w-4 shrink-0 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default MobileNavigation;
