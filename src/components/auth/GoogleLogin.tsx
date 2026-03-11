"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";

export default function GoogleLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/post";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up the global callback function for Google Sign-In
    window.handleCredentialResponse = async (response: any) => {
      try {
        setLoading(true);
        setError(null);
        
        const token = response.credential;
        console.log("Google login token:", token);
        
        // Sign in with Google token
        await signInWithGoogle(token);
        
        // Redirect to next page
        router.replace(next);
      } catch (err) {
        console.error("Google login error:", err);
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    };

    // Initialize Google Sign-In
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID",
        callback: window.handleCredentialResponse,
      });

      const buttonElement = document.getElementById("google-signin-button");
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

    return () => {
      // Clean up global function
      if (typeof window.handleCredentialResponse === "function") {
        delete (window as any).handleCredentialResponse;
      }
    };
  }, [router, next]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center">
          <h1 className="text-2xl font-semibold">Sign in to vStudent</h1>
          <p className="mt-2 text-sm text-slate-600">
            Continue with Google to post rooms, items, and contact owners.
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Google Sign-In Button */}
            <div 
              id="google-signin-button"
              className="w-full flex justify-center"
            />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

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
    </main>
  );
}
