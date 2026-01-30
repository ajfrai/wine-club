'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Wine, DollarSign, Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  wines_theme: string | null;
  price: number | null;
  max_attendees: number | null;
  host_id: string;
  created_at: string;
  host?: {
    id: string;
    full_name: string;
    hosts: {
      host_code: string;
    }[];
  };
}

interface Attendee {
  id: string;
  status: string;
  registered_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface EventDetailClientProps {
  event: Event;
  attendeeCount: number;
  isRegistered: boolean;
  isHost: boolean;
  attendees: Attendee[] | null;
}

export const EventDetailClient: React.FC<EventDetailClientProps> = ({
  event,
  attendeeCount: initialAttendeeCount,
  isRegistered: initialIsRegistered,
  isHost,
  attendees,
}) => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [attendeeCount, setAttendeeCount] = useState(initialAttendeeCount);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isPastEvent = () => {
    return new Date(event.event_date) < new Date();
  };

  const isFull = () => {
    return event.max_attendees !== null && attendeeCount >= event.max_attendees;
  };

  const handleRSVP = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isRegistered) {
        // Cancel registration (update status to cancelled)
        const response = await fetch('/api/events/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: event.id }),
        });

        if (response.ok) {
          setIsRegistered(false);
          setAttendeeCount(prev => Math.max(0, prev - 1));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to cancel registration');
        }
      } else {
        // Register for event
        const response = await fetch('/api/events/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: event.id }),
        });

        if (response.ok) {
          setIsRegistered(true);
          setAttendeeCount(prev => prev + 1);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to register for event');
        }
      }
    } catch (error) {
      console.error('RSVP error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hostName = event.host?.full_name || 'Unknown Host';
  const hostCode = event.host?.hosts?.[0]?.host_code;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-wine hover:text-wine-dark mb-6 text-sm font-medium"
        >
          ← Back
        </button>

        {/* Event Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-wine to-wine-dark text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-2 text-wine-light">
              <Calendar size={18} />
              <span className="text-lg">
                {formatDate(event.event_date)} at {formatTime(event.event_date)}
              </span>
            </div>
            {isPastEvent() && (
              <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-full text-sm">
                Past Event
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Host */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Hosted By</h3>
                  <p className="text-gray-700">{hostName}</p>
                  {hostCode && (
                    <a
                      href={`/clubs/${hostCode}`}
                      className="text-wine hover:text-wine-dark text-sm"
                    >
                      View Club →
                    </a>
                  )}
                </div>
              </div>

              {/* Wines/Theme */}
              {event.wines_theme && (
                <div className="flex items-start gap-3">
                  <Wine className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Wines & Theme</h3>
                    <p className="text-gray-700">{event.wines_theme}</p>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Price</h3>
                  <p className="text-gray-700">
                    {event.price ? `$${event.price.toFixed(2)}` : 'Free'}
                  </p>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Capacity</h3>
                  <p className="text-gray-700">
                    {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} registered
                    {event.max_attendees && ` (${event.max_attendees} max)`}
                  </p>
                  {isFull() && (
                    <span className="text-sm text-sunburst-600 font-medium">Event is full</span>
                  )}
                </div>
              </div>

              {/* Date Range (if multi-day) */}
              {event.end_date && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-wine mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Duration</h3>
                    <p className="text-gray-700">
                      Ends {formatDate(event.end_date)} at {formatTime(event.end_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RSVP Button */}
            {!isHost && (
              <div className="pt-6 border-t border-gray-200">
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                      <Check size={20} />
                      <span className="font-medium">You're registered for this event</span>
                    </div>
                    {!isPastEvent() && (
                      <Button
                        onClick={handleRSVP}
                        variant="secondary"
                        isLoading={isLoading}
                        className="w-full"
                      >
                        <X size={20} className="mr-2" />
                        Cancel Registration
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleRSVP}
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isFull() || isPastEvent()}
                    className="w-full"
                  >
                    {isPastEvent()
                      ? 'Event Has Passed'
                      : isFull()
                      ? 'Event is Full'
                      : 'RSVP for This Event'}
                  </Button>
                )}
              </div>
            )}

            {/* Attendee List (Host Only) */}
            {isHost && attendees && attendees.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attendees ({attendees.length})
                </h3>
                <div className="space-y-3">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{attendee.users.full_name}</p>
                        <p className="text-sm text-gray-500">{attendee.users.email}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Registered {new Date(attendee.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
