'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
}

export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Wine Club</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 capitalize">
              {userRole}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Welcome, {userName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
