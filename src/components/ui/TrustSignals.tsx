"use client";

import { MapPin, Clock, Calendar, Home } from "lucide-react";

interface TrustSignalsProps {
  distance?: string;
  responseTime?: string;
  available?: boolean;
  postedDate?: Date;
  area?: string;
  className?: string;
}

export default function TrustSignals({
  distance,
  responseTime,
  available = true,
  postedDate,
  area,
  className = "",
}: TrustSignalsProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs text-gray-600 ${className}`}>
      {distance && (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{distance}</span>
        </div>
      )}
      
      {available && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Available Now</span>
        </div>
      )}
      
      {responseTime && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{responseTime} response</span>
        </div>
      )}
      
      {postedDate && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{getTimeAgo(postedDate)}</span>
        </div>
      )}
      
      {area && (
        <div className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          <span>{area}</span>
        </div>
      )}
    </div>
  );
}
