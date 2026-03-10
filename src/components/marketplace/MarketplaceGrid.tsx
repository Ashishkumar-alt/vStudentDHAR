import { ReactNode } from 'react';

interface MarketplaceGridProps {
  children: ReactNode;
  className?: string;
}

export default function MarketplaceGrid({ children, className = '' }: MarketplaceGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}
