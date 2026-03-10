"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, MapPin, Tag, User, Phone, MessageCircle, Share2 } from 'lucide-react';

// Mock item data
const mockItems: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Engineering Mathematics Volume 1',
    price: 450,
    condition: 'Good',
    description: 'Comprehensive engineering mathematics textbook covering calculus, linear algebra, and differential equations. Perfect for first-year engineering students. Book is in good condition with minimal highlighting and no missing pages.',
    category: 'Books',
    image: '/api/placeholder/400/400',
    location: 'Near GCD Campus',
    postedBy: 'Rahul Sharma',
    postedDate: '2 days ago',
    phone: '+91 98765 43210',
    isFavorite: false,
    views: 145,
    likes: 23
  },
  '2': {
    id: '2',
    title: 'Study Chair with Back Support',
    price: 1200,
    condition: 'Like-new',
    description: 'Ergonomic study chair with excellent back support. Adjustable height, comfortable cushioning, and sturdy construction. Perfect for long study sessions. Barely used for 3 months.',
    category: 'Furniture',
    image: '/api/placeholder/400/400',
    location: 'Dharamshala',
    postedBy: 'Priya Patel',
    postedDate: '1 week ago',
    phone: '+91 98765 43211',
    isFavorite: true,
    views: 89,
    likes: 15
  },
  '3': {
    id: '3',
    title: 'Mountain Bike - 21 Speed',
    price: 3500,
    condition: 'Good',
    description: 'Well-maintained mountain bike with 21 speed gears. Perfect for commuting around campus and weekend rides. Recent servicing done, tires in good condition. Includes lock and helmet.',
    category: 'Bikes',
    image: '/api/placeholder/400/400',
    location: 'Mcleodganj',
    postedBy: 'Amit Kumar',
    postedDate: '3 days ago',
    phone: '+91 98765 43212',
    isFavorite: false,
    views: 201,
    likes: 34
  },
  '4': {
    id: '4',
    title: 'Laptop Stand Adjustable',
    price: 800,
    condition: 'New',
    description: 'Brand new adjustable laptop stand. Ergonomic design for better posture. Compatible with all laptop sizes. Adjustable height and angle. Still in original packaging.',
    category: 'Electronics',
    image: '/api/placeholder/400/400',
    location: 'Near Bus Stand',
    postedBy: 'Neha Singh',
    postedDate: '5 days ago',
    phone: '+91 98765 43213',
    isFavorite: false,
    views: 67,
    likes: 8
  }
};

const conditionColors = {
  'New': 'bg-green-100 text-green-800',
  'Good': 'bg-yellow-100 text-yellow-800',
  'Like-new': 'bg-blue-100 text-blue-800',
};

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [item, setItem] = React.useState(mockItems[itemId] || null);
  const [isFavorite, setIsFavorite] = React.useState(item?.isFavorite || false);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <Link 
            href="/marketplace" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // In real app, this would update the database
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this ${item.category.toLowerCase()} on vStudent`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/marketplace"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleFavoriteToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Image Section */}
          <div className="aspect-square bg-gray-200 relative">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${conditionColors[item.condition as keyof typeof conditionColors]}`}>
                {item.condition}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            {/* Title and Price */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">₹{item.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium text-gray-900">{item.category}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Seller Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.postedBy}</div>
                    <div className="text-sm text-gray-500">Posted {item.postedDate}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>{item.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{item.likes} likes</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${item.phone}`}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call Seller
              </a>
              <a
                href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(mockItems)
              .filter(i => i.id !== itemId && i.category === item.category)
              .slice(0, 4)
              .map((similarItem) => (
                <Link key={similarItem.id} href={`/marketplace-item/${similarItem.id}`} className="block">
                  <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{similarItem.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">₹{similarItem.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">{similarItem.condition}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
