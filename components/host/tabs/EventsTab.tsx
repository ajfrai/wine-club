'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, MapPin, Users, Receipt } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { EventForm } from '@/components/host/EventForm';
import { EventFormData } from '@/lib/validations/event-form.schema';
import { EventLedgerDialog } from '@/components/host/EventLedgerDialog';

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
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const handleViewLedger = (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEvent(event);
    setIsLedgerOpen(true);
  };

  const closeLedger = () => {
    setIsLedgerOpen(false);
    setSelectedEvent(null);
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
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Calendar className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Manage Events</h2>
              <p className="text-wine-light">Create and manage events for your wine club</p>
            </div>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-white text-wine-dark hover:bg-wine-light hover:text-wine-dark px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
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
      <div className="bg-wine-light/30 border border-wine-light rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-wine-dark">Upcoming Events</h3>
          {upcomingEvents.length > 0 && (
            <Link
              href="/dashboard/host/club/events"
              className="text-wine hover:text-wine-dark text-sm font-medium"
            >
              View All →
            </Link>
          )}
        </div>

        {isLoadingEvents ? (
          <div className="text-center py-8 text-wine">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-wine-light mx-auto mb-3" />
            <p className="text-wine-dark mb-2">No upcoming events scheduled</p>
            <p className="text-sm text-wine">Create your first event to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white border border-wine-light rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <Link href="/dashboard/host/club/events" className="flex-1">
                    <h4 className="font-semibold text-wine-dark mb-1">{event.title}</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-wine" />
                        <span>
                          {formatDate(event.event_date)} at {formatTime(event.event_date)}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-wine" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-wine" />
                          <span>
                            {event.attendee_count} / {event.max_attendees} attendees
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    {event.price && (
                      <div className="text-lg font-bold text-wine-dark">${event.price}</div>
                    )}
                    {event.price && (
                      <button
                        onClick={(e) => handleViewLedger(event, e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-wine text-white rounded hover:bg-wine-dark transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Ledger
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

      {/* Event Ledger Dialog */}
      {selectedEvent && (
        <EventLedgerDialog
          isOpen={isLedgerOpen}
          onClose={closeLedger}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
        />
      )}
    </div>
  );
};
