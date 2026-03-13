"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  Plus, 
  Heart, 
  User, 
  Menu,
  Package,
  Building
} from "lucide-react";
import { useState, useEffect } from "react";
import FeatureGate from "@/components/ui/FeatureGate";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  active?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show nav based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      id: "browse",
      label: "Browse",
      icon: Search,
      href: "/rooms",
      active: pathname === "/rooms" || pathname === "/items",
    },
    {
      id: "post",
      label: "Post",
      icon: Plus,
      href: "/post",
      active: pathname.startsWith("/post"),
    },
    {
      id: "saved",
      label: "Saved",
      icon: Heart,
      href: "/saved",
      active: pathname === "/saved",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  // Only show on mobile
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full 
                  transition-all duration-200 ease-in-out
                  group
                  ${isActive 
                    ? "text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div className="relative">
                  <Icon 
                    className={`
                      h-5 w-5 transition-transform duration-200
                      ${isActive ? "scale-110" : "scale-100 group-hover:scale-110"}
                    `}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`
                    text-xs mt-1 font-medium transition-all duration-200
                    ${isActive ? "font-semibold" : "font-normal"}
                  `}
                >
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

// Post action button (floating action button style)
export function MobilePostButton() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Only show on mobile
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/post")}
      className={`
        fixed bottom-20 right-4 z-20 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 
        text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
        flex items-center justify-center group
        ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}
        hover:scale-110 active:scale-95
      `}
      aria-label="Post listing"
    >
      <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
      
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-300" />
    </button>
  );
}
