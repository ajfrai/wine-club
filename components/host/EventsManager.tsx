'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Users, DollarSign, MapPin, Wine, Ban, Repeat } from 'lucide-react';
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
  status: 'scheduled' | 'cancelled' | 'completed';
  is_recurring: boolean;
  recurrence_count: number | null;
  created_at: string;
}

interface EventsManagerProps {
  defaultLocation: string;
}

export const EventsManager: React.FC<EventsManagerProps> = ({ defaultLocation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/host/events');
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

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/host/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEvents();
        setIsDialogOpen(false);
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

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/host/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEvents();
        setIsDialogOpen(false);
        setEditingEvent(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      const response = await fetch(`/api/host/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event? Registered members will need to be notified.')) {
      return;
    }

    try {
      setCancellingEventId(eventId);
      const response = await fetch(`/api/host/events/${eventId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel event');
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      alert('Failed to cancel event');
    } finally {
      setCancellingEventId(null);
    }
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
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

  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  // Separate upcoming and past events
  const upcomingEvents = events.filter(e => !isPastEvent(e.event_date));
  const pastEvents = events.filter(e => isPastEvent(e.event_date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wine-dark">Manage Events</h1>
          <p className="text-wine mt-1">Create and manage events for your wine club</p>
        </div>
        <button
          onClick={openCreateDialog}
          className="bg-wine-dark hover:bg-wine text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-wine">Loading events...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-wine-dark mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteEvent}
                    onCancel={handleCancelEvent}
                    isDeleting={deletingEventId === event.id}
                    isCancelling={cancellingEventId === event.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-wine/60 mb-4">Past Events</h2>
              <div className="space-y-4 opacity-60">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteEvent}
                    onCancel={handleCancelEvent}
                    isDeleting={deletingEventId === event.id}
                    isCancelling={cancellingEventId === event.id}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-wine-light">
              <Calendar size={48} className="mx-auto text-wine-light mb-4" />
              <h3 className="text-lg font-semibold text-wine-dark mb-2">No events yet</h3>
              <p className="text-wine mb-6">Create your first event to get started</p>
              <button
                onClick={openCreateDialog}
                className="bg-wine-dark hover:bg-wine text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Create Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        maxWidth="lg"
      >
        <EventForm
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={closeDialog}
          isLoading={isSubmitting}
          defaultValues={editingEvent ? {
            title: editingEvent.title,
            description: editingEvent.description || '',
            event_date: editingEvent.event_date,
            end_date: editingEvent.end_date || '',
            location: editingEvent.location || '',
            wines_theme: editingEvent.wines_theme || '',
            price: editingEvent.price,
            max_attendees: editingEvent.max_attendees,
            is_recurring: editingEvent.is_recurring,
            recurrence_count: editingEvent.recurrence_count,
          } : undefined}
          defaultLocation={defaultLocation}
        />
      </Dialog>
    </div>
  );
};

// Event Card Component
interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onCancel: (eventId: string) => void;
  isDeleting: boolean;
  isCancelling: boolean;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  isPast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onCancel,
  isDeleting,
  isCancelling,
  formatDate,
  formatTime,
  isPast = false,
}) => {
  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const isCancelled = event.status === 'cancelled';

  return (
    <div className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
      isCancelled ? 'border-wine-light/50 bg-wine-light/10' : 'border-wine-light'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-xl font-semibold ${isCancelled ? 'text-wine/50 line-through' : 'text-wine-dark'}`}>
              {event.title}
            </h3>
            {isCancelled && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wine-light/50 text-wine-dark">
                Cancelled
              </span>
            )}
            {event.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-wine-light text-wine-dark">
                <Repeat size={12} />
                Weekly
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-wine">
            <Calendar size={16} />
            <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-wine hover:text-wine-dark hover:bg-wine-light/30 rounded-lg transition-colors"
            aria-label="Edit event"
          >
            <Edit2 size={18} />
          </button>
          {event.status === 'scheduled' && (
            <button
              onClick={() => onCancel(event.id)}
              disabled={isCancelling}
              className="p-2 text-wine hover:text-wine-dark hover:bg-wine-light/30 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Cancel event"
            >
              <Ban size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(event.id)}
            disabled={isDeleting}
            className="p-2 text-wine hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Delete event"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {event.description && (
        <p className="text-wine-dark/80 mb-4">{event.description}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-wine-light/50">
        {event.location && (
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-wine mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-wine">Location</p>
              <p className="text-sm text-wine-dark">{event.location}</p>
            </div>
          </div>
        )}

        {event.wines_theme && (
          <div className="flex items-start gap-2">
            <Wine size={16} className="text-wine mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-wine">Wines/Theme</p>
              <p className="text-sm text-wine-dark">{event.wines_theme}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <DollarSign size={16} className="text-wine mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-wine">Price</p>
            <p className="text-sm text-wine-dark">
              {event.price ? `$${event.price.toFixed(2)}` : 'Free'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Users size={16} className="text-wine mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-wine">Attendees</p>
            <p className="text-sm text-wine-dark">
              {event.attendee_count}
              {event.max_attendees ? ` / ${event.max_attendees}` : ''}
              {isFull && <span className="text-wine-dark font-semibold ml-1">(Full)</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
