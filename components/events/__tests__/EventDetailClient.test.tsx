import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventDetailClient } from '../EventDetailClient';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockEvent = {
  id: 'event-1',
  title: 'Wine Tasting Event',
  description: 'A great wine tasting',
  event_date: '2026-03-01T18:00:00',
  end_date: null,
  location: '123 Wine St',
  wines_theme: 'Red wines',
  price: 50,
  max_attendees: 10,
  host_id: 'host-1',
  created_at: '2026-01-01T00:00:00',
  host: {
    id: 'host-1',
    full_name: 'John Host',
    hosts: [{ host_code: 'WINE123' }],
  },
};

const pastEvent = {
  ...mockEvent,
  event_date: '2020-01-01T18:00:00', // Past date
};

describe('EventDetailClient - RSVP Button States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Not Registered State', () => {
    it('should show "RSVP for This Event" button when not registered, not full, not past', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should show "Event is Full" button when event is at capacity', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={10} // Equal to max_attendees
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Event is Full/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should show "Event is Full" when attendees exceed max', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={15} // More than max_attendees
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Event is Full/i });
      expect(button).toBeDisabled();
    });

    it('should show "Event Has Passed" button for past events', () => {
      render(
        <EventDetailClient
          event={pastEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Event Has Passed/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should disable button for past event even if not full', () => {
      render(
        <EventDetailClient
          event={pastEvent}
          attendeeCount={2}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Event Has Passed/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Registered State', () => {
    it('should show registration confirmation when registered', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/You're registered for this event/i)).toBeInTheDocument();
    });

    it('should show "Cancel Registration" button when registered and not past', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should NOT show "Cancel Registration" button for past events', () => {
      render(
        <EventDetailClient
          event={pastEvent}
          attendeeCount={5}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/You're registered for this event/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Cancel Registration/i })).not.toBeInTheDocument();
    });

    it('should still show registered status for past event', () => {
      render(
        <EventDetailClient
          event={pastEvent}
          attendeeCount={5}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/You're registered for this event/i)).toBeInTheDocument();
      expect(screen.getByText(/Past Event/i)).toBeInTheDocument();
    });
  });

  describe('RSVP Button Actions', () => {
    it('should register user when clicking RSVP button', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/events/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: 'event-1' }),
        });
      });
    });

    it('should update to registered state after successful RSVP', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const rsvpButton = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(rsvpButton);

      await waitFor(() => {
        expect(screen.getByText(/You're registered for this event/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel Registration/i })).toBeInTheDocument();
      });
    });

    it('should increment attendee count after successful RSVP', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/5 people registered/i)).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/6 people registered/i)).toBeInTheDocument();
      });
    });

    it('should cancel registration when clicking Cancel button', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={6}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/events/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: 'event-1' }),
        });
      });
    });

    it('should update to not registered state after successful cancellation', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={6}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/You're registered for this event/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /RSVP for This Event/i })).toBeInTheDocument();
      });
    });

    it('should decrement attendee count after successful cancellation', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={6}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/6 people registered/i)).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/5 people registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during RSVP', async () => {
      const user = userEvent.setup();

      // Make fetch slower to see loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();
    });

    it('should show loading state during cancellation', async () => {
      const user = userEvent.setup();

      // Make fetch slower to see loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={6}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();
    });

    it('should not allow double-clicking during RSVP', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });

      // Try to click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle RSVP errors gracefully', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Event is full' }),
      });

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Event is full');
      });

      // Button should still be enabled after error
      expect(button).toBeEnabled();

      alertMock.mockRestore();
    });

    it('should handle cancellation errors gracefully', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Registration not found' }),
      });

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={6}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Registration not found');
      });

      alertMock.mockRestore();
    });

    it('should not change state on failed RSVP', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      await user.click(button);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      // Should still show RSVP button, not registered state
      expect(screen.getByRole('button', { name: /RSVP for This Event/i })).toBeInTheDocument();
      expect(screen.queryByText(/You're registered for this event/i)).not.toBeInTheDocument();
    });
  });

  describe('Host View', () => {
    it('should not show RSVP buttons when user is host', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={5}
          isRegistered={false}
          isHost={true}
          attendees={null}
        />
      );

      expect(screen.queryByRole('button', { name: /RSVP/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Cancel Registration/i })).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle event with null max_attendees', () => {
      const eventWithNoLimit = { ...mockEvent, max_attendees: null };

      render(
        <EventDetailClient
          event={eventWithNoLimit}
          attendeeCount={100}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      expect(button).toBeEnabled();
      expect(screen.queryByText(/Event is Full/i)).not.toBeInTheDocument();
    });

    it('should handle attendee count of 0', () => {
      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={0}
          isRegistered={false}
          isHost={false}
          attendees={null}
        />
      );

      expect(screen.getByText(/0 people registered/i)).toBeInTheDocument();
      const button = screen.getByRole('button', { name: /RSVP for This Event/i });
      expect(button).toBeEnabled();
    });

    it('should not show negative attendee count after cancellation', async () => {
      const user = userEvent.setup();

      render(
        <EventDetailClient
          event={mockEvent}
          attendeeCount={0}
          isRegistered={true}
          isHost={false}
          attendees={null}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Registration/i });
      await user.click(button);

      await waitFor(() => {
        // Should use Math.max(0, prev - 1) so count stays at 0
        expect(screen.getByText(/0 people registered/i)).toBeInTheDocument();
      });
    });
  });
});
