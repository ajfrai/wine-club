'use client';

import { useState } from 'react';
import { Calendar, Users, Wine, Receipt, Settings, Eye, EyeOff, Info } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { EventsTab } from '@/components/host/tabs/EventsTab';
import { MembersTab } from '@/components/host/tabs/MembersTab';
import { SettingsTab } from '@/components/host/tabs/SettingsTab';
import { WinesTab } from '@/components/host/tabs/WinesTab';
import { LedgerTab } from '@/components/host/tabs/LedgerTab';
import { PublicAboutTab } from '@/components/club/tabs/PublicAboutTab';
import { PublicEventsTab } from '@/components/club/tabs/PublicEventsTab';
import { PublicWinesTab } from '@/components/club/tabs/PublicWinesTab';

interface ClubManagementViewProps {
  clubName: string;
  hostCode: string;
  clubAddress: string | null;
  aboutClub: string | null;
  winePreferences: string | null;
  memberCount: number;
  upcomingEventsCount: number;
  pendingCount: number;
  joinMode: string;
  hostData: any;
  members: any[];
  pendingRequests: any[];
  joinModeLabel: string;
  hostCodeDescription: string;
}

export function ClubManagementView({
  clubName,
  hostCode,
  clubAddress,
  aboutClub,
  winePreferences,
  memberCount,
  upcomingEventsCount,
  pendingCount,
  joinMode,
  hostData,
  members,
  pendingRequests,
  joinModeLabel,
  hostCodeDescription,
}: ClubManagementViewProps) {
  const [viewAsMember, setViewAsMember] = useState(false);

  const managementTabs = [
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      badge: upcomingEventsCount || 0,
      content: <EventsTab upcomingEventsCount={upcomingEventsCount || 0} defaultLocation={clubAddress || ''} />,
    },
    {
      id: 'wines',
      label: 'Wines',
      icon: <Wine className="w-5 h-5" />,
      content: <WinesTab />,
    },
    // Ledger feature temporarily hidden
    // {
    //   id: 'ledger',
    //   label: 'Ledger',
    //   icon: <Receipt className="w-5 h-5" />,
    //   content: <LedgerTab />,
    // },
    {
      id: 'members',
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      badge: joinMode === 'request' ? (pendingCount || 0) : undefined,
      content: (
        <MembersTab
          memberCount={memberCount || 0}
          members={members || []}
          pendingRequests={pendingRequests}
          pendingCount={pendingCount || 0}
          joinMode={joinMode}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <SettingsTab
          hostData={hostData}
          joinModeLabel={joinModeLabel}
          hostCodeDescription={hostCodeDescription}
        />
      ),
    },
  ];

  const memberTabs = [
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-5 h-5" />,
      content: (
        <PublicAboutTab
          aboutClub={aboutClub}
          clubAddress={clubAddress}
          winePreferences={winePreferences}
          venmoUsername={hostData?.venmo_username || null}
          paypalUsername={hostData?.paypal_username || null}
          zelleHandle={hostData?.zelle_handle || null}
          acceptsCash={hostData?.accepts_cash || false}
        />
      ),
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      content: <PublicEventsTab hostCode={hostCode} />,
    },
    {
      id: 'wines',
      label: 'Wines',
      icon: <Wine className="w-5 h-5" />,
      content: <PublicWinesTab />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{clubName}</h1>
          <p className="text-gray-600 mt-1">
            {viewAsMember ? 'Member view' : 'Manage your club and members'}
          </p>
        </div>
        <button
          onClick={() => setViewAsMember(!viewAsMember)}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-wine text-wine rounded-lg hover:bg-wine hover:text-white transition-colors font-medium"
        >
          {viewAsMember ? (
            <>
              <EyeOff className="w-4 h-4" />
              Exit Member View
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              View as Member
            </>
          )}
        </button>
      </div>

      {/* Member View Info Banner */}
      {viewAsMember && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Member View</p>
              <p className="text-sm text-blue-700 mt-1">
                This is how your club appears to members. Member count and join code:{' '}
                <span className="font-mono font-semibold">{hostCode}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <Tabs
        tabs={viewAsMember ? memberTabs : managementTabs}
        defaultTab={viewAsMember ? 'about' : 'events'}
      />
    </div>
  );
}
