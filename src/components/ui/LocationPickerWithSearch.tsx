"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LatLngExpression } from "leaflet";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface LocationPickerWithSearchProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

// Dharamshala coordinates
const DHARAMSHALA_CENTER: LatLngExpression = [32.2190, 76.3234];

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default function LocationPickerWithSearch({ 
  latitude, 
  longitude, 
  onLocationChange, 
  className = "" 
}: LocationPickerWithSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1&viewbox=75.8,31.8,76.8,32.6&bounded=1`,
          {
            headers: {
              'User-Agent': 'vStudent/1.0 (https://vstudent.com; contact@vstudent.com)'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Filter results to ensure they are within reasonable bounds of Dharamshala
          const filteredResults = data.filter((item: LocationSuggestion) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            return lat >= 31.5 && lat <= 32.8 && lon >= 75.5 && lon <= 77.0;
          });
          
          setSuggestions(filteredResults);
          setShowSuggestions(filteredResults.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSuggestionIndex(-1);
    debouncedSearch(query);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    // Update search input with selected location
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Update map and marker
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    
    // Call callback
    onLocationChange(lat, lng);
  };

  // Initialize map
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
          const initialLat = latitude || (DHARAMSHALA_CENTER as [number, number])[0];
          const initialLng = longitude || (DHARAMSHALA_CENTER as [number, number])[1];
          
          const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 11, // Prevent zooming out too far
          }).addTo(map);

          // Set initial marker if coordinates provided
          const marker = L.marker([initialLat, initialLng], {
            draggable: true
          }).addTo(map);
          
          // Handle marker drag
          marker.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            onLocationChange(lat, lng);
          });
          
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
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="mb-3 relative z-[1000]" ref={searchInputRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          placeholder="Search location (e.g., Sidhbari Dharamshala)"
          className="input w-full pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm ${
                  index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{suggestion.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="h-64 w-full rounded-lg border border-gray-200 relative z-[1]"
        style={{ minHeight: '256px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-[5]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        Search for a location or click/drag the marker to set the exact room location
      </div>
    </div>
  );
}
