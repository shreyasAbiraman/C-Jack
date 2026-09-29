import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { SectionHeader, StatusBadge, MetricCard, Button, PageStateWrapper } from '../components/ui';
import { Navigation, MapPin, Satellite, Compass, Copy, Check } from 'lucide-react';
import GoogleMapView from '../components/map/GoogleMapView';

const LocationPage = () => {
  const {
    location,
    connectivity,
    responder,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate,
    refreshData
  } = useSystem();
  const [copied, setCopied] = useState(false);

  const lat = Number(location?.latitude) || 12.9716;
  const lng = Number(location?.longitude) || 77.5946;
  const satellites = connectivity?.gps?.satellites ?? 11;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(location)}
      onRetry={refreshData}
      screenTitle="Live GNSS Location"
    >
      <div className="space-y-6">
        <SectionHeader
          title="Live Location & GPS Beacon"
          question="Where is the patient? What are the exact dispatch coordinates?"
          statusBadge={
            <StatusBadge
              status={connectivity?.gps?.locked ? 'safe' : 'warning'}
              text={connectivity?.gps?.locked ? '3D GPS FIX ACQUIRED' : 'SEARCHING SATELLITES'}
            />
          }
          actions={
            <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy Coordinates'}
            </Button>
          }
        />

        {/* Primary Coordinates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Latitude"
            value={lat.toFixed(6)}
            unit="° N"
            icon={Navigation}
            status="info"
            targetRange="WGS 84"
            subtitle="NEO-6M GPS Receiver"
          />

          <MetricCard
            title="Longitude"
            value={lng.toFixed(6)}
            unit="° E"
            icon={Navigation}
            status="info"
            targetRange="WGS 84"
            subtitle="Differential GNSS"
          />

          <MetricCard
            title="Satellites Locked"
            value={satellites}
            unit="Sats"
            icon={Satellite}
            status={satellites >= 6 ? 'safe' : 'warning'}
            targetRange="> 4 for 3D Fix"
            subtitle="Constellation: GPS + GLONASS"
          />

          <MetricCard
            title="Horizontal Accuracy"
            value={location?.accuracyMeters ?? 2.8}
            unit="Meters"
            icon={Compass}
            status="safe"
            targetRange="< 5.0m"
            subtitle="Circular Error Probable"
          />
        </div>

        {/* Live Interactive Google Maps View */}
        <GoogleMapView
          patient={location || { latitude: lat, longitude: lng, accuracyMeters: 2.8, landmark: location?.addressHint || 'Bengaluru Emergency Sector 4' }}
          responder={responder || { callsign: 'ALS-MED-04', latitude: 12.9810, longitude: 77.6015, distanceKm: 1.8, etaMinutes: 4, speedKmh: 48 }}
          showResponder={true}
          showGateway={true}
          showRoute={true}
          height="450px"
          title="Tactical GNSS Google Map"
        />
      </div>
    </PageStateWrapper>
  );
};

export default LocationPage;

