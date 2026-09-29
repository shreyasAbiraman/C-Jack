/**
 * Connectivity Service for CJack
 * 
 * Manages:
 * 1. Telemetry Dashboard Data (GPS, LoRa, Gateway, Signal, Backend, Packet Info)
 * 2. Structured Communication Packet Ingestion & Storage:
 *    { deviceId, timestamp, emergencyStatus, latitude, longitude, heartRate, spo2, cprStatus, battery, sensorStatus }
 * 3. Offline Queue Simulation (Packet generated -> Network unavailable -> Packet queued -> Network restored -> Packet transmitted)
 * 4. Multi-State Network Diagnostic Matrix:
 *    - Device connected
 *    - LoRa available
 *    - Gateway reachable
 *    - Backend reachable
 *    - Internet unavailable
 */

class ConnectivityService {
  constructor() {
    // 1. GNSS / GPS Telemetry
    this.gps = {
      status: '3D GNSS LOCK (OPTIMAL)',
      locked: true,
      latitude: 12.9716,
      longitude: 77.5946,
      altitudeMeters: 920,
      accuracyMeters: 2.8,
      satellites: 11,
      hdop: 0.9,
      vdop: 1.2,
      fixType: '3D Multi-Constellation Fix (GPS+GLONASS)',
      receiverModel: 'u-blox NEO-6M / NEO-M8N',
      antennaStatus: 'Active Patch Antenna OK',
      isSimulated: true
    };

    // 2. LoRa Telemetry & Gateway Status
    this.lora = {
      status: 'ACTIVE_TRANSMITTING',
      transceiver: 'Semtech SX1262 Sub-GHz Transceiver',
      frequency: '868.1 MHz (EU/IN Band)',
      spreadingFactor: 'SF7',
      bandwidthKhz: 125,
      codingRate: '4/5',
      txPowerDbm: 14,
      gateway: {
        id: 'GW-BLR-041',
        name: 'Bengaluru Central Emergency Gateway #41',
        status: 'ONLINE_REACHABLE',
        latitude: 12.9750,
        longitude: 77.5990,
        distanceKm: 0.62,
        lastAckReceivedAt: new Date().toISOString(),
        coverageRadiusKm: 5.0
      },
      signal: {
        rssi: -72,
        snr: 9.5,
        packetLossRate: '0.2%',
        perQuality: 'OPTIMAL (High SNR Margin)'
      }
    };

    // 3. Multi-State Technical Diagnostic Layers
    this.networkStates = {
      deviceConnected: true,       // Hardware bus (USB/I2C/UART) between host and CJack vest
      loraAvailable: true,         // On-board SX1262 initialized & transmitting carrier
      gatewayReachable: true,      // Line-of-sight LoRaWAN gateway receiving uplinks
      backendReachable: true,      // Municipal gateway forwarding packets to CJack Express API
      internetUnavailable: false   // True when local mesh is active but cloud WAN is severed
    };

    // 4. Communication Packets Store (Structured Data Model)
    this.packets = [];
    this._initializeDefaultPackets();

    // 5. Offline Queue Simulation State
    this.offlineQueue = {
      currentStep: 'PACKET_GENERATED', // 'PACKET_GENERATED', 'NETWORK_UNAVAILABLE', 'PACKET_QUEUED', 'NETWORK_RESTORED', 'PACKET_TRANSMITTED'
      stepIndex: 0,
      steps: [
        { id: 'PACKET_GENERATED', label: 'Packet generated', desc: 'Emergency telemetry payload assembled in vest memory buffer' },
        { id: 'NETWORK_UNAVAILABLE', label: 'Network unavailable', desc: 'LoRa / Cellular carrier fade or RF attenuation blackout detected' },
        { id: 'PACKET_QUEUED', label: 'Packet queued', desc: 'Payload stored in non-volatile flash memory offline ring buffer' },
        { id: 'NETWORK_RESTORED', label: 'Network restored', desc: 'Sub-GHz gateway carrier re-acquired; uplink handshake established' },
        { id: 'PACKET_TRANSMITTED', label: 'Packet transmitted', desc: 'Buffered packets burst-transmitted and cryptographically acknowledged' }
      ],
      bufferedPackets: [],
      queueCount: 0,
      maxBufferCapacity: 256,
      lastFlushTime: null
    };

    // 6. Backend Connectivity Status
    this.backend = {
      status: 'ONLINE',
      pollingCadenceSec: 3,
      latencyMs: 14,
      serverVersion: 'v1.0.0-prototype',
      lastPingTimestamp: new Date().toISOString()
    };
  }

