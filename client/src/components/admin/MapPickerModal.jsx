import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { X, MapPin, CheckCircle, Loader2 } from "lucide-react";

const MAP_CONTAINER_STYLE = { width: "100%", height: "450px" };

const MAP_OPTIONS = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControlOptions: { position: 3 },
};

// ─── MapPickerModal ───────────────────────────────────────────────────────────
// Props:
//   isOpen      – boolean controlling visibility
//   onClose     – fn to close modal
//   mapLocation – { lat, lng } current stored location
//   onConfirm   – fn(pos) called with the confirmed { lat, lng }
//   isLoaded    – boolean from parent's useLoadScript
//   loadError   – error from parent's useLoadScript (or undefined)
// ─────────────────────────────────────────────────────────────────────────────
const MapPickerModal = ({ isOpen, onClose, mapLocation, onConfirm, isLoaded, loadError }) => {
  const [markerPos, setMarkerPos] = useState(mapLocation);

  // Reset working position every time the modal opens
  useEffect(() => {
    if (isOpen) setMarkerPos(mapLocation);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapClick = useCallback((e) => {
    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800">Pick Location on Map</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors rounded-lg p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map area */}
        <div className="relative">
          {loadError && (
            <div className="h-[450px] flex flex-col items-center justify-center bg-red-50 text-red-600 text-sm gap-2">
              <span className="text-2xl">⚠️</span>
              <p className="font-semibold">Failed to load Google Maps</p>
              <p className="text-xs text-red-400">Check your VITE_GOOGLE_MAPS_API_KEY in .env.local</p>
            </div>
          )}

          {!isLoaded && !loadError && (
            <div className="h-[450px] flex items-center justify-center bg-gray-50 text-gray-400 text-sm gap-2">
              <Loader2 size={18} className="animate-spin" />
              Loading satellite view…
            </div>
          )}

          {isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={markerPos}
              zoom={16}
              mapTypeId="satellite"
              onClick={handleMapClick}
              options={MAP_OPTIONS}
            >
              <Marker position={markerPos} />
            </GoogleMap>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500 leading-relaxed">
            <p>
              <span className="font-semibold text-gray-700">Click on the map</span> to drop a pin at the exact location.
            </p>
            <p className="font-mono text-indigo-600 mt-0.5">
              Lat: {markerPos.lat.toFixed(6)} &nbsp;|&nbsp; Lng: {markerPos.lng.toFixed(6)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { onConfirm(markerPos); onClose(); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md flex-shrink-0"
          >
            <CheckCircle size={16} />
            Confirm Location
          </button>
        </div>

      </div>
    </div>
  );
};

export default MapPickerModal;
