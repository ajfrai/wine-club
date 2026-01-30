import React from 'react';
import { Wine, Plus, Star } from 'lucide-react';

export const WinesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Wine className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Wine Management</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          This feature is coming soon! You'll be able to add and manage your wine collection,
          feature wines for your members, and track tasting notes.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <Star className="w-4 h-4" />
          Coming Soon
        </div>
      </div>

      {/* Placeholder Feature List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-wine-light rounded-lg flex items-center justify-center mb-4">
            <Wine className="w-6 h-6 text-wine-dark" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Wine Library</h3>
          <p className="text-sm text-gray-600">
            Add wines to your collection with details, photos, and tasting notes
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-wine-light rounded-lg flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-wine-dark" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Featured Wines</h3>
          <p className="text-sm text-gray-600">
            Highlight special wines for your members to see on your club page
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-wine-light rounded-lg flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-wine-dark" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Quick Add</h3>
          <p className="text-sm text-gray-600">
            Quickly add wines by scanning labels or searching our database
          </p>
        </div>
      </div>
    </div>
  );
};
