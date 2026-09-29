import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNavigation from './MobileNavigation';
import { SimulationDisclaimer, EmergencyBanner, ErrorBoundary } from '../ui';
import { useSystem } from '../../context/SystemContext';
import SimulationBanner from '../simulation/SimulationBanner';
import SimulationControlPanel from '../simulation/SimulationControlPanel';

export const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { systemStatus } = useSystem();
  const navigate = useNavigate();

  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active' || status === 'CRITICAL';

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-gray-900 dark:text-gray-100 antialiased selection:bg-cjack-primary selection:text-white">
      {/* Simulation Mode Ribbon — always top */}
      <SimulationBanner />

      {/* Simulation Disclaimer Ribbon (existing) */}
      <SimulationDisclaimer />

      {/* Critical Emergency Banner */}
      <EmergencyBanner
        active={isEmergency}
        title={status === 'CPR Active' ? 'AUTOMATED CPR ENGAGED' : 'CARDIAC ARREST DETECTED'}
        message={
          status === 'CPR Active'
            ? 'Vest pneumatic actuators cycling compressions at 108 CPM. Synchronized ambient air assistance operational.'
            : 'Loss of pulsatile flow and ventricular rhythm confirmed. Automated CPR armed.'
        }
        actionText="Open Emergency Console"
        onAction={() => navigate('/emergency')}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar onOpenMobileNav={() => setMobileOpen(true)} />

          <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-20 md:pb-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Emergency Navigation Dock (Sticky Bottom) */}
      <MobileNavigation onOpenDrawer={() => setMobileOpen(true)} />

      {/* Floating Simulation Control Panel (Ctrl+Shift+D) */}
      <SimulationControlPanel />
    </div>
  );
};

export default AppShell;

