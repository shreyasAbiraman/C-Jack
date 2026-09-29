import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  Radio, 
  Layers, 
  Key, 
  AlertCircle, 
  Maximize2, 
  Compass, 
  Settings, 
  ExternalLink,
  RotateCcw,
  Check
} from 'lucide-react';

// Custom Tactical Dark Theme for Google Maps
const CJACK_TACTICAL_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b1329' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1329' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#020617' }]
  }
];

export const GoogleMapView = ({
  patient = { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 2.8, landmark: 'Cubbon Tech Hub' },
  responder = { callsign: 'ALS-MED-04', latitude: 12.9810, longitude: 77.6015, distanceKm: 1.8, etaMinutes: 4, speedKmh: 48 },
  gateway = { id: 'GW-BLR-041', name: 'Bengaluru Central Gateway', latitude: 12.9750, longitude: 77.5990, distanceKm: 0.62 },
  showResponder = true,
  showGateway = true,
  showRoute = true,
  height = '400px',
  interactive = true,
  title = 'Live Google Map Tactical View'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  // API Key state: check localStorage first, then env variable
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('cjack_google_maps_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  const [inputKey, setInputKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapType, setMapType] = useState('tactical'); // 'tactical' | 'roadmap' | 'satellite' | 'hybrid'
  const [copiedKey, setCopiedKey] = useState(false);

  const patientLat = Number(patient?.latitude) || 12.9716;
  const patientLng = Number(patient?.longitude) || 77.5946;
  const responderLat = Number(responder?.latitude) || 12.9810;
  const responderLng = Number(responder?.longitude) || 77.6015;

  // Save API key
  const handleSaveApiKey = (keyToSave) => {
    const cleanKey = keyToSave.trim();
    localStorage.setItem('cjack_google_maps_api_key', cleanKey);
    setApiKey(cleanKey);
    setShowKeyModal(false);
    setLoadError(null);
    setIsLoaded(false);
    // Reload script
    window.location.reload();
  };

  // Dynamically load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setIsLoaded(false);
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already added
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Error listener for Google Maps authentication errors
    window.gm_authFailure = () => {
      setLoadError('Google Maps Authentication Failed: The API key provided is invalid, restricted, or billing is not enabled.');
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      setLoadError(null);
    };

    script.onerror = () => {
      setLoadError('Failed to load Google Maps SDK. Please check your internet connection or API key configuration.');
      setIsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // cleanup global handler if needed
    };
  }, [apiKey]);

  // Initialize Map
  const initMap = useCallback(() => {
    if (!isLoaded || !window.google || !window.google.maps || !mapContainerRef.current) {
      return;
    }

    try {
      const google = window.google;
      const center = { lat: patientLat, lng: patientLng };

      const mapOptions = {
        center,
        zoom: 15,
        mapTypeId: mapType === 'tactical' ? google.maps.MapTypeId.ROADMAP : mapType,
        styles: mapType === 'tactical' ? CJACK_TACTICAL_MAP_STYLE : null,
        disableDefaultUI: !interactive,
        zoomControl: interactive,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: interactive,
        backgroundColor: '#0b1329',
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Clear previous overlays
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);

      // 1. Patient Marker & Info Window
      const patientMarker = new google.maps.Marker({
        position: { lat: patientLat, lng: patientLng },
        map,
        title: 'Patient Location (Code Red)',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        zIndex: 100,
      });

      const patientInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 6px; font-family: system-ui; max-width: 220px;">
            <div style="font-weight: bold; color: #dc2626; font-size: 13px; margin-bottom: 4px;">🚨 PATIENT IN CARDIAC ARREST</div>
            <div style="font-size: 11px; margin-bottom: 2px;"><b>Coordinates:</b> ${patientLat.toFixed(5)}°N, ${patientLng.toFixed(5)}°E</div>
            <div style="font-size: 11px; margin-bottom: 2px;"><b>Landmark:</b> ${patient?.landmark || 'Active GPS Fix'}</div>
            <div style="font-size: 11px; color: #2563eb;"><b>Accuracy:</b> ±${patient?.accuracyMeters || 2.8}m WGS84</div>
          </div>
        `,
      });

      patientMarker.addListener('click', () => {
        patientInfoWindow.open(map, patientMarker);
      });
      markersRef.current.push(patientMarker);

      // Accuracy Uncertainty Circle
      const accuracyCircle = new google.maps.Circle({
        strokeColor: '#06b6d4',
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
        map,
        center: { lat: patientLat, lng: patientLng },
        radius: patient?.accuracyMeters || 15,
      });
      accuracyCircleRef.current = accuracyCircle;

      // 2. Responder / Ambulance Marker
      if (showResponder && responder) {
        const responderMarker = new google.maps.Marker({
          position: { lat: responderLat, lng: responderLng },
          map,
          title: `Ambulance ${responder.callsign}`,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: 225, // Direction heading toward patient
          },
          zIndex: 90,
        });

        const responderInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: system-ui; max-width: 220px;">
              <div style="font-weight: bold; color: #d97706; font-size: 13px; margin-bottom: 4px;">🚑 ${responder.callsign}</div>
              <div style="font-size: 11px; margin-bottom: 2px;"><b>Distance:</b> ${responder.distanceKm || 1.8} km</div>
              <div style="font-size: 11px; margin-bottom: 2px;"><b>ETA:</b> ~${responder.etaMinutes || 4} mins</div>
              <div style="font-size: 11px; color: #059669;"><b>Speed:</b> ${responder.speedKmh || 48} km/h (Code 3)</div>
            </div>
          `,
        });

        responderMarker.addListener('click', () => {
          responderInfoWindow.open(map, responderMarker);
        });
        markersRef.current.push(responderMarker);

        // 3. Route Polyline between Ambulance and Patient
        if (showRoute) {
          const routeCoordinates = [
            { lat: responderLat, lng: responderLng },
            { lat: (responderLat + patientLat) / 2 + 0.001, lng: (responderLng + patientLng) / 2 - 0.001 },
            { lat: patientLat, lng: patientLng }
          ];

          const routePolyline = new google.maps.Polyline({
            path: routeCoordinates,
            geodesic: true,
            strokeColor: '#f59e0b',
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map,
          });
          polylineRef.current = routePolyline;
        }
      }

      // 4. LoRa Gateway Marker
      if (showGateway && gateway) {
        const gwLat = Number(gateway.latitude) || 12.9750;
        const gwLng = Number(gateway.longitude) || 77.5990;

        const gatewayMarker = new google.maps.Marker({
          position: { lat: gwLat, lng: gwLng },
          map,
          title: `Gateway ${gateway.id}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#0284c7',
            fillOpacity: 0.9,
            strokeColor: '#38bdf8',
            strokeWeight: 2,
          },
          zIndex: 80,
        });

        const gatewayInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: system-ui; max-width: 200px;">
              <div style="font-weight: bold; color: #0284c7; font-size: 12px; margin-bottom: 4px;">📡 ${gateway.id}</div>
              <div style="font-size: 11px;"><b>Type:</b> LoRa Sub-GHz Gateway</div>
              <div style="font-size: 11px; color: #059669;"><b>Status:</b> Online Reachable</div>
            </div>
          `,
        });

        gatewayMarker.addListener('click', () => {
          gatewayInfoWindow.open(map, gatewayMarker);
        });
        markersRef.current.push(gatewayMarker);
      }

      // Auto fit bounds to include all assets
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: patientLat, lng: patientLng });
      if (showResponder) bounds.extend({ lat: responderLat, lng: responderLng });
      if (showGateway && gateway?.latitude) bounds.extend({ lat: Number(gateway.latitude), lng: Number(gateway.longitude) });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

    } catch (err) {
      console.error('[GoogleMapView] Initialization error:', err);
      setLoadError(`Map rendering failed: ${err.message}`);
    }
  }, [isLoaded, patientLat, patientLng, responderLat, responderLng, showResponder, showGateway, showRoute, mapType, interactive]);

  useEffect(() => {
    if (isLoaded) {
      initMap();
    }
  }, [isLoaded, initMap, mapType]);

  const recenterOn = (target) => {
    if (!mapInstanceRef.current || !window.google) return;
    if (target === 'PATIENT') {
      mapInstanceRef.current.panTo({ lat: patientLat, lng: patientLng });
      mapInstanceRef.current.setZoom(16);
    } else if (target === 'RESPONDER') {
      mapInstanceRef.current.panTo({ lat: responderLat, lng: responderLng });
      mapInstanceRef.current.setZoom(16);
    } else if (target === 'FIT') {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: patientLat, lng: patientLng });
      bounds.extend({ lat: responderLat, lng: responderLng });
      mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
      {/* Top Map Header Controls */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {title}
              </h4>
              {apiKey && !loadError ? (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Google Maps Live
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" />
                  API Key Needed
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              GPS Coordinates: {patientLat.toFixed(5)}°N, {patientLng.toFixed(5)}°E (±{patient?.accuracyMeters || 2.8}m)
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {isLoaded && !loadError && (
            <>
              {/* Map Type Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setMapType('tactical')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapType === 'tactical' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Tactical
                </button>
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapType === 'roadmap' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMapType('hybrid')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapType === 'hybrid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
              </div>

              {/* Recenter Button */}
              <button
                onClick={() => recenterOn('FIT')}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1"
                title="Fit all assets"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fit</span>
              </button>
            </>
          )}

          {/* API Key Modal Toggle */}
          <button
            onClick={() => {
              setInputKey(apiKey);
              setShowKeyModal(true);
            }}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">{apiKey ? 'Key Configured' : 'Enter API Key'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport / Fallback Card */}
      <div className="relative w-full" style={{ height }}>
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full ${!apiKey || loadError ? 'hidden' : 'block'}`} 
        />

        {/* Fallback View if API Key is missing or invalid */}
        {(!apiKey || loadError) && (
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center border-t border-slate-800/80">
            {/* Grid graphic background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="relative z-10 max-w-md bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <Key className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                {loadError ? 'Google Maps Access Error' : 'Connect Google Maps API'}
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {loadError 
                  ? loadError 
                  : 'To display live Google Maps with real satellite imagery, terrain data, and ambulance routing, please enter your Google Maps JavaScript API Key.'}
              </p>

              {/* Quick Input Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste AIzaSy... API Key"
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleSaveApiKey(inputKey)}
                  disabled={!inputKey.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                >
                  Activate Map
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Stored locally in browser & .env</span>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/overview"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Get API Key from Google Cloud <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Geospatial Stats Strip Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Patient GNSS Fix
          </div>
          <div className="text-white font-bold mt-0.5">
            {patientLat.toFixed(5)}° N, {patientLng.toFixed(5)}° E
          </div>
          <div className="text-[10px] text-slate-400">
            {patient?.landmark || 'Cubbon Tech Hub, BLR'} (±{patient?.accuracyMeters || 2.8}m)
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Ambulance {responder?.callsign}
          </div>
          <div className="text-amber-300 font-bold mt-0.5">
            {responder?.distanceKm || 1.8} km away • ETA ~{responder?.etaMinutes || 4} min
          </div>
          <div className="text-[10px] text-slate-400">
            Speed: {responder?.speedKmh || 48} km/h • Code 3 Priority
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Telemetry Uplink
          </div>
          <div className="text-sky-400 font-bold mt-0.5">
            LoRa 868.1 MHz + Cellular 4G LTE
          </div>
          <div className="text-[10px] text-slate-400">
            Gateway: {gateway?.id || 'GW-BLR-041'} (0.62 km)
          </div>
        </div>
      </div>

      {/* Modal to configure API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Google Maps API Configuration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Enter your Google Maps JavaScript API key below to activate satellite maps, live tactical rendering, and real GIS routing.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Google Maps JavaScript API Key
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300">Required Google Cloud APIs:</div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Maps JavaScript API
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Places API (Optional)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Directions API (Optional)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(inputKey)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                >
                  Save & Apply Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapView;
