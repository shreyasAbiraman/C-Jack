import React from 'react';
import { User, Heart, AlertCircle, Phone, Shield } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const PatientCard = ({
  patient = {
    id: 'CJ-PATIENT-8829',
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    bloodType: 'O Positive',
    conditions: ['Coronary Artery Disease', 'Hypertension'],
    allergies: ['Penicillin'],
    emergencyContact: {
      name: 'Sarah Doe (Spouse)',
      phone: '+91 98765 43210'
    },
    triageCategory: 'RED / IMMEDIATE'
  },
  status = 'NORMAL',
  className = ''
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-borderLight dark:border-surface-borderDark mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-cjack-primary/10 text-cjack-primary flex items-center justify-center font-bold">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {patient.name}
            </h3>
            <span className="text-[10px] font-mono text-gray-500">
              ID: {patient.id}
            </span>
          </div>
        </div>

        <StatusBadge status={status} size="sm" />
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-sans pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div>
          <span className="text-gray-500 text-[11px] block">Age / Gender</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {patient.age} Y / {patient.gender}
          </span>
        </div>

        <div>
          <span className="text-gray-500 text-[11px] block">Blood Type</span>
          <span className="font-semibold font-mono text-red-600 dark:text-red-400">
            {patient.bloodType}
          </span>
        </div>

        <div>
          <span className="text-gray-500 text-[11px] block">Known Conditions</span>
          <span className="font-medium text-gray-800 dark:text-gray-200 truncate block" title={patient.conditions?.join(', ')}>
            {patient.conditions?.join(', ') || 'None recorded'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 text-[11px] block">Critical Allergies</span>
          <span className="font-medium text-amber-600 dark:text-amber-400 truncate block">
            {patient.allergies?.join(', ') || 'No known allergies'}
          </span>
        </div>
      </div>

      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <div className="mt-3 flex items-center justify-between text-xs bg-surface-mutedLight/70 dark:bg-surface-mutedDark/60 p-2.5 rounded border border-surface-borderLight dark:border-surface-borderDark">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-cjack-accent shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {patient.emergencyContact.name}:
            </span>
          </div>
          <span className="font-mono font-bold text-gray-900 dark:text-white text-[11px]">
            {patient.emergencyContact.phone}
          </span>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
