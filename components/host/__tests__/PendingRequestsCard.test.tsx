import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingRequestsCard } from '../PendingRequestsCard';
import { PendingRequest } from '@/types/member.types';

// Mock fetch
global.fetch = jest.fn();

const mockRequests: PendingRequest[] = [
  {
    id: 'membership-1',
    user: {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
    },
    request_message: 'I love wine!',
    created_at: '2026-01-15T10:00:00',
  },
  {
    id: 'membership-2',
    user: {
      id: 'user-2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
    },
    request_message: null,
    created_at: '2026-01-16T11:00:00',
  },
  {
    id: 'membership-3',
    user: {
      id: 'user-3',
      full_name: 'Bob Wilson',
      email: 'bob@example.com',
    },
    request_message: 'Looking forward to joining!',
    created_at: '2026-01-17T12:00:00',
  },
];

describe('PendingRequestsCard - Approve/Deny Button States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Initial State', () => {
    it('should show all pending requests with Approve and Deny buttons', () => {
      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });

      expect(approveButtons).toHaveLength(3);
      expect(denyButtons).toHaveLength(3);

      approveButtons.forEach(button => expect(button).toBeEnabled());
      denyButtons.forEach(button => expect(button).toBeEnabled());
    });

    it('should display pending count badge', () => {
      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show "No pending requests" when empty', () => {
      render(
        <PendingRequestsCard
          pendingRequests={[]}
          pendingCount={0}
        />
      );

      expect(screen.getByText('No pending requests')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Deny/i })).not.toBeInTheDocument();
    });

    it('should not show count badge when count is 0', () => {
      render(
        <PendingRequestsCard
          pendingRequests={[]}
          pendingCount={0}
        />
      );

      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      // Badge with "0" should not be visible
      const badge = screen.queryByText('0');
      expect(badge).not.toBeInTheDocument();
    });

    it('should display request messages when provided', () => {
      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText(/I love wine!/i)).toBeInTheDocument();
      expect(screen.getByText(/Looking forward to joining!/i)).toBeInTheDocument();
    });
  });

  describe('Approve Button States', () => {
    it('should call approve API when clicking Approve button', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/host/memberships/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ membership_id: 'membership-1' }),
        });
      });
    });

    it('should show "Processing..." on Approve button during action', async () => {
      const user = userEvent.setup();

      // Slow down fetch to see loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });

      // Click and immediately check for processing state (before it completes)
      const clickPromise = user.click(approveButtons[0]);

      // Check for processing text (don't wait for it with findBy, use waitFor)
      await waitFor(() => {
        const processingButtons = screen.queryAllByRole('button', { name: /Processing.../i });
        expect(processingButtons.length).toBeGreaterThan(0);
      });

      // Wait for the click to complete
      await clickPromise;
    });

    it('should disable both Approve and Deny buttons for the request being processed', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        // Both buttons for the first request should be disabled
        const processingButtons = screen.getAllByRole('button', { name: /Processing.../i });
        expect(processingButtons).toHaveLength(2); // Both Approve and Deny show "Processing..."
        processingButtons.forEach(button => expect(button).toBeDisabled());
      });
    });

    it('should NOT disable buttons for other requests during processing', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      // Other requests' buttons should still be enabled
      await waitFor(() => {
        const stillEnabledApproveButtons = screen.getAllByRole('button', { name: /^Approve$/i });
        // Should have 2 enabled Approve buttons (for requests 2 and 3)
        expect(stillEnabledApproveButtons.length).toBeGreaterThan(0);
        stillEnabledApproveButtons.forEach(button => expect(button).toBeEnabled());
      });
    });

    it('should remove approved request from list', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });

      // Other requests should still be there
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should decrement count after approval', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should handle approval errors gracefully', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Already approved' }),
      });

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Already approved');
      });

      // Request should still be in the list after error
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      alertMock.mockRestore();
    });

    it('should not remove request on failed approval', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      // Count should not change
      expect(screen.getByText('3')).toBeInTheDocument();
      // Request should still be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Deny Button States', () => {
    it('should call deny API when clicking Deny button', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });
      await user.click(denyButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/host/memberships/deny', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ membership_id: 'membership-1' }),
        });
      });
    });

    it('should show "Processing..." on Deny button during action', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });
      await user.click(denyButtons[0]);

      const processingButtons = await screen.findAllByRole('button', { name: /Processing.../i });
      expect(processingButtons.length).toBeGreaterThan(0);
      processingButtons.forEach(button => expect(button).toBeDisabled());
    });

    it('should remove denied request from list', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });
      await user.click(denyButtons[1]); // Deny second request

      await waitFor(() => {
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });

      // Other requests should still be there
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should decrement count after denial', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });
      await user.click(denyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should handle denial errors gracefully', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Request not found' }),
      });

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });
      await user.click(denyButtons[0]);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Request not found');
      });

      alertMock.mockRestore();
    });
  });

  describe('Processing State Edge Cases', () => {
    it('should not allow clicking Approve while processing', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });

      // Click first time
      await user.click(approveButtons[0]);

      // Try clicking again immediately
      await user.click(approveButtons[0]);

      await waitFor(() => {
        // Should only be called once
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should not allow clicking Deny while processing', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });

      // Click first time
      await user.click(denyButtons[0]);

      // Try clicking again immediately
      await user.click(denyButtons[0]);

      await waitFor(() => {
        // Should only be called once
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent processing different requests simultaneously', async () => {
      const user = userEvent.setup();
      let resolveFirst: any;

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => { resolveFirst = resolve; })
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });

      // Click on first request
      await user.click(approveButtons[0]);

      // Try clicking on second request while first is processing
      await user.click(approveButtons[1]);

      // FIXED BEHAVIOR: Second click is blocked because processingId is set
      // Only one request can be processed at a time
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Resolve the first request
      resolveFirst({ ok: true, json: async () => ({}) });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should not allow switching from Approve to Deny during processing', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      const denyButtons = screen.getAllByRole('button', { name: /Deny/i });

      // Click Approve
      await user.click(approveButtons[0]);

      // Try clicking Deny on same request
      await user.click(denyButtons[0]);

      await waitFor(() => {
        // Should only have called approve, not deny
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/host/memberships/approve',
          expect.any(Object)
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle count not going below 0', async () => {
      const user = userEvent.setup();

      // Start with count of 0 but 1 request (shouldn't happen but test it)
      render(
        <PendingRequestsCard
          pendingRequests={[mockRequests[0]]}
          pendingCount={0}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        // Count should not show badge when 0
        expect(screen.queryByText('-1')).not.toBeInTheDocument();
      });
    });

    it('should show no pending requests message after all are processed', async () => {
      const user = userEvent.setup();

      render(
        <PendingRequestsCard
          pendingRequests={[mockRequests[0]]}
          pendingCount={1}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('No pending requests')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <PendingRequestsCard
          pendingRequests={mockRequests}
          pendingCount={3}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('An unexpected error occurred');
      });

      // Request should still be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      alertMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });
});
