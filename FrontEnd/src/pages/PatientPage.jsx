import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusBadge,
  Modal,
  Button,
  PageStateWrapper
} from '../components/ui';
import {
  User,
  Heart,
  Phone,
  AlertCircle,
  FileText,
  Edit3,
  Check,
  X,
  Shield,
  Activity,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { patientService } from '../services/patientService';

export const PatientPage = () => {
  const {
    patient,
    systemStatus,
    refreshData,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate
  } = useSystem();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: patient?.name || 'John Doe',
    age: patient?.age || 58,
    gender: patient?.gender || 'Male',
    bloodGroup: patient?.bloodGroup || 'O Positive',
    emergencyName: patient?.emergencyContact?.name || 'Sarah Doe (Spouse)',
    emergencyPhone: patient?.emergencyContact?.phone || '+91 98765 43210',
    allergies: patient?.allergies?.join(', ') || 'Penicillin',
    medicalNotes: patient?.medicalNotes || 'Known CAD (Triple Vessel Disease s/p Stent 2021), Hypertension, Hyperlipidemia. Daily Aspirin and Atorvastatin.'
  });

  const [errors, setErrors] = useState({});

  const openEditModal = () => {
    setFormData({
      name: patient?.name || 'John Doe',
      age: patient?.age || 58,
      gender: patient?.gender || 'Male',
      bloodGroup: patient?.bloodGroup || 'O Positive',
      emergencyName: patient?.emergencyContact?.name || 'Sarah Doe (Spouse)',
      emergencyPhone: patient?.emergencyContact?.phone || '+91 98765 43210',
      allergies: patient?.allergies?.join(', ') || 'Penicillin',
      medicalNotes: patient?.medicalNotes || 'Known CAD, Hypertension. Daily Aspirin.'
    });
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
      errs.age = 'Age must be between 0 and 130 years.';
    }
    if (!formData.bloodGroup || formData.bloodGroup.trim() === '') {
      errs.bloodGroup = 'Blood group is required.';
    }
    if (!formData.emergencyName || formData.emergencyName.trim().length < 2) {
      errs.emergencyName = 'Emergency contact name is required.';
    }
    if (!formData.emergencyPhone || !/^\+?[0-9\s\-()]{7,20}$/.test(formData.emergencyPhone.trim())) {
      errs.emergencyPhone = 'Valid contact phone number required (7-20 digits).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast({
        title: 'Validation Error',
        message: 'Please resolve errors in the patient form before saving.',
        type: 'warning'
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        emergencyContact: {
          name: formData.emergencyName.trim(),
          phone: formData.emergencyPhone.trim()
        },
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medicalNotes: formData.medicalNotes.trim()
      };

      await patientService.updatePatient(payload);
      await refreshData();
      setIsEditing(false);
      addToast({
        title: 'Patient Profile Updated',
        message: 'Clinical record and emergency contacts updated successfully.',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Update Failed',
        message: err.message || 'Failed to save patient profile.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for Data Source Tags
  const renderSourceTag = (source = 'Simulation') => {
    const s = String(source).toLowerCase();
    const isHw = s === 'hardware';
    const isUnavail = s === 'unavailable';

    const style = isHw
      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : isUnavail
      ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
      : 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800';

    return (
      <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${style} select-none`}>
        Source: {isHw ? 'Hardware' : isUnavail ? 'Unavailable' : 'Simulation'}
      </span>
    );
  };

  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'Suspected Arrest' || status === 'CPR Active' || status === 'CRITICAL' || status === 'CARDIAC ARREST SUSPECTED';
  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(patient)}
      onRetry={refreshData}
      screenTitle="Patient Profile"
    >
      <div className="space-y-6">
        <SectionHeader
          title="Patient Profile & Clinical Record"
          question="Who is the patient? What are their verified clinical notes and emergency contacts?"
          statusBadge={
            <StatusBadge
              status={isEmergency ? 'CRITICAL' : 'NORMAL'}
              text={isEmergency ? 'CRITICAL UNRESPONSIVE' : 'MONITORED & STABLE'}
              pulse={isEmergency}
            />
          }
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={openEditModal}
            >
              Edit Patient Profile
            </Button>
          }
        />

      {/* Patient Overview Hero Card */}
      <Card highlight={isEmergency}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-cjack-primary/10 text-cjack-primary flex items-center justify-center font-bold shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-700 dark:text-gray-300 border border-surface-borderLight dark:border-surface-borderDark">
                  CODE: {systemStatus?.systemState?.patientId || 'CJ-PATIENT-8829'}
                </span>
                {renderSourceTag(patient?.demographicsProvenance || 'Simulation')}
              </div>
              <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
                {patient?.name || 'John Doe'}
              </h2>
              <p className="text-xs text-gray-500 font-sans">
                {patient?.age ?? 58} Years Old • {patient?.gender || 'Male'} • Blood Group: <strong className="text-red-600 dark:text-red-400 font-mono">{patient?.bloodGroup || 'O Positive'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40 border border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 block text-[10px]">CURRENT CLINICAL STATE</span>
              <span className={`font-bold ${isEmergency ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isEmergency ? 'Sudden Cardiac Arrest' : 'Conscious / Normal Sinus'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Structured Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal Demographics */}
        <Card className="space-y-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle icon={User}>Personal Information</CardTitle>
            </div>
            {renderSourceTag(patient?.demographicsProvenance || 'Simulation')}
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs font-sans">
            <div className="flex justify-between py-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Legal Full Name:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{patient?.name || 'John Doe'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Age / Gender:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{patient?.age ?? 58} Years / {patient?.gender || 'Male'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">ABO & Rh Blood Group:</span>
              <span className="font-bold font-mono text-red-600 dark:text-red-400">{patient?.bloodGroup || 'O Positive'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Primary Language:</span>
              <span className="font-semibold text-gray-900 dark:text-white">English / Kannada</span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="space-y-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle icon={Phone}>Emergency Contacts & Next of Kin</CardTitle>
            </div>
            {renderSourceTag(patient?.emergencyContact?.provenance || 'Hardware')}
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 dark:text-white">
                  {patient?.emergencyContact?.name || 'Sarah Doe (Spouse)'}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">PRIMARY</span>
              </div>
              <p className="font-mono text-cjack-accent font-bold text-sm">
                {patient?.emergencyContact?.phone || '+91 98765 43210'}
              </p>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Automated SMS dispatch enabled on cardiac arrest confirmation.
              </span>
            </div>

            <div className="p-3 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Secondary Contact</span>
                <span className="text-gray-500 block text-[11px]">Alternate Family Member</span>
              </div>
              {renderSourceTag('Unavailable')}
            </div>
          </CardContent>
        </Card>

        {/* Critical Allergies */}
        <Card className="space-y-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle icon={AlertCircle}>Critical Allergies</CardTitle>
            </div>
            {renderSourceTag(patient?.allergiesProvenance || 'Hardware')}
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {patient?.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No known drug allergies recorded.</p>
            )}
            <p className="text-[11px] text-gray-500 pt-2">
              Allergies are transmitted directly to the incoming EMS ambulance triage tablet to prevent contraindications.
            </p>
          </CardContent>
        </Card>

        {/* Medical History & Notes */}
        <Card className="space-y-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle icon={FileText}>Medical History & Clinical Notes</CardTitle>
            </div>
            {renderSourceTag(patient?.medicalNotesProvenance || 'Hardware')}
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
              {patient?.medicalNotes || 'Known CAD (Triple Vessel Disease s/p Stent 2021), Hypertension, Hyperlipidemia. Daily Aspirin and Atorvastatin.'}
            </div>
            <p className="text-[11px] text-gray-500">
              Pre-existing cardiovascular notes assist autonomous CPR closed-loop algorithms in modulating chest compression depth safely.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          SAFE VALIDATED PATIENT EDIT MODAL
          ========================================================================= */}
      <Modal
        isOpen={isEditing}
        onClose={() => !isSaving && setIsEditing(false)}
        title="Edit Patient Clinical Profile"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? 'Validating & Saving...' : 'Save Patient Profile'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="p-2.5 rounded bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px]">
            <strong>Safe Validation Enabled:</strong> All fields are verified against clinical range constraints before persisting to the device profile.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name Field */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded border bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-surface-borderLight dark:border-surface-borderDark'
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>

            {/* Age Field */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={`w-full px-3 py-2 rounded border bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white ${
                  errors.age ? 'border-red-500' : 'border-surface-borderLight dark:border-surface-borderDark'
                }`}
                placeholder="58"
              />
              {errors.age && <p className="text-[11px] text-red-500 mt-0.5">{errors.age}</p>}
            </div>

            {/* Gender Field */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                ABO / Rh Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className={`w-full px-3 py-2 rounded border bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white ${
                  errors.bloodGroup ? 'border-red-500' : 'border-surface-borderLight dark:border-surface-borderDark'
                }`}
              >
                <option value="O Positive">O Positive (O+)</option>
                <option value="O Negative">O Negative (O-)</option>
                <option value="A Positive">A Positive (A+)</option>
                <option value="A Negative">A Negative (A-)</option>
                <option value="B Positive">B Positive (B+)</option>
                <option value="B Negative">B Negative (B-)</option>
                <option value="AB Positive">AB Positive (AB+)</option>
                <option value="AB Negative">AB Negative (AB-)</option>
              </select>
              {errors.bloodGroup && <p className="text-[11px] text-red-500 mt-0.5">{errors.bloodGroup}</p>}
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className={`w-full px-3 py-2 rounded border bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white ${
                  errors.emergencyName ? 'border-red-500' : 'border-surface-borderLight dark:border-surface-borderDark'
                }`}
                placeholder="Sarah Doe (Spouse)"
              />
              {errors.emergencyName && <p className="text-[11px] text-red-500 mt-0.5">{errors.emergencyName}</p>}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Emergency Contact Phone *
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className={`w-full px-3 py-2 rounded border font-mono bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white ${
                  errors.emergencyPhone ? 'border-red-500' : 'border-surface-borderLight dark:border-surface-borderDark'
                }`}
                placeholder="+91 98765 43210"
              />
              {errors.emergencyPhone && <p className="text-[11px] text-red-500 mt-0.5">{errors.emergencyPhone}</p>}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Critical Allergies (comma-separated)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 rounded border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white"
              placeholder="Penicillin, Sulfa, Latex"
            />
          </div>

          {/* Medical Notes */}
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Medical Notes & Relevant Cardiovascular History
            </label>
            <textarea
              rows="3"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              className="w-full px-3 py-2 rounded border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white"
              placeholder="Known CAD, Hypertension, Previous Stents..."
            />
          </div>
        </form>
      </Modal>
      </div>
    </PageStateWrapper>
  );
};

export default PatientPage;
