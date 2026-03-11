"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function LoginModal({ isOpen, onClose, redirectTo = "/post" }: LoginModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Set up the global callback function for Google Sign-In
    window.handleCredentialResponse = async (response: any) => {
      try {
        setLoading(true);
        setError(null);
        
        const token = response.credential;
        console.log("Google login token:", token);
        
        // Sign in with Google token
        await signInWithGoogle(token);
        
        // Close modal and redirect
        onClose();
        router.replace(redirectTo);
      } catch (err) {
        console.error("Google login error:", err);
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    };

    // Initialize Google Sign-In
    const timer = setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID",
          callback: window.handleCredentialResponse,
        });

        const buttonElement = document.getElementById("modal-google-signin-button");
        if (buttonElement) {
          window.google.accounts.id.renderButton(
            buttonElement,
            {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: "100%",
            }
          );
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (typeof window.handleCredentialResponse === "function") {
        delete (window as any).handleCredentialResponse;
      }
    };
  }, [isOpen, onClose, router, redirectTo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to continue</h2>
          <p className="text-sm text-gray-600">
            Sign in with Google to post rooms, items, and contact owners.
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign-In Button */}
          <div 
            id="modal-google-signin-button"
            className="w-full flex justify-center"
          />
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-slate-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Signing in...
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
