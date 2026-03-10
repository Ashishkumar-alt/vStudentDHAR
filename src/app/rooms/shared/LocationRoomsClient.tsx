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

// Location configuration with natural, human-friendly content
const LOCATION_CONFIG = {
  dharamshala: {
    name: "Dharamshala",
    description: "Find your perfect student room in the heart of Dharamshala. We connect students directly with room owners - no brokers, no hassles.",
    areas: ["Kotwali Bazaar", "Sidhpur", "Kaccheri", "Chamunda"],
    intro: "Looking for a room in Dharamshala? You're in the right place! Every year, hundreds of students move here for college and coaching. We make finding your perfect room simple and stress-free.",
    whyChoose: "Dharamshala is the perfect spot for students. You'll find everything you need within walking distance - from local cafes and libraries to bus stops and markets. The peaceful environment helps you focus on studies, while the friendly community makes you feel right at home.",
    tips: [
      "Start your room hunt at least a month before college starts - good places get booked quickly!",
      "Visit the room in person and chat with neighbors to get a feel for the area",
      "Check internet connectivity and water supply - these matter more than you think",
      "Always get a written agreement to avoid any confusion later"
    ],
    aboutVStudent: "vStudent is your friendly roommate finder! We connect students directly with room owners in Dharamshala. No broker fees, no middlemen - just simple, honest connections that help you find your ideal student home."
  },
  mcleodganj: {
    name: "McLeod Ganj",
    description: "Discover peaceful student living in McLeod Ganj. Find rooms that offer the perfect study environment with easy access to cafes and cultural spots.",
    areas: ["Main Square", "Temple Road", "Jogiwara Road", "Bhagsu"],
    intro: "Welcome to McLeod Ganj! This beautiful hill town is a favorite among students who love a calm, inspiring environment. Whether you're studying nearby or just want a peaceful place to focus, we'll help you find the perfect room.",
    whyChoose: "Students love McLeod Ganj for its unique blend of tranquility and convenience. The area is famous for its Tibetan culture, amazing cafes perfect for study sessions, and stunning views that make every day better. Plus, you're never far from essential amenities.",
    tips: [
      "Look for rooms with good heating - McLeod Ganj can get chilly in winters",
      "Choose a place closer to the main square for easy access to cafes and shops",
      "Check the water pressure and electricity backup - hilly areas can have issues",
      "Talk to local students about the best areas for safety and connectivity"
    ],
    aboutVStudent: "At vStudent, we understand how important the right environment is for your studies. We help you find rooms in McLeod Ganj that match your needs and budget, connecting you directly with trusted local room owners."
  },
  sidhbari: {
    name: "Sidhbari",
    description: "Find affordable student rooms in Sidhbari's quiet residential neighborhoods. Perfect for focused studying with modern amenities nearby.",
    areas: ["Main Market", "Near University", "Temple Area", "New Colony"],
    intro: "Searching for a room in Sidhbari? You've come to the right place! This growing educational hub is becoming increasingly popular among students who want quality education in a peaceful setting.",
    whyChoose: "Sidhbari offers the best of both worlds - it's quiet enough for serious studying but has all the modern facilities you need. The area is well-connected to educational institutions and has plenty of affordable food options. Plus, the friendly local community makes settling in easy.",
    tips: [
      "Focus on areas near educational institutions for shorter commute times",
      "Check for reliable internet - essential for online studies and research",
      "Look for rooms with proper ventilation and natural light",
      "Ask about nearby mess facilities or food options - good food is crucial!"
    ],
    aboutVStudent: "vStudent makes finding student accommodation in Sidhbari simple and transparent. We connect you directly with verified room owners, ensuring you get honest information and fair prices for your student home."
  },
  "central-university": {
    name: "Central University Area",
    description: "Find rooms within walking distance of Central University of Himachal Pradesh. Save time and money with accommodation right near campus.",
    areas: ["University Gate", "Campus Road", "Student Colony", "Faculty Quarters"],
    intro: "Looking for a room near Central University? You're smart to stay close to campus! Walking distance to university means more time for studies and less money spent on transport. Let us help you find your perfect student home.",
    whyChoose: "Living near Central University is a game-changer for students. Imagine rolling out of bed and being in class in 10 minutes! The area is designed for students - with affordable food options, study-friendly environments, and everything you need within easy reach.",
    tips: [
      "Book early - rooms near campus are always in high demand",
      "Check the exact walking time to your department buildings",
      "Look for study-friendly environments with minimal disturbance",
      "Consider shared accommodations to save money while staying close to campus"
    ],
    aboutVStudent: "vStudent specializes in helping students find rooms near Central University. We connect you directly with room owners who understand student needs, making your accommodation search smooth and hassle-free."
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
          {locationConfig.intro}
        </p>

        {/* Why Students Choose Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Students Choose {locationConfig.name}</h2>
          <p className="text-gray-600 mb-4">
            {locationConfig.whyChoose}
          </p>
        </div>

        {/* Popular Areas Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Areas Nearby</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {locationConfig.areas.map((area, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-gray-900">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Tips for Students Looking for Rooms</h2>
          <ul className="space-y-3">
            {locationConfig.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* About vStudent Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">About vStudent</h2>
          <p className="text-gray-700">
            {locationConfig.aboutVStudent}
          </p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
          <p className="text-gray-600">Please try again in a moment.</p>
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="text-center py-12">
          <SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms listed in {locationConfig.name} yet</h3>
          <p className="text-gray-600 mb-6">
            You can explore nearby areas or be the first to post a room in {locationConfig.name}!
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
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRows.map(({ id, data }) => (
            <RoomCard key={id} id={id} listing={data} />
          ))}
        </div>
      )}

      {/* SEO Content */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Everything You Need to Know About Student Living in {locationConfig.name}
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">
            {locationConfig.intro} The area has become increasingly popular among students due to its excellent educational facilities and student-friendly atmosphere.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Popular Areas in {locationConfig.name}</h3>
          <ul className="list-disc pl-6 mb-4">
            {locationConfig.areas.map((area) => (
              <li key={area}>{area} - Great choice for students with good connectivity and amenities</li>
            ))}
          </ul>
          <p className="mb-4">
            Most student rooms in {locationConfig.name} are conveniently located near educational institutions, making daily commute easy and affordable. The area offers everything you need for a comfortable student life - from affordable food options to quiet study spots.
          </p>
          <p className="mb-4">
            Whether you're looking for a peaceful place to focus on your studies or want to be close to campus activities, {locationConfig.name} has something perfect for every student's needs and budget.
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
