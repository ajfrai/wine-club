'use client';

import { useState } from 'react';
import { PendingRequest } from '@/types/member.types';

interface PendingRequestsCardProps {
  pendingRequests: PendingRequest[];
  pendingCount: number;
}

export function PendingRequestsCard({ pendingRequests, pendingCount }: PendingRequestsCardProps) {
  const [requests, setRequests] = useState(pendingRequests);
  const [count, setCount] = useState(pendingCount);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (membershipId: string) => {
    setProcessingId(membershipId);
    try {
      const response = await fetch('/api/host/memberships/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membershipId }),
      });

      if (response.ok) {
        setRequests(requests.filter(r => r.id !== membershipId));
        setCount(Math.max(0, count - 1));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('An unexpected error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (membershipId: string) => {
    setProcessingId(membershipId);
    try {
      const response = await fetch('/api/host/memberships/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membershipId }),
      });

      if (response.ok) {
        setRequests(requests.filter(r => r.id !== membershipId));
        setCount(Math.max(0, count - 1));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to deny request');
      }
    } catch (error) {
      console.error('Error denying request:', error);
      alert('An unexpected error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Pending Requests
        {count > 0 && (
          <span className="ml-2 bg-wine text-white rounded-full px-2 py-1 text-xs">
            {count}
          </span>
        )}
      </h3>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <p className="font-medium text-gray-900">{request.user.full_name}</p>
              <p className="text-xs text-gray-500">{request.user.email}</p>
              {request.request_message && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  "{request.request_message}"
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                  className="flex-1 text-xs bg-wine text-white px-3 py-2 rounded hover:bg-wine-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processingId === request.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleDeny(request.id)}
                  disabled={processingId === request.id}
                  className="flex-1 text-xs border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  {processingId === request.id ? 'Processing...' : 'Deny'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No pending requests</p>
      )}
    </div>
  );
}
