import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClubCard from '../ClubCard';
import { NearbyClub } from '@/types/member.types';

// Mock Next.js Link and Image
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockClub: NearbyClub = {
  host_id: 'host-1',
  host_name: 'Wine Club Name',
  host_code: 'WINE123',
  club_address: '123 Wine St, Napa, CA',
  wine_preferences: 'Red, White, Sparkling',
  about_club: 'We love wine!',
  member_count: 15,
  distance: 5.2,
  join_mode: 'public',
  upcoming_events: [
    {
      id: 'event-1',
      title: 'Wine Tasting',
      event_date: '2026-03-01T18:00:00',
      price: 50,
    },
  ],
};

const privateClub: NearbyClub = {
  ...mockClub,
  join_mode: 'private',
};

const requestClub: NearbyClub = {
  ...mockClub,
  join_mode: 'request',
};

describe('ClubCard - Join/Leave Button States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Not Joined State', () => {
    it('should show "Join Club" button for public clubs', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should have wine-colored button for not joined state', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });
      expect(button).toHaveClass('bg-wine');
    });

    it('should show "Join Club" button for private clubs', () => {
      render(
        <ClubCard
          club={privateClub}
          isJoined={false}
          isPending={false}
        />
      );

      // Private clubs should still show "Join Club" button
      const button = screen.getByRole('button', { name: /Join Club/i });
      expect(button).toBeInTheDocument();
    });

    it('should show "Request to Join" button for request-mode clubs', () => {
      render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={false}
        />
      );

      const button = screen.getByRole('button', { name: /Request to Join/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should call onJoin when clicking Join Club button', async () => {
      const user = userEvent.setup();
      const onJoinMock = jest.fn();

      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          onJoin={onJoinMock}
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });
      await user.click(button);

      expect(onJoinMock).toHaveBeenCalledWith('host-1');
      expect(onJoinMock).toHaveBeenCalledTimes(1);
    });

    it('should call onJoin when clicking Request to Join button', async () => {
      const user = userEvent.setup();
      const onJoinMock = jest.fn();

      render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={false}
          onJoin={onJoinMock}
        />
      );

      const button = screen.getByRole('button', { name: /Request to Join/i });
      await user.click(button);

      expect(onJoinMock).toHaveBeenCalledWith('host-1');
    });
  });

  describe('Joined State', () => {
    it('should show "Leave Club" button when joined', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
        />
      );

      const button = screen.getByRole('button', { name: /Leave Club/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should have gray button styling when joined', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
        />
      );

      const button = screen.getByRole('button', { name: /Leave Club/i });
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('text-gray-700');
    });

    it('should call onLeave when clicking Leave Club button', async () => {
      const user = userEvent.setup();
      const onLeaveMock = jest.fn();

      render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
          onLeave={onLeaveMock}
        />
      );

      const button = screen.getByRole('button', { name: /Leave Club/i });
      await user.click(button);

      expect(onLeaveMock).toHaveBeenCalledWith('host-1');
      expect(onLeaveMock).toHaveBeenCalledTimes(1);
    });

    it('should show Leave Club for all join modes when joined', () => {
      const { rerender } = render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
        />
      );
      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={privateClub}
          isJoined={true}
          isPending={false}
        />
      );
      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={requestClub}
          isJoined={true}
          isPending={false}
        />
      );
      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();
    });
  });

  describe('Pending Request State', () => {
    it('should show "Cancel Request" button when request is pending', () => {
      render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Request/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should have gray button with border when pending', () => {
      render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Request/i });
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('text-gray-700');
      expect(button).toHaveClass('border-gray-300');
    });

    it('should call onLeave when clicking Cancel Request button', async () => {
      const user = userEvent.setup();
      const onLeaveMock = jest.fn();

      render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
          onLeave={onLeaveMock}
        />
      );

      const button = screen.getByRole('button', { name: /Cancel Request/i });
      await user.click(button);

      expect(onLeaveMock).toHaveBeenCalledWith('host-1');
      expect(onLeaveMock).toHaveBeenCalledTimes(1);
    });

    it('should show Cancel Request even for public clubs if pending', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={true}
        />
      );

      // Even for public clubs, if there's a pending state, show cancel request
      const button = screen.getByRole('button', { name: /Cancel Request/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show "Loading..." button text when loading', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={true}
        />
      );

      const button = screen.getByRole('button', { name: /Loading.../i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should disable button during loading', () => {
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={true}
        />
      );

      const button = screen.getByRole('button', { name: /Loading.../i });
      expect(button).toBeDisabled();
    });

    it('should show Loading... regardless of joined state', () => {
      const { rerender } = render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={true}
        />
      );
      expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
          isLoading={true}
        />
      );
      expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={true}
          isLoading={true}
        />
      );
      expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();
    });

    it('should not call action handlers when disabled during loading', async () => {
      const user = userEvent.setup();
      const onJoinMock = jest.fn();
      const onLeaveMock = jest.fn();

      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={true}
          onJoin={onJoinMock}
          onLeave={onLeaveMock}
        />
      );

      const button = screen.getByRole('button', { name: /Loading.../i });
      await user.click(button);

      expect(onJoinMock).not.toHaveBeenCalled();
      expect(onLeaveMock).not.toHaveBeenCalled();
    });
  });

  describe('Button State Transitions', () => {
    it('should transition from not joined to joined', () => {
      const { rerender } = render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
        />
      );

      expect(screen.getByRole('button', { name: /Join Club/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
        />
      );

      expect(screen.queryByRole('button', { name: /Join Club/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();
    });

    it('should transition from joined back to not joined', () => {
      const { rerender } = render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
        />
      );

      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
        />
      );

      expect(screen.queryByRole('button', { name: /Leave Club/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Join Club/i })).toBeInTheDocument();
    });

    it('should transition from not joined to pending', () => {
      const { rerender } = render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={false}
        />
      );

      expect(screen.getByRole('button', { name: /Request to Join/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
        />
      );

      expect(screen.queryByRole('button', { name: /Request to Join/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel Request/i })).toBeInTheDocument();
    });

    it('should transition from pending to joined (after approval)', () => {
      const { rerender } = render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
        />
      );

      expect(screen.getByRole('button', { name: /Cancel Request/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={requestClub}
          isJoined={true}
          isPending={false}
        />
      );

      expect(screen.queryByRole('button', { name: /Cancel Request/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Leave Club/i })).toBeInTheDocument();
    });

    it('should transition from pending back to not joined (after cancellation)', () => {
      const { rerender } = render(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={true}
        />
      );

      expect(screen.getByRole('button', { name: /Cancel Request/i })).toBeInTheDocument();

      rerender(
        <ClubCard
          club={requestClub}
          isJoined={false}
          isPending={false}
        />
      );

      expect(screen.queryByRole('button', { name: /Cancel Request/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Request to Join/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both isJoined and isPending being true', () => {
      // This shouldn't happen in normal flow, but test the priority
      render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={true}
        />
      );

      // When both are true, getButtonText checks isPending before isJoined
      // Actually looking at the code, it checks isLoading, then isPending, then isJoined
      // So if isPending is true, it should show "Cancel Request"
      const button = screen.getByRole('button', { name: /Cancel Request/i });
      expect(button).toBeInTheDocument();
    });

    it('should not call handler if onJoin is not provided', async () => {
      const user = userEvent.setup();

      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          // No onJoin prop
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });
      await user.click(button);

      // Should not crash, just do nothing
      expect(button).toBeInTheDocument();
    });

    it('should not call handler if onLeave is not provided', async () => {
      const user = userEvent.setup();

      render(
        <ClubCard
          club={mockClub}
          isJoined={true}
          isPending={false}
          // No onLeave prop
        />
      );

      const button = screen.getByRole('button', { name: /Leave Club/i });
      await user.click(button);

      // Should not crash, just do nothing
      expect(button).toBeInTheDocument();
    });

    it('should handle missing join_mode gracefully', () => {
      const clubWithoutJoinMode = { ...mockClub, join_mode: undefined as any };

      render(
        <ClubCard
          club={clubWithoutJoinMode}
          isJoined={false}
          isPending={false}
        />
      );

      // Should default to "Join Club"
      const button = screen.getByRole('button', { name: /Join Club/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Multiple Button Clicks', () => {
    it('should prevent rapid clicks when isLoading is properly set', async () => {
      const user = userEvent.setup();
      const onJoinMock = jest.fn();
      const { rerender } = render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={false}
          onJoin={onJoinMock}
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });

      // First click
      await user.click(button);
      expect(onJoinMock).toHaveBeenCalledTimes(1);

      // Simulate parent setting isLoading to true (proper usage)
      rerender(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          isLoading={true}
          onJoin={onJoinMock}
        />
      );

      // Try clicking while loading - should be prevented
      await user.click(screen.getByRole('button', { name: /Loading.../i }));

      // Handler should not be called again
      expect(onJoinMock).toHaveBeenCalledTimes(1);
    });

    it('should warn about multiple rapid clicks if parent does not manage isLoading', async () => {
      const user = userEvent.setup();
      const onJoinMock = jest.fn();

      // Parent doesn't manage isLoading state (bad practice)
      render(
        <ClubCard
          club={mockClub}
          isJoined={false}
          isPending={false}
          // isLoading not provided or always false
          onJoin={onJoinMock}
        />
      );

      const button = screen.getByRole('button', { name: /Join Club/i });

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // LIMITATION: If parent doesn't manage isLoading, multiple calls still happen
      // Parent components MUST set isLoading=true during async operations
      expect(onJoinMock).toHaveBeenCalledTimes(3);
    });
  });
});
