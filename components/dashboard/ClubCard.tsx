'use client';

import { MapPin, Users, ChevronLeft, ChevronRight, Wine as WineIcon, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { NearbyClub } from '@/types/member.types';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ClubCardProps {
  club: NearbyClub;
  isJoined?: boolean;
  isPending?: boolean;
  onJoin?: (hostId: string) => void;
  onLeave?: (hostId: string) => void;
  isLoading?: boolean;
}

type SlideType = 'overview' | 'host-note' | 'featured-wines' | 'events';

export default function ClubCard({
  club,
  isJoined = false,
  isPending = false,
  onJoin,
  onLeave,
  isLoading = false
}: ClubCardProps) {
  const [currentSlide, setCurrentSlide] = useState<SlideType>('overview');
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Parse wine preferences from comma-separated string
  const winePreferences = club.wine_preferences
    ? club.wine_preferences.split(',').map(pref => pref.trim()).filter(Boolean).slice(0, 3)
    : [];

  // Fixed 4 slides
  const slides: SlideType[] = ['overview', 'host-note', 'featured-wines', 'events'];

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoAdvance) return;

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
    } else if (!isJoined && !isPending && onJoin) {
      onJoin(club.host_id);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isPending) return 'Request Pending...';
    if (isJoined) return 'Leave Club';
    if (club.join_mode === 'request') return 'Request to Join';
    return 'Join Club';
  };

  const getButtonStyle = () => {
    if (isPending) {
      return 'bg-gray-300 text-gray-600 cursor-not-allowed';
    }
    if (isJoined) {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    return 'bg-wine text-white hover:bg-wine-dark';
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
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-1 mb-2 text-sm text-gray-700">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{club.member_count} {club.member_count === 1 ? 'member' : 'members'}</span>
              </div>

              {winePreferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
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
            </div>

            <div className="space-y-2">
              <div className="relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden mb-3">
                <Image
                  src="https://placehold.co/200x80/8B4049/FFFFFF/png?text=Club+Logo"
                  alt="Club Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{club.club_address}</span>
              </div>
            </div>
          </div>
        );

      case 'host-note':
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
              <MessageSquare className="w-5 h-5 text-wine" />
              <h3 className="text-lg font-semibold text-gray-900">Host's Note</h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {club.about_club ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{club.about_club}"
                  </p>
                  <p className="text-sm text-gray-600 text-right">
                    — {club.host_name}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No host note available
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'featured-wines':
        // Mock featured wines data
        const featuredWines = [
          { name: '2019 Cabernet Sauvignon', vineyard: 'Napa Valley Reserve' },
          { name: '2021 Pinot Noir', vineyard: 'Willamette Valley' },
          { name: '2020 Chardonnay', vineyard: 'Russian River' },
        ];

        return (
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <WineIcon className="w-5 h-5 text-wine" />
                <h3 className="text-lg font-semibold text-gray-900">Featured Wines</h3>
              </div>

              {/* Hero Wine Image */}
              <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src="https://placehold.co/400x300/8B4049/FFFFFF/png?text=Featured+Wine"
                  alt="Featured Wine"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Wine List */}
            <div className="space-y-2">
              {featuredWines.map((wine, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="w-8 h-8 bg-wine-light rounded flex items-center justify-center flex-shrink-0">
                    <WineIcon className="w-4 h-4 text-wine-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{wine.name}</h4>
                    <p className="text-xs text-gray-600 truncate">{wine.vineyard}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-wine" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Calendar className="w-16 h-16 mx-auto text-gray-300" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Join to see events</p>
                  <p className="text-xs text-gray-600">
                    Members get access to exclusive tastings and gatherings
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Club Header - Always Visible */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{club.host_name}</h3>
          <p className="text-sm text-gray-600 mt-1">Code: {club.host_code}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{club.distance.toFixed(1)} mi</span>
        </div>
      </div>

      {/* Slide Content */}
      <div className="h-[280px] mb-4 flex flex-col">
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
          disabled={isLoading || isPending}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${getButtonStyle()}`}
        >
          {getButtonText()}
        </button>
        <Link
          href={`/clubs/${club.host_code}`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
