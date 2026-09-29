const mongoose = require('mongoose');
const {
  Ambulance,
  Emergency,
  EmergencyDispatch,
  EmergencyAssignment,
} = require('../models');
const telephonyService = require('./telephonyService');
const { isConnected } = require('../config/database');

/**
 * In-memory fallback stores when MongoDB is disconnected or in test mode
 */
const inMemoryAmbulances = new Map();
const inMemoryDispatches = new Map();
const inMemoryAssignments = new Map();
const inMemoryEmergencies = new Map();
const assignmentLocks = new Set(); // Concurrency Mutex for in-memory race protection

class EmergencyDispatchService {
  constructor() {
    this.seedDefaultAmbulances().catch((err) =>
      console.error('[EmergencyDispatchService] Seed error:', err.message)
    );
  }

  /**
   * Seed 3 standard, realistic ambulance units if not already in DB
   */
  async seedDefaultAmbulances() {
    const defaultAmbulances = [
      {
        ambulanceId: 'AMB-01',
        name: 'City Emergency Ambulance 01',
        organization: 'Metro Central Emergency Services',
        responderName: 'Dr. Marcus Vance & Crew Alpha',
        primaryPhone: '+91 80 2200 0101',
        secondaryPhone: '+91 80 2200 0102',
        serviceArea: 'Central Emergency Sector 4',
        availability: 'AVAILABLE',
        currentStatus: 'AVAILABLE',
        priority: 1,
        isActiveResponder: true,
        location: {
          latitude: 12.9750,
          longitude: 77.5980,
          addressHint: 'MG Road Trauma Sub-Station',
          lastUpdated: new Date(),
        },
        notes: 'ALS Certified • High-Frequency Mechanical Defibrillator Equipped',
      },
      {
        ambulanceId: 'AMB-02',
        name: 'ABC Emergency Services 02',
        organization: 'Apex Critical Care Transport',
        responderName: 'Lead Paramedic Rajesh Sharma',
        primaryPhone: '+91 80 4100 0201',
        secondaryPhone: '+91 80 4100 0202',
        serviceArea: 'East Zone Sector 2',
        availability: 'AVAILABLE',
        currentStatus: 'AVAILABLE',
        priority: 2,
        isActiveResponder: true,
        location: {
          latitude: 12.9810,
          longitude: 77.6015,
          addressHint: 'Richmond Circle Hub, Sector 2',
          lastUpdated: new Date(),
        },
        notes: 'Mobile Intensive Care Unit (MICU) • Pediatric & Cardiac Specialists',
      },
      {
        ambulanceId: 'AMB-03',
        name: 'XYZ Medical Transport 03',
        organization: 'Lifeline Rapid Resuscitation Fleet',
        responderName: 'EMT Officer Priya Nair',
        primaryPhone: '+91 80 3300 0301',
        secondaryPhone: '+91 80 3300 0302',
        serviceArea: 'South-West Corridor',
        availability: 'AVAILABLE',
        currentStatus: 'AVAILABLE',
        priority: 3,
        isActiveResponder: true,
        location: {
          latitude: 12.9650,
          longitude: 77.5890,
          addressHint: 'Victoria Hospital Trauma Base',
          lastUpdated: new Date(),
        },
        notes: 'Rapid Response Unit • Dual-Pneumatic Thoracic Compression Support',
      },
    ];

    // Seed into in-memory fallback
    for (const amb of defaultAmbulances) {
      if (!inMemoryAmbulances.has(amb.ambulanceId)) {
        inMemoryAmbulances.set(amb.ambulanceId, { ...amb, _id: amb.ambulanceId, createdAt: new Date() });
      }
    }

    // Seed into MongoDB if connected
    if (isConnected()) {
      try {
        const count = await Ambulance.countDocuments();
        if (count === 0) {
          await Ambulance.insertMany(defaultAmbulances);
          console.log('[EmergencyDispatchService] Seeded 3 default ambulances into MongoDB.');
        }
      } catch (err) {
        console.warn('[EmergencyDispatchService] MongoDB ambulance seed warning:', err.message);
      }
    }
  }

