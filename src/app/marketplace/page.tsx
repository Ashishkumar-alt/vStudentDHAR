"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Clock, Star } from 'lucide-react';
import CategoryCard from '@/components/marketplace/CategoryCard';
import MarketplaceGrid from '@/components/marketplace/MarketplaceGrid';

// Mock data for categories with colorful emojis (disabled for now to fix routing)
const categories = [
  {
    name: 'Books',
    icon: '📚',
    count: 156,
    href: '#',
    description: 'Textbooks, notes, study materials'
  },
  {
    name: 'Furniture',
    icon: '🪑',
    count: 89,
    href: '#',
    description: 'Chairs, tables, beds, storage'
  },
  {
    name: 'Bikes',
    icon: '🚲',
    count: 45,
    href: '#',
    description: 'Bicycles, scooters, accessories'
  },
  {
    name: 'Electronics',
    icon: '💻',
    count: 123,
    href: '#',
    description: 'Laptops, phones, gadgets'
  },
  {
    name: 'Notes',
    icon: '📝',
    count: 234,
    href: '#',
    description: 'Study notes, assignments, papers'
  },
  {
    name: 'Other',
    icon: '📦',
    count: 67,
    href: '#',
    description: 'Miscellaneous student items'
  }
];

// Mock featured items
const featuredItems = [
  {
    id: '1',
    title: 'Engineering Mathematics Textbook',
    price: 450,
    condition: 'Good',
    category: 'books',
    image: '/api/placeholder/300/300',
    location: 'Near GCD Campus',
    isFavorite: false
  },
  {
    id: '2',
    title: 'Study Chair with Back Support',
    price: 1200,
    condition: 'Like-new',
    category: 'furniture',
    image: '/api/placeholder/300/300',
    location: 'Dharamshala',
    isFavorite: true
  },
  {
    id: '3',
    title: 'Mountain Bike - 21 Speed',
    price: 3500,
    condition: 'Good',
    category: 'bikes',
    image: '/api/placeholder/300/300',
    location: 'Mcleodganj',
    isFavorite: false
  },
  {
    id: '4',
    title: 'Laptop Stand Adjustable',
    price: 800,
    condition: 'New',
    category: 'electronics',
    image: '/api/placeholder/300/300',
    location: 'Near Bus Stand',
    isFavorite: false
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sticky Search Bar - Mobile Only */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 sm:hidden">
        <div className="w-full max-w-full px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-2 overflow-hidden">
              <div className="flex flex-1 items-center gap-3 px-4 min-w-0">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-2 bg-transparent outline-none text-gray-900 placeholder-gray-400 min-w-0"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Header Section - Desktop Only */}
      <div className="bg-white border-b border-gray-200 hidden sm:block">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Student Marketplace
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Buy and sell student essentials. Find textbooks, furniture, electronics, and more near your college.
            </p>
            
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
              <div className="relative">
                <div className="flex gap-2 bg-gray-100 rounded-xl p-2">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search for items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 py-2 sm:py-3 bg-transparent outline-none text-gray-900 placeholder-gray-400 min-w-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base flex-shrink-0"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile Optimized */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile: Horizontal row */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 sm:hidden">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">717</span>
            <span>Listings</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-900">4.8</span>
            <span>Rating</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-500">⏱</span>
            <span className="font-semibold text-gray-900">2h</span>
            <span>Response</span>
          </div>
        </div>

        {/* Desktop: Original 3-column layout */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">717</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">2h</div>
            <div className="text-sm text-gray-600">Avg. Response Time</div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Browse Categories</h2>
          <p className="text-sm sm:text-base text-gray-600">Find exactly what you're looking for</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
              count={category.count}
              href={category.href}
            />
          ))}
        </div>
      </div>

      {/* Featured Items Section - Mobile Optimized */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Featured Items</h2>
            <p className="text-sm sm:text-base text-gray-600">Popular items from students near you</p>
          </div>
          <Link 
            href="/marketplace/featured" 
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm sm:text-base flex-shrink-0"
          >
            View all
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
        
        {/* Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {featuredItems.map((item) => (
            <Link key={item.id} href={`/marketplace-item/${item.id}`} className="block">
              <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{item.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-blue-600">₹{item.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{item.condition}</span>
                </div>
                <div className="text-xs text-gray-600 line-clamp-1">{item.location}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
