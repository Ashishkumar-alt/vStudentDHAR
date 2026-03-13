"use client";

import { CheckCircle, Clock, Camera, Shield, Zap } from "lucide-react";

interface VerificationBadgesProps {
  isVerified?: boolean;
  responseTime?: string;
  photosVerified?: boolean;
  quickResponder?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VerificationBadges({
  isVerified = false,
  responseTime,
  photosVerified = false,
  quickResponder = false,
  size = "sm",
  className = "",
}: VerificationBadgesProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-2.5 py-1.5 gap-1.5",
    lg: "text-base px-3 py-2 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badges = [];

  if (isVerified) {
    badges.push({
      icon: <Shield className={iconSizes[size]} />,
      text: "Verified",
      type: "verified",
    });
  }

  if (quickResponder || (responseTime && parseInt(responseTime) <= 2)) {
    badges.push({
      icon: <Zap className={iconSizes[size]} />,
      text: "Quick Response",
      type: "responsive",
    });
  }

  if (photosVerified) {
    badges.push({
      icon: <Camera className={iconSizes[size]} />,
      text: "Photos Verified",
      type: "photos",
    });
  }

  if (responseTime && !quickResponder && parseInt(responseTime) > 2) {
    badges.push({
      icon: <Clock className={iconSizes[size]} />,
      text: `${responseTime} response`,
      type: "time",
    });
  }

  if (badges.length === 0) {
    return null;
  }

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case "verified":
        return "bg-emerald-100 text-emerald-800 ring-emerald-200";
      case "responsive":
        return "bg-blue-100 text-blue-800 ring-blue-200";
      case "photos":
        return "bg-purple-100 text-purple-800 ring-purple-200";
      case "time":
        return "bg-gray-100 text-gray-800 ring-gray-200";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-200";
    }
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`inline-flex items-center rounded-full ring-1 ${sizeClasses[size]} ${getBadgeStyles(
            badge.type
          )}`}
        >
          {badge.icon}
          <span className="font-medium">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
