"use client";

import { useState } from "react";
import { Phone, Eye, EyeOff, LogIn } from "lucide-react";
import { maskPhoneNumber, getSafePhoneDisplay, type PhoneVisibilityState, createPhoneVisibilityState, revealPhoneWithPermission } from "@/lib/utils/phone-masking";
import { useAuth } from "@/components/auth/AuthProvider";

interface PhoneDisplayProps {
  phone: string;
  className?: string;
  showRevealButton?: boolean;
}

export default function PhoneDisplay({ phone, className = "", showRevealButton = true }: PhoneDisplayProps) {
  const { user, loading } = useAuth();
  const [phoneState, setPhoneState] = useState<PhoneVisibilityState>(() => 
    createPhoneVisibilityState(phone)
  );

  const handleRevealPhone = () => {
    if (!user) {
      // Trigger login modal
      const loginModal = document.getElementById('login-modal-trigger') as HTMLElement;
      if (loginModal) {
        loginModal.click();
      } else {
        // Fallback: redirect to login page
        window.location.href = '/login';
      }
      return;
    }

    try {
      const newState = revealPhoneWithPermission(phoneState, phone, true);
      setPhoneState(newState);
    } catch (error) {
      console.error("Error revealing phone:", error);
      alert("Unable to reveal phone number");
    }
  };

  const handleMaskPhone = () => {
    setPhoneState(createPhoneVisibilityState(phone));
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // If user is not authenticated, show masked phone with login button
  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Phone className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-900">
          {maskPhoneNumber(phone)}
        </span>
        
        {showRevealButton && (
          <button
            onClick={handleRevealPhone}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            title="Login to view phone number"
          >
            <LogIn className="h-3 w-3" />
            <span>Login</span>
          </button>
        )}
      </div>
    );
  }

  // User is authenticated - show full phone with reveal/hide functionality
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Phone className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-900">
        {phoneState.phone}
      </span>
      
      {showRevealButton && (
        <button
          onClick={phoneState.revealed ? handleMaskPhone : handleRevealPhone}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          title={phoneState.revealed ? "Hide phone number" : "Reveal phone number"}
        >
          {phoneState.revealed ? (
            <>
              <EyeOff className="h-3 w-3" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span>Show</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Hook for managing phone visibility in components
export function usePhoneVisibility(phone: string) {
  const { user } = useAuth();
  const [phoneState, setPhoneState] = useState<PhoneVisibilityState>(() => 
    createPhoneVisibilityState(phone)
  );

  const revealPhone = () => {
    if (!user) {
      throw new Error("Authentication required");
    }

    try {
      const newState = revealPhoneWithPermission(phoneState, phone, true);
      setPhoneState(newState);
    } catch (error) {
      throw error;
    }
  };

  const maskPhone = () => {
    setPhoneState(createPhoneVisibilityState(phone));
  };

  return {
    phoneState,
    revealPhone,
    maskPhone,
    isRevealed: phoneState.revealed,
    displayPhone: phoneState.phone,
  };
}
