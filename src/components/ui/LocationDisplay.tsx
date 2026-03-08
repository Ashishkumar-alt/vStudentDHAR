"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";

interface LocationDisplayProps {
  latitude?: number;
  longitude?: number;
  title: string;
  className?: string;
}

export default function LocationDisplay({ 
  latitude, 
  longitude, 
  title,
  className = "" 
}: LocationDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only load map on client side and if coordinates are provided
    if (typeof window === 'undefined' || !latitude || !longitude) return;

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
          // Initialize map centered on the room location
          const center: LatLngExpression = [latitude, longitude];
          const map = L.map(mapRef.current).setView(center, 15);

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 11,
          }).addTo(map);

          // Add marker for the room location
          const marker = L.marker(center).addTo(map);
          marker.bindPopup(`<b>${title}</b><br>Room location`).openPopup();

          // Restrict bounds to Dharamshala region
          const southWest = L.latLng(31.8, 75.8);
          const northEast = L.latLng(32.6, 76.8);
          const bounds = L.latLngBounds(southWest, northEast);
          
          map.setMaxBounds(bounds);

          mapInstanceRef.current = map;
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadLeaflet();
  }, [latitude, longitude, title]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Don't render if no coordinates
  if (!latitude || !longitude) {
    return null;
  }

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
    </div>
  );
}
