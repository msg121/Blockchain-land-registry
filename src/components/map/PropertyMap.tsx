'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}

const DEFAULT_CENTER: [number, number] = [24.8607, 67.0011]; // Default to Karachi

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  const markerRef = useRef<L.Marker>(null)
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [setPosition],
  )

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  )
}

export default function PropertyMap({ lat, lng, onChange }: PropertyMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapCentered, setMapCentered] = useState(false);
  
  useEffect(() => {
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      setPosition(new L.LatLng(Number(lat), Number(lng)));
    } else {
      setPosition(null);
    }
  }, [lat, lng]);

  const handlePositionChange = (newPos: L.LatLng) => {
    setPosition(newPos);
    onChange(newPos.lat.toFixed(6), newPos.lng.toFixed(6));
  };

  const center = position || DEFAULT_CENTER;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-primary/20 relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
    </div>
  )
}
