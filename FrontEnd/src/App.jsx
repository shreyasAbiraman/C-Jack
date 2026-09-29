import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SystemProvider } from './context/SystemContext';
import { ToastProvider } from './context/ToastContext';
import { RoleProvider } from './context/RoleContext';
import { VoiceProvider } from './context/VoiceContext';
import { SimulationProvider } from './simulation/SimulationContext';
import { EmergencyDispatchProvider } from './context/EmergencyDispatchContext';
import AppShell from './components/layout/AppShell';

// 12 Major Application Areas + Design System Showcase + Simulation Engine
import DashboardPage from './pages/DashboardPage';
import PatientPage from './pages/PatientPage';
import DevicePage from './pages/DevicePage';
import VitalsPage from './pages/VitalsPage';
import CprMonitorPage from './pages/CprMonitorPage';
import EmergencyPage from './pages/EmergencyPage';
import LocationPage from './pages/LocationPage';
import ConnectivityPage from './pages/ConnectivityPage';
import ResponderPage from './pages/ResponderPage';
import VoiceGuidancePage from './pages/VoiceGuidancePage';
import SettingsPage from './pages/SettingsPage';
import LogsPage from './pages/LogsPage';
import SimulationPage from './pages/SimulationPage';
import DesignSystemShowcasePage from './pages/DesignSystemShowcasePage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SystemProvider>
          <EmergencyDispatchProvider>
            <SimulationProvider>
              <RoleProvider>
                <VoiceProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<AppShell />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="patient" element={<PatientPage />} />
                        <Route path="device" element={<DevicePage />} />
                        <Route path="vitals" element={<VitalsPage />} />
                        <Route path="cpr" element={<CprMonitorPage />} />
                        <Route path="emergency" element={<EmergencyPage />} />
                        <Route path="location" element={<LocationPage />} />
                        <Route path="connectivity" element={<ConnectivityPage />} />
                        <Route path="responder" element={<ResponderPage />} />
                        <Route path="voice" element={<VoiceGuidancePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="logs" element={<LogsPage />} />
                        <Route path="simulation" element={<SimulationPage />} />
                        <Route path="design-system" element={<DesignSystemShowcasePage />} />
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </VoiceProvider>
              </RoleProvider>
            </SimulationProvider>
          </EmergencyDispatchProvider>
        </SystemProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