  _initializeDefaultPackets() {
    const baseTime = Date.now();
    const samplePackets = [
      {
        deviceId: 'CJACK-UNIT-TX104',
        timestamp: new Date(baseTime - 9000).toISOString(),
        emergencyStatus: 'NORMAL',
        latitude: 12.9716,
        longitude: 77.5946,
        heartRate: 74,
        spo2: 98,
        cprStatus: 'INACTIVE',
        battery: 88,
        sensorStatus: 'NOMINAL',
        packetId: 'PKT-9481',
        sizeBytes: 64,
        digest: '0xA4F2B819'
      },
      {
        deviceId: 'CJACK-UNIT-TX104',
        timestamp: new Date(baseTime - 6000).toISOString(),
        emergencyStatus: 'SUSPECTED_ARREST',
        latitude: 12.9716,
        longitude: 77.5946,
        heartRate: 0,
        spo2: 78,
        cprStatus: 'CONFIRMING',
        battery: 88,
        sensorStatus: 'NOMINAL',
        packetId: 'PKT-9482',
        sizeBytes: 64,
        digest: '0xC918D34E'
      },
      {
        deviceId: 'CJACK-UNIT-TX104',
        timestamp: new Date(baseTime - 2000).toISOString(),
        emergencyStatus: 'CPR_ACTIVE',
        latitude: 12.9716,
        longitude: 77.5946,
        heartRate: 108,
        spo2: 86,
        cprStatus: 'ACTIVE_CLOSED_LOOP',
        battery: 87,
        sensorStatus: 'NOMINAL',
        packetId: 'PKT-9483',
        sizeBytes: 64,
        digest: '0xFE88102A'
      }
    ];
    this.packets = samplePackets;
  }

  getStatus() {
    const latestPacket = this.packets[0] || null;

    return {
      success: true,
      gps: this.gps,
      lora: this.lora,
      networkStates: this.networkStates,
      offlineQueue: this.offlineQueue,
      backend: {
        ...this.backend,
        lastPingTimestamp: new Date().toISOString()
      },
      lastPacket: latestPacket ? {
        packetId: latestPacket.packetId || 'PKT-9483',
        timestamp: latestPacket.timestamp,
        sizeBytes: latestPacket.sizeBytes || 64,
        digest: latestPacket.digest || '0xFE88102A',
        data: latestPacket
      } : null,
      responder: {
        callsign: 'ALS-MED-04',
        latitude: 12.9810,
        longitude: 77.6015,
        distanceKm: 1.8,
        etaMinutes: 4,
        speedKmh: 48
      },
      timestamp: new Date().toISOString()
    };
  }

  ingestPacket(packet) {
    if (!packet || typeof packet !== 'object') {
      throw new Error('Invalid communication packet: Payload must be a JSON object.');
    }

    // Required schema verification:
    // { deviceId, timestamp, emergencyStatus, latitude, longitude, heartRate, spo2, cprStatus, battery, sensorStatus }
    const requiredKeys = [
      'deviceId',
      'emergencyStatus',
      'latitude',
      'longitude',
      'heartRate',
      'spo2',
      'cprStatus',
      'battery',
      'sensorStatus'
    ];

    for (const key of requiredKeys) {
      if (packet[key] === undefined || packet[key] === null) {
        throw new Error(`Invalid communication packet: Missing required property '${key}'.`);
      }
    }

    const newPacket = {
      deviceId: String(packet.deviceId),
      timestamp: packet.timestamp || new Date().toISOString(),
      emergencyStatus: String(packet.emergencyStatus),
      latitude: Number(packet.latitude),
      longitude: Number(packet.longitude),
      heartRate: Number(packet.heartRate),
      spo2: Number(packet.spo2),
      cprStatus: String(packet.cprStatus),
      battery: Number(packet.battery),
      sensorStatus: String(packet.sensorStatus),
      packetId: `PKT-${Math.floor(1000 + Math.random() * 9000)}`,
      sizeBytes: 64,
      digest: '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase(),
      receivedAt: new Date().toISOString()
    };

    // If network unavailable state is active, push to offline buffer
    if (!this.networkStates.gatewayReachable || !this.networkStates.backendReachable) {
      this.offlineQueue.bufferedPackets.push(newPacket);
      this.offlineQueue.queueCount = this.offlineQueue.bufferedPackets.length;
      return {
        success: true,
        queued: true,
        message: 'Network unavailable: Packet queued in non-volatile offline flash buffer.',
        packet: newPacket,
        queueCount: this.offlineQueue.queueCount
      };
    }

    // Store in active packet log (keep last 50)
    this.packets.unshift(newPacket);
    if (this.packets.length > 50) {
      this.packets = this.packets.slice(0, 50);
    }

    // Update GPS and signal telemetry
    this.gps.latitude = newPacket.latitude;
    this.gps.longitude = newPacket.longitude;

    return {
      success: true,
      queued: false,
      message: 'Communication packet ingested and stored successfully.',
      packet: newPacket
    };
  }

