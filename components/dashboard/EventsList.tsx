'use client';

import { useState } from 'react';
import EventCard from './EventCard';
import { Event } from '@/types/member.types';

interface EventsListProps {
  events: Event[];
  onRegister?: (eventId: string) => Promise<void>;
}

export default function EventsList({ events, onRegister }: EventsListProps) {
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  const handleRegister = async (eventId: string) => {
    if (!onRegister) return;
    setLoadingEventId(eventId);
    try {
      await onRegister(eventId);
    } finally {
      setLoadingEventId(null);
    }
  };

  const groupEventsByDate = (events: Event[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    const grouped: { [key: string]: Event[] } = {
      Today: [],
      'This Week': [],
      'This Month': [],
      Later: [],
    };

    events.forEach((event) => {
      const eventDate = new Date(event.event_date);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (eventDay.getTime() === today.getTime()) {
        grouped.Today.push(event);
      } else if (eventDate < weekFromNow) {
        grouped['This Week'].push(event);
      } else if (eventDate < monthFromNow) {
        grouped['This Month'].push(event);
      } else {
        grouped.Later.push(event);
      }
    });

    return grouped;
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No upcoming events.</p>
        <p className="text-sm text-gray-500 mt-2">Join clubs to see their upcoming events.</p>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([group, groupEvents]) => {
        if (groupEvents.length === 0) return null;

        return (
          <div key={group}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{group}</h3>
            <div className="space-y-4">
              {groupEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegister}
                  isLoading={loadingEventId === event.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
