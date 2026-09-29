const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age cannot exceed 130'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      trim: true,
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      relationship: { type: String, default: 'Emergency Contact' },
      provenance: { type: String, default: 'REAL' },
    },
    allergies: {
      type: [String],
      default: [],
    },
    allergiesProvenance: {
      type: String,
      default: 'REAL',
    },
    medicalNotes: {
      type: String,
      default: '',
    },
    medicalNotesProvenance: {
      type: String,
      default: 'REAL',
    },
    assignedDeviceId: {
      type: String,
      default: null,
      ref: 'Device',
    },
    isSimulated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
