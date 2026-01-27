'use client';

import { useState, useRef } from 'react';
import WineCard from './WineCard';
import { Wine } from '@/types/member.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WinesCarouselProps {
  wines: Wine[];
}

export default function WinesCarousel({ wines }: WinesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 336; // Width of card (320px) + gap (16px)
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  if (wines.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No featured wines available.</p>
        <p className="text-sm text-gray-500 mt-2">Check back later for new wine selections.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {wines.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
}
