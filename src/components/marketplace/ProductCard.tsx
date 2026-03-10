import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  condition: 'New' | 'Good' | 'Like-new';
  category: string;
  image: string;
  location?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

const conditionColors = {
  'New': 'bg-green-100 text-green-800',
  'Good': 'bg-yellow-100 text-yellow-800',
  'Like-new': 'bg-blue-100 text-blue-800',
};

export default function ProductCard({ 
  id, 
  title, 
  price, 
  condition, 
  category, 
  image, 
  location,
  isFavorite = false,
  onFavoriteToggle,
  className = ''
}: ProductCardProps) {
  return (
    <Link 
      href={`/marketplace/${category}/${id}`}
      className={`group block overflow-hidden rounded-2xl bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-200 ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110"
        >
          <Heart 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        
        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-800">
            {category}
          </span>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
          {title}
        </h3>
        
        {/* Price and Condition */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${conditionColors[condition]}`}>
              {condition}
            </span>
          </div>
        </div>
        
        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
