'use client';

import { MapPin, Users, ChevronLeft, ChevronRight, Wine as WineIcon, MessageSquare, Calendar } from 'lucide-react';
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

type SlideType = 'overview' | 'host-note' | 'featured-wines' | 'events';

export default function ClubCard({ club, isJoined = false, onJoin, onLeave, isLoading = false }: ClubCardProps) {
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
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{club.host_name}</h3>
                <p className="text-sm text-gray-500 mt-1.5 font-mono tracking-wide">CODE: {club.host_code}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-semibold">{club.distance.toFixed(1)}</span>
                <span className="text-xs">mi</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-md border border-purple-100">
              <Users className="w-4 h-4 flex-shrink-0 text-purple-600" />
              <span className="font-medium">{club.member_count} {club.member_count === 1 ? 'member' : 'members'}</span>
            </div>

            {winePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {winePreferences.map((pref, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 bg-gradient-to-r from-rose-100 to-purple-100 text-rose-900 text-xs font-bold rounded-full border border-rose-200 shadow-sm uppercase tracking-wide"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="leading-relaxed">{club.club_address}</span>
              </div>
            </div>

            {club.about_club && (
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed italic border-l-2 border-amber-400 pl-3">
                {club.about_club}
              </p>
            )}
          </div>
        );

      case 'host-note':
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-amber-300">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Host's Note</h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {club.about_club ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute -left-2 -top-2 text-6xl text-amber-200 font-serif leading-none">"</div>
                    <p className="text-base text-gray-700 leading-relaxed relative z-10 pl-6 pr-2 pt-4">
                      {club.about_club}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <p className="text-sm font-semibold text-gray-600">
                      {club.host_name}
                    </p>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center border-2 border-amber-200">
                    <MessageSquare className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    The host hasn't shared a note yet
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'featured-wines':
        // Mock featured wines data
        const featuredWines = [
          { name: '2019 Cabernet Sauvignon', vineyard: 'Napa Valley Reserve', varietal: 'Cabernet' },
          { name: '2021 Pinot Noir', vineyard: 'Willamette Valley', varietal: 'Pinot Noir' },
          { name: '2020 Chardonnay', vineyard: 'Russian River', varietal: 'Chardonnay' },
        ];

        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-300">
              <WineIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Featured Wines</h3>
            </div>

            {/* Hero Wine Image */}
            <div className="relative w-full h-32 bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 rounded-lg overflow-hidden border-2 border-purple-200 shadow-inner">
              <Image
                src="https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Featured+Wine"
                alt="Featured Wine"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-2 left-3 right-3">
                <p className="text-white font-bold text-sm drop-shadow-lg">Featured Selection</p>
              </div>
            </div>

            {/* Wine List */}
            <div className="space-y-2 flex-1">
              {featuredWines.slice(0, 3).map((wine, index) => (
                <div key={index} className="flex gap-3 items-center p-2 rounded-md hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-rose-100 rounded flex items-center justify-center flex-shrink-0 border border-purple-200">
                    <WineIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-xs truncate leading-tight">{wine.name}</h4>
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
            <div className="flex items-center gap-2 pb-3 border-b-2 border-rose-300">
              <Calendar className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Upcoming Events</h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 w-full">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-100 to-amber-100 rounded-full flex items-center justify-center border-2 border-rose-200 shadow-inner">
                  <Calendar className="w-10 h-10 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-gray-900">Join to see events</p>
                  <p className="text-sm text-gray-600 leading-relaxed px-4">
                    Members get access to exclusive tastings, wine education, and social gatherings
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
                  <WineIcon className="w-4 h-4 text-gray-400" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
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
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* Decorative top border */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400"></div>

      <div className="p-6 flex flex-col flex-1">
        {/* Slide Content */}
        <div className="flex-1 min-h-[320px] mb-4">
          {renderSlide()}
        </div>

        {/* Slide Navigation */}
        <div className="flex items-center justify-center gap-3 mb-4 py-2">
          <button
            onClick={goToPrevSlide}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide}
                onClick={() => {
                  setAutoAdvance(false);
                  setCurrentSlide(slide);
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === slide
                    ? 'w-8 h-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNextSlide}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAction}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all duration-200 disabled:bg-gray-400 uppercase tracking-wide text-sm shadow-sm ${
              isJoined
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 text-white hover:shadow-md hover:scale-[1.02] border-2 border-transparent'
            }`}
          >
            {isLoading ? 'Loading...' : isJoined ? 'Leave Club' : 'Join Club'}
          </button>
          <Link
            href={`/dashboard/member/clubs/${club.host_id}`}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-center font-bold uppercase tracking-wide text-sm hover:border-gray-400"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
