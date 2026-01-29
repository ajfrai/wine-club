'use client';

import { useState, useEffect, useRef } from 'react';
import ClubCard from './ClubCard';
import { NearbyClub } from '@/types/member.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ClubsGridProps {
  initialClubs?: NearbyClub[];
  joinedClubIds?: string[];
  onJoin?: (hostId: string) => Promise<void>;
  onLeave?: (hostId: string) => Promise<void>;
}

export default function ClubsGrid({ initialClubs = [], joinedClubIds = [], onJoin, onLeave }: ClubsGridProps) {
  const [clubs, setClubs] = useState<NearbyClub[]>(initialClubs);
  const [loadingClubId, setLoadingClubId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClubs(initialClubs);
    setCurrentIndex(0);
  }, [initialClubs]);

  // Update visible count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCount(1); // Mobile: 1 card
      } else if (width < 1024) {
        setVisibleCount(2); // Tablet: 2 cards
      } else {
        setVisibleCount(3); // Desktop: 3 cards
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const handleJoin = async (hostId: string) => {
    if (!onJoin) return;
    setLoadingClubId(hostId);
    try {
      await onJoin(hostId);
    } finally {
      setLoadingClubId(null);
    }
  };

  const handleLeave = async (hostId: string) => {
    if (!onLeave) return;
    setLoadingClubId(hostId);
    try {
      await onLeave(hostId);
    } finally {
      setLoadingClubId(null);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, clubs.length - visibleCount);
      return Math.min(prev + 1, maxIndex);
    });
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const canGoNext = currentIndex < clubs.length - visibleCount;
  const canGoPrev = currentIndex > 0;

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No clubs found in your area.</p>
        <p className="text-sm text-gray-500 mt-2">Try increasing your search radius or updating your location.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Navigation */}
      {clubs.length > visibleCount && (
        <>
          <button
            onClick={goToPrev}
            disabled={!canGoPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-200 transition-all ${
              canGoPrev
                ? 'hover:bg-gray-50 text-gray-700'
                : 'opacity-50 cursor-not-allowed text-gray-400'
            }`}
            aria-label="Previous clubs"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-200 transition-all ${
              canGoNext
                ? 'hover:bg-gray-50 text-gray-700'
                : 'opacity-50 cursor-not-allowed text-gray-400'
            }`}
            aria-label="Next clubs"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden" ref={carouselRef}>
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {clubs.map((club) => (
            <div
              key={club.host_id}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 24 / visibleCount}px)`,
              }}
            >
              <ClubCard
                club={club}
                isJoined={joinedClubIds.includes(club.host_id)}
                onJoin={handleJoin}
                onLeave={handleLeave}
                isLoading={loadingClubId === club.host_id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicators */}
      {clubs.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(clubs.length / visibleCount) }).map((_, index) => {
            const isActive = Math.floor(currentIndex / visibleCount) === index;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * visibleCount)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-wine' : 'bg-gray-300'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Club Counter */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Showing {Math.min(currentIndex + 1, clubs.length)} - {Math.min(currentIndex + visibleCount, clubs.length)} of {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
      </p>
    </div>
  );
}
