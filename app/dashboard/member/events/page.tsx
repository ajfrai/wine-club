'use client';

import { useState, useEffect } from 'react';
import EventsList from '@/components/dashboard/EventsList';
import { Event } from '@/types/member.types';
import { Loader2 } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events/upcoming');
      if (response.ok) {
        const { events: fetchedEvents } = await response.json();
        setEvents(fetchedEvents || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });

      if (response.ok) {
        // Reload events to update registration status
        loadEvents();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-gray-600 mt-2">View and register for events from your wine clubs.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-wine animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <EventsList events={events} onRegister={handleRegister} />
      )}
    </div>
  );
}
