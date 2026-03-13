"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  BedDouble, 
  Flame, 
  MapPin, 
  Mountain, 
  Phone, 
  ShieldCheck, 
  Soup, 
  Sun, 
  Utensils, 
  Waves, 
  MessageCircle, 
  Footprints,
  Share2,
  Heart,
  Navigation,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { getRoom } from "@/lib/firebase/listings";
import type { RoomListing } from "@/lib/firebase/models";
import { formatINR, institutionShortLabel, toWhatsAppLink } from "@/lib/utils";
import ReportListing from "@/components/listings/ReportListing";
import { useAuth } from "@/components/auth/AuthProvider";
import { PRIMARY_INSTITUTION_SHORT } from "@/lib/constants";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { recordRoomView } from "@/lib/firebase/views";
import SafetyNotice from "@/components/listings/SafetyNotice";
import LocationDisplay from "@/components/ui/LocationDisplay";

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function ModernRoomDetails() {
  const params = useParams<{ id: string; slug?: string }>();
  const id = params.id;
  const { user, profile } = useAuth();
  const [listing, setListing] = useState<RoomListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let alive = true;

    getRoom(id)
      .then((res) => {
        if (!alive) return;
        setListing(res?.data || null);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load listing");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !listing) return;
    recordRoomView({ roomId: id, viewerId: user.uid }).catch(() => {});
  }, [id, listing, user]);

  const wa = useMemo(() => {
    if (!listing) return null;
    const inst = institutionShortLabel(profile?.institution) || "a student";
    return toWhatsAppLink(
      listing.contactPhone,
      `Hi, I am ${inst} and I am interested in your room on vStudent Dharamshala. Is it still available?`,
    );
  }, [listing, profile?.institution]);

  const phoneHref = useMemo(() => {
    if (!listing) return null;
    return getPhoneHref(listing.contactPhone);
  }, [listing]);

  const shareText = useMemo(() => {
    if (!listing) return null;
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `vStudent Dharamshala: ${listing.title} (${listing.area}) - ${url}`;
  }, [listing]);

  const waShare = useMemo(() => {
    if (!shareText) return null;
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }, [shareText]);

  const facilities = useMemo(() => {
    if (!listing) return [];

    return [
      listing.attachedBathroom ? { label: "Attached bathroom", icon: Waves, color: "bg-blue-50 text-blue-600 border-blue-200" } : null,
      listing.foodIncluded ? { label: "Food included", icon: Soup, color: "bg-green-50 text-green-600 border-green-200" } : null,
      listing.vegOnly ? { label: "Veg only", icon: Utensils, color: "bg-orange-50 text-orange-600 border-orange-200" } : null,
      listing.heaterIncluded ? { label: "Heater included", icon: Flame, color: "bg-red-50 text-red-600 border-red-200" } : null,
      listing.sunFacing ? { label: "Sun-facing room", icon: Sun, color: "bg-yellow-50 text-yellow-600 border-yellow-200" } : null,
      listing.mountainView ? { label: "Mountain view", icon: Mountain, color: "bg-purple-50 text-purple-600 border-purple-200" } : null,
      typeof listing.walkMinutesToHPU === "number"
        ? { label: `${listing.walkMinutesToHPU} min to ${PRIMARY_INSTITUTION_SHORT}`, icon: Footprints, color: "bg-indigo-50 text-indigo-600 border-indigo-200" }
        : null,
    ].filter(Boolean) as { label: string; icon: typeof Flame; color: string }[];
  }, [listing]);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!listing?.photoUrls?.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => prev === 0 ? listing.photoUrls!.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex((prev) => prev === listing.photoUrls!.length - 1 ? 0 : prev + 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share && shareText) {
      try {
        await navigator.share({
          title: listing?.title,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (waShare) {
      window.open(waShare, '_blank');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="aspect-[4/3] bg-gray-200"></div>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/rooms" className="btn btn-primary">
          Browse Rooms
        </Link>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Room not found</h2>
        <p className="text-gray-600 mb-4">This room listing doesn't exist or has been removed.</p>
        <Link href="/rooms" className="btn btn-primary">
          Browse Rooms
        </Link>
      </div>
    </div>
  );

  const photos = listing.photoUrls || [];
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            {/* Hero Image Section */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              {hasPhotos ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  {currentPhoto && (
                    <Image
                      src={currentPhoto}
                      alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
                      fill
                      className="object-cover max-h-[500px]"
                      priority
                    />
                  )}
                  
                  {/* Top overlay with badges and share button */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex gap-2">
                      {listing.status === "active" && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                        {listing.genderAllowed}
                      </div>
                    </div>
                    <button
                      onClick={handleShare}
                      className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg"
                    >
                      <Share2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Image navigation */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => handleImageNavigation('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleImageNavigation('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Image dots indicator */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No photos available</p>
                  </div>
                </div>
              )}

              {/* Back button */}
              <Link href="/rooms" className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg md:hidden">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            {/* Image thumbnails */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Room Information */}
          <div className="space-y-6">
            {/* Back button for desktop */}
            <Link href="/rooms" className="hidden md:inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4" />
              Back to Rooms
            </Link>

            {/* Title and Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{listing.area}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{listing.address}</p>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatINR(listing.rent)}
                    <span className="text-lg font-normal text-gray-500">/month</span>
                  </div>
                  {listing.deposit > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Deposit: {formatINR(listing.deposit)}
                    </div>
                  )}
                </div>
                <FavoriteButton listingType="room" listingId={id} />
              </div>
            </div>

            {/* Contact Buttons - Desktop */}
            <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Owner</h3>
              <div className="space-y-3">
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-base">Call Owner</span>
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-base">WhatsApp Owner</span>
                  </a>
                )}
                <p className="text-center text-xs text-gray-500 mt-3 font-medium">{listing.contactPhone}</p>
              </div>
            </div>

            {/* Facilities Section */}
            {facilities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Facilities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {facilities.map(({ label, icon: Icon, color }) => (
                    <div key={label} className={`flex items-center gap-2 p-3 rounded-xl border ${color}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Address</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">{listing.area}</p>
                    <p className="text-gray-600 text-sm">{listing.address}</p>
                  </div>
                </div>
                <Link 
                  href={`/rooms?area=${encodeURIComponent(listing.area)}`}
                  className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  <MapPin className="h-4 w-4" />
                  More rooms in {listing.area}
                </Link>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Listed by</h3>
                  <p className="text-sm text-gray-600">
                    {listing.institution || 'Private owner'}
                    {listing.createdByMemberSinceYear && (
                      <span className="block text-xs text-gray-500">
                        Member since {listing.createdByMemberSinceYear}
                      </span>
                    )}
                  </p>
                </div>
                {user?.uid && listing.createdBy === user.uid && (
                  <Link href={`/edit/room/${id}`} className="btn btn-outline text-sm">
                    Edit
                  </Link>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Safety Tips</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Visit the room before making any payment</li>
                    <li>• Verify all details with the owner</li>
                    <li>• Don't send money without seeing the property</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Report Listing */}
            <div className="flex justify-center">
              <ReportListing listingType="room" listingId={id} />
            </div>
          </div>
        </div>

        {/* Location Section - Full Width */}
        {listing.latitude && listing.longitude && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
              <LocationDisplay 
                latitude={listing.latitude} 
                longitude={listing.longitude} 
                title={listing.title} 
              />
            </div>
            <a
              href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full btn btn-outline flex items-center justify-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Open in Maps
            </a>
          </div>
        )}
      </div>

      {/* Sticky Bottom Contact Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 md:hidden">
        <div className="p-4">
          <div className="flex gap-3 max-w-lg mx-auto">
            {phoneHref && (
              <a
                href={phoneHref}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Phone className="h-4 w-4" />
                <span className="text-base">Call Owner</span>
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-base">WhatsApp Owner</span>
              </a>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-3 font-medium">{listing.contactPhone}</p>
        </div>
      </div>
    </div>
  );
}
