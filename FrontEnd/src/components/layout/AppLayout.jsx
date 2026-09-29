import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SimulationDisclaimer, EmergencyBanner } from '../ui';
import { useSystem } from '../../context/SystemContext';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { systemStatus } = useSystem();
  const navigate = useNavigate();

  const status = systemStatus?.systemState?.status || 'Normal';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active';

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-gray-900 dark:text-gray-100 antialiased selection:bg-cjack-primary selection:text-white">
      {/* Simulation Disclaimer Ribbon */}
      <SimulationDisclaimer />

      {/* Critical Emergency Banner (visible when arrest or active CPR) */}
      <EmergencyBanner
        active={isEmergency}
        message={
          status === 'CPR Active'
            ? 'ACTIVE CPR SEQUENCE IN PROGRESS — MOTORIZED AIR COMPRESSION ENGAGED'
            : 'SUSPECTED CARDIAC ARREST DETECTED — MULTI-SENSOR VERIFICATION ACTIVE'
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
          <Header setMobileOpen={setMobileOpen} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
