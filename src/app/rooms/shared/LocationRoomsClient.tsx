"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, Search, SearchX, SlidersHorizontal, MapPin } from "lucide-react";
import { PRIMARY_INSTITUTION_SHORT, ROOM_GENDER_ALLOWED } from "@/lib/constants";
import { asNumber } from "@/lib/utils";
import { RoomCard } from "@/components/listings/ListingCard";
import { useRoomsByLocation } from "@/components/listings/useListings";
import AreaChips from "@/components/ui/AreaChips";
import { useAuth } from "@/components/auth/AuthProvider";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface RoomsLocationClientProps {
  location: string;
}

// Location configuration
const LOCATION_CONFIG = {
  dharamshala: {
    name: "Dharamshala",
    description: "Find student rooms and PG accommodations in the main Dharamshala area with easy access to markets, transportation, and educational institutions.",
    areas: ["Kotwali Bazaar", "Sidhpur", "Kaccheri", "Chamunda"]
  },
  mcleodganj: {
    name: "McLeod Ganj",
    description: "Discover affordable student housing in McLeod Ganj, known for its peaceful environment and proximity to Tibetan culture and educational centers.",
    areas: ["Main Square", "Temple Road", "Jogiwara Road", "Bhagsu"]
  },
  sidhbari: {
    name: "Sidhbari",
    description: "Browse student accommodations in Sidhbari, a quiet residential area ideal for studying with modern amenities and good connectivity.",
    areas: ["Main Market", "Near University", "Temple Area", "New Colony"]
  },
  "central-university": {
    name: "Central University Area",
    description: "Find rooms within walking distance of Central University of Himachal Pradesh. Perfect for students wanting minimal commute.",
    areas: ["University Gate", "Campus Road", "Student Colony", "Faculty Quarters"]
  }
};

