'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';

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
  attendee_count: number;
}

interface PublicEventsTabProps {
  hostCode: string;
}

export const PublicEventsTab: React.FC<PublicEventsTabProps> = ({ hostCode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clubs/${hostCode}/events`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [hostCode]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-wine animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 mb-3">{event.description}</p>
              )}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatDate(event.event_date)} at {formatTime(event.event_date)}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.max_attendees && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      {event.attendee_count} / {event.max_attendees} spots filled
                    </span>
                  </div>
                )}
                {event.wines_theme && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-wine-light text-wine-dark text-xs font-medium rounded-full">
                      {event.wines_theme}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {event.price !== null && event.price > 0 && (
              <div className="ml-4 text-right">
                <div className="text-xl font-bold text-gray-900">${event.price}</div>
                <div className="text-xs text-gray-500">per person</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
