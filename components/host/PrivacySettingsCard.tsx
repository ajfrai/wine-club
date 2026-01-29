'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrivacySettingsCardProps {
  currentJoinMode: string;
}

export function PrivacySettingsCard({ currentJoinMode }: PrivacySettingsCardProps) {
  const router = useRouter();
  const [joinMode, setJoinMode] = useState(currentJoinMode);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/host/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ join_mode: joinMode }),
      });

      if (response.ok) {
        alert('Privacy settings updated successfully');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = joinMode !== currentJoinMode;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Control who can join your club and how they join.
      </p>

      <div className="space-y-3 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="join_mode"
            value="public"
            checked={joinMode === 'public'}
            onChange={(e) => setJoinMode(e.target.value)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-gray-900">Anyone Can Join</p>
            <p className="text-sm text-gray-600">Members can discover and join instantly</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="join_mode"
            value="request"
            checked={joinMode === 'request'}
            onChange={(e) => setJoinMode(e.target.value)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-gray-900">Approval Required</p>
            <p className="text-sm text-gray-600">Members can discover your club and request to join</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="join_mode"
            value="private"
            checked={joinMode === 'private'}
            onChange={(e) => setJoinMode(e.target.value)}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-gray-900">Invite Only</p>
            <p className="text-sm text-gray-600">Club is hidden. Members need your code to join</p>
          </div>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={!hasChanged || isSaving}
        className="w-full px-4 py-2 bg-wine text-white rounded-lg hover:bg-wine-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? 'Saving...' : 'Save Privacy Settings'}
      </button>
    </div>
  );
}
