'use client';

export default function ClubCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with title and distance */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      {/* Address and description section */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
      </div>
    </div>
  );
}