  getPackets(limit = 20) {
    return {
      success: true,
      totalCount: this.packets.length,
      packets: this.packets.slice(0, limit)
    };
  }

  simulateOfflineQueue(action) {
    const queueSteps = this.offlineQueue.steps;

    if (action === 'NEXT_STEP') {
      const nextIndex = (this.offlineQueue.stepIndex + 1) % queueSteps.length;
      this.offlineQueue.stepIndex = nextIndex;
      this.offlineQueue.currentStep = queueSteps[nextIndex].id;

      if (this.offlineQueue.currentStep === 'NETWORK_UNAVAILABLE') {
        this.networkStates.gatewayReachable = false;
        this.networkStates.backendReachable = false;
      } else if (this.offlineQueue.currentStep === 'PACKET_QUEUED') {
        // Generate a mock emergency packet for the offline queue
        const mockPkt = {
          deviceId: 'CJACK-UNIT-TX104',
          timestamp: new Date().toISOString(),
          emergencyStatus: 'CPR_ACTIVE',
          latitude: 12.9716,
          longitude: 77.5946,
          heartRate: 0,
          spo2: 76,
          cprStatus: 'ACTIVE_CLOSED_LOOP',
          battery: 86,
          sensorStatus: 'NOMINAL',
          packetId: `PKT-QUEUED-${this.offlineQueue.bufferedPackets.length + 1}`,
          sizeBytes: 64,
          digest: '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()
        };
        this.offlineQueue.bufferedPackets.push(mockPkt);
        this.offlineQueue.queueCount = this.offlineQueue.bufferedPackets.length;
      } else if (this.offlineQueue.currentStep === 'NETWORK_RESTORED') {
        this.networkStates.gatewayReachable = true;
        this.networkStates.backendReachable = true;
      } else if (this.offlineQueue.currentStep === 'PACKET_TRANSMITTED') {
        // Flush all buffered packets to active packet stream
        while (this.offlineQueue.bufferedPackets.length > 0) {
          const flushed = this.offlineQueue.bufferedPackets.shift();
          this.packets.unshift(flushed);
        }
        this.offlineQueue.queueCount = 0;
        this.offlineQueue.lastFlushTime = new Date().toISOString();
      }
    } else if (action === 'SIMULATE_DROP') {
      this.offlineQueue.stepIndex = 1;
      this.offlineQueue.currentStep = 'NETWORK_UNAVAILABLE';
      this.networkStates.gatewayReachable = false;
      this.networkStates.backendReachable = false;
    } else if (action === 'RESTORE_AND_FLUSH') {
      this.offlineQueue.stepIndex = 4;
      this.offlineQueue.currentStep = 'PACKET_TRANSMITTED';
      this.networkStates.gatewayReachable = true;
      this.networkStates.backendReachable = true;
      while (this.offlineQueue.bufferedPackets.length > 0) {
        const flushed = this.offlineQueue.bufferedPackets.shift();
        this.packets.unshift(flushed);
      }
      this.offlineQueue.queueCount = 0;
      this.offlineQueue.lastFlushTime = new Date().toISOString();
    } else if (action === 'RESET') {
      this.offlineQueue.stepIndex = 0;
      this.offlineQueue.currentStep = 'PACKET_GENERATED';
      this.networkStates.gatewayReachable = true;
      this.networkStates.backendReachable = true;
      this.offlineQueue.bufferedPackets = [];
      this.offlineQueue.queueCount = 0;
    }

    return this.getStatus();
  }

  setNetworkStates(states = {}) {
    if (states.deviceConnected !== undefined) this.networkStates.deviceConnected = Boolean(states.deviceConnected);
    if (states.loraAvailable !== undefined) this.networkStates.loraAvailable = Boolean(states.loraAvailable);
    if (states.gatewayReachable !== undefined) this.networkStates.gatewayReachable = Boolean(states.gatewayReachable);
    if (states.backendReachable !== undefined) this.networkStates.backendReachable = Boolean(states.backendReachable);
    if (states.internetUnavailable !== undefined) this.networkStates.internetUnavailable = Boolean(states.internetUnavailable);

    return this.getStatus();
  }
}

module.exports = new ConnectivityService();
