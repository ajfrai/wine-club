'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { EventForm } from '@/components/host/EventForm';
import { EventFormData } from '@/lib/validations/event-form.schema';

interface EventsTabProps {
  upcomingEventsCount: number;
  defaultLocation: string;
}

export const EventsTab: React.FC<EventsTabProps> = ({ upcomingEventsCount, defaultLocation }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for Great Events</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Create events at least 2 weeks in advance to give members time to RSVP</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Include details about wines, food pairings, and what to expect</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Set capacity limits to ensure an intimate experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use the price field to indicate if members should bring cash or Venmo you</span>
          </li>
        </ul>
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
