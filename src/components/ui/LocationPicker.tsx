"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

// Dharamshala coordinates
const DHARAMSHALA_CENTER: LatLngExpression = [32.2190, 76.3234];

export default function LocationPicker({ 
  latitude, 
  longitude, 
  onLocationChange, 
  className = "" 
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only load map on client side
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS
        const L = await import('leaflet');
        
        // Fix default icon issue with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map
          const map = L.map(mapRef.current).setView(DHARAMSHALA_CENTER, 13);

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 11, // Prevent zooming out too far
          }).addTo(map);

          // Set initial marker if coordinates provided
          const initialLat = latitude || (DHARAMSHALA_CENTER as [number, number])[0];
          const initialLng = longitude || (DHARAMSHALA_CENTER as [number, number])[1];
          
          const marker = L.marker([initialLat, initialLng]).addTo(map);
          markerRef.current = marker;

          // Handle map clicks
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            
            // Update marker position
            marker.setLatLng([lat, lng]);
            
            // Call callback
            onLocationChange(lat, lng);
          });

          // Restrict bounds to Dharamshala region (approximately)
          const southWest = L.latLng(31.8, 75.8);
          const northEast = L.latLng(32.6, 76.8);
          const bounds = L.latLngBounds(southWest, northEast);
          
          map.setMaxBounds(bounds);
          map.fitBounds(bounds);

          mapInstanceRef.current = map;
          setIsLoaded(true);
        }

        // Update marker if coordinates change from props
        if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadLeaflet();
  }, [latitude, longitude, onLocationChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="h-64 w-full rounded-lg border border-gray-200"
        style={{ minHeight: '256px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        Click on the map to set the exact room location
      </div>
    </div>
  );
}
