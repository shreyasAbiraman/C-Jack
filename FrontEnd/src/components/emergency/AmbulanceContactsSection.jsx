import React, { useState } from 'react';
import { useEmergencyDispatch } from '../../context/EmergencyDispatchContext';
import { Plus, Trash2, Shield, Phone, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AmbulanceContactsSection = () => {
  const { 
    ambulances, 
    activeResponders,
    saveAmbulanceSelection, 
    createAmbulance, 
    deleteAmbulance 
  } = useEmergencyDispatch();
  const { addToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ALS',
    phoneNumber: '',
    baseLocation: '',
    driverName: ''
  });

  const handleToggleActive = async (ambulanceId) => {
    let newSelection;
    if (activeResponders.some(r => r._id === ambulanceId || r.ambulanceId === ambulanceId)) {
      newSelection = activeResponders.filter(r => r._id !== ambulanceId && r.ambulanceId !== ambulanceId).map(a => a._id || a.ambulanceId);
    } else {
      newSelection = [...activeResponders.map(a => a._id || a.ambulanceId), ambulanceId];
    }
    await saveAmbulanceSelection(newSelection);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber) {
      addToast('WARNING', 'Name and Phone Number are required.');
      return;
    }
    
    await createAmbulance(formData);
    setShowAddForm(false);
    setFormData({ name: '', type: 'ALS', phoneNumber: '', baseLocation: '', driverName: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this ambulance contact?')) {
      await deleteAmbulance(id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Ambulance Dispatch Network
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Configure responders who will be notified during an emergency call.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cjack-primary hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Unit</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 mb-6 space-y-4">
          <h3 className="text-white font-bold mb-2">Register New Ambulance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Unit Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cjack-primary"
                placeholder="e.g. Apollo ALS-01"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cjack-primary"
              >
                <option value="ALS">ALS (Advanced Life Support)</option>
                <option value="BLS">BLS (Basic Life Support)</option>
                <option value="MICU">MICU (Mobile ICU)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Phone Number (Required)</label>
              <input 
                type="tel" 
                required
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cjack-primary"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Base Location</label>
              <input 
                type="text" 
                value={formData.baseLocation}
                onChange={e => setFormData({...formData, baseLocation: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cjack-primary"
                placeholder="Hospital Name / Area"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg font-semibold text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {ambulances.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-slate-800">
            <p className="text-slate-400">No ambulance units registered.</p>
          </div>
        ) : (
          ambulances.map((amb) => {
            const isActive = activeResponders.some(r => r._id === amb._id || r.ambulanceId === amb.ambulanceId || (amb.phoneNumber && r.phoneNumber === amb.phoneNumber));
            return (
              <div 
                key={amb._id || amb.ambulanceId} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors
                  ${isActive 
                    ? 'bg-slate-800 border-cjack-primary' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    type="button"
                    onClick={() => handleToggleActive(amb._id || amb.ambulanceId)}
                    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-colors
                      ${isActive ? 'bg-cjack-primary text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]' : 'bg-slate-700 text-slate-400'}`}
                  >
                    {isActive ? <CheckCircle2 className="w-6 h-6" /> : <Truck className="w-5 h-5" />}
                  </button>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2 flex-wrap">
                      {amb.name}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {amb.type || 'ALS'}
                      </span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400 shrink-0" /> {amb.phoneNumber || amb.primaryPhone || 'N/A'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-400 shrink-0" /> {amb.baseLocation || amb.serviceArea || amb.organization || 'Emergency Sector'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                  <span className={`text-[10px] font-mono uppercase font-bold ${isActive ? 'text-cjack-primary' : 'text-slate-500'}`}>
                    {isActive ? 'ACTIVE FOR DISPATCH' : 'INACTIVE'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleDelete(amb._id || amb.ambulanceId)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Ambulance"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AmbulanceContactsSection;
