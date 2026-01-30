'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, MapPin, Users } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { EventForm } from '@/components/host/EventForm';
import { EventFormData } from '@/lib/validations/event-form.schema';

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

interface EventsTabProps {
  upcomingEventsCount: number;
  defaultLocation: string;
}

export const EventsTab: React.FC<EventsTabProps> = ({ upcomingEventsCount, defaultLocation }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await fetch('/api/host/events');
        if (response.ok) {
          const data = await response.json();
          // Filter for upcoming events and take first 3
          const now = new Date();
          const upcoming = data.events
            .filter((event: Event) => new Date(event.event_date) >= now)
            .slice(0, 3);
          setUpcomingEvents(upcoming);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/host/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        // Refresh events list
        const refreshResponse = await fetch('/api/host/events');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const now = new Date();
          const upcoming = data.events
            .filter((event: Event) => new Date(event.event_date) >= now)
            .slice(0, 3);
          setUpcomingEvents(upcoming);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

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

  return (
    <div className="space-y-6">
      {/* Events Overview Card */}
      <div className="bg-gradient-to-r from-wine to-wine-dark rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Manage Events</h2>
              <p className="text-wine-light">Create and manage events for your wine club</p>
            </div>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-white text-wine hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
        {upcomingEventsCount > 0 && (
          <div className="mt-6 pt-6 border-t border-wine-light/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wine-light text-sm mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold">{upcomingEventsCount}</p>
              </div>
              <Link
                href="/dashboard/host/club/events"
                className="text-white hover:text-wine-light text-sm font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Upcoming Events</h3>
          {upcomingEvents.length > 0 && (
            <Link
              href="/dashboard/host/club/events"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          )}
        </div>

        {isLoadingEvents ? (
          <div className="text-center py-8 text-blue-600">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-700 mb-2">No upcoming events scheduled</p>
            <p className="text-sm text-blue-600">Create your first event to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href="/dashboard/host/club/events"
                className="block bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">{event.title}</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(event.event_date)} at {formatTime(event.event_date)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.attendee_count} / {event.max_attendees} attendees
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {event.price && (
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-blue-900">${event.price}</div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title="Create Event"
        maxWidth="lg"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={closeDialog}
          isLoading={isSubmitting}
          defaultLocation={defaultLocation}
        />
      </Dialog>
    </div>
  );
};