  // ==========================================
  // AMBULANCE CONTACT MANAGEMENT METHODS
  // ==========================================

  async getAllAmbulances() {
    if (isConnected()) {
      try {
        const ambulances = await Ambulance.find().sort({ priority: 1, createdAt: 1 });
        if (ambulances && ambulances.length > 0) return ambulances;
      } catch (err) {
        console.warn('[EmergencyDispatchService] DB query failed, using in-memory ambulances:', err.message);
      }
    }
    return Array.from(inMemoryAmbulances.values()).sort((a, b) => a.priority - b.priority);
  }

  async getActiveEmergencyContacts() {
    const all = await this.getAllAmbulances();
    // Return max 3 active responders
    return all.filter((a) => a.isActiveResponder).slice(0, 3);
  }

  async createAmbulance(data) {
    const ambulanceId = data.ambulanceId || `AMB-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const ambulanceData = {
      ...data,
      ambulanceId,
      name: data.name || `Ambulance ${ambulanceId}`,
      primaryPhone: data.primaryPhone || data.phoneNumber || data.phone || '+91-98765-43210',
      responderName: data.responderName || data.driverName || 'EMT Paramedic',
      organization: data.organization || data.hospital || 'Emergency Medical Services',
      serviceArea: data.serviceArea || data.baseLocation || 'Central District (5km Radius)',
      availability: data.availability || 'AVAILABLE',
      currentStatus: 'AVAILABLE',
      priority: data.priority || 1,
      isActiveResponder: data.isActiveResponder !== undefined ? Boolean(data.isActiveResponder) : true,
      location: data.location || {
        latitude: 12.9716,
        longitude: 77.5946,
        addressHint: data.serviceArea || data.baseLocation || 'General Municipal Sector',
      },
    };

    if (isConnected()) {
      try {
        const created = await Ambulance.create(ambulanceData);
        inMemoryAmbulances.set(ambulanceId, created.toObject());
        return created;
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error creating ambulance in DB:', err.message);
      }
    }

    inMemoryAmbulances.set(ambulanceId, { ...ambulanceData, _id: ambulanceId, createdAt: new Date() });
    return inMemoryAmbulances.get(ambulanceId);
  }

  async updateAmbulance(id, updateData) {
    if (isConnected()) {
      try {
        const query = (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && id.length === 24)
          ? { $or: [{ _id: id }, { ambulanceId: id }] }
          : { ambulanceId: id };
        const updated = await Ambulance.findOneAndUpdate(
          query,
          { $set: updateData },
          { new: true }
        );
        if (updated) {
          inMemoryAmbulances.set(updated.ambulanceId, updated.toObject());
          return updated;
        }
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error updating ambulance in DB:', err.message);
      }
    }

    const existing = inMemoryAmbulances.get(id);
    if (existing) {
      const merged = { ...existing, ...updateData, updatedAt: new Date() };
      inMemoryAmbulances.set(id, merged);
      return merged;
    }
    return null;
  }

  async deleteAmbulance(id) {
    if (isConnected()) {
      try {
        const query = (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && id.length === 24)
          ? { $or: [{ _id: id }, { ambulanceId: id }] }
          : { ambulanceId: id };
        await Ambulance.findOneAndDelete(query);
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error deleting ambulance from DB:', err.message);
      }
    }
    inMemoryAmbulances.delete(id);
    return { success: true };
  }

  /**
   * Update the active 3 responders selection (enforces max 3 limit)
   */
  async updateActiveSelection(activeAmbulanceIds) {
    if (!Array.isArray(activeAmbulanceIds)) {
      throw new Error('activeAmbulanceIds must be an array of ambulance IDs');
    }
    if (activeAmbulanceIds.length > 3) {
      throw new Error('A maximum of 3 ambulance contacts can be selected as active emergency responders');
    }

    const allAmbulances = await this.getAllAmbulances();
    for (const amb of allAmbulances) {
      const isActive = activeAmbulanceIds.includes(amb.ambulanceId);
      await this.updateAmbulance(amb.ambulanceId, { isActiveResponder: isActive });
    }

    return await this.getActiveEmergencyContacts();
  }

  // ==========================================
  // HARDWARE SOS TRIGGER & DEDUPLICATED CALLING
  // ==========================================
  async handleSosTrigger(sosData) {
    if (!this.sosCooldownCache) {
      this.sosCooldownCache = new Map();
    }

    const cacheKey = sosData.eventId || `${sosData.deviceId}-${sosData.reason}`;
    const now = Date.now();

    // Deduplication & 30-second cooldown protection
    if (this.sosCooldownCache.has(cacheKey)) {
      const lastTrigger = this.sosCooldownCache.get(cacheKey);
      if (now - lastTrigger.timestamp < 30000) {
        console.log(`[EmergencyDispatchService] Duplicate SOS suppressed within 30s cooldown (${cacheKey})`);
        return {
          isDuplicate: true,
          callStatus: 'initiated',
          message: 'SOS trigger acknowledged (call already initiated within cooldown window)',
          eventId: cacheKey,
          callId: lastTrigger.callId,
        };
      }
    }

    console.log(`[EmergencyDispatchService] Processing SOS Trigger for Device ${sosData.deviceId}: HR=${sosData.heartRate}, SpO2=${sosData.spo2}`);

    // Trigger Telephony Voice Call
    const callResult = await telephonyService.initiateSosVoiceCall(sosData);

    // Save in cooldown cache
    this.sosCooldownCache.set(cacheKey, {
      timestamp: now,
      callId: callResult.callId,
      status: callResult.status || 'initiated',
    });

    // Clean old cache entries
    for (const [k, v] of this.sosCooldownCache.entries()) {
      if (now - v.timestamp > 60000) {
        this.sosCooldownCache.delete(k);
      }
    }

    return {
      success: true,
      callStatus: callResult.status || 'initiated',
      callId: callResult.callId,
      eventId: cacheKey,
      isSimulated: callResult.isSimulated || false,
      message: 'Automated emergency voice call initiated successfully',
    };
  }

  // ==========================================
  // EMERGENCY CALL & DISPATCH WORKFLOW METHODS
  // ==========================================

  /**
   * Check if there is already an active emergency call in progress
   * (Requirement 17: Duplicate Call Protection)
   */
  async getActiveEmergency() {
    const activeStatuses = [
      'CREATED',
      'DISPATCHING',
      'CALLING',
      'ACCEPTED',
      'ASSIGNED',
      'EN_ROUTE',
      'ARRIVED',
      'PATIENT_PICKED_UP',
      'HOSPITAL_REACHED',
    ];

    // Check assignments
    if (isConnected()) {
      try {
        const assignment = await EmergencyAssignment.findOne({
          assignmentStatus: { $in: activeStatuses },
        }).sort({ createdAt: -1 });

        if (assignment) {
          const dispatches = await EmergencyDispatch.find({ emergencyId: assignment.emergencyId });
          return {
            emergencyId: assignment.emergencyId,
            assignment,
            dispatches,
            status: assignment.assignmentStatus,
            isActive: true,
          };
        }
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error finding active assignment in DB:', err.message);
      }
    }

    // Check in-memory assignments
    for (const assignment of inMemoryAssignments.values()) {
      if (activeStatuses.includes(assignment.assignmentStatus)) {
        const dispatches = Array.from(inMemoryDispatches.values()).filter(
          (d) => d.emergencyId === assignment.emergencyId
        );
        return {
          emergencyId: assignment.emergencyId,
          assignment,
          dispatches,
          status: assignment.assignmentStatus,
          isActive: true,
        };
      }
    }

    // Check active dispatches without assignment yet
    for (const dispatch of inMemoryDispatches.values()) {
      if (['PENDING', 'RINGING'].includes(dispatch.callStatus)) {
        const dispatches = Array.from(inMemoryDispatches.values()).filter(
          (d) => d.emergencyId === dispatch.emergencyId
        );
        return {
          emergencyId: dispatch.emergencyId,
          assignment: null,
          dispatches,
          status: 'DISPATCHING',
          isActive: true,
        };
      }
    }

    return null;
  }

  /**
   * Create emergency call and immediately trigger dispatch to up to 3 active ambulances
   */
  async createAndDispatchEmergency(callData = {}) {
    // 1. DUPLICATE CALL PROTECTION (Requirement 17)
    const existingActive = await this.getActiveEmergency();
    if (existingActive) {
      return {
        isDuplicate: true,
        message: 'An emergency dispatch is already active.',
        activeEmergency: existingActive,
      };
    }

    const emergencyId = `EMG-${Date.now().toString(36).toUpperCase()}`;
    const timestampStr = new Date().toLocaleTimeString();

    // 2. Retrieve active available ambulance contacts (up to 3) (Requirement 4 & 5)
    const activeContacts = await this.getActiveEmergencyContacts();
    const availableAmbulances = activeContacts.filter(
      (a) => a.availability === 'AVAILABLE' && a.currentStatus === 'AVAILABLE'
    );

    if (availableAmbulances.length === 0) {
      throw new Error(
        'No available ambulance responders configured. Please set at least one active ambulance to AVAILABLE in Settings.'
      );
    }

    const patientLocation = callData.patientLocation || {
      latitude: 12.9716,
      longitude: 77.5946,
      addressHint: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)',
    };

    const initialTimeline = [
      {
        timestamp: new Date(),
        status: 'CREATED',
        message: `${timestampStr} Emergency created: automated first-aid dispatch request confirmed`,
        actor: 'CJack Dashboard Wearer / Bystander',
      },
      {
        timestamp: new Date(),
        status: 'DISPATCHING',
        message: `${timestampStr} Dispatch started: locating ${availableAmbulances.length} active emergency ambulance(s)`,
        actor: 'EmergencyDispatchService',
      },
    ];

    // Store in-memory emergency
    const emergencyRecord = {
      emergencyId,
      patientId: callData.patientId || 'CJ-PATIENT-8829',
      patientName: callData.patientName || 'Rajesh Kumar (Wearer)',
      status: 'DISPATCHING',
      vitals: callData.vitals || {
        heartRate: 0,
        spo2: 78,
        respirationRate: 0,
        bloodPressure: '60/40',
        bloodGroup: 'O+ POSITIVE',
        emergencySeverity: 'CRITICAL',
      },
      patientLocation,
      timeline: initialTimeline,
      createdAt: new Date(),
    };
    inMemoryEmergencies.set(emergencyId, emergencyRecord);

    if (isConnected()) {
      try {
        await Emergency.create({
          emergencyId,
          patientId: emergencyRecord.patientId,
          status: 'EMERGENCY ALERT SENT',
          alertLevel: 'CRITICAL',
          cardiacArrestDetected: true,
          gpsCoordinates: patientLocation,
          timeline: initialTimeline.map((t) => ({
            timestamp: t.timestamp,
            stage: t.status,
            title: t.status,
            description: t.message,
            severity: 'critical',
            source: t.actor,
          })),
        });
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error creating Emergency in DB:', err.message);
      }
    }

    // 3. Contact selected ambulance responders (Simultaneous Simulated Ringing)
    const dispatches = [];
    for (const amb of availableAmbulances) {
      const call = await telephonyService.initiateCall(amb, emergencyRecord);
      const dispatchRecord = {
        dispatchId: `DISP-${emergencyId}-${amb.ambulanceId}`,
        emergencyId,
        ambulanceId: amb.ambulanceId,
        ambulanceName: amb.name,
        responderName: amb.responderName,
        phoneNumber: amb.primaryPhone,
        callId: call.callId,
        callStatus: 'RINGING', // Ringing state
        dispatchedAt: new Date(),
        notes: 'Simulated simultaneous telephony call initiated',
      };

      inMemoryDispatches.set(dispatchRecord.dispatchId, dispatchRecord);
      if (isConnected()) {
        try {
          await EmergencyDispatch.create(dispatchRecord);
        } catch (err) {
          console.warn('[EmergencyDispatchService] Error saving dispatch in DB:', err.message);
        }
      }

      // Add timeline event
      const callTimeStr = new Date().toLocaleTimeString();
      initialTimeline.push({
        timestamp: new Date(),
        status: 'CALLING',
        message: `${callTimeStr} ${amb.name} called (${amb.primaryPhone}) — Ringing...`,
        actor: 'TelephonyService',
      });

      dispatches.push(dispatchRecord);
    }

    return {
      success: true,
      emergencyId,
      status: 'DISPATCHING',
      availableCount: availableAmbulances.length,
      dispatches,
      timeline: initialTimeline,
      emergencyRecord,
    };
  }

  /**
   * First-Responder Acceptance with Concurrency Protection (Requirement 8, 15, 16)
   * 
   * CRITICAL RACE CONDITION HANDLING:
   * Only the FIRST valid acceptance succeeds.
   * If another ambulance accepts simultaneously, returns 'Emergency already assigned to another responder.'
   */
  async acceptEmergency(emergencyId, ambulanceId) {
    const timestampStr = new Date().toLocaleTimeString();

    // 1. Concurrency Mutex Check (In-memory atomic lock)
    if (assignmentLocks.has(emergencyId)) {
      return {
        success: false,
        code: 'ALREADY_ASSIGNED',
        reason: 'EMERGENCY_ALREADY_ASSIGNED',
        message: 'Emergency already assigned to another responder.',
      };
    }

    // Acquire atomic mutex lock immediately
    assignmentLocks.add(emergencyId);

    try {
      // 2. Check if already assigned in database
      if (isConnected()) {
        const existingDBAssignment = await EmergencyAssignment.findOne({
          emergencyId,
          assignmentStatus: { $ne: 'CANCELLED' },
        });

        if (existingDBAssignment) {
          return {
            success: false,
            code: 'ALREADY_ASSIGNED',
            reason: 'EMERGENCY_ALREADY_ASSIGNED',
            message: `Emergency already assigned to ${existingDBAssignment.ambulanceName}.`,
            assignedAmbulance: existingDBAssignment.ambulanceName,
          };
        }
      }

      // Check if already assigned in memory
      const existingMemAssignment = inMemoryAssignments.get(emergencyId);
      if (existingMemAssignment && existingMemAssignment.assignmentStatus !== 'CANCELLED') {
        return {
          success: false,
          code: 'ALREADY_ASSIGNED',
          reason: 'EMERGENCY_ALREADY_ASSIGNED',
          message: `Emergency already assigned to ${existingMemAssignment.ambulanceName}.`,
          assignedAmbulance: existingMemAssignment.ambulanceName,
        };
      }

      // 3. Find target ambulance
      const ambulances = await this.getAllAmbulances();
      const winningAmbulance = ambulances.find((a) => a.ambulanceId === ambulanceId);

      if (!winningAmbulance) {
        return {
          success: false,
          code: 'AMBULANCE_NOT_FOUND',
          message: `Ambulance with ID ${ambulanceId} not found.`,
        };
      }

      // 4. Update the winning ambulance's dispatch record
      const winningDispatchId = `DISP-${emergencyId}-${ambulanceId}`;
      const winningDispatch = inMemoryDispatches.get(winningDispatchId);
      if (winningDispatch) {
        winningDispatch.callStatus = 'ACCEPTED';
        winningDispatch.acceptedAt = new Date();
      }

      if (isConnected()) {
        try {
          await EmergencyDispatch.findOneAndUpdate(
            { emergencyId, ambulanceId },
            { $set: { callStatus: 'ACCEPTED', acceptedAt: new Date() } }
          );
        } catch (err) {
          console.warn('[EmergencyDispatchService] Error updating winning dispatch in DB:', err.message);
        }
      }

      // 5. Cancel ALL OTHER ambulance dispatches (Requirement 5 & 6)
      const allDispatches = Array.from(inMemoryDispatches.values()).filter(
        (d) => d.emergencyId === emergencyId && d.ambulanceId !== ambulanceId
      );

      for (const otherDisp of allDispatches) {
        otherDisp.callStatus = 'CANCELLED';
        otherDisp.cancelledAt = new Date();
        otherDisp.notes = `Cancelled automatically: emergency claimed by ${winningAmbulance.name}`;
        await telephonyService.cancelCall(otherDisp.callId, 'ASSIGNED_TO_OTHER_RESPONDER');
      }

      if (isConnected()) {
        try {
          await EmergencyDispatch.updateMany(
            { emergencyId, ambulanceId: { $ne: ambulanceId } },
            {
              $set: {
                callStatus: 'CANCELLED',
                cancelledAt: new Date(),
                notes: `Cancelled automatically: emergency claimed by ${winningAmbulance.name}`,
              },
            }
          );
        } catch (err) {
          console.warn('[EmergencyDispatchService] Error cancelling other dispatches in DB:', err.message);
        }
      }

      // 6. Build Assignment Record (Requirement 9)
      const emergency = inMemoryEmergencies.get(emergencyId) || {};
      const timeline = emergency.timeline || [];

      timeline.push({
        timestamp: new Date(),
        status: 'ACCEPTED',
        message: `${timestampStr} ${winningAmbulance.name} accepted the emergency`,
        actor: winningAmbulance.responderName,
      });
      timeline.push({
        timestamp: new Date(),
        status: 'ASSIGNED',
        message: `${timestampStr} Patient assigned to ${winningAmbulance.name}`,
        actor: 'EmergencyDispatchService',
      });
      timeline.push({
        timestamp: new Date(),
        status: 'CANCELLED',
        message: `${timestampStr} Other responder calls cancelled`,
        actor: 'TelephonyService',
      });

      const assignmentData = {
        assignmentId: `ASGN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        emergencyId,
        patientId: emergency.patientId || 'CJ-PATIENT-8829',
        patientName: emergency.patientName || 'Rajesh Kumar (Wearer)',
        ambulanceId: winningAmbulance.ambulanceId,
        ambulanceName: winningAmbulance.name,
        responderId: winningAmbulance.ambulanceId,
        responderName: winningAmbulance.responderName,
        primaryPhone: winningAmbulance.primaryPhone,
        acceptedTimestamp: new Date(),
        patientLocation: emergency.patientLocation || {
          latitude: 12.9716,
          longitude: 77.5946,
          addressHint: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)',
        },
        ambulanceLocation: winningAmbulance.location || {
          latitude: 12.9810,
          longitude: 77.6015,
          addressHint: 'Richmond Circle Hub, Sector 2',
          lastUpdated: new Date(),
        },
        emergencyStatus: 'EMERGENCY ALERT SENT',
        cprStatus: 'CPR ACTIVE',
        currentVitals: emergency.vitals || {
          heartRate: 0,
          spo2: 78,
          respirationRate: 0,
          bloodPressure: '60/40',
          bloodGroup: 'O+ POSITIVE',
          emergencySeverity: 'CRITICAL',
        },
        assignmentStatus: 'ASSIGNED',
        distanceKm: 2.1,
        etaMinutes: 5,
        isSimulatedETA: true,
        timeline,
      };

      // Atomic DB write (unique constraint on emergencyId)
      if (isConnected()) {
        try {
          await EmergencyAssignment.create(assignmentData);
        } catch (err) {
          // If unique constraint triggers in DB:
          if (err.code === 11000) {
            return {
              success: false,
              code: 'ALREADY_ASSIGNED',
              reason: 'EMERGENCY_ALREADY_ASSIGNED',
              message: 'Emergency already assigned to another responder.',
            };
          }
          console.warn('[EmergencyDispatchService] Error creating EmergencyAssignment in DB:', err.message);
        }
      }

      inMemoryAssignments.set(emergencyId, assignmentData);

      // Update winning ambulance status to ASSIGNED
      await this.updateAmbulance(ambulanceId, { currentStatus: 'ASSIGNED' });

      return {
        success: true,
        message: `✓ Emergency Accepted by ${winningAmbulance.name}. Patient assigned.`,
        assignment: assignmentData,
      };
    } finally {
      // Release mutex lock
      assignmentLocks.delete(emergencyId);
    }
  }

  /**
   * First-Responder Rejection (Requirement 8)
   */
  async rejectEmergency(emergencyId, ambulanceId, reason = 'RESPONDER_BUSY') {
    const timestampStr = new Date().toLocaleTimeString();
    const winningDispatchId = `DISP-${emergencyId}-${ambulanceId}`;
    const dispatch = inMemoryDispatches.get(winningDispatchId);
    if (dispatch) {
      dispatch.callStatus = 'REJECTED';
      dispatch.rejectedAt = new Date();
      dispatch.notes = reason;
      await telephonyService.handleCallRejected(dispatch.callId, reason);
    }

    if (isConnected()) {
      try {
        await EmergencyDispatch.findOneAndUpdate(
          { emergencyId, ambulanceId },
          { $set: { callStatus: 'REJECTED', rejectedAt: new Date(), notes: reason } }
        );
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error rejecting dispatch in DB:', err.message);
      }
    }

    const emergency = inMemoryEmergencies.get(emergencyId);
    if (emergency && emergency.timeline) {
      emergency.timeline.push({
        timestamp: new Date(),
        status: 'REJECTED',
        message: `${timestampStr} Ambulance ${ambulanceId} declined emergency (${reason})`,
        actor: ambulanceId,
      });
    }

    return {
      success: true,
      message: `Emergency rejected by ambulance ${ambulanceId}`,
    };
  }

  /**
   * Cancel Emergency Dispatch (Requirement 18)
   */
  async cancelEmergency(emergencyId, reason = 'ACCIDENTAL_TRIGGER_RESOLVED') {
    const timestampStr = new Date().toLocaleTimeString();

    // 1. Cancel in-memory dispatches
    const activeDispatches = Array.from(inMemoryDispatches.values()).filter(
      (d) => d.emergencyId === emergencyId && ['PENDING', 'RINGING'].includes(d.callStatus)
    );

    for (const d of activeDispatches) {
      d.callStatus = 'CANCELLED';
      d.cancelledAt = new Date();
      await telephonyService.cancelCall(d.callId, 'EMERGENCY_DISPATCH_CANCELLED_BY_USER');
    }

    // 2. Mark assignment cancelled if present
    const assignment = inMemoryAssignments.get(emergencyId);
    if (assignment) {
      assignment.assignmentStatus = 'CANCELLED';
      assignment.cancelledAt = new Date();
      assignment.cancelReason = reason;
      assignment.timeline.push({
        timestamp: new Date(),
        status: 'CANCELLED',
        message: `${timestampStr} Emergency dispatch cancelled: ${reason}`,
        actor: 'CJack Operator / Wearer',
      });

      // Free ambulance
      await this.updateAmbulance(assignment.ambulanceId, { currentStatus: 'AVAILABLE' });
    }

    // 3. DB Updates
    if (isConnected()) {
      try {
        await EmergencyDispatch.updateMany(
          { emergencyId, callStatus: { $in: ['PENDING', 'RINGING'] } },
          { $set: { callStatus: 'CANCELLED', cancelledAt: new Date() } }
        );
        if (assignment) {
          await EmergencyAssignment.findOneAndUpdate(
            { emergencyId },
            { $set: { assignmentStatus: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason } }
          );
        }
      } catch (err) {
        console.warn('[EmergencyDispatchService] DB cancel error:', err.message);
      }
    }

    return {
      success: true,
      message: 'Emergency dispatch successfully cancelled. Responders notified.',
      emergencyId,
    };
  }

  /**
   * Reset all dispatch and assignment state for testing / re-initialization
   */
  async resetEmergency() {
    inMemoryAssignments.clear();
    inMemoryDispatches.clear();
    inMemoryEmergencies.clear();
    assignmentLocks.clear();

    if (isConnected()) {
      try {
        await Promise.all([
          EmergencyAssignment.updateMany({}, { $set: { assignmentStatus: 'CANCELLED' } }),
          EmergencyDispatch.updateMany({}, { $set: { callStatus: 'CANCELLED' } }),
        ]);
      } catch (err) {
        console.warn('[EmergencyDispatchService] DB reset notice:', err.message);
      }
    }
    await this.seedDefaultAmbulances().catch(() => null);
  }

  /**
   * Progress Assigned Responder Lifecycle (Requirement 9 & 20)
   * CREATED -> DISPATCHING -> CALLING -> ACCEPTED -> ASSIGNED -> EN_ROUTE -> ARRIVED -> PATIENT_PICKED_UP -> HOSPITAL_REACHED -> COMPLETED
   */
  async progressAssignmentStatus(emergencyId, nextStatus) {
    const timestampStr = new Date().toLocaleTimeString();
    const assignment = inMemoryAssignments.get(emergencyId);
    if (!assignment) {
      throw new Error(`No active assignment found for emergency ${emergencyId}`);
    }

    assignment.assignmentStatus = nextStatus;

    // Coordinate & ETA progression
    if (nextStatus === 'EN_ROUTE') {
      assignment.distanceKm = 1.4;
      assignment.etaMinutes = 3;
      assignment.ambulanceLocation = {
        latitude: 12.9735,
        longitude: 77.5965,
        addressHint: 'En route via Brigade Road (Sirens Active)',
        lastUpdated: new Date(),
      };
    } else if (nextStatus === 'ARRIVED') {
      assignment.distanceKm = 0.05;
      assignment.etaMinutes = 0;
      assignment.ambulanceLocation = {
        latitude: 12.9716,
        longitude: 77.5946,
        addressHint: 'On-scene: MG Road Cross (Patient reached)',
        lastUpdated: new Date(),
      };
    } else if (nextStatus === 'PATIENT_PICKED_UP') {
      assignment.distanceKm = 0.0;
      assignment.etaMinutes = 0;
      assignment.ambulanceLocation = {
        latitude: 12.9716,
        longitude: 77.5946,
        addressHint: 'Patient loaded onto stretcher into mobile ICU',
        lastUpdated: new Date(),
      };
    } else if (nextStatus === 'HOSPITAL_REACHED') {
      assignment.distanceKm = 4.2;
      assignment.etaMinutes = 0;
      assignment.ambulanceLocation = {
        latitude: 12.9602,
        longitude: 77.5912,
        addressHint: 'St. John Trauma Care Center — Handover in progress',
        lastUpdated: new Date(),
      };
    } else if (nextStatus === 'COMPLETED') {
      assignment.completedAt = new Date();
      await this.updateAmbulance(assignment.ambulanceId, { currentStatus: 'AVAILABLE' });
    }

    const messages = {
      EN_ROUTE: `${timestampStr} Ambulance en route (Sirens active, 1.4 km away)`,
      ARRIVED: `${timestampStr} Ambulance arrived on scene. Paramedics deploying resuscitation gear`,
      PATIENT_PICKED_UP: `${timestampStr} Patient secured in ambulance. Continuous ECG & pneumatic CPR active`,
      HOSPITAL_REACHED: `${timestampStr} Hospital reached. Emergency Department trauma bay handover`,
      COMPLETED: `${timestampStr} Emergency response completed successfully`,
    };

    if (messages[nextStatus]) {
      assignment.timeline.push({
        timestamp: new Date(),
        status: nextStatus,
        message: messages[nextStatus],
        actor: assignment.responderName,
      });
    }

    if (isConnected()) {
      try {
        await EmergencyAssignment.findOneAndUpdate(
          { emergencyId },
          {
            $set: {
              assignmentStatus: nextStatus,
              distanceKm: assignment.distanceKm,
              etaMinutes: assignment.etaMinutes,
              ambulanceLocation: assignment.ambulanceLocation,
              timeline: assignment.timeline,
              ...(nextStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
            },
          }
        );
      } catch (err) {
        console.warn('[EmergencyDispatchService] DB progress error:', err.message);
      }
    }

    return {
      success: true,
      assignment,
    };
  }

  /**
   * Emergency Call & Dispatch History with Timeline (Requirement 13)
   */
  async getEmergencyHistory() {
    if (isConnected()) {
      try {
        const assignments = await EmergencyAssignment.find().sort({ createdAt: -1 });
        if (assignments && assignments.length > 0) return assignments;
      } catch (err) {
        console.warn('[EmergencyDispatchService] Error reading history from DB:', err.message);
      }
    }
    return Array.from(inMemoryAssignments.values()).sort(
      (a, b) => new Date(b.createdAt || b.acceptedTimestamp) - new Date(a.createdAt || a.acceptedTimestamp)
    );
  }
}

module.exports = new EmergencyDispatchService();
