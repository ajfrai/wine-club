'use client';

import { Event } from '@/types/member.types';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  isLoading?: boolean;
}

export default function EventCard({ event, onRegister, isLoading = false }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const isFullyBooked = event.max_attendees && event.attendee_count
    ? event.attendee_count >= event.max_attendees
    : false;

  const canRegister = !event.user_registered && !isFullyBooked;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            {event.host && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Hosted by {event.host.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {event.max_attendees ? (
            <span>
              {event.attendee_count || 0} / {event.max_attendees} attending
            </span>
          ) : (
            <span>{event.attendee_count || 0} attending</span>
          )}
        </div>

        {event.user_registered ? (
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            Registered
          </span>
        ) : (
          <button
            onClick={() => onRegister?.(event.id)}
            disabled={isLoading || !canRegister}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              canRegister
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Registering...' : isFullyBooked ? 'Fully Booked' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
}
