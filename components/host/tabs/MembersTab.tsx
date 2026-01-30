import { Users, Clock } from 'lucide-react';
import { PendingRequestsCard } from '@/components/host/PendingRequestsCard';
import { PendingRequest } from '@/types/member.types';

interface MembersTabProps {
  memberCount: number;
  members: any[];
  pendingRequests: PendingRequest[];
  pendingCount: number;
  joinMode: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  memberCount,
  members,
  pendingRequests,
  pendingCount,
  joinMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-wine" />
            <h3 className="text-lg font-semibold text-gray-900">Active Members</h3>
          </div>
          <p className="text-4xl font-bold text-wine">{memberCount}</p>
        </div>

        {joinMode === 'request' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-sunburst-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            </div>
            <p className="text-4xl font-bold text-sunburst-600">{pendingCount}</p>
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {joinMode === 'request' && pendingCount > 0 && (
        <PendingRequestsCard
          pendingRequests={pendingRequests}
          pendingCount={pendingCount}
        />
      )}

      {/* Member List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Member Directory</h3>
          <p className="text-sm text-gray-600 mt-1">
            All active members of your wine club
          </p>
        </div>

        {members && members.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {members.map((membership: any) => (
              <div key={membership.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-wine-light rounded-full flex items-center justify-center">
                      <span className="text-wine-dark font-semibold text-lg">
                        {membership.users?.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {membership.users?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {membership.users?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(membership.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h4>
            <p className="text-gray-600">Share your host code to invite people to join your club!</p>
          </div>
        )}
      </div>
    </div>
  );
};
