import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  href: string;
  className?: string;
}

export default function CategoryCard({ name, icon, count, href, className = '' }: CategoryCardProps) {
  return (
    <Link 
      href={href}
      className={`group relative overflow-hidden rounded-xl bg-white border border-gray-200 p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-200 min-h-[110px] flex flex-col items-center justify-center w-full ${className}`}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Colorful Icon */}
        <div className="mb-2 flex items-center justify-center">
          <div className="w-8 h-8 flex items-center justify-center text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
            {icon}
          </div>
        </div>
        
        {/* Category name */}
        <h3 className="mb-1 text-sm font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-600 text-center break-words">
          {name}
        </h3>
        
        {/* Item count */}
        <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-700 text-center">
          {count} items
        </p>
      </div>
      
      {/* Subtle border animation */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-blue-300" />
    </Link>
  );
}