export default function RoomsLocationClient({ location }: RoomsLocationClientProps) {
  const { profile } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [genderAllowed, setGenderAllowed] = useState<string>("Any");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [sort, setSort] = useState<"new" | "priceAsc" | "priceDesc">("new");
  const [vegOnly, setVegOnly] = useState(false);
  const [heaterIncluded, setHeaterIncluded] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);
  const [maxWalk, setMaxWalk] = useState<string>("");

  const locationConfig = LOCATION_CONFIG[location as keyof typeof LOCATION_CONFIG];
  const { rows, loading, error } = useRoomsByLocation(location);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    
    return rows.filter(({ data }: { id: string; data: any }) => {
      // Gender filter
      if (genderAllowed !== "Any" && data.genderAllowed !== genderAllowed) return false;
      
      // Rent filters
      const rent = asNumber(data.rent);
      const minRentNum = asNumber(minRent);
      const maxRentNum = asNumber(maxRent);
      if (minRent && rent && minRentNum && rent < minRentNum) return false;
      if (maxRent && rent && maxRentNum && rent > maxRentNum) return false;
      
      // Feature filters
      if (vegOnly && !data.vegOnly) return false;
      if (heaterIncluded && !data.heaterIncluded) return false;
      if (attachedBathroom && !data.attachedBathroom) return false;
      
      // Walking distance filter
      if (maxWalk) {
        const walk = asNumber(data.walkMinutes);
        const maxWalkNum = asNumber(maxWalk);
        if (walk === null || walk === undefined || (maxWalkNum && walk > maxWalkNum)) return false;
      }
      
      return true;
    });
  }, [rows, genderAllowed, minRent, maxRent, vegOnly, heaterIncluded, attachedBathroom, maxWalk]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    switch (sort) {
      case "priceAsc":
        return sorted.sort((a, b) => {
          const rentA = asNumber(a.data.rent) || 0;
          const rentB = asNumber(b.data.rent) || 0;
          return rentA - rentB;
        });
      case "priceDesc":
        return sorted.sort((a, b) => {
          const rentA = asNumber(a.data.rent) || 0;
          const rentB = asNumber(b.data.rent) || 0;
          return rentB - rentA;
        });
      default:
        return sorted;
    }
  }, [filteredRows, sort]);

  if (!locationConfig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Location Not Found</h1>
          <p className="text-gray-600 mb-6">The requested location is not available.</p>
          <Link href="/rooms" className="text-blue-600 hover:text-blue-800 underline">
            Browse all rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/rooms" className="hover:text-blue-600">Rooms</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{locationConfig.name}</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Student Rooms in {locationConfig.name}
        </h1>
        
        <p className="text-gray-600 mb-6 max-w-3xl">
          Find affordable rooms and PGs for students near colleges, markets and transport in {locationConfig.name}.
        </p>

        {/* Popular Locations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Locations</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Link
              href="/rooms/dharamshala"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === 'dharamshala' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dharamshala
            </Link>
            <Link
              href="/rooms/mcleodganj"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === 'mcleodganj' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              McLeodganj
            </Link>
            <Link
              href="/rooms/sidhbari"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === 'sidhbari' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sidhbari
            </Link>
            <Link
              href="/rooms/central-university"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === 'central-university' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Central University
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Rooms in {locationConfig.name} ({sortedRows.length})
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender Allowed
                </label>
                <select
                  value={genderAllowed}
                  onChange={(e) => setGenderAllowed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {ROOM_GENDER_ALLOWED.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rent Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent (₹)
                </label>
                <input
                  type="number"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent (₹)
                </label>
                <input
                  type="number"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Walking Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Walking Time (min)
                </label>
                <input
                  type="number"
                  value={maxWalk}
                  onChange={(e) => setMaxWalk(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="new">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

              {/* Feature Filters */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={vegOnly}
                      onChange={(e) => setVegOnly(e.target.checked)}
                      className="mr-2"
                    />
                    Veg Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={heaterIncluded}
                      onChange={(e) => setHeaterIncluded(e.target.checked)}
                      className="mr-2"
                    />
                    Heater Included
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={attachedBathroom}
                      onChange={(e) => setAttachedBathroom(e.target.checked)}
                      className="mr-2"
                    />
                    Attached Bathroom
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rooms</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="text-center py-12">
          <SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available in {locationConfig.name} right now.</h3>
          <p className="text-gray-600 mb-6">
            Try nearby locations:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.entries(LOCATION_CONFIG)
              .filter(([key]) => key !== location)
              .map(([key, config]) => (
                <Link
                  key={key}
                  href={`/rooms/${key}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  {config.name}
                </Link>
              ))}
          </div>
          <button
            onClick={() => {
              setGenderAllowed("Any");
              setMinRent("");
              setMaxRent("");
              setVegOnly(false);
              setHeaterIncluded(false);
              setAttachedBathroom(false);
              setMaxWalk("");
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRows.map(({ id, data }) => (
            <RoomCard key={id} id={id} listing={data} />
          ))}
        </div>
      )}

      {/* SEO Content */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Why Choose {locationConfig.name} for Student Accommodation?
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">
            {locationConfig.name} offers excellent options for student housing with various amenities 
            and price ranges to suit different budgets. Students can find rooms with features like 
            attached bathrooms, heating facilities, and vegetarian meal options.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Popular Areas in {locationConfig.name}</h3>
          <ul className="list-disc pl-6 mb-4">
            {locationConfig.areas.map((area) => (
              <li key={area}>{area} - Well-connected area with good amenities</li>
            ))}
          </ul>
          <p className="mb-4">
            Most rooms in {locationConfig.name} are within walking distance or a short commute from 
            educational institutions, making it convenient for students. The area offers good 
            connectivity to markets, hospitals, and recreational facilities.
          </p>
        </div>
      </div>

      {/* Internal SEO Links */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore more rooms:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(LOCATION_CONFIG)
            .filter(([key]) => key !== location)
            .map(([key, config]) => (
              <Link
                key={key}
                href={`/rooms/${key}`}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 hover:border-blue-300 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium">Rooms in {config.name}</div>
                  {key === 'central-university' && (
                    <div className="text-sm text-gray-500">Near Central University</div>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
