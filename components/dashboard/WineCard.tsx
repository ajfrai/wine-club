'use client';

import { Wine } from '@/types/member.types';
import { Wine as WineIcon } from 'lucide-react';

interface WineCardProps {
  wine: Wine;
}

export default function WineCard({ wine }: WineCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-shrink-0 w-80">
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        {wine.image_url ? (
          <img
            src={wine.image_url}
            alt={wine.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <WineIcon className="w-16 h-16 text-purple-400" />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{wine.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          {wine.vineyard && <span>{wine.vineyard}</span>}
          {wine.vintage && (
            <>
              <span>•</span>
              <span>{wine.vintage}</span>
            </>
          )}
        </div>

        {wine.varietal && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Varietal:</span> {wine.varietal}
          </p>
        )}

        {wine.region && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Region:</span> {wine.region}
          </p>
        )}

        {wine.tasting_notes && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{wine.tasting_notes}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {wine.price && (
            <span className="text-lg font-bold text-purple-700">${wine.price.toFixed(2)}</span>
          )}
          <button className="px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
