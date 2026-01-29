'use client';

import { MapPin, Users, ChevronLeft, ChevronRight, Wine as WineIcon } from 'lucide-react';
import Link from 'next/link';
import { NearbyClub } from '@/types/member.types';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ClubCardProps {
  club: NearbyClub;
  isJoined?: boolean;
  onJoin?: (hostId: string) => void;
  onLeave?: (hostId: string) => void;
  isLoading?: boolean;
}

type SlideType = 'overview' | 'hero-wine' | 'featured-wines' | 'host-note';

export default function ClubCard({ club, isJoined = false, onJoin, onLeave, isLoading = false }: ClubCardProps) {
  const [currentSlide, setCurrentSlide] = useState<SlideType>('overview');
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Parse wine preferences from comma-separated string
  const winePreferences = club.wine_preferences
    ? club.wine_preferences.split(',').map(pref => pref.trim()).filter(Boolean).slice(0, 3)
    : [];

  // Determine available slides
  const slides: SlideType[] = ['overview'];
  if (club.hero_wine) slides.push('hero-wine');
  if (club.featured_wines && club.featured_wines.length > 0) slides.push('featured-wines');
  if (club.about_club) slides.push('host-note');

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoAdvance || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(current => {
        const currentIndex = slides.indexOf(current);
        const nextIndex = (currentIndex + 1) % slides.length;
        return slides[nextIndex];
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoAdvance, slides]);

  const handleAction = () => {
    if (isJoined && onLeave) {
      onLeave(club.host_id);
    } else if (!isJoined && onJoin) {
      onJoin(club.host_id);
    }
  };

  const goToNextSlide = () => {
    setAutoAdvance(false);
    const currentIndex = slides.indexOf(currentSlide);
    const nextIndex = (currentIndex + 1) % slides.length;
    setCurrentSlide(slides[nextIndex]);
  };

  const goToPrevSlide = () => {
    setAutoAdvance(false);
    const currentIndex = slides.indexOf(currentSlide);
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    setCurrentSlide(slides[prevIndex]);
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{club.host_name}</h3>
                <p className="text-sm text-gray-600 mt-1">Code: {club.host_code}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{club.distance.toFixed(1)} mi</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{club.member_count} {club.member_count === 1 ? 'member' : 'members'}</span>
            </div>

            {winePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {winePreferences.map((pref, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-wine-light text-wine-dark text-xs font-medium rounded-full"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{club.club_address}</span>
            </div>
          </div>
        );

      case 'hero-wine':
        const heroWine = club.hero_wine;
        if (!heroWine) return null;

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <WineIcon className="w-5 h-5 text-wine" />
              Featured Wine
            </h3>

            {heroWine.image_url && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={heroWine.image_url}
                  alt={heroWine.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900">{heroWine.name}</h4>
              {heroWine.vineyard && (
                <p className="text-sm text-gray-600">{heroWine.vineyard}</p>
              )}
              {heroWine.vintage && (
                <p className="text-sm text-gray-600">{heroWine.vintage}</p>
              )}
            </div>

            {heroWine.description && (
              <p className="text-sm text-gray-700 line-clamp-3">{heroWine.description}</p>
            )}

            {heroWine.tasting_notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Tasting Notes</p>
                <p className="text-sm text-gray-700 line-clamp-2">{heroWine.tasting_notes}</p>
              </div>
            )}
          </div>
        );

      case 'featured-wines':
        const featuredWines = club.featured_wines || [];
        if (featuredWines.length === 0) return null;

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <WineIcon className="w-5 h-5 text-wine" />
              More Featured Wines
            </h3>

            <div className="space-y-3">
              {featuredWines.map((wine) => (
                <div key={wine.id} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0">
                  {wine.image_url && (
                    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={wine.image_url}
                        alt={wine.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{wine.name}</h4>
                    {wine.vineyard && (
                      <p className="text-xs text-gray-600 truncate">{wine.vineyard}</p>
                    )}
                    {wine.varietal && (
                      <p className="text-xs text-gray-500">{wine.varietal}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'host-note':
        if (!club.about_club) return null;

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">About This Club</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{club.about_club}</p>
            <div className="pt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Host:</span> {club.host_name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {club.club_address}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Slide Content */}
      <div className="flex-1 min-h-[280px] mb-4">
        {renderSlide()}
      </div>

      {/* Slide Navigation */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={goToPrevSlide}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex gap-1.5">
            {slides.map((slide) => (
              <button
                key={slide}
                onClick={() => {
                  setAutoAdvance(false);
                  setCurrentSlide(slide);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === slide ? 'bg-wine' : 'bg-gray-300'
                }`}
                aria-label={`Go to ${slide} slide`}
              />
            ))}
          </div>

          <button
            onClick={goToNextSlide}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAction}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 ${
            isJoined
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-wine text-white hover:bg-wine-dark'
          }`}
        >
          {isLoading ? 'Loading...' : isJoined ? 'Leave Club' : 'Join Club'}
        </button>
        <Link
          href={`/dashboard/member/clubs/${club.host_id}`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
