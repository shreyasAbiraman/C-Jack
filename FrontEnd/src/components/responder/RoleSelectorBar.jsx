import React from 'react';
import { useRole, CJACK_ROLES } from '../../context/RoleContext';
import { Users, Shield, CheckCircle2 } from 'lucide-react';

/**
 * RoleSelectorBar
 * 
 * Reusable role switcher providing multi-role support without code duplication:
 * - Rider/Patient
 * - Responder
 * - Ambulance
 * - Hospital
 * - Administrator
 */
export const RoleSelectorBar = () => {
  const { activeRoleKey, activeRole, roles, setRole } = useRole();

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Active Stakeholder Role View:
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
            {activeRole.badge}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Unified Multi-Role Architecture (Zero Code Duplication)
        </span>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {Object.values(roles).map((r) => {
          const Icon = r.icon;
          const isSelected = r.id === activeRoleKey;

          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`p-2 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-sm ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`p-1 rounded ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>

              <div>
                <div className={`text-xs font-bold font-mono tracking-tight ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}>
                  {r.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                  {r.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Role Capabilities Strip */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <span className="text-slate-400">
          Role Focus: <strong className="text-slate-200">{activeRole.description}</strong>
        </span>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Shield className="w-3 h-3 text-cyan-400" />
          <span>Capabilities: {Object.keys(activeRole.capabilities).filter(k => activeRole.capabilities[k]).join(' • ')}</span>
        </div>
      </div>
    </div>
  );
};
