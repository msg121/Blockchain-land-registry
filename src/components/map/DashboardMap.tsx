'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Badge } from '@/components/ui/badge'

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for Verified properties
const verifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface MapProperty {
  id: string;
  lat: number;
  lng: number;
  verified: boolean;
  area: number;
}

interface DashboardMapProps {
  properties: MapProperty[];
}

export default function DashboardMap({ properties }: DashboardMapProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl border border-primary/20 flex items-center justify-center">Loading Map...</div>;

  // Calculate center based on properties or default to a global view
  const defaultCenter: [number, number] = properties.length > 0 
    ? [properties[0].lat, properties[0].lng] 
    : [24.8607, 67.0011]; // Default Karachi

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-primary/20 shadow-lg relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={properties.length > 0 ? 11 : 4} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {properties.map((prop, idx) => (
          <Marker 
            key={prop.id + idx} 
            position={[prop.lat, prop.lng]}
            icon={prop.verified ? verifiedIcon : new L.Icon.Default()}
          >
            <Popup className="rounded-lg shadow-xl">
              <div className="space-y-2 p-1 min-w-[200px]">
                <h3 className="font-bold text-sm border-b pb-1">Property Details</h3>
                <div className="text-xs space-y-1">
                  <p><span className="text-muted-foreground">ID:</span> <span className="font-mono">{prop.id}</span></p>
                  <p><span className="text-muted-foreground">Area:</span> {prop.area} sqm</p>
                  <div className="pt-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${prop.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {prop.verified ? '✓ Verified' : '⚠ Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
