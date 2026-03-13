"use client";

import { Phone, MessageCircle, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatINR } from "@/lib/utils";

interface ContactButtonsProps {
  phone: string;
  className?: string;
  layout?: "desktop" | "mobile";
}

export default function ContactButtons({ phone, className = "", layout = "desktop" }: ContactButtonsProps) {
  const { user, loading } = useAuth();

  // Format phone number for links
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneHref = `tel:${cleanPhone}`;
  const waHref = `https://wa.me/${cleanPhone}?text=Hi I found your room on vStudent`;

  // Mask phone number for non-authenticated users
  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 5) return phone;
    return phone.slice(0, 5) + "XXXXX";
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto mt-3"></div>
      </div>
    );
  }

  // User not authenticated - show login prompt
  if (!user) {
    return (
      <div className={`${className}`}>
        <div className="space-y-3">
          <button
            onClick={() => {
              // Trigger login modal - you'll need to implement this
              const loginModal = document.getElementById('login-modal-trigger') as HTMLElement;
              if (loginModal) {
                loginModal.click();
              } else {
                // Fallback: redirect to login page
                window.location.href = '/login';
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogIn className="h-4 w-4" />
            <span className="text-base">Login to Contact Owner</span>
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3 font-medium">
          {maskPhoneNumber(phone)}
        </p>
      </div>
    );
  }

  // User authenticated - show contact buttons
  const buttonClass = layout === "mobile" 
    ? "flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
    : "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl";

  const whatsappClass = layout === "mobile"
    ? "flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
    : "w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl";

  return (
    <div className={`${className}`}>
      <div className={layout === "mobile" ? "flex gap-3 max-w-lg mx-auto" : "space-y-3"}>
        <a
          href={phoneHref}
          className={buttonClass}
        >
          <Phone className="h-4 w-4" />
          <span className="text-base">Call Owner</span>
        </a>
        
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={whatsappClass}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-base">WhatsApp Owner</span>
        </a>
      </div>
      <p className="text-center text-xs text-gray-500 mt-3 font-medium">
        {phone}
      </p>
    </div>
  );
}
