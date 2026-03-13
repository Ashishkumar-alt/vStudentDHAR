"use client";

import { useState } from "react";
import { Bell, Package, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  showNotifyButton?: boolean;
  className?: string;
}

export default function ComingSoon({
  title = "Items Marketplace",
  subtitle = "Buy & sell books, electronics, furniture and more.",
  badge = "🚧 Coming Soon in v3",
  showNotifyButton = true,
  className = "",
}: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with your actual notification service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="mb-8 rounded-3xl bg-blue-100 p-6 shadow-lg">
            <Package className="h-16 w-16 text-blue-600" />
          </div>

          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            <span className="mr-2">{badge.split(" ")[0]}</span>
            <span>{badge.split(" ").slice(1).join(" ")}</span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mb-12 max-w-2xl text-lg text-gray-600 sm:text-xl">
            {subtitle}
          </p>

          {/* Notify Form */}
          {showNotifyButton && (
            <div className="w-full max-w-md">
              {!isSubscribed ? (
                <form onSubmit={handleNotify} className="space-y-4">
                  <div className="relative">
                    <Bell className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to get notified"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 w-full rounded-2xl bg-blue-600 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="ml-2">Subscribing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Bell className="mr-2 h-5 w-5" />
                        <span>Notify Me</span>
                      </div>
                    )}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-green-50 p-6 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-green-900">
                    You're on the list!
                  </h3>
                  <p className="text-green-700">
                    We'll notify you as soon as the Items Marketplace is live.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features Preview */}
          <div className="mt-16 grid w-full max-w-4xl gap-8 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Buy & Sell</h3>
              <p className="text-sm text-gray-600">
                Books, electronics, furniture, and more from fellow students
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <ArrowRight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Direct Contact</h3>
              <p className="text-sm text-gray-600">
                Chat directly with buyers and sellers, no middlemen
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Save Money</h3>
              <p className="text-sm text-gray-600">
                Find great deals on used items from students like you
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-16">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
