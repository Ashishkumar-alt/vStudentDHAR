"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, Clock, TrendingUp, Filter, X, Menu, Sparkles, ShoppingBag, Book, Bike, Laptop, FileText, Home } from "lucide-react";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { ItemCard } from "@/components/listings/ListingCard";
import { useItems } from "@/components/listings/useListings";
import { useAuth } from "@/components/auth/AuthProvider";

const categoryIcons: Record<string, any> = {
  "Books & Study Materials": Book,
  "Hostel Essentials": Home,
  "Clothing & Traditional Dress": ShoppingBag,
  "Sports Items": TrendingUp,
  "Electronics & Gadgets": Laptop,
  "Transport (Cycle / Scooter)": Bike,
};

const categoryColors: Record<string, string> = {
  "Books & Study Materials": "bg-purple-100 text-purple-700 border-purple-200",
  "Hostel Essentials": "bg-blue-100 text-blue-700 border-blue-200",
  "Clothing & Traditional Dress": "bg-pink-100 text-pink-700 border-pink-200",
  "Sports Items": "bg-green-100 text-green-700 border-green-200",
  "Electronics & Gadgets": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Transport (Cycle / Scooter)": "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const mainCategories = [
  "Books & Study Materials",
  "Hostel Essentials", 
  "Clothing & Traditional Dress",
  "Sports Items",
  "Electronics & Gadgets",
  "Transport (Cycle / Scooter)"
];

// Map original categories to main categories
const categoryMapping: Record<string, string> = {
  "Books": "Books & Study Materials",
  "Notes": "Books & Study Materials",
  "Furniture": "Hostel Essentials",
  "Hostel Essentials": "Hostel Essentials",
  "Clothing": "Clothing & Traditional Dress",
  "Traditional Dress": "Clothing & Traditional Dress",
  "Sports": "Sports Items",
  "Cycles": "Transport (Cycle / Scooter)",
  "Scooter": "Transport (Cycle / Scooter)",
  "Electronics": "Electronics & Gadgets",
  "Gadgets": "Electronics & Gadgets",
};

export default function GenZItemsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { rows, loading, error } = useItems();

  // Hide the default AppShell header for this page
  useEffect(() => {
    const appHeader = document.querySelector('.app-header') as HTMLElement;
    const appBottomNav = document.querySelector('.app-bottom-nav') as HTMLElement;
    if (appHeader) appHeader.style.display = 'none';
    if (appBottomNav) appBottomNav.style.display = 'none';
    
    return () => {
      if (appHeader) appHeader.style.display = '';
      if (appBottomNav) appBottomNav.style.display = '';
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(({ data }) => {
      const keyword = searchQuery.trim().toLowerCase();
      if (keyword && !data.title.toLowerCase().includes(keyword)) return false;
      
      // Filter by selected main category
      if (selectedCategory) {
        const itemMainCategory = categoryMapping[data.category] || data.category;
        if (itemMainCategory !== selectedCategory) return false;
      }
      
      return true;
    });
  }, [rows, searchQuery, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    rows.forEach(({ data }) => {
      const mainCategory = categoryMapping[data.category] || data.category;
      stats[mainCategory] = (stats[mainCategory] || 0) + 1;
    });
    return stats;
  }, [rows]);

  const trendingItems = useMemo(() => {
    return filtered.slice(0, 6);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">vS</span>
            </div>
            <span className="font-bold text-gray-900">vStudent</span>
          </div>
          <button className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full blur-2xl opacity-30"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Student Marketplace
            </h1>
            <Sparkles className="h-6 w-6 text-pink-600" />
          </div>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Buy & sell student essentials near your campus. Find books, furniture, gadgets & more!
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 pb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search books, furniture, gadgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-purple-200 focus:border-purple-400 focus:outline-none shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-purple-100 text-purple-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 pb-6">
        <div className="flex gap-3 justify-center">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md border border-purple-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">{rows.length} Listings</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md border border-purple-100">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">4.8 Rating</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md border border-purple-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">2h Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="px-4 pb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mainCategories.map((category) => {
            const Icon = categoryIcons[category] || ShoppingBag;
            const count = categoryStats[category] || 0;
            const colorClass = categoryColors[category] || "bg-gray-100 text-gray-700 border-gray-200";
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
                className={`p-6 rounded-2xl border-2 transition-all h-full min-h-[140px] flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 ${
                  selectedCategory === category
                    ? colorClass.replace('100', '200').replace('text-', 'bg-').replace('border-', 'text-')
                    : colorClass
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <div className="text-sm font-semibold">{category}</div>
                <div className="text-xs opacity-75">{count} items</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Category Items */}
      {selectedCategory && (
        <section className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{selectedCategory}</h2>
            <button
              onClick={() => setSelectedCategory("")}
              className="text-purple-600 text-sm font-medium"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {filtered.slice(0, 8).map(({ id, data }) => (
              <div key={id} className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
                <div className="flex gap-3">
                  {data.photoUrls?.[0] && (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image 
                        src={data.photoUrls[0]} 
                        alt={data.title} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{data.title}</h3>
                    <p className="text-purple-600 font-bold">₹{data.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{data.area}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {data.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Items */}
      {!selectedCategory && trendingItems.length > 0 && (
        <section className="px-4 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Trending Near You</h2>
          </div>
          <div className="space-y-3">
            {trendingItems.map(({ id, data }) => (
              <div key={id} className="bg-white rounded-2xl p-4 shadow-md border border-purple-100">
                <div className="flex gap-3">
                  {data.photoUrls?.[0] && (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image 
                        src={data.photoUrls[0]} 
                        alt={data.title} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{data.title}</h3>
                    <p className="text-purple-600 font-bold">₹{data.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{data.area}</span>
                      {Math.random() > 0.5 && (
                        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full">
                          {Math.random() > 0.5 ? "Hot" : "New"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      <section className="px-4 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map(({ id, data }) => (
              <ItemCard key={id} id={id} listing={data} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 z-40">
        <div className="flex justify-around py-2">
          <Link href="/rooms" className="flex flex-col items-center gap-1 p-2 text-gray-600">
            <Home className="h-5 w-5" />
            <span className="text-xs">Rooms</span>
          </Link>
          <Link href="/items" className="flex flex-col items-center gap-1 p-2 text-purple-600">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">Items</span>
          </Link>
          <Link href="/post" className="flex flex-col items-center gap-1 p-2 text-gray-600">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"></div>
            <span className="text-xs">Post</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-600">
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            <span className="text-xs">Me</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
