import { MapPin, Wine, Settings as SettingsIcon, Code } from 'lucide-react';
import { PaymentHandlesForm } from '@/components/settings/PaymentHandlesForm';
import { CopyHostCode } from '@/components/host/CopyHostCode';
import { PrivacySettingsCard } from '@/components/host/PrivacySettingsCard';
import Link from 'next/link';

interface SettingsTabProps {
  hostData: {
    host_code: string;
    club_address: string;
    about_club: string | null;
    wine_preferences: string | null;
    join_mode: string;
  };
  joinModeLabel: string;
  hostCodeDescription: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  hostData,
  joinModeLabel,
  hostCodeDescription,
}) => {
  return (
    <div className="space-y-6">
      {/* Club Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Club Information</h2>
          <Link
            href={`/clubs/${hostData.host_code}`}
            className="text-wine hover:text-wine-dark text-sm font-medium"
            target="_blank"
          >
            View Public Page →
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Host Code
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-lg font-mono font-semibold text-wine bg-wine-light px-3 py-1 rounded">
                {hostData.host_code}
              </code>
              <CopyHostCode hostCode={hostData.host_code} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{hostCodeDescription}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Privacy Setting
            </label>
            <p className="text-gray-900 font-medium mt-1">{joinModeLabel}</p>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label className="text-sm text-gray-500">Location</label>
              <p className="text-gray-900 mt-1">{hostData.club_address}</p>
            </div>
          </div>

          {hostData.about_club && (
            <div>
              <label className="text-sm text-gray-500">About</label>
              <p className="text-gray-900 mt-1">{hostData.about_club}</p>
            </div>
          )}

          {hostData.wine_preferences && (
            <div className="flex items-start gap-3">
              <Wine className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <label className="text-sm text-gray-500">Wine Preferences</label>
                <p className="text-gray-900 mt-1">{hostData.wine_preferences}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings Card */}
      <PrivacySettingsCard currentJoinMode={hostData.join_mode} />

      {/* Payment Settings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure how members can pay you. Members will see these options when they view your club.
        </p>
        <PaymentHandlesForm />
      </div>
    </div>
  );
};
